import {
    addDays,
    addMonths,
    addWeeks,
    differenceInCalendarDays,
    endOfDay,
    startOfDay,
    startOfMonth,
    startOfWeek,
} from 'date-fns';
import type { Category, Reseller, Subcategory, Transaction } from '../db/database';
import {
    calculateBalancesByReseller,
    isTransactionReversed,
    transactionOccurredAt,
} from './transactions';

const FINANCIAL_EPSILON = 0.000001;

export interface FinancialReportRange {
    startDate: Date;
    endDate: Date;
}

export interface FinancialReportComparison {
    previousRange: FinancialReportRange;
    sales: number;
    receipts: number;
    orderCount: number;
    openDebt: number;
    salesChangePercent: number | null;
    receiptsChangePercent: number | null;
    orderCountChangePercent: number | null;
    openDebtChangePercent: number | null;
}

export interface FinancialReportSummary {
    sales: number;
    receipts: number;
    periodNet: number;
    openDebt: number;
    orderCount: number;
    itemQuantity: number;
}

export interface FinancialTimelinePoint {
    key: string;
    label: string;
    sales: number;
    receipts: number;
}

export interface FinancialSubcategoryPerformance {
    subcategoryId?: number;
    label: string;
    orderCount: number;
    quantity: number;
    grossValue: number;
}

export interface FinancialCategoryPerformance {
    categoryId?: number;
    label: string;
    orderCount: number;
    quantity: number;
    grossValue: number;
    subcategories: FinancialSubcategoryPerformance[];
}

export interface FinancialResellerPerformance {
    resellerId: number;
    name: string;
    orderCount: number;
    sales: number;
    receipts: number;
    closingBalance: number;
    openDebt: number;
}

export interface FinancialReport {
    range: FinancialReportRange;
    summary: FinancialReportSummary;
    comparison: FinancialReportComparison;
    timeline: FinancialTimelinePoint[];
    categories: FinancialCategoryPerformance[];
    resellers: FinancialResellerPerformance[];
}

function normalizeRange(range: FinancialReportRange): FinancialReportRange {
    const normalized = {
        startDate: startOfDay(range.startDate),
        endDate: endOfDay(range.endDate),
    };

    if (normalized.startDate > normalized.endDate) {
        throw new Error('A data de início não pode ser posterior à data de fim.');
    }

    return normalized;
}

function inRange(transaction: Transaction, range: FinancialReportRange) {
    const occurredAt = transactionOccurredAt(transaction);
    return occurredAt >= range.startDate && occurredAt <= range.endDate;
}

function effectiveInRange(transactions: Transaction[], range: FinancialReportRange) {
    return transactions.filter(transaction => !isTransactionReversed(transaction) && inRange(transaction, range));
}

function effectiveThrough(transactions: Transaction[], endDate: Date) {
    return transactions.filter(transaction =>
        !isTransactionReversed(transaction) && transactionOccurredAt(transaction) <= endDate
    );
}

function percentageChange(current: number, previous: number) {
    if (Math.abs(previous) <= FINANCIAL_EPSILON) {
        return Math.abs(current) <= FINANCIAL_EPSILON ? 0 : null;
    }
    return ((current - previous) / Math.abs(previous)) * 100;
}

function summarizePeriod(periodTransactions: Transaction[]) {
    let sales = 0;
    let receipts = 0;
    let orderCount = 0;
    let itemQuantity = 0;

    periodTransactions.forEach(transaction => {
        if (transaction.type === 'order') {
            sales += transaction.totalPrice;
            orderCount += 1;
            itemQuantity += transaction.quantity ?? 0;
            return;
        }
        receipts += transaction.totalPrice;
    });

    return { sales, receipts, orderCount, itemQuantity };
}

function calculateOpenDebt(transactions: Transaction[], endDate: Date) {
    const balances = calculateBalancesByReseller(effectiveThrough(transactions, endDate));
    return Array.from(balances.values()).reduce((sum, balance) => sum + Math.max(balance, 0), 0);
}

function previousRangeFor(range: FinancialReportRange): FinancialReportRange {
    const days = differenceInCalendarDays(range.endDate, range.startDate) + 1;
    const previousEnd = endOfDay(addDays(range.startDate, -1));
    return {
        startDate: startOfDay(addDays(previousEnd, -(days - 1))),
        endDate: previousEnd,
    };
}

