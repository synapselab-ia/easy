import React, { useState, useEffect, useMemo } from "react";
import { useCreateItem, useUpdateItem } from "../../hooks/useItems";
import { useCategories } from "../../hooks/useCategories";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { isCategoryActive, type Item } from "../../db/database";
import { toast } from "sonner";

interface ItemFormProps {
    initialData?: Item;
    onSubmitSuccess: () => void;
    onCancel: () => void;
}

export function ItemForm({ initialData, onSubmitSuccess, onCancel }: ItemFormProps) {
    const isExistingItem = typeof initialData?.id === 'number';
    const [name, setName] = useState(initialData?.name || "");
    const [basePrice, setBasePrice] = useState(
        initialData?.basePrice !== undefined ? initialData.basePrice.toString() : ""
    );
    const [categoryId, setCategoryId] = useState(initialData?.categoryId?.toString() || "");
    const [categoryChanged, setCategoryChanged] = useState(false);
    const [errors, setErrors] = useState<{ name?: string; basePrice?: string; categoryId?: string }>({});

    const { data: categories = [] } = useCategories();
    const activeCategories = useMemo(
        () => categories.filter(isCategoryActive),
        [categories],
    );
    const currentCategory = initialData?.categoryId
        ? categories.find(category => category.id === initialData.categoryId)
        : undefined;

    const createMutation = useCreateItem();
    const updateMutation = useUpdateItem();
    const isPending = createMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        setName(initialData?.name || "");
        setBasePrice(initialData?.basePrice !== undefined ? initialData.basePrice.toString() : "");
        setCategoryId(initialData?.categoryId?.toString() || "");
        setCategoryChanged(false);
        setErrors({});
    }, [initialData]);

    const validate = () => {
        const newErrors: { name?: string; basePrice?: string; categoryId?: string } = {};
        if (!name.trim()) newErrors.name = "Nome é obrigatório";

        const priceNum = parseFloat(basePrice.replace(",", "."));
        if (isNaN(priceNum) || priceNum <= 0) {
            newErrors.basePrice = "Preço deve ser maior que 0";
        }

        if (!isExistingItem && !categoryId) {
            newErrors.categoryId = "Categoria é obrigatória para novos itens ativos";
        } else if ((categoryChanged || !isExistingItem) && categoryId) {
            const selectedId = Number(categoryId);
            if (!activeCategories.some(category => category.id === selectedId)) {
                newErrors.categoryId = "Selecione uma categoria ativa";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const priceNum = parseFloat(basePrice.replace(",", "."));
        const categoryUpdate = categoryId && (!isExistingItem || categoryChanged)
            ? { categoryId: Number(categoryId) }
            : {};
        const data = {
            name: name.trim(),
            basePrice: priceNum,
            ...categoryUpdate,
            updatedAt: new Date()
        };

        try {
            if (initialData && initialData.id) {
                await updateMutation.mutateAsync({ id: initialData.id, ...data });
            } else {
                await createMutation.mutateAsync({ ...data, createdAt: new Date() });
            }
            onSubmitSuccess();
            setName("");
            setBasePrice("");
            setCategoryId("");
            setCategoryChanged(false);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Falha ao salvar item.";
            toast.error(message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nome do Item</Label>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Perfume Malbec"
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="categoryId">Categoria</Label>
                <select
                    id="categoryId"
                    value={categoryId}
                    onChange={(event) => {
                        setCategoryId(event.target.value);
                        setCategoryChanged(true);
                    }}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                >
                    <option value="">
                        {isExistingItem ? "Sem categoria — legado" : "Selecione uma categoria..."}
                    </option>
                    {currentCategory && !isCategoryActive(currentCategory) && (
                        <option value={currentCategory.id?.toString()} disabled>
                            {currentCategory.name} — arquivada
                        </option>
                    )}
                    {activeCategories.map(category => (
                        <option key={category.id} value={category.id?.toString()}>
                            {category.name}
                        </option>
                    ))}
                </select>
                {activeCategories.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        Cadastre uma categoria ativa antes de criar novos itens.
                    </p>
                )}
                {isExistingItem && !initialData?.categoryId && (
                    <p className="text-xs text-muted-foreground">
                        Este item legado pode continuar sem categoria, mas precisa ser classificado antes de entrar em um novo pedido.
                    </p>
                )}
                {errors.categoryId && <p className="text-red-500 text-sm">{errors.categoryId}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="basePrice">Preço Base (R$)</Label>
                <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="0.00"
                />
                {errors.basePrice && <p className="text-red-500 text-sm">{errors.basePrice}</p>}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Salvando..." : "Salvar"}
                </Button>
            </div>
        </form>
    );
}
