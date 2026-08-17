import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "./SectionHeader";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useDebtAging } from "@/hooks/useDashboard";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { differenceInCalendarDays } from "date-fns";
import { cn } from "@/lib/utils";
import type { CriticalReseller } from "@/hooks/useDashboard";

const formatBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

export function DebtHealthAgingCard() {
    const { data, isLoading } = useDebtAging();
    const now = new Date();

    if (isLoading || !data) {
        return (
            <div className="w-full space-y-4 animate-pulse">
                <div className="space-y-2">
                    <div className="h-8 w-1/3 bg-muted rounded"></div>
                    <div className="h-4 w-1/2 bg-muted rounded"></div>
                </div>
                <Card className="w-full">
                    <CardContent className="h-[400px] flex items-center justify-center">
                        <div className="h-40 w-40 rounded-full bg-muted"></div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { buckets, totalDebt, criticalResellers, attentionResellers } = data;

    return (
        <div className="w-full">
            <SectionHeader
                title="Radar de Recebimentos"
                description={
                    <>
                        Distribuição do saldo devedor pela idade dos pedidos ainda em aberto.
                        <br className="sm:hidden" />
                        <span className="sm:ml-2">
                            Pagamentos e sinais abatem primeiro os pedidos mais antigos (FIFO). Total:{' '}
                            <span className="font-semibold text-foreground">{formatBRL(totalDebt)}</span>
                        </span>
                    </>
                }
            />
            <Card className="w-full overflow-hidden">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="flex flex-col items-center">
                            <div className="h-[240px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={buckets}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={65}
                                            outerRadius={85}
                                            paddingAngle={4}
                                            dataKey="value"
                                            nameKey="label"
                                        >
                                            {buckets.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: any) => formatBRL(Number(value))}
                                            contentStyle={{
                                                borderRadius: '8px',
                                                border: '1px solid hsl(var(--border))',
                                                backgroundColor: 'hsl(var(--card))',
                                                color: 'hsl(var(--card-foreground))',
                                                fontSize: '12px'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="w-full grid grid-cols-1 gap-2 mt-4">
                                {buckets.map((bucket) => (
                                    <div key={bucket.category} className="flex items-center justify-between text-[11px] p-2 rounded border bg-muted/30">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: bucket.color }}
                                            />
                                            <span className="font-medium">{bucket.label}</span>
                                        </div>
                                        <div className="font-bold">{bucket.percentage.toFixed(0)}%</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <ResellerAlertList
                            title="Principais Alertas (Crítico)"
                            resellers={criticalResellers}
                            type="critical"
                            now={now}
                        />

                        <ResellerAlertList
                            title="Em Atenção"
                            resellers={attentionResellers}
                            type="attention"
                            now={now}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function ResellerAlertList({
    title,
    resellers,
    type,
    now
}: {
    title: string;
    resellers: CriticalReseller[];
    type: 'critical' | 'attention';
    now: Date;
}) {
    const navigate = useNavigate();
    return (
        <div className="space-y-4">
            <h3 className={cn(
                "font-semibold text-[11px] flex items-center gap-2 uppercase tracking-widest",
                type === 'critical' ? "text-destructive" : "text-foreground/70"
            )}>
                <div className={cn(
                    "w-2 h-2 rounded-full",
                    type === 'critical' ? "bg-destructive animate-pulse" : "bg-yellow-500"
                )} />
                {title}
            </h3>
            {resellers.length > 0 ? (
                <div className="rounded-md border overflow-hidden bg-card">
                    <Table>
                        <TableBody>
                            {resellers.map((reseller) => {
                                const daysOutstanding = Math.max(
                                    0,
                                    differenceInCalendarDays(now, reseller.oldestOutstandingAt),
                                );

                                return (
                                    <TableRow
                                        key={reseller.id}
                                        className="cursor-pointer hover:bg-muted/50 transition-colors h-11"
                                        onClick={() => navigate(`/resellers/${reseller.id}`)}
                                    >
                                        <TableCell className="py-0 px-3 text-[12px] font-medium max-w-[120px] truncate leading-tight">
                                            {reseller.name}
                                        </TableCell>
                                        <TableCell align="right" className={cn(
                                            "py-0 px-3 text-[12px] font-bold whitespace-nowrap",
                                            type === 'critical' && "text-destructive"
                                        )}>
                                            {formatBRL(reseller.balance)}
                                            <div className="text-[9.5px] text-muted-foreground font-normal leading-none mt-0.5">
                                                {daysOutstanding}d em aberto
                                                {reseller.totalBalance > reseller.balance + 0.01
                                                    ? ` · saldo total ${formatBRL(reseller.totalBalance)}`
                                                    : ''}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="text-center py-8 text-[12px] text-muted-foreground bg-muted/20 rounded-lg border border-dashed flex flex-col items-center justify-center h-[200px]">
                    Nenhum revendedor encontrado.
                </div>
            )}
        </div>
    );
}
