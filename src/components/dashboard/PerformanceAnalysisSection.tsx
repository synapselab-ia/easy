import { useState } from 'react';
import { usePerformanceAnalysis, type AnalysisPeriod } from "@/hooks/useDashboard";
import { ParetoChart } from "./ParetoChart";
import { DefaultRankingChart } from "./DefaultRankingChart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "./SectionHeader";
import { AlertCircle, Users } from "lucide-react";

const ANALYSIS_PERIOD_OPTIONS = [
    { value: '90', label: 'Últimos 90 dias' },
    { value: '180', label: 'Últimos 180 dias' },
    { value: '360', label: 'Último ano' },
];

const formatBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

export function PerformanceAnalysisSection() {
    const [days, setDays] = useState<AnalysisPeriod>(90);
    const { data, isLoading } = usePerformanceAnalysis(days);

    if (isLoading || !data) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-8 w-64 bg-muted rounded"></div>
                        <div className="h-4 w-96 bg-muted rounded"></div>
                    </div>
                    <div className="h-10 w-32 bg-muted rounded"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-24 bg-muted rounded-lg"></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-[450px] bg-muted rounded-xl"></div>
                    <div className="h-[450px] bg-muted rounded-xl"></div>
                </div>
            </div>
        );
    }

    const { pareto, ranking, insights } = data;

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Análise de Performance"
                description="Inteligência de faturamento e gestão de risco por revendedor."
                className="mt-8 pt-8 border-t"
            >
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Janela:</span>
                    <Select
                        items={ANALYSIS_PERIOD_OPTIONS}
                        value={days.toString()}
                        onValueChange={(val) => setDays(parseInt(val || "0") as AnalysisPeriod)}
                    >
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Selecione o período" />
                        </SelectTrigger>
                        <SelectContent>
                            {ANALYSIS_PERIOD_OPTIONS.map(option => (
                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </SectionHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-primary/5 border-primary/20 shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Concentração de Vendas</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{insights.countTo80} revendedores</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            concentram 80% do seu faturamento total no período.
                        </p>
                    </CardContent>
                </Card>

                {insights.topDebtor && (
                    <Card className="bg-destructive/5 border-destructive/20 shadow-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Maior devedor atual</CardTitle>
                            <AlertCircle className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-destructive">
                                {formatBRL(insights.topDebtor.value)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                <span className="font-bold">{insights.topDebtor.name}</span> é o seu maior devedor acumulado.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ParetoChart data={pareto} />
                <DefaultRankingChart data={ranking} />
            </div>
        </div>
    );
}
