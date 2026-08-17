import React, { useState, useEffect, useMemo } from "react";
import { useCreateTransaction } from "../../hooks/useTransactions";
import { useItems } from "../../hooks/useItems";
import { useResellers } from "../../hooks/useResellers";
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
import { isResellerActive, type TransactionType } from "../../db/database";

interface TransactionFormProps {
    onSubmitSuccess: () => void;
    onCancel: () => void;
    initialType?: TransactionType;
}

export function TransactionForm({ onSubmitSuccess, onCancel, initialType = "order" }: TransactionFormProps) {
    const [resellerId, setResellerId] = useState<string>("");
    const [type, setType] = useState<TransactionType>(initialType);

    // Pass order fields
    const [itemId, setItemId] = useState<string>("");
    const [quantity, setQuantity] = useState<string>("1");
    const [unitPrice, setUnitPrice] = useState<string>("");
    const [observation, setObservation] = useState<string>("");

    // Pass payment fields
    const [paymentValue, setPaymentValue] = useState<string>("");

    const [errors, setErrors] = useState<Record<string, string>>({});

    const createMutation = useCreateTransaction();
    const isPending = createMutation.isPending;

    const { data: items = [] } = useItems();
    const { data: resellers = [] } = useResellers();
    const activeResellers = useMemo(
        () => resellers.filter(isResellerActive),
        [resellers]
    );

    // Auto-fill unit price when item is selected
    useEffect(() => {
        if (type === "order" && itemId) {
            const selectedItem = items.find(i => i.id?.toString() === itemId);
            if (selectedItem) {
                setUnitPrice(selectedItem.basePrice.toString());
            }
        }
    }, [itemId, items, type]);

    // Computed total price for orders
    const orderTotalPrice = type === "order"
        ? (parseFloat(quantity) || 0) * (parseFloat(unitPrice.replace(",", ".")) || 0)
        : 0;

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!resellerId) {
            newErrors.resellerId = "Revendedor é obrigatório";
        } else if (!activeResellers.some(r => r.id?.toString() === resellerId)) {
            newErrors.resellerId = "Revendedor inativo não pode receber novos lançamentos";
        }

        if (type === "order") {
            if (!itemId) newErrors.itemId = "Item é obrigatório";

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

        let data: any = {
            resellerId: parseInt(resellerId, 10),
            type,
            createdAt: new Date(),
        };

        if (type === "order") {
            const selectedItem = items.find(i => i.id?.toString() === itemId);
            data = {
                ...data,
                itemId: parseInt(itemId, 10),
                itemName: selectedItem?.name,
                quantity: parseInt(quantity, 10),
                unitPrice: parseFloat(unitPrice.replace(",", ".")),
                totalPrice: orderTotalPrice,
                observation: observation.trim() || undefined,
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
            // Reset form
            setResellerId("");
            setItemId("");
            setQuantity("1");
            setUnitPrice("");
            setPaymentValue("");
            setObservation("");
        } catch (error) {
            console.error("Erro ao salvar transação:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="resellerId">Revendedor</Label>
                    <Select value={resellerId} onValueChange={(val) => setResellerId(val ?? "")}>
                        <SelectTrigger id="resellerId">
                            <SelectValue>
                                {resellerId ? activeResellers.find(r => r.id!.toString() === resellerId)?.name : "Selecione..."}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {activeResellers.map((r) => (
                                <SelectItem key={r.id} value={r.id!.toString()}>
                                    {r.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
            </div>

            {type === "order" ? (
                <div className="space-y-4 pt-2 border-t mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="itemId">Item do Catálogo</Label>
                            <Select value={itemId} onValueChange={(val) => setItemId(val ?? "")}>
                                <SelectTrigger id="itemId">
                                    <SelectValue>
                                        {itemId ? items.find(i => i.id!.toString() === itemId)?.name : "Selecione o item..."}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {items.map((i) => (
                                        <SelectItem key={i.id} value={i.id!.toString()}>
                                            {i.name} (R$ {i.basePrice.toFixed(2)})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                            <Label htmlFor="totalPrice">Valor Total (R$)</Label>
                            <Input
                                id="totalPrice"
                                disabled
                                value={orderTotalPrice.toFixed(2)}
                                className="bg-muted"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="observation">Observação</Label>
                        <Input
                            id="observation"
                            value={observation}
                            onChange={(e) => setObservation(e.target.value)}
                            placeholder="Ex: Nome na placa"
                        />
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

            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Lançando..." : "Lançar Movimentação"}
                </Button>
            </div>
        </form>
    );
}
