import { useState } from "react";
import { isItemActive, type Category, type Item, type Subcategory } from "../../db/database";
import { useArchiveItem, useReactivateItem } from "../../hooks/useItems";
import { getCurrentItemClassificationLabel } from "../../lib/catalogClassification";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { ResponsiveDialog } from "../ui/ResponsiveDialog";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Card, CardContent } from "../ui/card";
import { Tag, CircleDollarSign } from "lucide-react";
import { toast } from "sonner";

interface ItemTableProps {
    items: Item[];
    categories: Category[];
    subcategories: Subcategory[];
    onEdit: (item: Item) => void;
}

export function ItemTable({ items, categories, subcategories, onEdit }: ItemTableProps) {
    const isDesktop = useMediaQuery("(min-width: 1024px)");
    const archiveMutation = useArchiveItem();
    const reactivateMutation = useReactivateItem();
    const [itemToArchive, setItemToArchive] = useState<Item | null>(null);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const classificationLabel = (item: Item) =>
        getCurrentItemClassificationLabel(item, categories, subcategories);

    const handleArchive = async () => {
        if (itemToArchive?.id) {
            await archiveMutation.mutateAsync(itemToArchive.id);
            setItemToArchive(null);
        }
    };

    const handleReactivate = async (item: Item) => {
        if (!item.id) return;

        try {
            await reactivateMutation.mutateAsync(item.id);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Não foi possível reativar o item.");
        }
    };

    const lifecycleActions = (item: Item) => {
        const active = isItemActive(item);
        return (
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(item)}
                >
                    Editar
                </Button>
                {active ? (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setItemToArchive(item)}
                        disabled={archiveMutation.isPending}
                    >
                        Arquivar
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReactivate(item)}
                        disabled={reactivateMutation.isPending}
                    >
                        {reactivateMutation.isPending ? "Reativando..." : "Reativar"}
                    </Button>
                )}
            </div>
        );
    };

    const archiveDialog = (
        <ResponsiveDialog
            open={!!itemToArchive}
            onOpenChange={(open) => !open && setItemToArchive(null)}
            title="Arquivar Item"
            description={`Arquivar o item "${itemToArchive?.name}"? Ele permanecerá no catálogo e no histórico, mas não poderá ser usado em novos pedidos até ser reativado.`}
            footer={
                <>
                    <Button
                        variant="outline"
                        onClick={() => setItemToArchive(null)}
                        disabled={archiveMutation.isPending}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleArchive}
                        disabled={archiveMutation.isPending}
                    >
                        {archiveMutation.isPending ? "Arquivando..." : "Confirmar Arquivamento"}
                    </Button>
                </>
            }
        >
            <div className="py-2 text-sm text-muted-foreground">
                O histórico de pedidos e os snapshots do item serão preservados.
            </div>
        </ResponsiveDialog>
    );

    if (!isDesktop) {
        return (
            <div className="space-y-4">
                {items.length === 0 ? (
                    <div className="text-center py-10 bg-card rounded-lg border border-dashed text-muted-foreground">
                        Nenhum item cadastrado.
                    </div>
                ) : (
                    items.map((item) => {
                        const active = isItemActive(item);
                        return (
                            <Card key={item.id} className={active ? "overflow-hidden" : "overflow-hidden opacity-75"}>
                                <CardContent className="p-4 space-y-4">
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="min-w-0 space-y-1">
                                            <div className="font-bold text-lg text-primary flex items-center gap-2 min-w-0">
                                                <Tag size={18} className="shrink-0" />
                                                <span className="truncate">{item.name}</span>
                                                {!active && (
                                                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase font-semibold tracking-wider">
                                                        Inativo
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {classificationLabel(item)}
                                            </div>
                                        </div>
                                        {lifecycleActions(item)}
                                    </div>
                                    <div className="flex items-center gap-2 text-lg font-semibold text-muted-foreground">
                                        <CircleDollarSign size={20} className="text-payment" />
                                        <span>{formatCurrency(item.basePrice)}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}

                {archiveDialog}
            </div>
        );
    }

    return (
        <div>
            <div className="rounded-md border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Classificação</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Preço Base</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                    Nenhum item cadastrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => {
                                const active = isItemActive(item);
                                return (
                                    <TableRow key={item.id} className={active ? undefined : "opacity-75"}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{classificationLabel(item)}</TableCell>
                                        <TableCell>{active ? 'Ativo' : 'Inativo'}</TableCell>
                                        <TableCell>{formatCurrency(item.basePrice)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {lifecycleActions(item)}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {archiveDialog}
        </div>
    );
}