import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ResponsiveDialog } from '../ui/ResponsiveDialog';
import { TransactionCorrectionDialog } from './TransactionCorrectionDialog';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Calendar, Tag, Layers, CircleDollarSign, Undo2, PencilLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/db/database';
import { isTransactionReversed, transactionOccurredAt } from '@/domain/transactions';
import { useReverseTransaction } from '@/hooks/useTransactions';
import { toast } from 'sonner';

interface TransactionTableProps {
    transactions: Transaction[];
}

function StatusLabel({ transaction }: { transaction: Transaction }) {
    const reversed = isTransactionReversed(transaction);
    return (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${reversed ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
            {reversed ? 'Estornado' : 'Válido'}
        </span>
    );
}

function auditDescriptions(transaction: Transaction) {
    const descriptions: string[] = [];

    if (transaction.reversal) {
        const reversedAt = new Date(transaction.reversal.reversedAt).toLocaleString('pt-BR');
        descriptions.push(`Motivo do estorno: ${transaction.reversal.reason} · ${reversedAt}`);
        if (transaction.reversal.replacementTransactionId) {
            descriptions.push(`Substituído pelo lançamento #${transaction.reversal.replacementTransactionId}`);
        }
    }

    if (transaction.correction?.replacesTransactionId) {
        descriptions.push(`Correção do lançamento #${transaction.correction.replacesTransactionId}`);
    }

    return descriptions;
}

export function TransactionTable({ transactions }: TransactionTableProps) {
    const isDesktop = useMediaQuery('(min-width: 1024px)');
    const reverseMutation = useReverseTransaction();
    const [transactionToReverse, setTransactionToReverse] = useState<Transaction | null>(null);
    const [transactionToCorrect, setTransactionToCorrect] = useState<Transaction | null>(null);
    const [reason, setReason] = useState('');

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const closeReverseDialog = () => {
        setTransactionToReverse(null);
        setReason('');
    };

    const handleReverse = async () => {
        if (!transactionToReverse?.id) return;

        try {
            await reverseMutation.mutateAsync({
                id: transactionToReverse.id,
                reason,
            });
            toast.success('Lançamento estornado com histórico preservado.');
            closeReverseDialog();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Não foi possível estornar o lançamento.');
        }
    };

    const reversalDialog = (
        <ResponsiveDialog
            open={!!transactionToReverse}
            onOpenChange={(open) => !open && closeReverseDialog()}
            title="Estornar movimentação"
            description="O lançamento original será preservado para auditoria e deixará de produzir efeito financeiro."
            footer={
                <>
                    <Button variant="outline" onClick={closeReverseDialog} disabled={reverseMutation.isPending}>
                        Cancelar
                    </Button>
                    <Button onClick={handleReverse} disabled={reverseMutation.isPending || !reason.trim()}>
                        {reverseMutation.isPending ? 'Estornando...' : 'Confirmar Estorno'}
                    </Button>
                </>
            }
        >
            <div className="space-y-2 py-2">
                <Label htmlFor="reversalReason">Motivo do estorno</Label>
                <Input
                    id="reversalReason"
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Ex.: pagamento duplicado"
                    autoFocus
                />
                <p className="text-xs text-muted-foreground">
                    O motivo é obrigatório e ficará associado permanentemente ao lançamento estornado.
                </p>
            </div>
        </ResponsiveDialog>
    );

    const correctionDialog = transactionToCorrect ? (
        <TransactionCorrectionDialog
            transaction={transactionToCorrect}
            open
            onOpenChange={(open) => !open && setTransactionToCorrect(null)}
        />
    ) : null;

    const actionButtons = (transaction: Transaction) => {
        if (isTransactionReversed(transaction)) return null;

        return (
            <div className="flex gap-2 justify-end flex-wrap">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTransactionToCorrect(transaction)}
                    disabled={!transaction.id}
                >
                    <PencilLine className="h-4 w-4 mr-1" />
                    Corrigir
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTransactionToReverse(transaction)}
                    disabled={!transaction.id}
                >
                    <Undo2 className="h-4 w-4 mr-1" />
                    Estornar
                </Button>
            </div>
        );
    };

    if (!isDesktop) {
        return (
            <div className="space-y-4">
                {transactions.length === 0 ? (
                    <div className="text-center py-10 bg-card rounded-lg border border-dashed text-muted-foreground">
                        Nenhuma movimentação encontrada.
                    </div>
                ) : (
                    transactions.map((t) => {
                        const reversed = isTransactionReversed(t);
                        const descriptions = auditDescriptions(t);
                        return (
                            <Card key={t.id} className={cn('overflow-hidden', reversed && 'opacity-75')}>
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <Calendar size={14} className="text-muted-foreground" />
                                            {transactionOccurredAt(t).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <StatusLabel transaction={t} />
                                            <div className={cn(
                                                'px-2 py-0.5 rounded-full text-xs font-semibold',
                                                t.type === 'order' ? 'bg-debt/10 text-debt' : 'bg-payment/10 text-payment'
                                            )}>
                                                {t.type === 'order' ? 'Pedido' : t.type === 'payment' ? 'Pagamento' : 'Sinal'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end gap-3">
                                        <div className="space-y-1">
                                            {t.itemName && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Tag size={14} className="text-muted-foreground" />
                                                    <span>{t.itemName}</span>
                                                </div>
                                            )}
                                            {t.quantity && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Layers size={14} className="text-muted-foreground" />
                                                    <span>Qtd: {t.quantity}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className={cn(
                                            'text-lg font-bold flex items-center gap-1',
                                            reversed ? 'text-muted-foreground line-through' : t.type === 'order' ? 'text-debt' : 'text-payment'
                                        )}>
                                            <CircleDollarSign size={18} />
                                            {formatCurrency(t.totalPrice)}
                                        </div>
                                    </div>

                                    {t.observation && (
                                        <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded italic">
                                            "{t.observation}"
                                        </div>
                                    )}

                                    {descriptions.length > 0 && (
                                        <div className="text-xs text-muted-foreground border-t pt-2 space-y-1">
                                            {descriptions.map(description => <div key={description}>{description}</div>)}
                                        </div>
                                    )}

                                    {!reversed && (
                                        <div className="pt-1">
                                            {actionButtons(t)}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })
                )}

                {reversalDialog}
                {correctionDialog}
            </div>
        );
    }

    return (
        <div>
            <div className="rounded-md border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Qtd</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Observação</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                                    Nenhuma movimentação encontrada.
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((t) => {
                                const reversed = isTransactionReversed(t);
                                const descriptions = auditDescriptions(t);
                                return (
                                    <TableRow key={t.id} className={cn(reversed && 'opacity-75')}>
                                        <TableCell>{transactionOccurredAt(t).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            {t.type === 'order' ? 'Pedido' : t.type === 'payment' ? 'Pagamento' : 'Sinal'}
                                        </TableCell>
                                        <TableCell>{t.itemName || '-'}</TableCell>
                                        <TableCell>{t.quantity ? t.quantity : '-'}</TableCell>
                                        <TableCell className={cn(
                                            'font-medium',
                                            reversed ? 'text-muted-foreground line-through' : t.type === 'order' ? 'text-debt' : 'text-payment'
                                        )}>
                                            {formatCurrency(t.totalPrice)}
                                        </TableCell>
                                        <TableCell><StatusLabel transaction={t} /></TableCell>
                                        <TableCell className="max-w-[280px]">
                                            <div className="truncate">{t.observation || '-'}</div>
                                            {descriptions.length > 0 && (
                                                <div className="text-xs text-muted-foreground mt-1 space-y-1">
                                                    {descriptions.map(description => <div key={description}>{description}</div>)}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {actionButtons(t)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {reversalDialog}
            {correctionDialog}
        </div>
    );
}
