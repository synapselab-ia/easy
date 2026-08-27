import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useItems } from "../hooks/useItems";
import { useCategories } from "../hooks/useCategories";
import { useSubcategories } from "../hooks/useSubcategories";
import { ItemTable } from "../components/items/ItemTable";
import { ItemForm } from "../components/items/ItemForm";
import {
    isCategoryActive,
    isItemActive,
    isSubcategoryActive,
    type Item,
} from "../db/database";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { SearchableSelect } from "../components/ui/SearchableSelect";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import { Plus, Search } from "lucide-react";
import { ResponsiveDialog } from "../components/ui/ResponsiveDialog";

function normalizeFilterText(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("pt-BR")
        .trim();
}

export default function ItemsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { data: items = [], isLoading: isItemsLoading } = useItems();
    const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();
    const { data: subcategories = [], isLoading: isSubcategoriesLoading } = useSubcategories();
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [subcategoryFilter, setSubcategoryFilter] = useState("all");
    const [lifecycleFilter, setLifecycleFilter] = useState("all");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | undefined>();

    useEffect(() => {
        const nameParam = searchParams.get("name");
        if (nameParam) {
            // Pre-fill creation
            setEditingItem({ name: nameParam } as Item);
            setIsDialogOpen(true);

            // Clear the param after using it
            const newParams = new URLSearchParams(searchParams);
            newParams.delete("name");
            setSearchParams(newParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    const handleCreateNew = () => {
        setEditingItem(undefined);
        setIsDialogOpen(true);
    };

    const handleEdit = (item: Item) => {
        setEditingItem(item);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingItem(undefined);
    };

    const selectedCategoryId = categoryFilter !== "all" && categoryFilter !== "unclassified"
        ? Number(categoryFilter)
        : undefined;

    const categoryFilterOptions = useMemo(() => [
        { value: "all", label: "Todas as categorias" },
        { value: "unclassified", label: "Sem classificação" },
        ...categories.map(category => ({
            value: category.id!.toString(),
            label: isCategoryActive(category) ? category.name : `${category.name} — arquivada`,
            searchText: category.name,
        })),
    ], [categories]);

    const subcategoryFilterOptions = useMemo(() => [
        { value: "all", label: "Todas as subcategorias" },
        { value: "none", label: "Sem subcategoria" },
        ...subcategories
            .filter(subcategory => subcategory.categoryId === selectedCategoryId)
            .map(subcategory => ({
                value: subcategory.id!.toString(),
                label: isSubcategoryActive(subcategory) ? subcategory.name : `${subcategory.name} — arquivada`,
                searchText: subcategory.name,
            })),
    ], [selectedCategoryId, subcategories]);

    const filteredItems = useMemo(() => {
        const normalizedQuery = normalizeFilterText(searchQuery);

        return items.filter(item => {
            if (normalizedQuery && !normalizeFilterText(item.name).includes(normalizedQuery)) {
                return false;
            }

            const active = isItemActive(item);
            if (lifecycleFilter === "active" && !active) return false;
            if (lifecycleFilter === "inactive" && active) return false;

            const resolvedCategory = item.categoryId === undefined
                ? undefined
                : categories.find(category => category.id === item.categoryId);

            if (categoryFilter === "unclassified") {
                return !resolvedCategory;
            }

            if (selectedCategoryId !== undefined && item.categoryId !== selectedCategoryId) {
                return false;
            }

            if (selectedCategoryId !== undefined && subcategoryFilter !== "all") {
                const resolvedSubcategory = item.subcategoryId === undefined
                    ? undefined
                    : subcategories.find(subcategory =>
                        subcategory.id === item.subcategoryId
                        && subcategory.categoryId === selectedCategoryId
                    );

                if (subcategoryFilter === "none") {
                    return !resolvedSubcategory;
                }

                return resolvedSubcategory?.id === Number(subcategoryFilter);
            }

            return true;
        });
    }, [
        categories,
        categoryFilter,
        items,
        lifecycleFilter,
        searchQuery,
        selectedCategoryId,
        subcategories,
        subcategoryFilter,
    ]);

    const hasActiveFilters = Boolean(
        searchQuery.trim()
        || categoryFilter !== "all"
        || subcategoryFilter !== "all"
        || lifecycleFilter !== "all"
    );

    const clearFilters = () => {
        setSearchQuery("");
        setCategoryFilter("all");
        setSubcategoryFilter("all");
        setLifecycleFilter("all");
    };

    const isLoading = isItemsLoading || isCategoriesLoading || isSubcategoriesLoading;

    return (
        <div className="p-4 lg:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Catálogo de Itens</h1>
                    <p className="text-muted-foreground">
                        Gerencie itens ativos e arquivados; apenas os ativos ficam disponíveis para novos pedidos.
                    </p>
                </div>
                <Button onClick={handleCreateNew} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Item
                </Button>
            </div>

            <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                        <Label htmlFor="itemSearch">Buscar item</Label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="itemSearch"
                                type="search"
                                placeholder="Buscar por nome..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="itemCategoryFilter">Filtrar por categoria</Label>
                        <SearchableSelect
                            id="itemCategoryFilter"
                            value={categoryFilter}
                            onValueChange={(value) => {
                                setCategoryFilter(value);
                                setSubcategoryFilter("all");
                            }}
                            options={categoryFilterOptions}
                            placeholder="Todas as categorias"
                            searchPlaceholder="Pesquisar categoria..."
                            emptyMessage="Nenhuma categoria encontrada."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="itemSubcategoryFilter">Filtrar por subcategoria</Label>
                        <SearchableSelect
                            id="itemSubcategoryFilter"
                            value={subcategoryFilter}
                            onValueChange={setSubcategoryFilter}
                            options={subcategoryFilterOptions}
                            placeholder="Todas as subcategorias"
                            searchPlaceholder="Pesquisar subcategoria..."
                            emptyMessage="Nenhuma subcategoria encontrada."
                            disabled={selectedCategoryId === undefined}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="itemLifecycleFilter">Status</Label>
                        <Select
                            value={lifecycleFilter}
                            onValueChange={(value) => setLifecycleFilter(value || "all")}
                        >
                            <SelectTrigger id="itemLifecycleFilter">
                                <SelectValue>
                                    {lifecycleFilter === "active"
                                        ? "Ativos"
                                        : lifecycleFilter === "inactive"
                                            ? "Inativos"
                                            : "Todos"}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="active">Ativos</SelectItem>
                                <SelectItem value="inactive">Inativos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {hasActiveFilters && (
                    <div className="flex justify-end">
                        <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                            Limpar filtros
                        </Button>
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="flex justify-center p-8 text-muted-foreground">
                    Carregando itens...
                </div>
            ) : (
                <ItemTable
                    items={filteredItems}
                    categories={categories}
                    subcategories={subcategories}
                    onEdit={handleEdit}
                    emptyMessage={items.length > 0
                        ? "Nenhum item encontrado com os filtros atuais."
                        : "Nenhum item cadastrado."}
                />
            )}

            <ResponsiveDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                title={editingItem ? "Editar Item" : "Novo Item"}
            >
                <ItemForm
                    initialData={editingItem}
                    onSubmitSuccess={handleCloseDialog}
                    onCancel={handleCloseDialog}
                />
            </ResponsiveDialog>
        </div>
    );
}
