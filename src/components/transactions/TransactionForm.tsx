import React, { useState, useEffect, useMemo } from "react";
import { useCreateTransaction } from "../../hooks/useTransactions";
import { useItems } from "../../hooks/useItems";
import { useResellers } from "../../hooks/useResellers";
import { useCategories } from "../../hooks/useCategories";
import { useSubcategories } from "../../hooks/useSubcategories";
import { getCurrentItemClassificationLabel } from "../../lib/catalogClassification";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { SearchableSelect } from "../ui/SearchableSelect";
import { isItemActive, isResellerActive, type TransactionType } from "../../db/database";
import { toast } from "sonner";

interface TransactionFormProps {
    onSubmitSuccess: () => void;
    onCancel?: () => void;
    initialType?: TransactionType;
    initialResellerId?: number;
}

function formatDateInput(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function occurrenceFromDateInput(value: string) {
    if (!value) return null;
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatMoney(value: number) {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function TransactionForm({
    onSubmitSuccess,
    onCancel,
    initialType = "order",
    initialResellerId,
}: TransactionFormProps) {
    const initialResellerValue = initialResellerId?.toString() ?? "";
    const [resellerId, setResellerId] = useState<string>(initialResellerValue);
    const [type, setType] = useState<TransactionType>(initialType);
    const [occurrenceDate, setOccurrenceDate] = useState<string>(() => formatDateInput());

    const [itemId, setItemId] = useState<string>("");
    const [quantity, setQuantity] = useState<string>("1");
    const [unitPrice, setUnitPrice] = useState<string>("");
    const [observation, setObservation] = useState<string>("");
    const [paymentValue, setPaymentValue] = useState<string>("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const createMutation = useCreateTransaction();
    const isPending = createMutation.isPending;

    const { data: items = [] } = useItems();
    const { data: resellers = [] } = useResellers();
    const { data: categories = [] } = useCategories();
    const { data: subcategories = [] } = useSubcategories();
    const activeItems = useMemo(
        () => items.filter(isItemActive),
        [items]
    );
    const activeResellers = useMemo(
        () => resellers.filter(isResellerActive),
        [resellers]
    );
    const resellerOptions = useMemo(
        () => activeResellers.map(reseller => ({
            value: reseller.id!.toString(),
            label: reseller.name,
            searchText: reseller.name,
        })),
        [activeResellers],
    );
    const itemOptions = useMemo(
        () => activeItems.map(item => {
            const classification = getCurrentItemClassificationLabel(item, categories, subcategories);
            return {
                value: item.id!.toString(),
                label: `${item.name} — ${classification} (${formatMoney(item.basePrice)})`,
                selectedLabel: `${item.name} — ${classification}`,
                searchText: item.name,
            };
        }),
        [activeItems, categories, subcategories],
    );

    useEffect(() => {
        if (type === "order" && itemId) {
            const selectedItem = activeItems.find(i => i.id?.toString() === itemId);
            if (selectedItem) {
                setUnitPrice(selectedItem.basePrice.toString());
            }
        }
    }, [itemId, activeItems, type]);

    const orderTotalPrice = type === "order"
        ? (parseFloat(quantity) || 0) * (parseFloat(unitPrice.replace(",", ".")) || 0)
        : 0;

    const resetForm = () => {
        setResellerId(initialResellerValue);
        setType(initialType);
        setOccurrenceDate(formatDateInput());
        setItemId("");
        setQuantity("1");
        setUnitPrice("");
        setPaymentValue("");
        setObservation("");
        setErrors({});
        createMutation.reset();
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!resellerId) {
            newErrors.resellerId = "Revendedor é obrigatório";
        } else if (!activeResellers.some(r => r.id?.toString() === resellerId)) {
            newErrors.resellerId = "Revendedor inativo não pode receber novos lançamentos";
        }

        if (!occurrenceFromDateInput(occurrenceDate)) {
            newErrors.occurrenceDate = "Data de ocorrência inválida";
        }

        if (type === "order") {
            if (!itemId) {
                newErrors.itemId = "Item é obrigatório";
            } else if (!activeItems.some(i => i.id?.toString() === itemId)) {
                newErrors.itemId = "Item inativo não pode ser usado em novos pedidos";
            }

            const qty = parseInt(quantity, 10);
            if (isNaN(qty) || qty <= 0) newErrors.quantity = "Quantidade inválida";

            const price = parseFloat(unitPrice.replace(",", "."));
            if (isNaN(price) || price < 0) newErrors.unitPrice = "Preço inválido";
        } else {
            const val = parseFloat(paymentValue.replace(",", "."));
            if (isNaN(val) || val <= 0) newErrors.paymentValue = "Valor inválido";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const occurredAt = occurrenceFromDateInput(occurrenceDate);
        if (!occurredAt) return;

        let data: any = {
            resellerId: parseInt(resellerId, 10),
            type,
            occurredAt,
            observation: observation.trim() || undefined,
        };

        if (type === "order") {
            const selectedItem = activeItems.find(i => i.id?.toString() === itemId);
            data = {
                ...data,
                itemId: parseInt(itemId, 10),
                itemName: selectedItem?.name,
                quantity: parseInt(quantity, 10),
                unitPrice: parseFloat(unitPrice.replace(",", ".")),
                totalPrice: orderTotalPrice,
            };
        } else {
            data = {
                ...data,
                totalPrice: parseFloat(paymentValue.replace(",", ".")),
            };
        }

        try {
            await createMutation.mutateAsync(data);
            onSubmitSuccess();
            resetForm();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Não foi possível salvar o lançamento.");
        }
    };

    const handleCancel = () => {
        resetForm();
        onCancel?.();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="resellerId">Revendedor</Label>
                    <SearchableSelect
                        id="resellerId"
                        value={resellerId}
                        onValueChange={setResellerId}
                        options={resellerOptions}
                        placeholder="Selecione..."
                        searchPlaceholder="Pesquisar revendedor..."
                        emptyMessage="Nenhum revendedor encontrado."
                    />
                    {activeResellers.length === 0 && (
                        <p className="text-sm text-muted-foreground">Nenhum revendedor ativo disponível para novos lançamentos.</p>
                    )}
                    {errors.resellerId && <p className="text-red-500 text-sm">{errors.resellerId}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Movimentação</Label>
                    <Select value={type} onValueChange={(val) => setType(val as TransactionType || "order")}>
                        <SelectTrigger id="type">
                            <SelectValue>
                                {type === 'order' ? 'Pedido' : type === 'payment' ? 'Pagamento' : 'Sinal'}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="order">Pedido</SelectItem>
                            <SelectItem value="payment">Pagamento</SelectItem>
                            <SelectItem value="signal">Sinal</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="occurrenceDate">Data da ocorrência</Label>
                    <Input
                        id="occurrenceDate"
                        type="date"
                        value={occurrenceDate}
                        onChange={(event) => setOccurrenceDate(event.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Data financeira da movimentação. O momento de registro é salvo automaticamente.</p>
                    {errors.occurrenceDate && <p className="text-red-500 text-sm">{errors.occurrenceDate}</p>}
                </div>
            </div>

            {type === "order" ? (
                <div className="space-y-4 pt-2 border-t mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="itemId">Item do Catálogo</Label>
                            <SearchableSelect
                                id="itemId"
                                value={itemId}
                                onValueChange={setItemId}
                                options={itemOptions}
                                placeholder="Selecione o item..."
                                searchPlaceholder="Pesquisar item..."
                                emptyMessage="Nenhum item encontrado."
                            />
                            {activeItems.length === 0 && (
                                <p className="text-sm text-muted-foreground">Nenhum item ativo disponível para novos pedidos.</p>
                            )}
                            {errors.itemId && <p className="text-red-500 text-sm">{errors.itemId}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantidade</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />
                            {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="unitPrice">Valor Unitário (R$)</Label>
                            <Input
                                id="unitPrice"
                                type="number"
                                step="0.01"
                                min="0"
                                value={unitPrice}
                                onChange={(e) => setUnitPrice(e.target.value)}
                            />
                            {errors.unitPrice && <p className="text-red-500 text-sm">{errors.unitPrice}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="totalPrice">Valor Total</Label>
                            <Input
                                id="totalPrice"
                                disabled
                                value={formatMoney(orderTotalPrice)}
                                className="bg-muted"
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 pt-2 border-t mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="paymentValue">Valor para Abatimento (R$)</Label>
                        <Input
                            id="paymentValue"
                            type="number"
                            step="0.01"
                            min="0"
                            value={paymentValue}
                            onChange={(e) => setPaymentValue(e.target.value)}
                            placeholder="0.00"
                        />
                        {errors.paymentValue && <p className="text-red-500 text-sm">{errors.paymentValue}</p>}
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="observation">Observação</Label>
                <Input
                    id="observation"
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    placeholder={type === "order" ? "Ex: Nome na placa" : "Ex.: referência ou contexto da movimentação"}
                />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Lançando..." : "Lançar Movimentação"}
                </Button>
            </div>
        </form>
    );
}
