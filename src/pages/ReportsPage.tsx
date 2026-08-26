import { useMemo, useState } from 'react';
import {
    ArrowDownRight,
    ArrowUpRight,
    ChevronDown,
    ChevronRight,
    CircleDollarSign,
    FileDown,
    PackageSearch,
    ReceiptText,
    ShoppingBag,
    Users,
    WalletCards,
} from 'lucide-react';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { endOfMonth, startOfMonth, startOfWeek, startOfYear, subMonths } from 'date-fns';
import { useCategories } from '../hooks/useCategories';
import { useResellers } from '../hooks/useResellers';
import { useSubcategories } from '../hooks/useSubcategories';
import { useTransactions } from '../hooks/useTransactions';
import { buildFinancialReport, type FinancialReport } from '../domain/financialReporting';
import {
    DEFAULT_FINANCIAL_REPORT_PDF_OPTIONS,
    generateFinancialReportPdf,
    type FinancialReportPdfOptions,
} from '../services/financialReportPdfService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ResponsiveDialog } from '../components/ui/ResponsiveDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../components/ui/table';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

const compactCurrencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
});

type ReportTab = 'summary' | 'categories' | 'resellers';
type PeriodPreset = 'today' | 'week' | 'month' | 'previous-month' | 'year' | 'custom';

function inputDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function dateFromInput(value: string) {
    return new Date(`${value}T12:00:00`);
}

function presetRange(preset: PeriodPreset, now = new Date()) {
    switch (preset) {
        case 'today':
            return { start: inputDate(now), end: inputDate(now) };
        case 'week':
            return {
                start: inputDate(startOfWeek(now, { weekStartsOn: 1 })),
                end: inputDate(now),
            };
        case 'previous-month': {
            const previous = subMonths(now, 1);
            return {
                start: inputDate(startOfMonth(previous)),
                end: inputDate(endOfMonth(previous)),
            };
        }
        case 'year':
            return { start: inputDate(startOfYear(now)), end: inputDate(now) };
        case 'month':
        default:
            return { start: inputDate(startOfMonth(now)), end: inputDate(now) };
    }
}

function comparisonText(value: number | null) {
    if (value === null) return 'Sem base comparável no período anterior';
    if (Math.abs(value) < 0.05) return 'Sem variação relevante vs. período anterior';
    return `${value > 0 ? '+' : ''}${value.toFixed(1).replace('.', ',')}% vs. período anterior`;
}

