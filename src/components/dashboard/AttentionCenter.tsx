import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DashboardAttentionRow } from '@/domain/dashboardSnapshot';
import { SectionHeader } from './SectionHeader';

const INITIAL_VISIBLE_ROWS = 6;
const FINANCIAL_DISPLAY_EPSILON = 0.01;

interface AttentionCenterProps {
    rows: DashboardAttentionRow[];
    isLoading: boolean;
}

function formatBRL(value: number) {
    return `R$ ${value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function formatAge(days: number) {
    return days === 1 ? '1 dia' : `${days} dias`;
}

export function AttentionCenter({ rows, isLoading }: AttentionCenterProps) {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);

    if (isLoading) {
        return (
            <div className="w-full space-y-4 animate-pulse" aria-label="Carregando prioridades da carteira">
                <div className="space-y-2">
                    <div className="h-8 w-1/3 rounded bg-muted" />
                    <div className="h-4 w-2/3 rounded bg-muted" />
                </div>
                <Card>
                    <CardContent className="space-y-3 p-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="h-16 rounded bg-muted" />
                        ))}
                    </CardContent>
                </Card>
            </div>
        );
    }

    const visibleRows = expanded ? rows : rows.slice(0, INITIAL_VISIBLE_ROWS);
    const hiddenCount = Math.max(0, rows.length - visibleRows.length);

    return (
        <section className="w-full">
            <SectionHeader
                title="Precisa de atenção"
                description="Prioridades da carteira hoje, ordenadas por gravidade, idade e valor em aberto."
            />

            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    {rows.length === 0 ? (
                        <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                            Nenhuma pendência em atenção ou crítica hoje.
                        </div>
                    ) : (
                        <>
                            <div role="list" aria-label="Revendedores que precisam de atenção" className="divide-y">
                                {visibleRows.map((row) => {
                                    const showTotalOpenDebt = row.totalOpenDebt > row.alertAmount + FINANCIAL_DISPLAY_EPSILON;
                                    const statusLabel = row.status === 'critical' ? 'CRÍTICO' : 'ATENÇÃO';

                                    return (
                                        <div key={row.resellerId} role="listitem">
                                            <button
                                                type="button"
                                                className="grid w-full grid-cols-1 gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                                                onClick={() => navigate(`/resellers/${row.resellerId}`)}
                                                aria-label={`${row.resellerName}, ${statusLabel}, ${formatAge(row.ageDays)}, ${formatBRL(row.alertAmount)}`}
                                            >
                                                <div className="min-w-0 space-y-1.5">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="truncate text-sm font-semibold">{row.resellerName}</span>
                                                        <span
                                                            className={cn(
                                                                'rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide',
                                                                row.status === 'critical'
                                                                    ? 'border-destructive/30 bg-destructive/10 text-destructive'
                                                                    : 'border-yellow-500/30 bg-yellow-500/10 text-foreground',
                                                            )}
                                                        >
                                                            {statusLabel}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatAge(row.ageDays)} desde o lançamento em aberto que determina esta prioridade.
                                                    </p>
                                                </div>

                                                <div className="sm:text-right">
                                                    <div
                                                        className={cn(
                                                            'text-sm font-bold tabular-nums',
                                                            row.status === 'critical' && 'text-destructive',
                                                        )}
                                                    >
                                                        {formatBRL(row.alertAmount)}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground">
                                                        {row.status === 'critical' ? 'valor crítico' : 'valor em atenção'}
                                                        {showTotalOpenDebt
                                                            ? ` · carteira total ${formatBRL(row.totalOpenDebt)}`
                                                            : ''}
                                                    </div>
                                                </div>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {rows.length > INITIAL_VISIBLE_ROWS && (
                                <div className="flex items-center justify-between gap-3 border-t bg-muted/20 px-4 py-3">
                                    <span className="text-xs text-muted-foreground">
                                        {expanded
                                            ? `${rows.length} prioridades exibidas.`
                                            : `${hiddenCount} ${hiddenCount === 1 ? 'prioridade adicional' : 'prioridades adicionais'}.`}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setExpanded(current => !current)}
                                    >
                                        {expanded ? 'Mostrar menos' : 'Ver todos'}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </section>
    );
}
