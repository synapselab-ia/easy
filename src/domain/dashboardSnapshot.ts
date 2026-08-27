import {
    differenceInCalendarDays,
    endOfDay,
    startOfDay,
    startOfMonth,
} from 'date-fns';
import type { Reseller, Transaction, TransactionType } from '../db/database';
import { buildFinancialReport } from './financialReporting';
import {
    calculateOutstandingDebtLots,
    debtAgeCategory,
    effectiveTransactions,
    transactionOccurredAt,
} from './transactions';

const FINANCIAL_EPSILON = 0.000001;
const DEFAULT_RECENT_REGISTRATION_LIMIT = 6;

export type DashboardAgingCategory = 'recent' | 'attention' | 'critical';
export type DashboardAttentionStatus = 'critical' | 'attention';

export interface DashboardPeriodMetrics {
    sales: number;
    receipts: number;
    orderCount: number;
    itemQuantity: number;
}

export interface DashboardAgingBucket {
    category: DashboardAgingCategory;
    value: number;
    percentage: number;
}

export interface DashboardAttentionRow {
    resellerId: number;
    resellerName: string;
    status: DashboardAttentionStatus;
    alertAmount: number;
    totalOpenDebt: number;
    oldestOutstandingAt: Date;
    ageDays: number;
}

export interface DashboardRecentRegistration {
    transactionId?: number;
    resellerId: number;
    resellerName: string;
    type: TransactionType;
    totalPrice: number;
    createdAt: Date;
    occurredAt: Date;
}

/**
 * Per-reseller aging detail kept in the read model so legacy Dashboard blocks can
 * consume the same projection during the DR-02 -> DR-04 transition without
 * changing their current two-list presentation prematurely.
 */
export interface DashboardResellerDebtProfile {
    resellerId: number;
    resellerName: string;
    totalOpenDebt: number;
    criticalAmount: number;
    attentionAmount: number;
    oldestCriticalAt?: Date;
    oldestAttentionAt?: Date;
}

export interface DashboardSnapshot {
    asOf: Date;
    monthRange: {
        startDate: Date;
        endDate: Date;
    };
    month: DashboardPeriodMetrics;
    today: DashboardPeriodMetrics;
    openDebt: {
        amount: number;
        resellerCount: number;
    };
    critical: {
        amount: number;
        resellerCount: number;
        oldestAgeDays: number | null;
    };
    agingBuckets: DashboardAgingBucket[];
    attentionRows: DashboardAttentionRow[];
    recentRegistrations: DashboardRecentRegistration[];
    resellerDebtProfiles: DashboardResellerDebtProfile[];
}

function periodMetrics(report: ReturnType<typeof buildFinancialReport>): DashboardPeriodMetrics {
    return {
        sales: report.summary.sales,
        receipts: report.summary.receipts,
        orderCount: report.summary.orderCount,
        itemQuantity: report.summary.itemQuantity,
    };
}

function compareAttentionRows(left: DashboardAttentionRow, right: DashboardAttentionRow) {
    if (left.status !== right.status) {
        return left.status === 'critical' ? -1 : 1;
    }

    const ageDelta = left.oldestOutstandingAt.getTime() - right.oldestOutstandingAt.getTime();
    if (ageDelta !== 0) return ageDelta;

    const amountDelta = right.alertAmount - left.alertAmount;
    if (Math.abs(amountDelta) > FINANCIAL_EPSILON) return amountDelta;

    return left.resellerName.localeCompare(right.resellerName, 'pt-BR');
}

function compareRecentRegistrations(left: Transaction, right: Transaction) {
    const registrationDelta = right.createdAt.getTime() - left.createdAt.getTime();
    if (registrationDelta !== 0) return registrationDelta;
    return (right.id ?? 0) - (left.id ?? 0);
}

