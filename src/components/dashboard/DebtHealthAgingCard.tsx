import { Card, CardContent } from '@/components/ui/card';
import type { DashboardAgingBucket } from '@/domain/dashboardSnapshot';
import { SectionHeader } from './SectionHeader';

const FINANCIAL_DISPLAY_EPSILON = 0.01;

const BUCKET_PRESENTATION: Record<
    DashboardAgingBucket['category'],
    { label: string; barClassName: string }
> = {
    recent: {
        label: 'Recente (0–6d)',
        barClassName: 'bg-emerald-500',
    },
    attention: {
        label: 'Em atenção (7–30d)',
        barClassName: 'bg-amber-500',
    },
    critical: {
        label: 'Crítico (>30d)',
        barClassName: 'bg-destructive',
    },
};

interface DebtHealthAgingCardProps {
    buckets?: DashboardAgingBucket[];
    totalDebt?: number;
    isLoading: boolean;
}

function formatBRL(value: number) {
    return `R$ ${value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function formatPercentage(value: number) {
    return `${value.toLocaleString('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
    })}%`;
}

function boundedPercentage(value: number) {
    return Math.min(100, Math.max(0, value));
}

export function DebtHealthAgingCard({ buckets, totalDebt, isLoading }: DebtHealthAgingCardProps) {
    if (isLoading || !buckets || totalDebt === undefined) {
        return (
            <div className="w-full" aria-busy="true">
                <SectionHeader
                    title="Carteira por idade"
                    description="Distribuição da carteira em aberto pelos três intervalos FIFO aceitos."
                />
                <Card className="w-full">
                    <CardContent className="space-y-3 p-4 sm:p-6">
                        {Array.from({ length: 3 }, (_, index) => (
                            <div key={index} className="space-y-3 rounded-lg border p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="h-4 w-36 rounded bg-muted" />
                                    <div className="h-4 w-12 rounded bg-muted" />
                                </div>
                                <div className="h-2 w-full rounded-full bg-muted" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        );
    }

    const hasOpenDebt = totalDebt > FINANCIAL_DISPLAY_EPSILON;

    return (
        <div className="w-full">
            <SectionHeader
                title="Carteira por idade"
                description={
                    <>
                        Distribuição da carteira em aberto pelos três intervalos FIFO aceitos.
                        <span className="sm:ml-2">
                            Total em aberto:{' '}
                            <span className="font-semibold text-foreground">{formatBRL(totalDebt)}</span>
                        </span>
                    </>
                }
            />

            <Card className="w-full overflow-hidden">
                <CardContent className="space-y-4 p-4 sm:p-6">
                    {!hasOpenDebt && (
                        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                            Nenhum saldo em aberto hoje.
                        </p>
                    )}

                    <div className="grid gap-3" role="list" aria-label="Distribuição da carteira por idade">
                        {buckets.map((bucket) => {
                            const presentation = BUCKET_PRESENTATION[bucket.category];
                            const progressValue = boundedPercentage(bucket.percentage);

                            return (
                                <div
                                    key={bucket.category}
                                    role="listitem"
                                    className="space-y-3 rounded-lg border bg-muted/20 p-4"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="font-medium">{presentation.label}</p>
                                            <p className="mt-1 text-sm font-semibold tabular-nums">
                                                {formatBRL(bucket.value)}
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-sm font-semibold tabular-nums">
                                            {formatPercentage(bucket.percentage)}
                                        </span>
                                    </div>

                                    <div
                                        className="h-2 w-full overflow-hidden rounded-full bg-muted"
                                        role="progressbar"
                                        aria-label={`${presentation.label}: ${formatBRL(bucket.value)}, ${formatPercentage(bucket.percentage)}`}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-valuenow={progressValue}
                                    >
                                        <div
                                            className={`h-full rounded-full ${presentation.barClassName}`}
                                            style={{ width: `${progressValue}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
