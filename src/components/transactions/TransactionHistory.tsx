import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Reseller, Transaction, TransactionActor, TransactionType } from '@/db/database';
import { transactionOccurredAt } from '@/domain/transactions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface TransactionHistoryProps {
    transactions: Transaction[];
    resellers: Reseller[];
    isLoading: boolean;
}

type HistoryStatus = 'effective' | 'corrected' | 'reversed';
type DateBasis = 'registered' | 'occurred';

function normalizeSearch(value: string) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('pt-BR')
        .trim();
}

function formatCurrency(value: number) {
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

function formatDateTime(value: Date) {
    return value.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function transactionStatus(transaction: Transaction): HistoryStatus {
    if (transaction.reversal?.replacementTransactionId) return 'corrected';
    if (transaction.reversal) return 'reversed';
    return 'effective';
}

function statusLabel(status: HistoryStatus) {
    if (status === 'corrected') return 'Corrigido';
    if (status === 'reversed') return 'Estornado';
    return 'Efetivo';
}

function typeLabel(type: TransactionType) {
    if (type === 'order') return 'Pedido';
    if (type === 'payment') return 'Pagamento';
    return 'Sinal';
}

function actorLabel(actor?: TransactionActor) {
    if (!actor) return 'Não registrado';
    if (actor.email?.trim()) return actor.email.trim();
    return `${actor.userId.slice(0, 8)}…`;
}

function detailLabel(transaction: Transaction) {
    const parts: string[] = [];

    if (transaction.type === 'order') {
        parts.push(transaction.itemName ?? 'Item não identificado');
        if (transaction.quantity) parts.push(`Qtd. ${transaction.quantity}`);
    }

    if (transaction.correction?.replacesTransactionId) {
        parts.push(`Correção do #${transaction.correction.replacesTransactionId}`);
    }

    if (transaction.observation?.trim()) {
        parts.push(transaction.observation.trim());
    }

    if (transaction.reversal?.replacementTransactionId) {
        parts.push(`Substituído pelo #${transaction.reversal.replacementTransactionId}`);
    }

    if (transaction.reversal?.reason) {
        parts.push(`Motivo: ${transaction.reversal.reason}`);
    }

    return parts.length > 0 ? parts.join(' · ') : '—';
}

function dateInputBounds(value: string, endOfDay: boolean) {
    if (!value) return undefined;
    const suffix = endOfDay ? 'T23:59:59.999' : 'T00:00:00.000';
    const date = new Date(`${value}${suffix}`);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

export function TransactionHistory({ transactions, resellers, isLoading }: TransactionHistoryProps) {
    const [search, setSearch] = useState('');
    const [type, setType] = useState<'all' | TransactionType>('all');
    const [status, setStatus] = useState<'all' | HistoryStatus>('all');
    const [actorId, setActorId] = useState('all');
    const [dateBasis, setDateBasis] = useState<DateBasis>('registered');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const resellerById = useMemo(
        () => new Map(resellers.flatMap(reseller => reseller.id ? [[reseller.id, reseller] as const] : [])),
        [resellers],
    );

    const actorOptions = useMemo(() => {
        const actors = new Map<string, TransactionActor>();
        transactions.forEach(transaction => {
            if (transaction.createdBy) actors.set(transaction.createdBy.userId, transaction.createdBy);
            if (transaction.reversal?.reversedBy) {
                actors.set(transaction.reversal.reversedBy.userId, transaction.reversal.reversedBy);
            }
        });
        return Array.from(actors.values()).sort((a, b) => actorLabel(a).localeCompare(actorLabel(b), 'pt-BR'));
    }, [transactions]);

    const filteredTransactions = useMemo(() => {
        const normalizedSearch = normalizeSearch(search);
        const from = dateInputBounds(dateFrom, false);
        const to = dateInputBounds(dateTo, true);

        return [...transactions]
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .filter(transaction => {
                const reseller = resellerById.get(transaction.resellerId);
                const currentStatus = transactionStatus(transaction);

                if (type !== 'all' && transaction.type !== type) return false;
                if (status !== 'all' && currentStatus !== status) return false;
                if (
                    actorId !== 'all'
                    && transaction.createdBy?.userId !== actorId
                    && transaction.reversal?.reversedBy?.userId !== actorId
                ) return false;

                const comparisonDate = dateBasis === 'registered'
                    ? transaction.createdAt
                    : transactionOccurredAt(transaction);
                if (from && comparisonDate < from) return false;
                if (to && comparisonDate > to) return false;

                if (!normalizedSearch) return true;
                const searchable = normalizeSearch([
                    transaction.id ? `#${transaction.id}` : '',
                    reseller?.name ?? '',
                    transaction.itemName ?? '',
                    transaction.observation ?? '',
                    transaction.reversal?.reason ?? '',
                    actorLabel(transaction.createdBy),
                    actorLabel(transaction.reversal?.reversedBy),
                ].join(' '));
                return searchable.includes(normalizedSearch);
            });
    }, [actorId, dateBasis, dateFrom, dateTo, resellerById, search, status, transactions, type]);

    const hasFilters = search || type !== 'all' || status !== 'all' || actorId !== 'all' || dateFrom || dateTo || dateBasis !== 'registered';

    const clearFilters = () => {
        setSearch('');
        setType('all');
        setStatus('all');
        setActorId('all');
        setDateBasis('registered');
        setDateFrom('');
        setDateTo('');
    };

    if (isLoading) {
        return (
            <section aria-busy="true" aria-label="Carregando histórico de lançamentos" className="space-y-4">
                <div className="h-10 rounded bg-muted" />
                <div className="h-56 rounded bg-muted" />
            </section>
        );
    }

    const renderActor = (transaction: Transaction) => {
        const correction = transactionStatus(transaction) === 'corrected';
        const registeredActor = actorLabel(transaction.createdBy);
        const reversalActor = transaction.reversal ? actorLabel(transaction.reversal.reversedBy) : undefined;
        const reversalAction = correction ? 'Corrigido' : 'Estornado';

        return (
            <div className="min-w-0 space-y-1 whitespace-normal text-xs">
                <div className="truncate" title={`Registrado: ${registeredActor}`}>
                    <span className="text-muted-foreground">Registrado:</span> {registeredActor}
                </div>
                {transaction.reversal && (
                    <div className="truncate" title={`${reversalAction}: ${reversalActor}`}>
                        <span className="text-muted-foreground">{reversalAction}:</span>{' '}
                        {reversalActor}
                    </div>
                )}
            </div>
        );
    };

    const renderStatus = (transaction: Transaction) => {
        const currentStatus = transactionStatus(transaction);
        return (
            <span className={cn(
                'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                currentStatus === 'effective' && 'bg-primary/10 text-primary',
                currentStatus === 'corrected' && 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
                currentStatus === 'reversed' && 'bg-muted text-muted-foreground',
            )}>
                {statusLabel(currentStatus)}
            </span>
        );
    };

    return (
        <section className="space-y-4" aria-labelledby="transaction-history-title">
            <div>
                <h2 id="transaction-history-title" className="text-xl font-semibold">Histórico de Lançamentos</h2>
                <p className="text-sm text-muted-foreground">
                    Consulte pedidos, pagamentos, sinais, correções e estornos preservados no histórico financeiro.
                </p>
            </div>

            <Card>
                <CardContent className="p-4 space-y-4">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                        <div className="space-y-1.5 md:col-span-2">
                            <Label htmlFor="transaction-history-search">Buscar</Label>
                            <Input
                                id="transaction-history-search"
                                value={search}
                                onChange={event => setSearch(event.target.value)}
                                placeholder="Revendedor, produto, observação, usuário ou #ID"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="transaction-history-type">Tipo</Label>
                            <select
                                id="transaction-history-type"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={type}
                                onChange={event => setType(event.target.value as 'all' | TransactionType)}
                            >
                                <option value="all">Todos</option>
                                <option value="order">Pedido</option>
                                <option value="payment">Pagamento</option>
                                <option value="signal">Sinal</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="transaction-history-status">Situação</Label>
                            <select
                                id="transaction-history-status"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={status}
                                onChange={event => setStatus(event.target.value as 'all' | HistoryStatus)}
                            >
                                <option value="all">Todas</option>
                                <option value="effective">Efetivos</option>
                                <option value="corrected">Corrigidos</option>
                                <option value="reversed">Estornados</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="transaction-history-user">Usuário</Label>
                            <select
                                id="transaction-history-user"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={actorId}
                                onChange={event => setActorId(event.target.value)}
                            >
                                <option value="all">Todos</option>
                                {actorOptions.map(actor => (
                                    <option key={actor.userId} value={actor.userId}>{actorLabel(actor)}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 lg:max-w-3xl">
                        <div className="space-y-1.5">
                            <Label htmlFor="transaction-history-date-basis">Filtrar data de</Label>
                            <select
                                id="transaction-history-date-basis"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={dateBasis}
                                onChange={event => setDateBasis(event.target.value as DateBasis)}
                            >
                                <option value="registered">Registro</option>
                                <option value="occurred">Ocorrência</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="transaction-history-date-from">De</Label>
                            <Input id="transaction-history-date-from" type="date" value={dateFrom} onChange={event => setDateFrom(event.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="transaction-history-date-to">Até</Label>
                            <Input id="transaction-history-date-to" type="date" value={dateTo} onChange={event => setDateTo(event.target.value)} />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                        <p className="text-sm text-muted-foreground">
                            {filteredTransactions.length} de {transactions.length} lançamento(s)
                        </p>
                        {hasFilters && (
                            <Button variant="ghost" size="sm" onClick={clearFilters}>Limpar filtros</Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {filteredTransactions.length === 0 ? (
                <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
                    {transactions.length === 0
                        ? 'Nenhum lançamento registrado ainda.'
                        : 'Nenhum lançamento corresponde aos filtros selecionados.'}
                </div>
            ) : (
                <>
                    <div className="hidden overflow-hidden rounded-md border bg-card lg:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Registrado em</TableHead>
                                    <TableHead>Ocorrência</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Revendedor</TableHead>
                                    <TableHead>Detalhe</TableHead>
                                    <TableHead>Valor</TableHead>
                                    <TableHead>Situação</TableHead>
                                    <TableHead>Usuário</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.map(transaction => {
                                    const reseller = resellerById.get(transaction.resellerId);
                                    const resellerName = reseller?.name ?? `Revendedor #${transaction.resellerId}`;
                                    const detail = detailLabel(transaction);

                                    return (
                                        <TableRow key={transaction.id ?? `${transaction.resellerId}-${transaction.createdAt.getTime()}`}>
                                            <TableCell className="whitespace-nowrap">{formatDateTime(transaction.createdAt)}</TableCell>
                                            <TableCell className="whitespace-nowrap">{formatDate(transactionOccurredAt(transaction))}</TableCell>
                                            <TableCell>{typeLabel(transaction.type)}</TableCell>
                                            <TableCell className="whitespace-normal">
                                                {reseller?.id ? (
                                                    <Link
                                                        className="line-clamp-2 break-words font-medium hover:underline"
                                                        title={resellerName}
                                                        to={`/resellers/${reseller.id}`}
                                                    >
                                                        {resellerName}
                                                    </Link>
                                                ) : (
                                                    <span className="line-clamp-2 break-words" title={resellerName}>{resellerName}</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="max-w-[360px] whitespace-normal text-sm text-muted-foreground">
                                                <span className="line-clamp-2 break-words" title={detail}>{detail}</span>
                                            </TableCell>
                                            <TableCell className={cn('whitespace-nowrap font-medium tabular-nums', transaction.reversal && 'text-muted-foreground')}>
                                                {formatCurrency(transaction.totalPrice)}
                                            </TableCell>
                                            <TableCell>{renderStatus(transaction)}</TableCell>
                                            <TableCell className="whitespace-normal">{renderActor(transaction)}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="space-y-3 lg:hidden">
                        {filteredTransactions.map(transaction => {
                            const reseller = resellerById.get(transaction.resellerId);
                            return (
                                <Card key={transaction.id ?? `${transaction.resellerId}-${transaction.createdAt.getTime()}`}>
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="font-semibold">{typeLabel(transaction.type)} {transaction.id ? `#${transaction.id}` : ''}</div>
                                                <div className="text-sm text-muted-foreground">Registrado em {formatDateTime(transaction.createdAt)}</div>
                                            </div>
                                            {renderStatus(transaction)}
                                        </div>
                                        <div>
                                            {reseller?.id ? (
                                                <Link className="font-medium hover:underline" to={`/resellers/${reseller.id}`}>{reseller.name}</Link>
                                            ) : (reseller?.name ?? `Revendedor #${transaction.resellerId}`)}
                                            <div className="text-sm text-muted-foreground">Ocorrência: {formatDate(transactionOccurredAt(transaction))}</div>
                                        </div>
                                        <div className="text-sm">{detailLabel(transaction)}</div>
                                        <div className="flex items-end justify-between gap-3 border-t pt-3">
                                            {renderActor(transaction)}
                                            <div className="font-bold tabular-nums">{formatCurrency(transaction.totalPrice)}</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}
        </section>
    );
}
