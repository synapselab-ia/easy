import { useEffect, useMemo, useState } from 'react';
import type { Transaction, TransactionType } from '@/db/database';
import { isCategoryActive, isItemActive, isResellerActive } from '@/db/database';
import { transactionOccurredAt } from '@/domain/transactions';
import { useCategories } from '@/hooks/useCategories';
import { useItems } from '@/hooks/useItems';
import { useResellers } from '@/hooks/useResellers';
import { useReplaceTransaction } from '@/hooks/useTransactions';
import { ResponsiveDialog } from '../ui/ResponsiveDialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';

interface Props {
    transaction: Transaction;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const typeLabel = (type: TransactionType) => type === 'order' ? 'Pedido' : type === 'payment' ? 'Pagamento' : 'Sinal';
const quantityOf = (transaction: Transaction) => transaction.quantity && transaction.quantity > 0 ? transaction.quantity : 1;
const unitPriceOf = (transaction: Transaction) => typeof transaction.unitPrice === 'number'
    ? transaction.unitPrice
    : transaction.totalPrice / quantityOf(transaction);

function formatMoney(value: number) {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function dateInput(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function parseDateInput(value: string) {
    if (!value) return null;
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
}

const selectClass = 'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring';

export function FullTransactionCorrectionDialog({ transaction, open, onOpenChange }: Props) {
    const { data: resellers = [] } = useResellers();
    const { data: items = [] } = useItems();
    const { data: categories = [] } = useCategories();
    const replaceMutation = useReplaceTransaction();

    const activeResellers = useMemo(() => resellers.filter(isResellerActive), [resellers]);
    const activeCategoryIds = useMemo(
        () => new Set(categories.filter(isCategoryActive).flatMap(category => category.id ? [category.id] : [])),
        [categories],
    );
    const originalItem = useMemo(
        () => transaction.itemId ? items.find(item => item.id === transaction.itemId) : undefined,
        [items, transaction.itemId],
    );
    const orderItems = useMemo(() => items.filter(item => {
        if (!item.id || !isItemActive(item)) return false;
        if (transaction.type === 'order' && item.id === transaction.itemId) return true;
        return item.categoryId !== undefined && activeCategoryIds.has(item.categoryId);
    }), [items, transaction.type, transaction.itemId, activeCategoryIds]);

    const [reason, setReason] = useState('');
    const [resellerId, setResellerId] = useState('');
    const [targetType, setTargetType] = useState<TransactionType>(transaction.type);
    const [occurredAt, setOccurredAt] = useState('');
    const [itemId, setItemId] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [unitPrice, setUnitPrice] = useState('0');
    const [movementValue, setMovementValue] = useState('0');
    const [observation, setObservation] = useState('');

    useEffect(() => {
        if (!open) return;
        setReason('');
        setResellerId(activeResellers.some(reseller => reseller.id === transaction.resellerId) ? String(transaction.resellerId) : '');
        setTargetType(transaction.type);
        setOccurredAt(dateInput(transactionOccurredAt(transaction)));
        setItemId(transaction.type === 'order' && transaction.itemId ? String(transaction.itemId) : '');
        setQuantity(String(quantityOf(transaction)));
        setUnitPrice(String(unitPriceOf(transaction)));
        setMovementValue(String(transaction.totalPrice));
        setObservation(transaction.observation ?? '');
    }, [open, transaction, activeResellers]);

    const parsedQuantity = Number.parseInt(quantity, 10);
    const parsedUnitPrice = Number.parseFloat(unitPrice.replace(',', '.'));
    const parsedMovementValue = Number.parseFloat(movementValue.replace(',', '.'));
    const parsedOccurredAt = parseDateInput(occurredAt);
    const selectedResellerValid = activeResellers.some(reseller => String(reseller.id) === resellerId);
    const selectedItem = targetType === 'order' ? orderItems.find(item => String(item.id) === itemId) : undefined;
    const originalItemUnavailable = targetType === 'order'
        && transaction.type === 'order'
        && String(transaction.itemId ?? '') === itemId
        && (!originalItem || !isItemActive(originalItem));
    const orderValid = targetType !== 'order' || (
        !!selectedItem
        && !originalItemUnavailable
        && Number.isInteger(parsedQuantity)
        && parsedQuantity > 0
        && Number.isFinite(parsedUnitPrice)
        && parsedUnitPrice >= 0
    );
    const movementValid = targetType === 'order' || (Number.isFinite(parsedMovementValue) && parsedMovementValue > 0);
    const canSubmit = !!transaction.id && !!reason.trim() && selectedResellerValid && !!parsedOccurredAt
        && orderValid && movementValid && !replaceMutation.isPending;

    const changeItem = (nextItemId: string) => {
        setItemId(nextItemId);
        if (!nextItemId) return;
        if (transaction.type === 'order' && String(transaction.itemId) === nextItemId) {
            setUnitPrice(String(unitPriceOf(transaction)));
            return;
        }
        const item = orderItems.find(candidate => String(candidate.id) === nextItemId);
        if (item) setUnitPrice(String(item.basePrice));
    };

    const submit = async () => {
        if (!transaction.id || !canSubmit || !parsedOccurredAt) return;
        const common = {
            resellerId: Number(resellerId),
            type: targetType,
            occurredAt: parsedOccurredAt,
            observation: observation.trim() || undefined,
        };
        const replacement = targetType === 'order'
            ? {
                ...common,
                itemId: Number(itemId),
                itemName: selectedItem?.name,
                quantity: parsedQuantity,
                unitPrice: parsedUnitPrice,
                totalPrice: parsedQuantity * parsedUnitPrice,
            }
            : { ...common, totalPrice: parsedMovementValue };

        try {
            await replaceMutation.mutateAsync({ originalId: transaction.id, reason, replacement });
            toast.success('Correção registrada com original e substituição preservados.');
            onOpenChange(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Não foi possível registrar a correção.');
        }
    };

    return (
        <ResponsiveDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Corrigir movimentação"
            description="O lançamento original será estornado e uma nova movimentação vinculada será criada. Nenhum registro será sobrescrito."
            footer={<>
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={replaceMutation.isPending}>Cancelar</Button>
                <Button onClick={submit} disabled={!canSubmit}>{replaceMutation.isPending ? 'Corrigindo...' : 'Confirmar Correção'}</Button>
            </>}
        >
            <div className="space-y-4 py-2">
                <div className="rounded-md border bg-muted/40 p-3 text-sm space-y-1">
                    <div><strong>Original:</strong> #{transaction.id} · {typeLabel(transaction.type)}</div>
                    <div><strong>Valor atual:</strong> {formatMoney(transaction.totalPrice)}</div>
                    {transaction.itemName && <div><strong>Item:</strong> {transaction.itemName}</div>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="correctionReason">Motivo da correção</Label>
                    <Input id="correctionReason" value={reason} onChange={event => setReason(event.target.value)} placeholder="Ex.: informação digitada incorretamente" />
                    <p className="text-xs text-muted-foreground">O motivo ficará no estorno do original e o vínculo com a substituição será permanente.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-2">
                        <Label htmlFor="correctionReseller">Revendedor da substituição</Label>
                        <select id="correctionReseller" value={resellerId} onChange={event => setResellerId(event.target.value)} className={selectClass}>
                            <option value="">Selecione...</option>
                            {activeResellers.map(reseller => <option key={reseller.id} value={reseller.id}>{reseller.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="correctionType">Tipo da substituição</Label>
                        <select id="correctionType" value={targetType} onChange={event => setTargetType(event.target.value as TransactionType)} className={selectClass}>
                            <option value="order">Pedido</option>
                            <option value="payment">Pagamento</option>
                            <option value="signal">Sinal</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="correctionOccurrenceDate">Data da ocorrência</Label>
                        <Input id="correctionOccurrenceDate" type="date" value={occurredAt} onChange={event => setOccurredAt(event.target.value)} />
                    </div>
                </div>

                {targetType === 'order' ? <div className="space-y-4">
                    {originalItemUnavailable && <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                        O item original não está ativo/disponível. Selecione outro item ativo e classificado ou altere o tipo da substituição.
                    </div>}
                    <div className="space-y-2">
                        <Label htmlFor="correctionItem">Item da substituição</Label>
                        <select id="correctionItem" value={itemId} onChange={event => changeItem(event.target.value)} className={selectClass}>
                            <option value="">Selecione...</option>
                            {orderItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                        </select>
                        {!selectedItem && !originalItemUnavailable && <p className="text-sm text-red-500">Selecione um item ativo e classificado.</p>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="correctionQuantity">Quantidade corrigida</Label>
                            <Input id="correctionQuantity" type="number" min="1" value={quantity} onChange={event => setQuantity(event.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="correctionUnitPrice">Valor unitário corrigido (R$)</Label>
                            <Input id="correctionUnitPrice" type="number" min="0" step="0.01" value={unitPrice} onChange={event => setUnitPrice(event.target.value)} />
                        </div>
                    </div>
                    <div className="text-sm text-muted-foreground">Total da substituição: <strong className="text-foreground">{formatMoney(orderValid ? parsedQuantity * parsedUnitPrice : 0)}</strong></div>
                </div> : <div className="space-y-2">
                    <Label htmlFor="correctionValue">Valor corrigido (R$)</Label>
                    <Input id="correctionValue" type="number" min="0.01" step="0.01" value={movementValue} onChange={event => setMovementValue(event.target.value)} />
                </div>}

                <div className="space-y-2">
                    <Label htmlFor="correctionObservation">Observação da substituição</Label>
                    <Input id="correctionObservation" value={observation} onChange={event => setObservation(event.target.value)} placeholder="Opcional" />
                </div>
            </div>
        </ResponsiveDialog>
    );
}
