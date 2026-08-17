import { useEffect, useMemo, useState } from 'react';
import type { Transaction } from '@/db/database';
import { isItemActive, isResellerActive } from '@/db/database';
import { useItems } from '@/hooks/useItems';
import { useResellers } from '@/hooks/useResellers';
import { useReplaceTransaction } from '@/hooks/useTransactions';
import { ResponsiveDialog } from '../ui/ResponsiveDialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';

interface TransactionCorrectionDialogProps {
    transaction: Transaction;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function transactionTypeLabel(transaction: Transaction) {
    return transaction.type === 'order'
        ? 'Pedido'
        : transaction.type === 'payment'
            ? 'Pagamento'
            : 'Sinal';
}

function initialOrderQuantity(transaction: Transaction) {
    return transaction.quantity && transaction.quantity > 0 ? transaction.quantity : 1;
}

function initialOrderUnitPrice(transaction: Transaction) {
    if (typeof transaction.unitPrice === 'number') return transaction.unitPrice;
    return transaction.totalPrice / initialOrderQuantity(transaction);
}

export function TransactionCorrectionDialog({
    transaction,
    open,
    onOpenChange,
}: TransactionCorrectionDialogProps) {
    const { data: resellers = [] } = useResellers();
    const { data: items = [] } = useItems();
    const replaceMutation = useReplaceTransaction();

    const activeResellers = useMemo(() => resellers.filter(isResellerActive), [resellers]);
    const originalItem = useMemo(
        () => transaction.itemId ? items.find(item => item.id === transaction.itemId) : undefined,
        [items, transaction.itemId],
    );
    const originalItemAvailable = transaction.type !== 'order'
        || (!!originalItem && isItemActive(originalItem));

    const [reason, setReason] = useState('');
    const [resellerId, setResellerId] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [unitPrice, setUnitPrice] = useState('0');
    const [movementValue, setMovementValue] = useState('0');

    useEffect(() => {
        if (!open) return;

        const originalResellerIsActive = activeResellers.some(reseller => reseller.id === transaction.resellerId);
        setReason('');
        setResellerId(originalResellerIsActive ? String(transaction.resellerId) : '');
        setQuantity(String(initialOrderQuantity(transaction)));
        setUnitPrice(String(initialOrderUnitPrice(transaction)));
        setMovementValue(String(transaction.totalPrice));
    }, [open, transaction, activeResellers]);

    const parsedQuantity = Number.parseInt(quantity, 10);
    const parsedUnitPrice = Number.parseFloat(unitPrice.replace(',', '.'));
    const parsedMovementValue = Number.parseFloat(movementValue.replace(',', '.'));

    const orderValueValid = transaction.type !== 'order'
        || (Number.isInteger(parsedQuantity) && parsedQuantity > 0 && Number.isFinite(parsedUnitPrice) && parsedUnitPrice >= 0);
    const movementValueValid = transaction.type === 'order'
        || (Number.isFinite(parsedMovementValue) && parsedMovementValue > 0);
    const selectedResellerIsActive = activeResellers.some(reseller => String(reseller.id) === resellerId);

    const canSubmit = !!transaction.id
        && !!reason.trim()
        && selectedResellerIsActive
        && originalItemAvailable
        && orderValueValid
        && movementValueValid
        && !replaceMutation.isPending;

    const closeDialog = () => onOpenChange(false);

    const handleSubmit = async () => {
        if (!transaction.id || !canSubmit) return;

        try {
            const replacement = transaction.type === 'order'
                ? {
                    resellerId: Number(resellerId),
                    itemId: transaction.itemId,
                    itemName: transaction.itemName,
                    quantity: parsedQuantity,
                    unitPrice: parsedUnitPrice,
                    totalPrice: parsedQuantity * parsedUnitPrice,
                    observation: transaction.observation,
                }
                : {
                    resellerId: Number(resellerId),
                    totalPrice: parsedMovementValue,
                    observation: transaction.observation,
                };

            await replaceMutation.mutateAsync({
                originalId: transaction.id,
                reason,
                replacement,
            });

            toast.success('Correção registrada com original e substituição preservados.');
            closeDialog();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Não foi possível registrar a correção.');
        }
    };

    const correctedTotal = transaction.type === 'order' && orderValueValid
        ? parsedQuantity * parsedUnitPrice
        : parsedMovementValue;

    return (
        <ResponsiveDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Corrigir movimentação"
            description="O lançamento original será estornado e uma nova movimentação vinculada será criada. Nenhum registro será sobrescrito."
            footer={
                <>
                    <Button variant="outline" onClick={closeDialog} disabled={replaceMutation.isPending}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={!canSubmit}>
                        {replaceMutation.isPending ? 'Corrigindo...' : 'Confirmar Correção'}
                    </Button>
                </>
            }
        >
            <div className="space-y-4 py-2">
                <div className="rounded-md border bg-muted/40 p-3 text-sm space-y-1">
                    <div><strong>Original:</strong> #{transaction.id} · {transactionTypeLabel(transaction)}</div>
                    <div><strong>Valor atual:</strong> R$ {transaction.totalPrice.toFixed(2)}</div>
                    {transaction.itemName && <div><strong>Item:</strong> {transaction.itemName}</div>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="correctionReason">Motivo da correção</Label>
                    <Input
                        id="correctionReason"
                        value={reason}
                        onChange={event => setReason(event.target.value)}
                        placeholder="Ex.: valor digitado incorretamente"
                    />
                    <p className="text-xs text-muted-foreground">
                        O motivo ficará no estorno do lançamento original e o vínculo com a substituição será permanente.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="correctionReseller">Revendedor da substituição</Label>
                    <select
                        id="correctionReseller"
                        value={resellerId}
                        onChange={event => setResellerId(event.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                        <option value="">Selecione...</option>
                        {activeResellers.map(reseller => (
                            <option key={reseller.id} value={reseller.id}>
                                {reseller.name}
                            </option>
                        ))}
                    </select>
                    {!selectedResellerIsActive && resellerId && (
                        <p className="text-sm text-red-500">Selecione um revendedor ativo.</p>
                    )}
                </div>

                {transaction.type === 'order' ? (
                    <div className="space-y-4">
                        {!originalItemAvailable && (
                            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                                O item original não está ativo no catálogo. Este pedido pode ser estornado, mas a correção guiada não pode recriá-lo sem violar as regras de P1.
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="correctionQuantity">Quantidade corrigida</Label>
                                <Input
                                    id="correctionQuantity"
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={event => setQuantity(event.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="correctionUnitPrice">Valor unitário corrigido (R$)</Label>
                                <Input
                                    id="correctionUnitPrice"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={unitPrice}
                                    onChange={event => setUnitPrice(event.target.value)}
                                />
                            </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Total da substituição: <strong className="text-foreground">R$ {Number.isFinite(correctedTotal) ? correctedTotal.toFixed(2) : '0.00'}</strong>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Label htmlFor="correctionValue">Valor corrigido (R$)</Label>
                        <Input
                            id="correctionValue"
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={movementValue}
                            onChange={event => setMovementValue(event.target.value)}
                        />
                    </div>
                )}
            </div>
        </ResponsiveDialog>
    );
}