function SummaryMetric({
    title,
    value,
    comparison,
    icon,
    lowerIsBetter = false,
    detail,
}: {
    title: string;
    value: string;
    comparison: number | null;
    icon: React.ReactNode;
    lowerIsBetter?: boolean;
    detail?: string;
}) {
    const changed = comparison !== null && Math.abs(comparison) >= 0.05;
    const isGood = changed ? (lowerIsBetter ? comparison < 0 : comparison > 0) : false;
    const isBad = changed ? !isGood : false;

    return (
        <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className="rounded-md border bg-muted/40 p-2 text-muted-foreground">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tracking-tight">{value}</div>
                <div className="mt-2 flex items-center gap-1 text-xs">
                    {changed && comparison !== null && (
                        comparison > 0
                            ? <ArrowUpRight className={`h-3.5 w-3.5 ${isBad ? 'text-debt' : 'text-payment'}`} />
                            : <ArrowDownRight className={`h-3.5 w-3.5 ${isBad ? 'text-debt' : 'text-payment'}`} />
                    )}
                    <span className={changed ? (isBad ? 'text-debt' : 'text-payment') : 'text-muted-foreground'}>
                        {comparisonText(comparison)}
                    </span>
                </div>
                {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
            </CardContent>
        </Card>
    );
}

function ReportTabs({ value, onChange }: { value: ReportTab; onChange: (value: ReportTab) => void }) {
    const tabs: Array<{ value: ReportTab; label: string }> = [
        { value: 'summary', label: 'Resumo' },
        { value: 'categories', label: 'Produtos e categorias' },
        { value: 'resellers', label: 'Revendedores' },
    ];

    return (
        <div className="inline-flex w-full rounded-lg border bg-muted/30 p-1 sm:w-auto">
            {tabs.map(tab => (
                <button
                    key={tab.value}
                    type="button"
                    onClick={() => onChange(tab.value)}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors sm:flex-none ${
                        value === tab.value
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

function FinancialTimeline({ report }: { report: FinancialReport }) {
    const hasMovement = report.timeline.some(point => point.sales > 0 || point.receipts > 0);

    return (
        <Card className="shadow-none">
            <CardHeader>
                <CardTitle>Vendas e recebimentos</CardTitle>
                <CardDescription>
                    Movimento financeiro pela data de ocorrência dos lançamentos válidos no período.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!hasMovement ? (
                    <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                        Nenhum movimento financeiro no período selecionado.
                    </div>
                ) : (
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={report.timeline} margin={{ top: 10, right: 12, bottom: 8, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 11 }} minTickGap={22} />
                                <YAxis
                                    tick={{ fontSize: 11 }}
                                    tickFormatter={(value: number) => compactCurrencyFormatter.format(value)}
                                    width={72}
                                />
                                <Tooltip
                                    formatter={(value: number | string, name: string) => [
                                        currencyFormatter.format(Number(value)),
                                        name,
                                    ]}
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: '1px solid hsl(var(--border))',
                                        backgroundColor: 'hsl(var(--card))',
                                        color: 'hsl(var(--card-foreground))',
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="sales"
                                    name="Vendas"
                                    stroke="hsl(var(--foreground))"
                                    strokeWidth={2.5}
                                    dot={false}
                                    activeDot={{ r: 4 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="receipts"
                                    name="Recebimentos"
                                    stroke="hsl(var(--payment))"
                                    strokeWidth={2.5}
                                    dot={false}
                                    activeDot={{ r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function SummaryView({ report }: { report: FinancialReport }) {
    const topCategory = report.categories[0];
    const topReseller = report.resellers.find(reseller => reseller.sales > 0);

    return (
        <div className="space-y-6">
            <FinancialTimeline report={report} />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <PackageSearch className="h-4 w-4" />
                            Destaque de produtos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {topCategory ? (
                            <div className="space-y-2">
                                <div className="flex items-end justify-between gap-4">
                                    <div>
                                        <p className="font-semibold">{topCategory.label}</p>
                                        <p className="text-sm text-muted-foreground">Categoria com maior venda no período</p>
                                    </div>
                                    <p className="text-xl font-bold">{currencyFormatter.format(topCategory.grossValue)}</p>
                                </div>
                                {topCategory.subcategories.slice(0, 3).map(subcategory => (
                                    <div key={subcategory.subcategoryId ?? subcategory.label} className="flex justify-between border-t pt-2 text-sm">
                                        <span className="text-muted-foreground">{subcategory.label}</span>
                                        <span className="font-medium">{currencyFormatter.format(subcategory.grossValue)}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Nenhuma venda para destacar neste período.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Users className="h-4 w-4" />
                            Destaque de revendedores
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {topReseller ? (
                            <div className="space-y-2">
                                <div className="flex items-end justify-between gap-4">
                                    <div>
                                        <p className="font-semibold">{topReseller.name}</p>
                                        <p className="text-sm text-muted-foreground">Maior volume de vendas no período</p>
                                    </div>
                                    <p className="text-xl font-bold">{currencyFormatter.format(topReseller.sales)}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 border-t pt-3 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Recebido</p>
                                        <p className="font-medium text-payment">{currencyFormatter.format(topReseller.receipts)}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Em aberto no fim</p>
                                        <p className={`font-medium ${topReseller.openDebt > 0 ? 'text-debt' : ''}`}>
                                            {currencyFormatter.format(topReseller.openDebt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Nenhuma venda para destacar neste período.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function CategoryView({ report }: { report: FinancialReport }) {
    const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

    const toggle = (key: string) => {
        setExpanded(current => {
            const next = new Set(current);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    if (report.categories.length === 0) {
        return (
            <Card className="shadow-none">
                <CardContent className="py-12 text-center text-sm text-muted-foreground">
                    Nenhum pedido válido encontrado no período selecionado.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden shadow-none">
            <CardHeader>
                <CardTitle>Desempenho por categoria</CardTitle>
                <CardDescription>
                    Abra uma categoria para detalhar as subcategorias registradas nos pedidos.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y border-t">
                    {report.categories.map(category => {
                        const key = category.categoryId === undefined ? 'legacy' : String(category.categoryId);
                        const isExpanded = expanded.has(key);
                        return (
                            <div key={key}>
                                <button
                                    type="button"
                                    onClick={() => toggle(key)}
                                    className="grid w-full grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/40"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        {isExpanded
                                            ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
                                        <div className="min-w-0">
                                            <p className="truncate font-medium">{category.label}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {category.orderCount} pedidos · {category.quantity} itens · {category.subcategories.length} grupos
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-right font-semibold">{currencyFormatter.format(category.grossValue)}</p>
                                </button>
                                {isExpanded && (
                                    <div className="border-t bg-muted/20 px-5 py-2 sm:pl-12">
                                        {category.subcategories.map(subcategory => (
                                            <div
                                                key={subcategory.subcategoryId ?? subcategory.label}
                                                className="grid grid-cols-[1fr_auto] gap-4 border-b py-3 last:border-b-0"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium">{subcategory.label}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {subcategory.orderCount} pedidos · {subcategory.quantity} itens
                                                    </p>
                                                </div>
                                                <p className="text-sm font-semibold">{currencyFormatter.format(subcategory.grossValue)}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

function ResellerView({ report }: { report: FinancialReport }) {
    return (
        <Card className="overflow-hidden shadow-none">
            <CardHeader>
                <CardTitle>Revendedores</CardTitle>
                <CardDescription>
                    Vendas e recebimentos são do período; o valor em aberto considera todo o histórico até a data final.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto border-t">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Revendedor</TableHead>
                                <TableHead className="text-right">Pedidos</TableHead>
                                <TableHead className="text-right">Vendas</TableHead>
                                <TableHead className="text-right">Recebido</TableHead>
                                <TableHead className="text-right">Em aberto</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {report.resellers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                                        Nenhum revendedor com movimento ou saldo no período.
                                    </TableCell>
                                </TableRow>
                            ) : report.resellers.map(reseller => (
                                <TableRow key={reseller.resellerId}>
                                    <TableCell className="font-medium">{reseller.name}</TableCell>
                                    <TableCell className="text-right">{reseller.orderCount}</TableCell>
                                    <TableCell className="text-right">{currencyFormatter.format(reseller.sales)}</TableCell>
                                    <TableCell className="text-right text-payment">{currencyFormatter.format(reseller.receipts)}</TableCell>
                                    <TableCell className={`text-right font-medium ${reseller.openDebt > 0 ? 'text-debt' : ''}`}>
                                        {currencyFormatter.format(reseller.openDebt)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

function PdfOptionsDialog({
    open,
    onOpenChange,
    report,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    report: FinancialReport;
}) {
    const [options, setOptions] = useState<FinancialReportPdfOptions>(DEFAULT_FINANCIAL_REPORT_PDF_OPTIONS);

    const fields: Array<{ key: keyof FinancialReportPdfOptions; label: string }> = [
        { key: 'includeSummary', label: 'Resumo financeiro' },
        { key: 'includeTimeline', label: 'Movimento no período' },
        { key: 'includeCategories', label: 'Produtos, categorias e subcategorias' },
        { key: 'includeResellers', label: 'Revendedores' },
    ];
    const hasSelection = Object.values(options).some(Boolean);

    return (
        <ResponsiveDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Gerar relatório PDF"
            description={`${report.range.startDate.toLocaleDateString('pt-BR')} a ${report.range.endDate.toLocaleDateString('pt-BR')}`}
            footer={(
                <div className="flex w-full gap-2 sm:justify-end">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button
                        disabled={!hasSelection}
                        onClick={() => {
                            generateFinancialReportPdf(report, options);
                            onOpenChange(false);
                        }}
                    >
                        <FileDown className="h-4 w-4" />
                        Gerar PDF
                    </Button>
                </div>
            )}
        >
            <div className="space-y-3">
                {fields.map(field => (
                    <label key={field.key} className="flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm">
                        <input
                            type="checkbox"
                            checked={options[field.key]}
                            onChange={event => setOptions(current => ({ ...current, [field.key]: event.target.checked }))}
                            className="h-4 w-4 accent-current"
                        />
                        <span>{field.label}</span>
                    </label>
                ))}
            </div>
        </ResponsiveDialog>
    );
}

export default function ReportsPage() {
    const initialRange = presetRange('month');
    const [preset, setPreset] = useState<PeriodPreset>('month');
    const [startDate, setStartDate] = useState(initialRange.start);
    const [endDate, setEndDate] = useState(initialRange.end);
    const [tab, setTab] = useState<ReportTab>('summary');
    const [pdfOpen, setPdfOpen] = useState(false);

    const { data: transactions = [], isLoading: loadingTransactions } = useTransactions();
    const { data: resellers = [], isLoading: loadingResellers } = useResellers();
    const { data: categories = [], isLoading: loadingCategories } = useCategories();
    const { data: subcategories = [], isLoading: loadingSubcategories } = useSubcategories();

    const isLoading = loadingTransactions || loadingResellers || loadingCategories || loadingSubcategories;
    const hasCompleteRange = startDate !== '' && endDate !== '';
    const parsedStart = hasCompleteRange ? dateFromInput(startDate) : undefined;
    const parsedEnd = hasCompleteRange ? dateFromInput(endDate) : undefined;
    const isInvalidRange = !!parsedStart && !!parsedEnd && parsedStart > parsedEnd;

    const report = useMemo(() => {
        if (!parsedStart || !parsedEnd || isInvalidRange) return undefined;
        return buildFinancialReport(
            transactions,
            resellers,
            categories,
            subcategories,
            { startDate: parsedStart, endDate: parsedEnd },
        );
    }, [categories, isInvalidRange, parsedEnd, parsedStart, resellers, subcategories, transactions]);

    const applyPreset = (value: PeriodPreset) => {
        setPreset(value);
        if (value === 'custom') return;
        const range = presetRange(value);
        setStartDate(range.start);
        setEndDate(range.end);
    };

    const updateCustomDate = (field: 'start' | 'end', value: string) => {
        setPreset('custom');
        if (field === 'start') setStartDate(value);
        else setEndDate(value);
    };

    return (
        <div className="space-y-6 p-4 lg:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
                    <p className="text-sm text-muted-foreground">
                        Entenda vendas, recebimentos, categorias e revendedores — e transforme a mesma visão em PDF.
                    </p>
                </div>
                <Button onClick={() => setPdfOpen(true)} disabled={!report || isLoading} className="w-full sm:w-auto">
                    <FileDown className="h-4 w-4" />
                    Gerar relatório PDF
                </Button>
            </div>

            <Card className="shadow-none">
                <CardContent className="pt-6">
                    <div className="grid gap-4 lg:grid-cols-[220px_1fr_1fr] lg:items-end">
                        <div className="space-y-1.5">
                            <Label>Período</Label>
                            <Select value={preset} onValueChange={value => applyPreset((value || 'month') as PeriodPreset)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione o período" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="today">Hoje</SelectItem>
                                    <SelectItem value="week">Esta semana</SelectItem>
                                    <SelectItem value="month">Este mês</SelectItem>
                                    <SelectItem value="previous-month">Mês passado</SelectItem>
                                    <SelectItem value="year">Este ano</SelectItem>
                                    <SelectItem value="custom">Personalizado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="report-start">Data inicial</Label>
                            <Input
                                id="report-start"
                                type="date"
                                value={startDate}
                                onChange={event => updateCustomDate('start', event.target.value)}
                                aria-invalid={isInvalidRange}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="report-end">Data final</Label>
                            <Input
                                id="report-end"
                                type="date"
                                value={endDate}
                                onChange={event => updateCustomDate('end', event.target.value)}
                                aria-invalid={isInvalidRange}
                            />
                        </div>
                    </div>
                    {!hasCompleteRange && (
                        <p role="alert" className="mt-3 text-sm text-muted-foreground">
                            Informe a data inicial e a data final para montar o relatório.
                        </p>
                    )}
                    {isInvalidRange && (
                        <p role="alert" className="mt-3 text-sm text-debt">
                            A data inicial não pode ser posterior à data final.
                        </p>
                    )}
                </CardContent>
            </Card>

            {isLoading ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {[1, 2, 3, 4].map(item => <div key={item} className="h-36 animate-pulse rounded-xl bg-muted" />)}
                </div>
            ) : report ? (
                <>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <SummaryMetric
                            title="Vendas"
                            value={currencyFormatter.format(report.summary.sales)}
                            comparison={report.comparison.salesChangePercent}
                            icon={<CircleDollarSign className="h-4 w-4" />}
                            detail={`${report.summary.itemQuantity} itens em ${report.summary.orderCount} pedidos`}
                        />
                        <SummaryMetric
                            title="Recebimentos"
                            value={currencyFormatter.format(report.summary.receipts)}
                            comparison={report.comparison.receiptsChangePercent}
                            icon={<WalletCards className="h-4 w-4" />}
                        />
                        <SummaryMetric
                            title="Em aberto no fim"
                            value={currencyFormatter.format(report.summary.openDebt)}
                            comparison={report.comparison.openDebtChangePercent}
                            icon={<ReceiptText className="h-4 w-4" />}
                            lowerIsBetter
                            detail="Considera todo o histórico até a data final"
                        />
                        <SummaryMetric
                            title="Pedidos"
                            value={report.summary.orderCount.toString()}
                            comparison={report.comparison.orderCountChangePercent}
                            icon={<ShoppingBag className="h-4 w-4" />}
                            detail={`Movimento líquido: ${currencyFormatter.format(report.summary.periodNet)}`}
                        />
                    </div>

                    <ReportTabs value={tab} onChange={setTab} />

                    {tab === 'summary' && <SummaryView report={report} />}
                    {tab === 'categories' && <CategoryView report={report} />}
                    {tab === 'resellers' && <ResellerView report={report} />}

                    <PdfOptionsDialog open={pdfOpen} onOpenChange={setPdfOpen} report={report} />
                </>
            ) : null}
        </div>
    );
}