function formatDay(date: Date) {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function formatWeek(date: Date) {
    return `Semana ${date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`;
}

function formatMonth(date: Date) {
    return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
}

function buildTimeline(transactions: Transaction[], range: FinancialReportRange): FinancialTimelinePoint[] {
    const days = differenceInCalendarDays(range.endDate, range.startDate) + 1;
    const periodTransactions = effectiveInRange(transactions, range);

    if (days <= 45) {
        const points = new Map<string, FinancialTimelinePoint>();
        for (let cursor = startOfDay(range.startDate); cursor <= range.endDate; cursor = addDays(cursor, 1)) {
            const key = cursor.toISOString().slice(0, 10);
            points.set(key, { key, label: formatDay(cursor), sales: 0, receipts: 0 });
        }
        periodTransactions.forEach(transaction => {
            const occurredAt = transactionOccurredAt(transaction);
            const key = startOfDay(occurredAt).toISOString().slice(0, 10);
            const point = points.get(key);
            if (!point) return;
            if (transaction.type === 'order') point.sales += transaction.totalPrice;
            else point.receipts += transaction.totalPrice;
        });
        return Array.from(points.values());
    }

    if (days <= 180) {
        const points = new Map<string, FinancialTimelinePoint>();
        const firstWeek = startOfWeek(range.startDate, { weekStartsOn: 1 });
        for (let cursor = firstWeek; cursor <= range.endDate; cursor = addWeeks(cursor, 1)) {
            const key = cursor.toISOString().slice(0, 10);
            points.set(key, { key, label: formatWeek(cursor), sales: 0, receipts: 0 });
        }
        periodTransactions.forEach(transaction => {
            const bucket = startOfWeek(transactionOccurredAt(transaction), { weekStartsOn: 1 });
            const key = bucket.toISOString().slice(0, 10);
            const point = points.get(key);
            if (!point) return;
            if (transaction.type === 'order') point.sales += transaction.totalPrice;
            else point.receipts += transaction.totalPrice;
        });
        return Array.from(points.values());
    }

    const points = new Map<string, FinancialTimelinePoint>();
    const firstMonth = startOfMonth(range.startDate);
    for (let cursor = firstMonth; cursor <= range.endDate; cursor = addMonths(cursor, 1)) {
        const key = cursor.toISOString().slice(0, 7);
        points.set(key, { key, label: formatMonth(cursor), sales: 0, receipts: 0 });
    }
    periodTransactions.forEach(transaction => {
        const bucket = startOfMonth(transactionOccurredAt(transaction));
        const key = bucket.toISOString().slice(0, 7);
        const point = points.get(key);
        if (!point) return;
        if (transaction.type === 'order') point.sales += transaction.totalPrice;
        else point.receipts += transaction.totalPrice;
    });
    return Array.from(points.values());
}

function buildCategoryPerformance(
    transactions: Transaction[],
    range: FinancialReportRange,
    categories: Category[],
    subcategories: Subcategory[],
): FinancialCategoryPerformance[] {
    const categoryById = new Map(
        categories
            .filter((category): category is Category & { id: number } => typeof category.id === 'number')
            .map(category => [category.id, category]),
    );
    const subcategoryById = new Map(
        subcategories
            .filter((subcategory): subcategory is Subcategory & { id: number } => typeof subcategory.id === 'number')
            .map(subcategory => [subcategory.id, subcategory]),
    );

    const groups = new Map<string, FinancialCategoryPerformance>();

    effectiveInRange(transactions, range)
        .filter(transaction => transaction.type === 'order')
        .forEach(transaction => {
            const categoryId = transaction.categoryId;
            const categoryKey = categoryId === undefined ? 'legacy' : `category:${categoryId}`;
            const categoryLabel = categoryId === undefined
                ? 'Sem categoria — histórico legado'
                : categoryById.get(categoryId)?.name || transaction.categoryName || `Categoria #${categoryId}`;

            const category = groups.get(categoryKey) ?? {
                ...(categoryId !== undefined ? { categoryId } : {}),
                label: categoryLabel,
                orderCount: 0,
                quantity: 0,
                grossValue: 0,
                subcategories: [],
            };

            category.orderCount += 1;
            category.quantity += transaction.quantity ?? 0;
            category.grossValue += transaction.totalPrice;

            const subcategoryId = transaction.subcategoryId;
            const subcategoryKey = subcategoryId === undefined ? 'none' : `subcategory:${subcategoryId}`;
            let subcategory = category.subcategories.find(item =>
                (subcategoryId === undefined && item.subcategoryId === undefined)
                || item.subcategoryId === subcategoryId
            );

            if (!subcategory) {
                subcategory = {
                    ...(subcategoryId !== undefined ? { subcategoryId } : {}),
                    label: subcategoryId === undefined
                        ? 'Sem subcategoria'
                        : subcategoryById.get(subcategoryId)?.name
                            || transaction.subcategoryName
                            || `Subcategoria #${subcategoryId}`,
                    orderCount: 0,
                    quantity: 0,
                    grossValue: 0,
                };
                category.subcategories.push(subcategory);
            }

            void subcategoryKey;
            subcategory.orderCount += 1;
            subcategory.quantity += transaction.quantity ?? 0;
            subcategory.grossValue += transaction.totalPrice;
            groups.set(categoryKey, category);
        });

    return Array.from(groups.values())
        .map(category => ({
            ...category,
            subcategories: category.subcategories.sort((left, right) => {
                const valueDelta = right.grossValue - left.grossValue;
                return valueDelta !== 0 ? valueDelta : left.label.localeCompare(right.label, 'pt-BR');
            }),
        }))
        .sort((left, right) => {
            const valueDelta = right.grossValue - left.grossValue;
            return valueDelta !== 0 ? valueDelta : left.label.localeCompare(right.label, 'pt-BR');
        });
}

function buildResellerPerformance(
    transactions: Transaction[],
    range: FinancialReportRange,
    resellers: Reseller[],
): FinancialResellerPerformance[] {
    const resellerById = new Map(
        resellers
            .filter((reseller): reseller is Reseller & { id: number } => typeof reseller.id === 'number')
            .map(reseller => [reseller.id, reseller]),
    );
    const periodTransactions = effectiveInRange(transactions, range);
    const closingBalances = calculateBalancesByReseller(effectiveThrough(transactions, range.endDate));
    const ids = new Set<number>([
        ...periodTransactions.map(transaction => transaction.resellerId),
        ...Array.from(closingBalances.entries())
            .filter(([, balance]) => Math.abs(balance) > FINANCIAL_EPSILON)
            .map(([resellerId]) => resellerId),
    ]);

    return Array.from(ids).map(resellerId => {
        const ownPeriod = periodTransactions.filter(transaction => transaction.resellerId === resellerId);
        const period = summarizePeriod(ownPeriod);
        const closingBalance = closingBalances.get(resellerId) ?? 0;
        return {
            resellerId,
            name: resellerById.get(resellerId)?.name || `Revendedor #${resellerId}`,
            orderCount: period.orderCount,
            sales: period.sales,
            receipts: period.receipts,
            closingBalance,
            openDebt: Math.max(closingBalance, 0),
        };
    }).sort((left, right) => {
        const salesDelta = right.sales - left.sales;
        if (salesDelta !== 0) return salesDelta;
        const debtDelta = right.openDebt - left.openDebt;
        if (debtDelta !== 0) return debtDelta;
        return left.name.localeCompare(right.name, 'pt-BR');
    });
}

export function buildFinancialReport(
    transactions: Transaction[],
    resellers: Reseller[],
    categories: Category[],
    subcategories: Subcategory[],
    inputRange: FinancialReportRange,
): FinancialReport {
    const range = normalizeRange(inputRange);
    const periodTransactions = effectiveInRange(transactions, range);
    const period = summarizePeriod(periodTransactions);
    const openDebt = calculateOpenDebt(transactions, range.endDate);
    const previousRange = previousRangeFor(range);
    const previousPeriod = summarizePeriod(effectiveInRange(transactions, previousRange));
    const previousOpenDebt = calculateOpenDebt(transactions, previousRange.endDate);

    return {
        range,
        summary: {
            sales: period.sales,
            receipts: period.receipts,
            periodNet: period.sales - period.receipts,
            openDebt,
            orderCount: period.orderCount,
            itemQuantity: period.itemQuantity,
        },
        comparison: {
            previousRange,
            sales: previousPeriod.sales,
            receipts: previousPeriod.receipts,
            orderCount: previousPeriod.orderCount,
            openDebt: previousOpenDebt,
            salesChangePercent: percentageChange(period.sales, previousPeriod.sales),
            receiptsChangePercent: percentageChange(period.receipts, previousPeriod.receipts),
            orderCountChangePercent: percentageChange(period.orderCount, previousPeriod.orderCount),
            openDebtChangePercent: percentageChange(openDebt, previousOpenDebt),
        },
        timeline: buildTimeline(transactions, range),
        categories: buildCategoryPerformance(transactions, range, categories, subcategories),
        resellers: buildResellerPerformance(transactions, range, resellers),
    };
}
