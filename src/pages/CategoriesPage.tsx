import { useState, type FormEvent } from 'react';
import { Archive, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { isCategoryActive, type Category } from '../db/database';
import {
    useArchiveCategory,
    useCategories,
    useCreateCategory,
    useDeleteCategory,
    useReactivateCategory,
    useRenameCategory,
} from '../hooks/useCategories';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ResponsiveDialog } from '../components/ui/ResponsiveDialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../components/ui/table';

export default function CategoriesPage() {
    const { data: categories = [], isLoading } = useCategories();
    const createMutation = useCreateCategory();
    const renameMutation = useRenameCategory();
    const archiveMutation = useArchiveCategory();
    const reactivateMutation = useReactivateCategory();
    const deleteMutation = useDeleteCategory();

    const [formOpen, setFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [name, setName] = useState('');
    const [categoryToArchive, setCategoryToArchive] = useState<Category | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

    const mutationPending = createMutation.isPending
        || renameMutation.isPending
        || archiveMutation.isPending
        || reactivateMutation.isPending
        || deleteMutation.isPending;

    const openCreate = () => {
        setEditingCategory(null);
        setName('');
        setFormOpen(true);
    };

    const openRename = (category: Category) => {
        setEditingCategory(category);
        setName(category.name);
        setFormOpen(true);
    };

    const closeForm = () => {
        setFormOpen(false);
        setEditingCategory(null);
        setName('');
    };

    const submitCategory = async (event: FormEvent) => {
        event.preventDefault();

        try {
            if (editingCategory?.id) {
                await renameMutation.mutateAsync({ id: editingCategory.id, name });
                toast.success('Categoria renomeada.');
            } else {
                await createMutation.mutateAsync(name);
                toast.success('Categoria criada.');
            }
            closeForm();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Não foi possível salvar a categoria.');
        }
    };

    const archiveSelected = async () => {
        if (!categoryToArchive?.id) return;

        try {
            await archiveMutation.mutateAsync(categoryToArchive.id);
            toast.success('Categoria arquivada.');
            setCategoryToArchive(null);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Não foi possível arquivar a categoria.');
        }
    };

    const reactivate = async (category: Category) => {
        if (!category.id) return;

        try {
            await reactivateMutation.mutateAsync(category.id);
            toast.success('Categoria reativada.');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Não foi possível reativar a categoria.');
        }
    };

    const deleteSelected = async () => {
        if (!categoryToDelete?.id) return;

        try {
            await deleteMutation.mutateAsync(categoryToDelete.id);
            toast.success('Categoria excluída permanentemente.');
            setCategoryToDelete(null);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Não foi possível excluir a categoria.');
        }
    };

    return (
        <div className="p-4 lg:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Categorias</h1>
                    <p className="text-muted-foreground">
                        Gerencie a classificação dos itens. Arquivar preserva identidade e histórico.
                    </p>
                </div>
                <Button onClick={openCreate} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Categoria
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-8 text-muted-foreground">Carregando categorias...</div>
            ) : (
                <div className="rounded-md border bg-card overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                        Nenhuma categoria cadastrada.
                                    </TableCell>
                                </TableRow>
                            ) : categories.map(category => {
                                const active = isCategoryActive(category);
                                return (
                                    <TableRow key={category.id} className={active ? undefined : 'opacity-75'}>
                                        <TableCell className="font-medium">{category.name}</TableCell>
                                        <TableCell>{active ? 'Ativa' : 'Arquivada'}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2 flex-wrap">
                                                <Button variant="outline" size="sm" onClick={() => openRename(category)}>
                                                    <Pencil className="mr-1 h-4 w-4" /> Editar
                                                </Button>
                                                {active ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setCategoryToArchive(category)}
                                                        disabled={mutationPending}
                                                    >
                                                        <Archive className="mr-1 h-4 w-4" /> Arquivar
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => reactivate(category)}
                                                        disabled={mutationPending}
                                                    >
                                                        <RotateCcw className="mr-1 h-4 w-4" /> Reativar
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCategoryToDelete(category)}
                                                    disabled={mutationPending}
                                                >
                                                    <Trash2 className="mr-1 h-4 w-4" /> Excluir
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}

            <ResponsiveDialog
                open={formOpen}
                onOpenChange={(open) => open ? setFormOpen(true) : closeForm()}
                title={editingCategory ? 'Renomear Categoria' : 'Nova Categoria'}
            >
                <form onSubmit={submitCategory} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="categoryName">Nome</Label>
                        <Input
                            id="categoryName"
                            value={name}
                            onChange={event => setName(event.target.value)}
                            placeholder="Ex: Porcelana"
                        />
                        <p className="text-xs text-muted-foreground">
                            O nome precisa ser único inclusive entre categorias arquivadas.
                        </p>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={closeForm} disabled={mutationPending}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={mutationPending}>
                            {mutationPending ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>
                </form>
            </ResponsiveDialog>

            <ResponsiveDialog
                open={!!categoryToArchive}
                onOpenChange={(open) => !open && setCategoryToArchive(null)}
                title="Arquivar Categoria"
                description={`Arquivar a categoria "${categoryToArchive?.name}"? A operação será bloqueada se algum item ativo ainda usar esta categoria.`}
                footer={
                    <>
                        <Button variant="outline" onClick={() => setCategoryToArchive(null)} disabled={mutationPending}>
                            Cancelar
                        </Button>
                        <Button variant="outline" onClick={archiveSelected} disabled={mutationPending}>
                            Confirmar Arquivamento
                        </Button>
                    </>
                }
            >
                <p className="text-sm text-muted-foreground">
                    Itens inativos e pedidos históricos podem continuar referenciando uma categoria arquivada.
                </p>
            </ResponsiveDialog>

            <ResponsiveDialog
                open={!!categoryToDelete}
                onOpenChange={(open) => !open && setCategoryToDelete(null)}
                title="Excluir Categoria Permanentemente"
                description={`Excluir "${categoryToDelete?.name}" permanentemente?`}
                footer={
                    <>
                        <Button variant="outline" onClick={() => setCategoryToDelete(null)} disabled={mutationPending}>
                            Cancelar
                        </Button>
                        <Button variant="outline" onClick={deleteSelected} disabled={mutationPending}>
                            Confirmar Exclusão
                        </Button>
                    </>
                }
            >
                <p className="text-sm text-muted-foreground">
                    A exclusão só é permitida quando nenhum item e nenhum snapshot histórico de pedido referenciam a categoria.
                </p>
            </ResponsiveDialog>
        </div>
    );
}
