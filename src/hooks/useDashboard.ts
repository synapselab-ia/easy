import { useQuery } from '@tanstack/react-query';
import { db, type Transaction } from '../db/database';
import {
    calculateOutstandingDebtLots,
    calculateTotalDebt,
    debtAgeCategory,
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

export function useTotalDebt() {
    return useQuery({
        queryKey: ['dashboard', 'total-debt'],
        queryFn: async () => calculateTotalDebt(await db.transactions.toArray()),
    });
}

export function useTodayOrders() {
    return useQuery({
        queryKey: ['dashboard', 'today-orders'],
        queryFn: async () => {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(startOfDay);
            endOfDay.setHours(23, 59, 59, 999);

            const transactions = effectiveTransactions(await db.transactions.toArray()).filter(transaction => {
                const occurredAt = transactionOccurredAt(transaction);
                return occurredAt >= startOfDay && occurredAt <= endOfDay;
            });

            const todayOrders = transactions.filter(t => t.type === 'order');
            const totalVolume = todayOrders.reduce((sum, current) => sum + current.totalPrice, 0);

            return {
                count: todayOrders.length,
                volume: totalVolume
            };
        },
    });
}

export function useDebtAging() {
    return useQuery({
        queryKey: ['dashboard', 'debt-aging'],
        queryFn: async (): Promise<DebtAgingResult> => {
            const resellers = await db.resellers.toArray();
            const transactions = await db.transactions.toArray();
            const now = new Date();

            const transactionsByReseller = new Map<number, Transaction[]>();
            transactions.forEach(transaction => {
                const resellerTransactions = transactionsByReseller.get(transaction.resellerId) || [];
                resellerTransactions.push(transaction);
                transactionsByReseller.set(transaction.resellerId, resellerTransactions);
            });

            const buckets: Record<'recent' | 'attention' | 'critical', number> = {
                recent: 0,
                attention: 0,
                critical: 0,
            };
            let totalDebt = 0;
            const criticalResellersList: CriticalReseller[] = [];
            const attentionResellersList: CriticalReseller[] = [];

            resellers.forEach(reseller => {
                if (!reseller.id) return;

                const lots = calculateOutstandingDebtLots(transactionsByReseller.get(reseller.id) || []);
                const totalBalance = lots.reduce((sum, lot) => sum + lot.amount, 0);
                if (totalBalance <= 0.01) return;

                totalDebt += totalBalance;

                let criticalAmount = 0;
                let attentionAmount = 0;
                let oldestCritical: Date | null = null;
                let oldestAttention: Date | null = null;

                lots.forEach(lot => {
                    const category = debtAgeCategory(lot.occurredAt, now);
                    buckets[category] += lot.amount;

                    if (category === 'critical') {
                        criticalAmount += lot.amount;
                        if (!oldestCritical || lot.occurredAt < oldestCritical) {
                            oldestCritical = lot.occurredAt;
                        }
                    } else if (category === 'attention') {
                        attentionAmount += lot.amount;
                        if (!oldestAttention || lot.occurredAt < oldestAttention) {
                            oldestAttention = lot.occurredAt;
                        }
                    }
                });

                if (criticalAmount > 0.01 && oldestCritical) {
                    criticalResellersList.push({
                        id: reseller.id,
                        name: reseller.name,
                        balance: criticalAmount,
                        totalBalance,
                        oldestOutstandingAt: oldestCritical,
                        lastMovement: oldestCritical,
                    });
                }

                if (attentionAmount > 0.01 && oldestAttention) {
                    attentionResellersList.push({
                        id: reseller.id,
                        name: reseller.name,
                        balance: attentionAmount,
                        totalBalance,
                        oldestOutstandingAt: oldestAttention,
                        lastMovement: oldestAttention,
                    });
                }
            });

            const resultBuckets: AgingData[] = [
                {
                    category: 'recent',
                    label: 'Recente (0–6d)',
                    value: buckets.recent,
                    percentage: totalDebt > 0 ? (buckets.recent / totalDebt) * 100 : 0,
                    color: '#22c55e'
                },
                {
                    category: 'attention',
                    label: 'Em Atenção (7–30d)',
                    value: buckets.attention,
                    percentage: totalDebt > 0 ? (buckets.attention / totalDebt) * 100 : 0,
                    color: '#eab308'
                },
                {
                    category: 'critical',
                    label: 'Crítico (> 30d)',
                    value: buckets.critical,
                    percentage: totalDebt > 0 ? (buckets.critical / totalDebt) * 100 : 0,
                    color: '#ef4444'
                }
            ];

            return {
                buckets: resultBuckets,
                criticalResellers: criticalResellersList
                    .sort((a, b) => b.balance - a.balance)
                    .slice(0, 10),
                attentionResellers: attentionResellersList
                    .sort((a, b) => b.balance - a.balance)
                    .slice(0, 10),
                totalDebt
            };
        }
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
