import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useItems } from "../hooks/useItems";
import { useCategories } from "../hooks/useCategories";
import { useSubcategories } from "../hooks/useSubcategories";
import { ItemTable } from "../components/items/ItemTable";
import { ItemForm } from "../components/items/ItemForm";
import type { Item } from "../db/database";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";
import { ResponsiveDialog } from "../components/ui/ResponsiveDialog";

export default function ItemsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { data: items = [], isLoading: isItemsLoading } = useItems();
    const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();
    const { data: subcategories = [], isLoading: isSubcategoriesLoading } = useSubcategories();
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

            {isLoading ? (
                <div className="flex justify-center p-8 text-muted-foreground">
                    Carregando itens...
                </div>
            ) : (
                <ItemTable
                    items={items}
                    categories={categories}
                    subcategories={subcategories}
                    onEdit={handleEdit}
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