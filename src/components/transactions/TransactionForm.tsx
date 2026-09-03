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
import { ResponsiveDialog } from "../ui/ResponsiveDialog";
import { isItemActive, isResellerActive, type TransactionType } from "../../db/database";
import { toast } from "sonner";

interface TransactionFormProps {
    onSubmitSuccess: () => void;
    onCancel?: () => void;
    initialType?: TransactionType;
    initialResellerId?: number;
}

type SubmitMode = "finish" | "continue";

type KeepNextState = {
    resellerId: boolean;
    type: boolean;
    occurrenceDate: boolean;
    itemId: boolean;
    quantity: boolean;
    unitPrice: boolean;
    paymentValue: boolean;
    observation: boolean;
};

function createDefaultKeepNext(): KeepNextState {
    return {
        resellerId: true,
        type: true,
        occurrenceDate: true,
        itemId: false,
        quantity: false,
        unitPrice: false,
        paymentValue: false,
        observation: false,
    };
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

function isFutureOccurrenceDate(value: string, today = new Date()) {
    if (!occurrenceFromDateInput(value)) return false;
    return value > formatDateInput(today);
}

function formatOccurrenceDate(value: string) {
    const date = occurrenceFromDateInput(value);
    return date?.toLocaleDateString('pt-BR') ?? value;
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
    const [keepNext, setKeepNext] = useState<KeepNextState>(() => createDefaultKeepNext());
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [futureDateConfirmationOpen, setFutureDateConfirmationOpen] = useState(false);
    const [pendingSubmitMode, setPendingSubmitMode] = useState<SubmitMode>("finish");

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
        setKeepNext(createDefaultKeepNext());
        setErrors({});
        setFutureDateConfirmationOpen(false);
        setPendingSubmitMode("finish");
        createMutation.reset();
    };

    const prepareNextTransaction = () => {
        const keptItemId = keepNext.itemId ? itemId : "";
        const keptItem = activeItems.find(item => item.id?.toString() === keptItemId);

        setResellerId(current => keepNext.resellerId ? current : "");
        setType(current => keepNext.type ? current : initialType);
        setOccurrenceDate(current => keepNext.occurrenceDate ? current : formatDateInput());
        setItemId(keptItemId);
        setQuantity(current => keepNext.quantity ? current : "1");
        setUnitPrice(current => {
            if (keepNext.unitPrice) return current;
            return keptItem ? keptItem.basePrice.toString() : "";
        });
        setPaymentValue(current => keepNext.paymentValue ? current : "");
        setObservation(current => keepNext.observation ? current : "");
        setErrors({});
        setFutureDateConfirmationOpen(false);
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

    const persistTransaction = async (mode: SubmitMode) => {
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
            if (mode === "continue") {
                prepareNextTransaction();
            } else {
                resetForm();
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Não foi possível salvar o lançamento.");
        }
    };

    const startSubmit = async (mode: SubmitMode) => {
        setPendingSubmitMode(mode);
        if (!validate()) return;

        if (isFutureOccurrenceDate(occurrenceDate)) {
            setFutureDateConfirmationOpen(true);
            return;
        }

        await persistTransaction(mode);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        await startSubmit("finish");
    };

    const handleConfirmFutureDate = async () => {
        setFutureDateConfirmationOpen(false);
        await persistTransaction(pendingSubmitMode);
    };

    const handleCancel = () => {
        resetForm();
        onCancel?.();
    };

    const toggleKeepNext = (field: keyof KeepNextState) => {
        setKeepNext(current => ({
            ...current,
            [field]: !current[field],
        }));
    };

    const keepNextOptions: Array<{ field: keyof KeepNextState; label: string }> = [
        { field: "resellerId", label: "Revendedor" },
        { field: "type", label: "Tipo" },
        { field: "occurrenceDate", label: "Data" },
        ...(type === "order"
            ? [
                { field: "itemId" as const, label: "Item" },
                { field: "quantity" as const, label: "Quantidade" },
                { field: "unitPrice" as const, label: "Preço" },
            ]
            : [
                { field: "paymentValue" as const, label: "Valor" },
            ]),
        { field: "observation", label: "Observação" },
    ];

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

            <div className="rounded-xl border bg-muted/30 p-4 shadow-sm">
                <div className="space-y-1">
                    <p className="text-sm font-semibold">Manter no próximo lançamento</p>
                    <p className="text-xs text-muted-foreground">
                        Vale somente para “Salvar e adicionar outro”. Revendedor, tipo e data já ficam mantidos por padrão.
                    </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Campos mantidos no próximo lançamento">
                    {keepNextOptions.map(({ field, label }) => {
                        const checked = keepNext[field];
                        return (
                            <button
                                key={field}
                                id={`keep-next-${field}`}
                                type="button"
                                role="checkbox"
                                aria-checked={checked}
                                aria-label={`Manter ${label.toLowerCase()}`}
                                onClick={() => toggleKeepNext(field)}
                                className={`inline-flex cursor-pointer select-none items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${checked
                                    ? "border-primary/30 bg-primary/10 text-foreground shadow-sm"
                                    : "bg-background text-muted-foreground hover:bg-muted/70"
                                    }`}
                            >
                                <span
                                    aria-hidden="true"
                                    className={`flex h-4 w-4 items-center justify-center rounded-full border text-[10px] leading-none ${checked
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-muted-foreground/40 bg-background"
                                        }`}
                                >
                                    {checked ? "✓" : ""}
                                </span>
                                <span>{label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending} className="w-full sm:w-auto">
                    Cancelar
                </Button>
                <Button type="submit" variant="secondary" disabled={isPending} className="w-full sm:w-auto">
                    {isPending && pendingSubmitMode === "finish" ? "Salvando..." : "Salvar e concluir"}
                </Button>
                <Button
                    type="button"
                    onClick={() => void startSubmit("continue")}
                    disabled={isPending}
                    className="w-full sm:w-auto"
                >
                    {isPending && pendingSubmitMode === "continue" ? "Salvando..." : "Salvar e adicionar outro"}
                </Button>
            </div>

            <ResponsiveDialog
                open={futureDateConfirmationOpen}
                onOpenChange={setFutureDateConfirmationOpen}
                title="Data de ocorrência no futuro"
                description="A data selecionada é posterior à data de hoje."
                footer={(
                    <>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setFutureDateConfirmationOpen(false)}
                            disabled={isPending}
                        >
                            Voltar e corrigir
                        </Button>
                        <Button
                            type="button"
                            onClick={handleConfirmFutureDate}
                            disabled={isPending}
                        >
                            {isPending
                                ? "Salvando..."
                                : pendingSubmitMode === "continue"
                                    ? "Cadastrar e adicionar outro"
                                    : "Cadastrar mesmo assim"}
                        </Button>
                    </>
                )}
            >
                <p className="text-sm text-muted-foreground">
                    A movimentação está com data de ocorrência em {formatOccurrenceDate(occurrenceDate)}. Se isso for intencional, confirme para manter exatamente essa data financeira.
                </p>
            </ResponsiveDialog>
        </form>
    );
}