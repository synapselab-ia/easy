import { useQuery } from '@tanstack/react-query';
import { db } from '../db/database';
import {
    type DashboardResellerDebtProfile,
    type DashboardSnapshot,
    buildDashboardSnapshot,
} from '../domain/dashboardSnapshot';
import {
    effectiveTransactions,
    transactionOccurredAt,
    transactionSignedAmount,
} from '../domain/transactions';
import { subDays } from 'date-fns';

export interface AgingData {
    category: 'recent' | 'attention' | 'critical';
    label: string;
    value: number;
    percentage: number;
    color: string;
}

export interface CriticalReseller {
    id: number;
    name: string;
    /** Amount outstanding in the alert bucket. */
    balance: number;
    /** Entire positive outstanding balance for the reseller. */
    totalBalance: number;
    /** Oldest still-open order occurrence represented by this alert. */
    oldestOutstandingAt: Date;
    /** Backward-compatible alias for P3-S1 consumers; semantics now mean oldest open debt. */
    lastMovement: Date;
}

export interface DebtAgingResult {
    buckets: AgingData[];
    criticalResellers: CriticalReseller[];
    attentionResellers: CriticalReseller[];
    totalDebt: number;
}

export interface PerformanceData {
    pareto: {
        resellerName: string;
        revenue: number;
        cumulativePercentage: number;
    }[];
    ranking: {
        resellerName: string;
        balance: number;
    }[];
    insights: {
        countTo80: number;
        topDebtor: { name: string; value: number } | null;
    };
}

export type AnalysisPeriod = 90 | 180 | 360;

const DASHBOARD_SNAPSHOT_QUERY_KEY = ['dashboard', 'snapshot'] as const;

async function loadDashboardSnapshot() {
    const [transactions, resellers] = await Promise.all([
        db.transactions.toArray(),
        db.resellers.toArray(),
    ]);

    return buildDashboardSnapshot(transactions, resellers, new Date());
}

export function useDashboardSnapshot() {
    return useQuery({
        queryKey: DASHBOARD_SNAPSHOT_QUERY_KEY,
        queryFn: loadDashboardSnapshot,
    });
}

export function useTotalDebt() {
    return useQuery({
        queryKey: DASHBOARD_SNAPSHOT_QUERY_KEY,
        queryFn: loadDashboardSnapshot,
        select: snapshot => snapshot.openDebt.amount,
    });
}

export function useTodayOrders() {
    return useQuery({
        queryKey: DASHBOARD_SNAPSHOT_QUERY_KEY,
        queryFn: loadDashboardSnapshot,
        select: snapshot => ({
            count: snapshot.today.orderCount,
            volume: snapshot.today.sales,
        }),
    });
}

function legacyAlertReseller(
    profile: DashboardResellerDebtProfile,
    kind: 'critical' | 'attention',
): CriticalReseller | null {
    const balance = kind === 'critical' ? profile.criticalAmount : profile.attentionAmount;
    const oldestOutstandingAt = kind === 'critical'
        ? profile.oldestCriticalAt
        : profile.oldestAttentionAt;

    if (balance <= 0.01 || !oldestOutstandingAt) return null;

    return {
        id: profile.resellerId,
        name: profile.resellerName,
        balance,
        totalBalance: profile.totalOpenDebt,
        oldestOutstandingAt,
        lastMovement: oldestOutstandingAt,
    };
}

function legacyDebtAging(snapshot: DashboardSnapshot): DebtAgingResult {
    const labels: Record<AgingData['category'], string> = {
        recent: 'Recente (0–6d)',
        attention: 'Em Atenção (7–30d)',
        critical: 'Crítico (> 30d)',
    };
    const colors: Record<AgingData['category'], string> = {
        recent: '#22c55e',
        attention: '#eab308',
        critical: '#ef4444',
    };

    const criticalResellers = snapshot.resellerDebtProfiles
        .map(profile => legacyAlertReseller(profile, 'critical'))
        .filter((reseller): reseller is CriticalReseller => reseller !== null)
        .sort((left, right) => right.balance - left.balance)
        .slice(0, 10);
    const attentionResellers = snapshot.resellerDebtProfiles
        .map(profile => legacyAlertReseller(profile, 'attention'))
        .filter((reseller): reseller is CriticalReseller => reseller !== null)
        .sort((left, right) => right.balance - left.balance)
        .slice(0, 10);

    return {
        buckets: snapshot.agingBuckets.map(bucket => ({
            ...bucket,
            label: labels[bucket.category],
            color: colors[bucket.category],
        })),
        criticalResellers,
        attentionResellers,
        totalDebt: snapshot.openDebt.amount,
    };
}

export function useDebtAging() {
    return useQuery({
        queryKey: DASHBOARD_SNAPSHOT_QUERY_KEY,
        queryFn: loadDashboardSnapshot,
        select: legacyDebtAging,
    });
}

export function usePerformanceAnalysis(days: AnalysisPeriod) {
    return useQuery({
        queryKey: ['dashboard', 'performance-analysis', days],
        queryFn: async (): Promise<PerformanceData> => {
            const resellers = await db.resellers.toArray();
            const transactions = effectiveTransactions(await db.transactions.toArray());
            const startDate = subDays(new Date(), days);

            const resellerMap = new Map<number, { name: string; revenue: number; balance: number }>();

            resellers.forEach(r => {
                if (r.id) {
                    resellerMap.set(r.id, { name: r.name, revenue: 0, balance: 0 });
                }
            });

            transactions.forEach(t => {
                const data = resellerMap.get(t.resellerId);
                if (data) {
                    data.balance += transactionSignedAmount(t);

                    if (t.type === 'order' && transactionOccurredAt(t) >= startDate) {
                        data.revenue += t.totalPrice;
                    }
                }
            });

            const sortedByRevenue = Array.from(resellerMap.values())
                .filter(d => d.revenue > 0)
                .sort((a, b) => b.revenue - a.revenue);

            const totalRevenue = sortedByRevenue.reduce((sum, d) => sum + d.revenue, 0);
            let runningTotal = 0;
            let countTo80 = 0;
            let reached80 = false;

            const pareto = sortedByRevenue.map(d => {
                runningTotal += d.revenue;
                const cumulativePercentage = totalRevenue > 0 ? (runningTotal / totalRevenue) * 100 : 0;

                if (!reached80) {
                    countTo80++;
                    if (cumulativePercentage >= 80) {
                        reached80 = true;
                    }
                }

                return {
                    resellerName: d.name,
                    revenue: d.revenue,
                    cumulativePercentage
                };
            });

            const ranking = Array.from(resellerMap.values())
                .filter(d => d.balance > 0.01)
                .sort((a, b) => b.balance - a.balance)
                .slice(0, 10)
                .map(d => ({
                    resellerName: d.name,
                    balance: d.balance
                }));

            const topDebtor = ranking.length > 0
                ? { name: ranking[0].resellerName, value: ranking[0].balance }
                : null;

            return {
                pareto,
                ranking,
                insights: {
                    countTo80,
                    topDebtor
                }
            };
        }
    });
}
