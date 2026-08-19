import { useMemo, useState } from 'react';
import type { Category, Transaction } from '../../db/database';
import {
    buildCategoryOrderPerformance,
    LEGACY_CATEGORY_LABEL,
} from '../../domain/categoryReporting';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../ui/table';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

interface CategoryReportProps {
    categories: Category[];
    transactions: Transaction[];
    isLoading?: boolean;
}

export function CategoryReport({ categories, transactions, isLoading = false }: CategoryReportProps) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const hasAnyDate = startDate !== '' || endDate !== '';
    const hasCompleteRange = startDate !== '' && endDate !== '';
    const parsedRange = useMemo(() => {
        if (!hasCompleteRange) return undefined;

        return {
            startDate: new Date(`${startDate}T00:00:00`),
            endDate: new Date(`${endDate}T23:59:59.999`),
        };
    }, [endDate, hasCompleteRange, startDate]);
    const isInvalidRange = !!parsedRange && parsedRange.startDate > parsedRange.endDate;
    const isIncompleteRange = hasAnyDate && !hasCompleteRange;

    const report = useMemo(() => {
        if (isIncompleteRange || isInvalidRange) return [];
        return buildCategoryOrderPerformance(transactions, categories, parsedRange);
    }, [categories, isIncompleteRange, isInvalidRange, parsedRange, transactions]);

    const totals = useMemo(() => report.reduce(
        (result, group) => ({
            orderCount: result.orderCount + group.orderCount,
            quantity: result.quantity + group.quantity,
            grossValue: result.grossValue + group.grossValue,
        }),
        { orderCount: 0, quantity: 0, grossValue: 0 },
    ), [report]);

    const clearRange = () => {
        setStartDate('');
        setEndDate('');
    };

    return (
        <Card>
            <CardHeader className="space-y-1">
                <CardTitle>Desempenho por categoria</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Pedidos efetivos agrupados pela categoria registrada no momento do pedido. Pagamentos, sinais e dívida não entram nesta análise.
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                    <div className="space-y-1">
                        <Label htmlFor="category-report-start">Data inicial</Label>
                        <Input
                            id="category-report-start"
                            type="date"
                            value={startDate}
                            onChange={event => setStartDate(event.target.value)}
                            aria-invalid={isInvalidRange}
                            className="w-full sm:w-40"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="category-report-end">Data final</Label>
                        <Input
                            id="category-report-end"
                            type="date"
                            value={endDate}
                            onChange={event => setEndDate(event.target.value)}
                            aria-invalid={isInvalidRange}
                            className="w-full sm:w-40"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={clearRange}
                        disabled={!hasAnyDate}
                        className="w-full sm:w-auto"
                    >
                        Ver todo o período
                    </Button>
                </div>

                {isIncompleteRange && (
                    <div role="alert" className="rounded-md border px-4 py-3 text-sm text-muted-foreground">
                        Preencha a data inicial e a data final para aplicar o período, ou limpe as duas datas para analisar todo o histórico.
                    </div>
                )}

                {isInvalidRange && (
                    <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                        Período inválido: a data inicial deve ser anterior ou igual à data final.
                    </div>
                )}

                {!isIncompleteRange && !isInvalidRange && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="rounded-md border p-3">
                                <p className="text-xs text-muted-foreground">Pedidos</p>
                                <p className="text-xl font-semibold">{totals.orderCount}</p>
                            </div>
                            <div className="rounded-md border p-3">
                                <p className="text-xs text-muted-foreground">Itens</p>
                                <p className="text-xl font-semibold">{totals.quantity}</p>
                            </div>
                            <div className="rounded-md border p-3">
                                <p className="text-xs text-muted-foreground">Valor bruto</p>
                                <p className="text-xl font-semibold">{currencyFormatter.format(totals.grossValue)}</p>
                            </div>
                        </div>

                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Categoria</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Pedidos</TableHead>
                                        <TableHead className="text-right">Itens</TableHead>
                                        <TableHead className="text-right">Valor bruto</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                Carregando análise por categoria...
                                            </TableCell>
                                        </TableRow>
                                    ) : report.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                Nenhum pedido efetivo encontrado no período selecionado.
                                            </TableCell>
                                        </TableRow>
                                    ) : report.map(group => (
                                        <TableRow key={group.categoryId ?? 'legacy'}>
                                            <TableCell className="font-medium">{group.label}</TableCell>
                                            <TableCell>
                                                {group.label === LEGACY_CATEGORY_LABEL
                                                    ? 'Histórico legado'
                                                    : group.isArchived ? 'Arquivada' : 'Ativa'}
                                            </TableCell>
                                            <TableCell className="text-right">{group.orderCount}</TableCell>
                                            <TableCell className="text-right">{group.quantity}</TableCell>
                                            <TableCell className="text-right">{currencyFormatter.format(group.grossValue)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
