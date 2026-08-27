import { useParams, useNavigate } from 'react-router-dom';
import { useReseller } from '../hooks/useResellers';
import { useTransactions } from '../hooks/useTransactions';
import { Button } from '../components/ui/button';
import { ArrowLeft, Download, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { TransactionTable } from '../components/transactions/TransactionTable';
import { generateResellerExtract } from '../services/pdfService';
import { useMemo, useEffect, useState } from 'react';
import { addToRecentResellers } from '../hooks/useSearch';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { isResellerActive } from '../db/database';
import {
    buildStatementPeriod,
    calculateBalance,
    transactionOccurredAt,
} from '../domain/transactions';

function formatBalance(value: number) {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ResellerDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const resellerId = id ? parseInt(id, 10) : undefined;

    const { data: reseller, isLoading: isLoadingReseller } = useReseller(resellerId);
    const { data: transactionsData, isLoading: isLoadingTransactions } = useTransactions(resellerId);

    const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' });

    useEffect(() => {
        if (resellerId) {
            addToRecentResellers(resellerId);
        }
    }, [resellerId]);

    const transactions = useMemo(() => {
        if (!transactionsData) return [];
        return [...transactionsData].sort(
            (a, b) => transactionOccurredAt(b).getTime() - transactionOccurredAt(a).getTime()
        );
    }, [transactionsData]);

    const balance = useMemo(() => calculateBalance(transactions), [transactions]);

    const hasFilter = dateFilter.startDate !== '' || dateFilter.endDate !== '';
    const isFilterComplete = dateFilter.startDate !== '' && dateFilter.endDate !== '';
    const isInvalidRange = useMemo(() => {
        if (!isFilterComplete) return false;

        const startDate = new Date(dateFilter.startDate + 'T00:00:00');
        const endDate = new Date(dateFilter.endDate + 'T23:59:59.999');
        return startDate > endDate;
    }, [isFilterComplete, dateFilter.startDate, dateFilter.endDate]);
    const isPdfButtonDisabled = (hasFilter && !isFilterComplete) || isInvalidRange;

    const periodStatement = useMemo(() => {
        if (!isFilterComplete || isInvalidRange) return null;

        const startDate = new Date(dateFilter.startDate + 'T00:00:00');
        const endDate = new Date(dateFilter.endDate + 'T23:59:59.999');

        return buildStatementPeriod(transactions, { startDate, endDate });
    }, [transactions, isFilterComplete, isInvalidRange, dateFilter.startDate, dateFilter.endDate]);

    const displayedTransactions = isInvalidRange ? [] : (periodStatement?.movements ?? transactions);

    const isLoading = isLoadingReseller || isLoadingTransactions;

    if (isLoading) {
        return (
            <div className="p-4 lg:p-6 flex justify-center text-muted-foreground">
                Carregando ficha do revendedor...
            </div>
        );
    }

    if (!reseller) {
        return (
            <div className="p-4 lg:p-6 flex flex-col items-center space-y-4">
                <p className="text-muted-foreground">Revendedor não encontrado.</p>
                <Button onClick={() => navigate('/resellers')}>Voltar para Revendedores</Button>
            </div>
        );
    }

    const resellerActive = isResellerActive(reseller);

    const handleNewTransaction = () => {
        if (!resellerActive || !reseller.id) return;
        navigate(`/transactions?resellerId=${reseller.id}`);
    };

    const handleGeneratePDF = () => {
        if (isInvalidRange) {
            toast.error('A data de início não pode ser posterior à data de fim.');
            return;
        }

        if (isFilterComplete) {
            const startDate = new Date(dateFilter.startDate + 'T00:00:00');
            const endDate = new Date(dateFilter.endDate + 'T23:59:59.999');
            const statement = buildStatementPeriod(transactions, { startDate, endDate });
            generateResellerExtract(reseller, transactions, statement);
            return;
        }

        generateResellerExtract(reseller, transactions, balance);
    };

    return (
        <div className="p-4 lg:p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/resellers')} className="shrink-0">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">Ficha do Revendedor</h1>
                    <p className="text-muted-foreground text-sm truncate">
                        Visualizando dados de {reseller.name}
                    </p>
                </div>
                <Button
                    onClick={handleNewTransaction}
                    disabled={!resellerActive || !reseller.id}
                    className="shrink-0 gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Novo lançamento
                </Button>
            </div>

            {!resellerActive && (
                <div className="rounded-md border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                    Revendedor inativo: histórico e extratos permanecem disponíveis, mas novos lançamentos estão bloqueados até a reativação.
                </div>
            )}

            <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3 items-end">
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="startDate">Data Início</Label>
                        <Input
                            id="startDate"
                            type="date"
                            value={dateFilter.startDate}
                            onChange={e => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                            aria-invalid={isInvalidRange}
                            aria-describedby={isInvalidRange ? 'statement-range-error' : undefined}
                            className="w-full sm:w-40"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="endDate">Data Fim</Label>
                        <Input
                            id="endDate"
                            type="date"
                            value={dateFilter.endDate}
                            onChange={e => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                            aria-invalid={isInvalidRange}
                            aria-describedby={isInvalidRange ? 'statement-range-error' : undefined}
                            className="w-full sm:w-40"
                        />
                    </div>
                    <Button
                        onClick={handleGeneratePDF}
                        variant="outline"
                        disabled={isPdfButtonDisabled}
                        className="flex items-center gap-2 w-full sm:w-auto"
                    >
                        <Download className="h-4 w-4" />
                        Gerar PDF
                    </Button>
                </div>

                {isInvalidRange && (
                    <div
                        id="statement-range-error"
                        role="alert"
                        className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                    >
                        Período inválido: a Data Início deve ser anterior ou igual à Data Fim. Corrija uma das datas ou limpe o período para voltar a visualizar saldo e histórico.
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Informações Pessoais</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="font-medium text-muted-foreground">Nome:</span>
                            <span>{reseller.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium text-muted-foreground">Status:</span>
                            <span>{resellerActive ? 'Ativo' : 'Inativo'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium text-muted-foreground">Telefone:</span>
                            <span>{reseller.phone || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium text-muted-foreground">Email:</span>
                            <span>{reseller.email || '-'}</span>
                        </div>
                        {reseller.notes && (
                            <div className="pt-2 border-t mt-2">
                                <span className="font-medium text-muted-foreground block mb-1">Observações:</span>
                                <p className="text-xs italic">{reseller.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {isInvalidRange ? (
                    <Card className="border-destructive/20 bg-destructive/5">
                        <CardHeader>
                            <CardTitle className="text-lg">Período inválido</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Saldo e resumo do período ficam ocultos até que a faixa de datas seja corrigida ou removida.
                            </p>
                        </CardContent>
                    </Card>
                ) : periodStatement ? (
                    <Card className={periodStatement.closingBalance > 0 ? "border-debt/20 bg-debt/5" : "border-payment/20 bg-payment/5"}>
                        <CardHeader>
                            <CardTitle className="text-lg">Resumo do Período</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Saldo inicial</p>
                                <p className="text-lg font-semibold">{formatBalance(periodStatement.openingBalance)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Movimentos do período</p>
                                <p className={`text-lg font-semibold ${periodStatement.periodMovement > 0 ? 'text-debt' : periodStatement.periodMovement < 0 ? 'text-payment' : ''}`}>
                                    {formatBalance(periodStatement.periodMovement)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Saldo final</p>
                                <p className={`text-2xl font-extrabold ${periodStatement.closingBalance > 0 ? 'text-debt' : 'text-payment'}`}>
                                    {formatBalance(periodStatement.closingBalance)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className={balance > 0 ? "border-debt/20 bg-debt/5" : "border-payment/20 bg-payment/5"}>
                        <CardHeader>
                            <CardTitle className="text-lg text-center md:text-left">Saldo Devedor Atual</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center md:items-start">
                            <div className={`text-4xl font-extrabold ${balance > 0 ? "text-debt" : "text-payment"}`}>
                                {formatBalance(balance)}
                            </div>
                            <p className="text-sm font-medium mt-2 text-muted-foreground">
                                {balance > 0 ? "⚠️ Débito pendente" : balance < 0 ? "✅ Crédito acumulado" : "✨ Saldo quitado"}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-bold px-1">
                    Histórico de Movimentações
                    {periodStatement && (
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                            ({periodStatement.range.startDate.toLocaleDateString('pt-BR')} a {periodStatement.range.endDate.toLocaleDateString('pt-BR')})
                        </span>
                    )}
                </h2>
                {isInvalidRange ? (
                    <div className="rounded-md border bg-muted/40 px-4 py-6 text-sm text-muted-foreground">
                        Histórico indisponível enquanto o período estiver inválido. Corrija ou limpe as datas para continuar.
                    </div>
                ) : (
                    <TransactionTable transactions={displayedTransactions} />
                )}
            </div>
        </div>
    );
}
