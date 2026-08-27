import React, { useState, useEffect, useMemo } from "react";
import { useCreateItem, useUpdateItem } from "../../hooks/useItems";
import { useCategories } from "../../hooks/useCategories";
import { useSubcategories } from "../../hooks/useSubcategories";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { SearchableSelect } from "../ui/SearchableSelect";
import { isCategoryActive, isSubcategoryActive, type Item } from "../../db/database";
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
    const [subcategoryId, setSubcategoryId] = useState(initialData?.subcategoryId?.toString() || "");
    const [categoryChanged, setCategoryChanged] = useState(false);
    const [subcategoryChanged, setSubcategoryChanged] = useState(false);
    const [errors, setErrors] = useState<{
        name?: string;
        basePrice?: string;
        categoryId?: string;
        subcategoryId?: string;
    }>({});

    const { data: categories = [] } = useCategories();
    const { data: subcategories = [] } = useSubcategories();
    const activeCategories = useMemo(
        () => categories.filter(isCategoryActive),
        [categories],
    );
    const selectedCategoryId = categoryId ? Number(categoryId) : undefined;
    const activeSubcategories = useMemo(
        () => subcategories.filter(subcategory =>
            isSubcategoryActive(subcategory) && subcategory.categoryId === selectedCategoryId
        ),
        [selectedCategoryId, subcategories],
    );
    const currentCategory = initialData?.categoryId
        ? categories.find(category => category.id === initialData.categoryId)
        : undefined;
    const currentSubcategory = initialData?.subcategoryId
        ? subcategories.find(subcategory => subcategory.id === initialData.subcategoryId)
        : undefined;
    const categoryOptions = useMemo(() => [
        {
            value: "",
            label: isExistingItem ? "Sem categoria — legado" : "Selecione uma categoria...",
        },
        ...(currentCategory && !isCategoryActive(currentCategory) ? [{
            value: currentCategory.id!.toString(),
            label: `${currentCategory.name} — arquivada`,
            searchText: currentCategory.name,
            disabled: true,
        }] : []),
        ...activeCategories.map(category => ({
            value: category.id!.toString(),
            label: category.name,
            searchText: category.name,
        })),
    ], [activeCategories, currentCategory, isExistingItem]);
    const subcategoryOptions = useMemo(() => [
        { value: "", label: "Sem subcategoria" },
        ...(currentSubcategory
            && currentSubcategory.categoryId === selectedCategoryId
            && !isSubcategoryActive(currentSubcategory) ? [{
                value: currentSubcategory.id!.toString(),
                label: `${currentSubcategory.name} — arquivada`,
                searchText: currentSubcategory.name,
                disabled: true,
            }] : []),
        ...activeSubcategories.map(subcategory => ({
            value: subcategory.id!.toString(),
            label: subcategory.name,
            searchText: subcategory.name,
        })),
    ], [activeSubcategories, currentSubcategory, selectedCategoryId]);

    const createMutation = useCreateItem();
    const updateMutation = useUpdateItem();
    const isPending = createMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        setName(initialData?.name || "");
        setBasePrice(initialData?.basePrice !== undefined ? initialData.basePrice.toString() : "");
        setCategoryId(initialData?.categoryId?.toString() || "");
        setSubcategoryId(initialData?.subcategoryId?.toString() || "");
        setCategoryChanged(false);
        setSubcategoryChanged(false);
        setErrors({});
    }, [initialData]);

    const validate = () => {
        const newErrors: {
            name?: string;
            basePrice?: string;
            categoryId?: string;
            subcategoryId?: string;
        } = {};
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

        const classificationChanged = !isExistingItem || categoryChanged || subcategoryChanged;
        if (subcategoryId && classificationChanged) {
            const selectedSubcategoryId = Number(subcategoryId);
            const selectedCategory = Number(categoryId);
            if (!activeSubcategories.some(subcategory =>
                subcategory.id === selectedSubcategoryId && subcategory.categoryId === selectedCategory
            )) {
                newErrors.subcategoryId = "Selecione uma subcategoria ativa desta categoria";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const priceNum = parseFloat(basePrice.replace(",", "."));
        const classificationChanged = !isExistingItem || categoryChanged || subcategoryChanged;
        const classificationUpdate = classificationChanged
            ? {
                categoryId: categoryId ? Number(categoryId) : undefined,
                subcategoryId: subcategoryId ? Number(subcategoryId) : undefined,
            }
            : {};
        const data = {
            name: name.trim(),
            basePrice: priceNum,
            ...classificationUpdate,
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
            setSubcategoryId("");
            setCategoryChanged(false);
            setSubcategoryChanged(false);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Falha ao salvar item.";
            toast.error(message);
        }
    };

    const changeCategory = (nextCategoryId: string) => {
        setCategoryId(nextCategoryId);
        setCategoryChanged(true);
        setSubcategoryId("");
        setSubcategoryChanged(true);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nome do Item</Label>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Placa 3x8"
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="categoryId">Categoria</Label>
                <SearchableSelect
                    id="categoryId"
                    value={categoryId}
                    onValueChange={changeCategory}
                    options={categoryOptions}
                    placeholder={isExistingItem ? "Sem categoria — legado" : "Selecione uma categoria..."}
                    searchPlaceholder="Pesquisar categoria..."
                    emptyMessage="Nenhuma categoria encontrada."
                />
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
                <Label htmlFor="subcategoryId">Subcategoria (opcional)</Label>
                <SearchableSelect
                    id="subcategoryId"
                    value={subcategoryId}
                    onValueChange={(nextSubcategoryId) => {
                        setSubcategoryId(nextSubcategoryId);
                        setSubcategoryChanged(true);
                    }}
                    options={subcategoryOptions}
                    placeholder="Sem subcategoria"
                    searchPlaceholder="Pesquisar subcategoria..."
                    emptyMessage="Nenhuma subcategoria encontrada."
                    disabled={!categoryId}
                />
                {categoryId && activeSubcategories.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                        Esta categoria ainda não possui subcategorias ativas. O item pode ficar somente na categoria.
                    </p>
                )}
                {errors.subcategoryId && <p className="text-red-500 text-sm">{errors.subcategoryId}</p>}
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
