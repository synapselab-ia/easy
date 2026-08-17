import { useQuery } from '@tanstack/react-query';
import { db } from '../db/database';
import { calculateBalance, effectiveTransactions } from '../domain/transactions';
import { differenceInDays, subDays } from 'date-fns';

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
    balance: number;
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
        queryFn: async () => calculateBalance(await db.transactions.toArray()),
    });
}

export function useTodayOrders() {
    return useQuery({
        queryKey: ['dashboard', 'today-orders'],
        queryFn: async () => {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const transactions = await db.transactions
                .where('createdAt')
                .aboveOrEqual(startOfDay)
                .toArray();

            const todayOrders = effectiveTransactions(transactions).filter(t => t.type === 'order');

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
            const transactions = effectiveTransactions(await db.transactions.toArray());

            const resellerMap = new Map<number, { name: string; balance: number; lastDate: Date | null }>();

            resellers.forEach(r => {
                if (r.id) {
                    resellerMap.set(r.id, { name: r.name, balance: 0, lastDate: null });
                }
            });

            transactions.forEach(t => {
                const data = resellerMap.get(t.resellerId);
                if (data) {
                    if (t.type === 'order') {
                        data.balance += t.totalPrice;
                    } else {
                        data.balance -= t.totalPrice;
                    }

                    if (!data.lastDate || t.createdAt > data.lastDate) {
                        data.lastDate = t.createdAt;
                    }
                }
            });

            const now = new Date();
            let totalDebt = 0;
            const buckets: Record<string, number> = {
                recent: 0,
                attention: 0,
                critical: 0
            };

            const criticalResellersList: CriticalReseller[] = [];
            const attentionResellersList: CriticalReseller[] = [];

            resellerMap.forEach((data, id) => {
                if (data.balance > 0.01) {
                    totalDebt += data.balance;

                    let category: 'recent' | 'attention' | 'critical';

                    if (!data.lastDate) {
                        category = 'critical';
                    } else {
                        const days = differenceInDays(now, data.lastDate);
                        if (days < 7) {
                            category = 'recent';
                        } else if (days <= 30) {
                            category = 'attention';
                        } else {
                            category = 'critical';
                        }
                    }

                    buckets[category] += data.balance;

                    if (category === 'critical') {
                        criticalResellersList.push({
                            id,
                            name: data.name,
                            balance: data.balance,
                            lastMovement: data.lastDate || new Date(0)
                        });
                    } else if (category === 'attention') {
                        attentionResellersList.push({
                            id,
                            name: data.name,
                            balance: data.balance,
                            lastMovement: data.lastDate || new Date(0)
                        });
                    }
                }
            });

            const resultBuckets: AgingData[] = [
                {
                    category: 'recent',
                    label: 'Recente (< 7d)',
                    value: buckets.recent,
                    percentage: totalDebt > 0 ? (buckets.recent / totalDebt) * 100 : 0,
                    color: '#22c55e'
                },
                {
                    category: 'attention',
                    label: 'Em Atenção (8-30d)',
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
                    if (t.type === 'order') {
                        data.balance += t.totalPrice;
                    } else {
                        data.balance -= t.totalPrice;
                    }

                    if (t.type === 'order' && t.createdAt >= startDate) {
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
