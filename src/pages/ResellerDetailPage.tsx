import { useParams, useNavigate } from 'react-router-dom';
import { useReseller } from '../hooks/useResellers';
import { useTransactions } from '../hooks/useTransactions';
import { Button } from '../components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
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
    return `R$ ${value.toFixed(2)}`;
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
    const isPdfButtonDisabled = hasFilter && !isFilterComplete;

    const periodStatement = useMemo(() => {
        if (!isFilterComplete) return null;

        const startDate = new Date(dateFilter.startDate + 'T00:00:00');
        const endDate = new Date(dateFilter.endDate + 'T23:59:59.999');
        if (startDate > endDate) return null;

        return buildStatementPeriod(transactions, { startDate, endDate });
    }, [transactions, isFilterComplete, dateFilter.startDate, dateFilter.endDate]);

    const displayedTransactions = periodStatement?.movements ?? transactions;

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

    const handleGeneratePDF = () => {
        if (isFilterComplete) {
            const startDate = new Date(dateFilter.startDate + 'T00:00:00');
            const endDate = new Date(dateFilter.endDate + 'T23:59:59.999');

            if (startDate > endDate) {
                toast.error('A data de início não pode ser posterior à data de fim.');
                return;
            }

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
            </div>

            {!resellerActive && (
                <div className="rounded-md border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                    Revendedor inativo: histórico e extratos permanecem disponíveis, mas novos lançamentos estão bloqueados até a reativação.
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex flex-col gap-1">
                    <Label htmlFor="startDate">Data Início</Label>
                    <Input
                        id="startDate"
                        type="date"
                        value={dateFilter.startDate}
                        onChange={e => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
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

                {periodStatement ? (
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
                <TransactionTable transactions={displayedTransactions} />
            </div>
        </div>
    );
}