export function buildDashboardSnapshot(
    transactions: Transaction[],
    resellers: Reseller[],
    asOf: Date,
    recentRegistrationLimit = DEFAULT_RECENT_REGISTRATION_LIMIT,
): DashboardSnapshot {
    if (Number.isNaN(asOf.getTime())) {
        throw new Error('A data de referência do Dashboard é inválida.');
    }

    const dayStart = startOfDay(asOf);
    const dayEnd = endOfDay(asOf);
    const monthStart = startOfMonth(asOf);
    const monthReport = buildFinancialReport(
        transactions,
        resellers,
        [],
        [],
        { startDate: monthStart, endDate: dayEnd },
    );
    const todayReport = buildFinancialReport(
        transactions,
        resellers,
        [],
        [],
        { startDate: dayStart, endDate: dayEnd },
    );

    const resellerNameById = new Map<number, string>();
    resellers.forEach(reseller => {
        if (typeof reseller.id === 'number') {
            resellerNameById.set(reseller.id, reseller.name);
        }
    });

    // D-035 current-position semantics: future occurrences stay valid history but
    // cannot affect today's open position or FIFO aging before their occurrence day.
    const currentTransactions = effectiveTransactions(transactions).filter(
        transaction => transactionOccurredAt(transaction) <= dayEnd,
    );
    const transactionsByReseller = new Map<number, Transaction[]>();
    currentTransactions.forEach(transaction => {
        const ownTransactions = transactionsByReseller.get(transaction.resellerId) ?? [];
        ownTransactions.push(transaction);
        transactionsByReseller.set(transaction.resellerId, ownTransactions);
    });

    const bucketValues: Record<DashboardAgingCategory, number> = {
        recent: 0,
        attention: 0,
        critical: 0,
    };
    const resellerDebtProfiles: DashboardResellerDebtProfile[] = [];
    const attentionRows: DashboardAttentionRow[] = [];

    transactionsByReseller.forEach((ownTransactions, resellerId) => {
        const lots = calculateOutstandingDebtLots(ownTransactions);
        const totalOpenDebt = lots.reduce((sum, lot) => sum + lot.amount, 0);
        if (totalOpenDebt <= FINANCIAL_EPSILON) return;

        let criticalAmount = 0;
        let attentionAmount = 0;
        let oldestCriticalAt: Date | undefined;
        let oldestAttentionAt: Date | undefined;

        lots.forEach(lot => {
            const category = debtAgeCategory(lot.occurredAt, dayEnd);
            bucketValues[category] += lot.amount;

            if (category === 'critical') {
                criticalAmount += lot.amount;
                if (!oldestCriticalAt || lot.occurredAt < oldestCriticalAt) {
                    oldestCriticalAt = lot.occurredAt;
                }
                return;
            }

            if (category === 'attention') {
                attentionAmount += lot.amount;
                if (!oldestAttentionAt || lot.occurredAt < oldestAttentionAt) {
                    oldestAttentionAt = lot.occurredAt;
                }
            }
        });

        const resellerName = resellerNameById.get(resellerId) ?? `Revendedor #${resellerId}`;
        const profile: DashboardResellerDebtProfile = {
            resellerId,
            resellerName,
            totalOpenDebt,
            criticalAmount,
            attentionAmount,
            ...(oldestCriticalAt ? { oldestCriticalAt } : {}),
            ...(oldestAttentionAt ? { oldestAttentionAt } : {}),
        };
        resellerDebtProfiles.push(profile);

        const status: DashboardAttentionStatus | null = criticalAmount > FINANCIAL_EPSILON
            ? 'critical'
            : attentionAmount > FINANCIAL_EPSILON
                ? 'attention'
                : null;
        if (!status) return;

        const oldestOutstandingAt = status === 'critical' ? oldestCriticalAt : oldestAttentionAt;
        if (!oldestOutstandingAt) return;

        attentionRows.push({
            resellerId,
            resellerName,
            status,
            alertAmount: status === 'critical' ? criticalAmount : attentionAmount,
            totalOpenDebt,
            oldestOutstandingAt,
            ageDays: Math.max(0, differenceInCalendarDays(dayEnd, oldestOutstandingAt)),
        });
    });

    const totalOpenDebt = monthReport.summary.openDebt;
    const agingBuckets: DashboardAgingBucket[] = (['recent', 'attention', 'critical'] as const).map(category => ({
        category,
        value: bucketValues[category],
        percentage: totalOpenDebt > FINANCIAL_EPSILON
            ? (bucketValues[category] / totalOpenDebt) * 100
            : 0,
    }));
    const criticalRows = attentionRows.filter(row => row.status === 'critical');

    const recentRegistrations = [...effectiveTransactions(transactions)]
        .sort(compareRecentRegistrations)
        .slice(0, Math.max(0, recentRegistrationLimit))
        .map(transaction => ({
            ...(transaction.id !== undefined ? { transactionId: transaction.id } : {}),
            resellerId: transaction.resellerId,
            resellerName: resellerNameById.get(transaction.resellerId) ?? `Revendedor #${transaction.resellerId}`,
            type: transaction.type,
            totalPrice: transaction.totalPrice,
            createdAt: transaction.createdAt,
            occurredAt: transactionOccurredAt(transaction),
        }));

    return {
        asOf,
        monthRange: monthReport.range,
        month: periodMetrics(monthReport),
        today: periodMetrics(todayReport),
        openDebt: {
            amount: totalOpenDebt,
            resellerCount: monthReport.resellers.filter(reseller => reseller.openDebt > FINANCIAL_EPSILON).length,
        },
        critical: {
            amount: bucketValues.critical,
            resellerCount: criticalRows.length,
            oldestAgeDays: criticalRows.length > 0
                ? Math.max(...criticalRows.map(row => row.ageDays))
                : null,
        },
        agingBuckets,
        attentionRows: attentionRows.sort(compareAttentionRows),
        recentRegistrations,
        resellerDebtProfiles,
    };
}
