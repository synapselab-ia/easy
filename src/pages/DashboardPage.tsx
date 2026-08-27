import { DashboardCards } from '../components/dashboard/DashboardCards';
import { AttentionCenter } from '../components/dashboard/AttentionCenter';
import { DebtHealthAgingCard } from '../components/dashboard/DebtHealthAgingCard';
import { PerformanceAnalysisSection } from '../components/dashboard/PerformanceAnalysisSection';
import { useDashboardSnapshot } from '../hooks/useDashboard';

export default function DashboardPage() {
    const { data: snapshot, isLoading } = useDashboardSnapshot();

    return (
        <div className="p-4 lg:p-6 space-y-8">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Visão operacional do mês e da carteira até hoje.</p>
            </div>

            <DashboardCards
                snapshot={snapshot}
                isLoading={isLoading}
            />

            <AttentionCenter
                rows={snapshot?.attentionRows ?? []}
                isLoading={isLoading}
            />

            <div className="w-full">
                <DebtHealthAgingCard
                    buckets={snapshot?.agingBuckets}
                    totalDebt={snapshot?.openDebt.amount}
                    isLoading={isLoading}
                />
            </div>

            <div className="w-full">
                <PerformanceAnalysisSection />
            </div>
        </div>
    );
}
