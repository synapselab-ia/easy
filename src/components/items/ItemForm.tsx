import React, { useState, useEffect } from "react";
import { useCreateItem, useUpdateItem } from "../../hooks/useItems";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type { Item } from "../../db/database";
import { toast } from "sonner";

interface ItemFormProps {
    initialData?: Item;
    onSubmitSuccess: () => void;
    onCancel: () => void;
}

export function ItemForm({ initialData, onSubmitSuccess, onCancel }: ItemFormProps) {
    const [name, setName] = useState(initialData?.name || "");
    const [basePrice, setBasePrice] = useState(
        initialData?.basePrice !== undefined ? initialData.basePrice.toString() : ""
    );
    const [errors, setErrors] = useState<{ name?: string; basePrice?: string }>({});

    const createMutation = useCreateItem();
    const updateMutation = useUpdateItem();
    const isPending = createMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        if (initialData) {
            setName(initialData.name || "");
            setBasePrice(initialData.basePrice !== undefined ? initialData.basePrice.toString() : "");
        }
    }, [initialData]);

    const validate = () => {
        const newErrors: { name?: string; basePrice?: string } = {};
        if (!name.trim()) newErrors.name = "Nome é obrigatório";

        const priceNum = parseFloat(basePrice.replace(",", "."));
        if (isNaN(priceNum) || priceNum <= 0) {
            newErrors.basePrice = "Preço deve ser maior que 0";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const priceNum = parseFloat(basePrice.replace(",", "."));
        const data = {
            name: name.trim(),
            basePrice: priceNum,
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
