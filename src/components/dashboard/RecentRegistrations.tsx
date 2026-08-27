import { isSameDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DashboardRecentRegistration } from '@/domain/dashboardSnapshot';
import { SectionHeader } from './SectionHeader';

interface RecentRegistrationsProps {
    rows: DashboardRecentRegistration[];
    isLoading: boolean;
}

const TYPE_PRESENTATION: Record<
    DashboardRecentRegistration['type'],
    { label: string; className: string }
> = {
    order: {
        label: 'Pedido',
        className: 'border-blue-500/30 bg-blue-500/10 text-foreground',
    },
    payment: {
        label: 'Pagamento',
        className: 'border-emerald-500/30 bg-emerald-500/10 text-foreground',
    },
    signal: {
        label: 'Sinal',
        className: 'border-amber-500/30 bg-amber-500/10 text-foreground',
    },
};

function formatBRL(value: number) {
    return `R$ ${value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function formatDate(value: Date) {
    return value.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function formatRegistration(value: Date) {
    return value.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function RecentRegistrations({ rows, isLoading }: RecentRegistrationsProps) {
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <section className="w-full" aria-busy="true" aria-label="Carregando últimos lançamentos registrados">
                <SectionHeader
                    title="Últimos lançamentos registrados"
                    description="Confirmação rápida das movimentações efetivas registradas mais recentemente."
                />
                <Card>
                    <CardContent className="space-y-3 p-4">
                        {Array.from({ length: 3 }, (_, index) => (
                            <div key={index} className="h-16 rounded bg-muted" />
                        ))}
                    </CardContent>
                </Card>
            </section>
        );
    }

    return (
        <section className="w-full">
            <SectionHeader
                title="Últimos lançamentos registrados"
                description="Movimentações efetivas mais recentes por horário de registro."
            />

            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    {rows.length === 0 ? (
                        <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                            Nenhum lançamento efetivo registrado ainda.
                        </div>
                    ) : (
                        <div role="list" aria-label="Últimos lançamentos efetivos" className="divide-y">
                            {rows.map((row, index) => {
                                const presentation = TYPE_PRESENTATION[row.type];
                                const showOccurrenceDate = !isSameDay(row.createdAt, row.occurredAt);
                                const rowKey = row.transactionId ?? `${row.resellerId}-${row.createdAt.getTime()}-${index}`;

                                return (
                                    <div key={rowKey} role="listitem">
                                        <button
                                            type="button"
                                            className="grid w-full grid-cols-1 gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                                            onClick={() => navigate(`/resellers/${row.resellerId}`)}
                                            aria-label={`Abrir histórico de ${row.resellerName}: ${presentation.label}, ${formatBRL(row.totalPrice)}`}
                                        >
                                            <div className="min-w-0 space-y-1.5">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span
                                                        className={cn(
                                                            'rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide',
                                                            presentation.className,
                                                        )}
                                                    >
                                                        {presentation.label}
                                                    </span>
                                                    <span className="truncate text-sm font-semibold">{row.resellerName}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Registrado em {formatRegistration(row.createdAt)}
                                                    {showOccurrenceDate
                                                        ? ` · Ocorrência: ${formatDate(row.occurredAt)}`
                                                        : ''}
                                                </p>
                                            </div>

                                            <div className="text-sm font-bold tabular-nums sm:text-right">
                                                {formatBRL(row.totalPrice)}
                                            </div>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </section>
    );
}
