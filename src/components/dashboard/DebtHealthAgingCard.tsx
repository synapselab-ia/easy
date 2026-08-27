import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "./SectionHeader";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useDebtAging } from "@/hooks/useDashboard";

const formatBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

export function DebtHealthAgingCard() {
    const { data, isLoading } = useDebtAging();

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

    const { buckets, totalDebt } = data;

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
                    <div className="mx-auto w-full max-w-xl">
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

                        <div className="mt-4 grid w-full grid-cols-1 gap-2">
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
                </CardContent>
            </Card>
        </div>
    );
}
