import { useMemo, useState, type FormEvent } from 'react';
import { Archive, ChevronDown, ChevronRight, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    isCategoryActive,
    isSubcategoryActive,
    type Category,
    type Subcategory,
} from '../db/database';
import {
    useArchiveCategory,
    useCategories,
    useCreateCategory,
    useDeleteCategory,
    useReactivateCategory,
    useRenameCategory,
} from '../hooks/useCategories';
import {
    useArchiveSubcategory,
    useCreateSubcategory,
    useDeleteSubcategory,
    useReactivateSubcategory,
    useRenameSubcategory,
    useSubcategories,
} from '../hooks/useSubcategories';
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
    const { data: categories = [], isLoading: categoriesLoading } = useCategories();
    const { data: subcategories = [], isLoading: subcategoriesLoading } = useSubcategories();
    const createMutation = useCreateCategory();
    const renameMutation = useRenameCategory();
    const archiveMutation = useArchiveCategory();
    const reactivateMutation = useReactivateCategory();
    const deleteMutation = useDeleteCategory();
    const createSubcategoryMutation = useCreateSubcategory();
    const renameSubcategoryMutation = useRenameSubcategory();
    const archiveSubcategoryMutation = useArchiveSubcategory();
    const reactivateSubcategoryMutation = useReactivateSubcategory();
    const deleteSubcategoryMutation = useDeleteSubcategory();

    const [formOpen, setFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [name, setName] = useState('');
    const [categoryToArchive, setCategoryToArchive] = useState<Category | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<number>>(new Set());

    const [subcategoryFormOpen, setSubcategoryFormOpen] = useState(false);
    const [subcategoryParent, setSubcategoryParent] = useState<Category | null>(null);
    const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
    const [subcategoryName, setSubcategoryName] = useState('');
    const [subcategoryToArchive, setSubcategoryToArchive] = useState<Subcategory | null>(null);
    const [subcategoryToDelete, setSubcategoryToDelete] = useState<Subcategory | null>(null);

    const subcategoriesByCategory = useMemo(() => {
        const grouped = new Map<number, Subcategory[]>();
        subcategories.forEach(subcategory => {
            const list = grouped.get(subcategory.categoryId) ?? [];
            list.push(subcategory);
            grouped.set(subcategory.categoryId, list);
        });
        grouped.forEach(list => list.sort((left, right) => left.name.localeCompare(right.name, 'pt-BR')));
        return grouped;
    }, [subcategories]);

    const mutationPending = createMutation.isPending
        || renameMutation.isPending
        || archiveMutation.isPending
        || reactivateMutation.isPending
        || deleteMutation.isPending
        || createSubcategoryMutation.isPending
        || renameSubcategoryMutation.isPending
        || archiveSubcategoryMutation.isPending
        || reactivateSubcategoryMutation.isPending
        || deleteSubcategoryMutation.isPending;

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

    const openCreateSubcategory = (category: Category) => {
        setSubcategoryParent(category);
        setEditingSubcategory(null);
        setSubcategoryName('');
        setSubcategoryFormOpen(true);
    };

    const openRenameSubcategory = (subcategory: Subcategory) => {
        const parent = categories.find(category => category.id === subcategory.categoryId) ?? null;
        setSubcategoryParent(parent);
        setEditingSubcategory(subcategory);
        setSubcategoryName(subcategory.name);
        setSubcategoryFormOpen(true);
    };

    const closeSubcategoryForm = () => {
        setSubcategoryFormOpen(false);
        setSubcategoryParent(null);
        setEditingSubcategory(null);
        setSubcategoryName('');
    };

    const submitSubcategory = async (event: FormEvent) => {
        event.preventDefault();
        if (!subcategoryParent?.id) return;

        try {
            if (editingSubcategory?.id) {
                await renameSubcategoryMutation.mutateAsync({ id: editingSubcategory.id, name: subcategoryName });
                toast.success('Subcategoria renomeada.');
            } else {
                await createSubcategoryMutation.mutateAsync({
                    categoryId: subcategoryParent.id,
                    name: subcategoryName,
                });
                setExpandedCategoryIds(current => new Set(current).add(subcategoryParent.id as number));
                toast.success('Subcategoria criada.');
            }
            closeSubcategoryForm();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Não foi possível salvar a subcategoria.');
        }
    };

    const toggleExpanded = (categoryId: number) => {
        setExpandedCategoryIds(current => {
            const next = new Set(current);
            if (next.has(categoryId)) next.delete(categoryId);
            else next.add(categoryId);
            return next;
        });
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

    const archiveSelectedSubcategory = async () => {
        if (!subcategoryToArchive?.id) return;
        try {
            await archiveSubcategoryMutation.mutateAsync(subcategoryToArchive.id);
            toast.success('Subcategoria arquivada.');
            setSubcategoryToArchive(null);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Não foi possível arquivar a subcategoria.');
        }
    };

    const reactivateSubcategory = async (subcategory: Subcategory) => {
        if (!subcategory.id) return;
        try {
            await reactivateSubcategoryMutation.mutateAsync(subcategory.id);
            toast.success('Subcategoria reativada.');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Não foi possível reativar a subcategoria.');
        }
    };

    const deleteSelectedSubcategory = async () => {
        if (!subcategoryToDelete?.id) return;
        try {
            await deleteSubcategoryMutation.mutateAsync(subcategoryToDelete.id);
            toast.success('Subcategoria excluída permanentemente.');
            setSubcategoryToDelete(null);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Não foi possível excluir a subcategoria.');
        }
    };

    return (
        <div className="p-4 lg:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Categorias</h1>
                    <p className="text-muted-foreground">
                        Organize os itens em categorias e, quando fizer sentido, em uma segunda camada opcional de subcategorias.
                    </p>
                </div>
                <Button onClick={openCreate} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Categoria
                </Button>
            </div>

            {categoriesLoading || subcategoriesLoading ? (
                <div className="flex justify-center p-8 text-muted-foreground">Carregando categorias...</div>
            ) : (
                <div className="rounded-md border bg-card overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Classificação</TableHead>
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
                                const categoryId = category.id as number;
                                const children = subcategoriesByCategory.get(categoryId) ?? [];
                                const expanded = expandedCategoryIds.has(categoryId);
                                return [
                                    <TableRow key={`category-${categoryId}`} className={active ? undefined : 'opacity-75'}>
                                        <TableCell>
                                            <button
                                                type="button"
                                                onClick={() => toggleExpanded(categoryId)}
                                                className="flex items-center gap-2 text-left font-medium"
                                                aria-expanded={expanded}
                                            >
                                                {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                <span>{category.name}</span>
                                                <span className="text-xs font-normal text-muted-foreground">
                                                    {children.length === 0 ? 'sem subcategorias' : `${children.length} ${children.length === 1 ? 'subcategoria' : 'subcategorias'}`}
                                                </span>
                                            </button>
                                        </TableCell>
                                        <TableCell>{active ? 'Ativa' : 'Arquivada'}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2 flex-wrap">
                                                <Button variant="outline" size="sm" onClick={() => openRename(category)}>
                                                    <Pencil className="mr-1 h-4 w-4" /> Editar
                                                </Button>
                                                {active && (
                                                    <Button variant="outline" size="sm" onClick={() => openCreateSubcategory(category)}>
                                                        <Plus className="mr-1 h-4 w-4" /> Subcategoria
                                                    </Button>
                                                )}
                                                {active ? (
                                                    <Button variant="outline" size="sm" onClick={() => setCategoryToArchive(category)} disabled={mutationPending}>
                                                        <Archive className="mr-1 h-4 w-4" /> Arquivar
                                                    </Button>
                                                ) : (
                                                    <Button variant="outline" size="sm" onClick={() => reactivate(category)} disabled={mutationPending}>
                                                        <RotateCcw className="mr-1 h-4 w-4" /> Reativar
                                                    </Button>
                                                )}
                                                <Button variant="outline" size="sm" onClick={() => setCategoryToDelete(category)} disabled={mutationPending}>
                                                    <Trash2 className="mr-1 h-4 w-4" /> Excluir
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>,
                                    ...(expanded ? children.map(subcategory => {
                                        const subcategoryActive = isSubcategoryActive(subcategory);
                                        return (
                                            <TableRow key={`subcategory-${subcategory.id}`} className={subcategoryActive ? 'bg-muted/20' : 'bg-muted/20 opacity-70'}>
                                                <TableCell>
                                                    <div className="pl-7 flex items-center gap-2">
                                                        <span className="text-muted-foreground">↳</span>
                                                        <span className="font-medium">{subcategory.name}</span>
                                                        <span className="text-xs text-muted-foreground">subcategoria de {category.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{subcategoryActive ? 'Ativa' : 'Arquivada'}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2 flex-wrap">
                                                        <Button variant="outline" size="sm" onClick={() => openRenameSubcategory(subcategory)}>
                                                            <Pencil className="mr-1 h-4 w-4" /> Editar
                                                        </Button>
                                                        {subcategoryActive ? (
                                                            <Button variant="outline" size="sm" onClick={() => setSubcategoryToArchive(subcategory)} disabled={mutationPending}>
                                                                <Archive className="mr-1 h-4 w-4" /> Arquivar
                                                            </Button>
                                                        ) : (
                                                            <Button variant="outline" size="sm" onClick={() => reactivateSubcategory(subcategory)} disabled={mutationPending}>
                                                                <RotateCcw className="mr-1 h-4 w-4" /> Reativar
                                                            </Button>
                                                        )}
                                                        <Button variant="outline" size="sm" onClick={() => setSubcategoryToDelete(subcategory)} disabled={mutationPending}>
                                                            <Trash2 className="mr-1 h-4 w-4" /> Excluir
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }) : []),
                                ];
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
                        <Input id="categoryName" value={name} onChange={event => setName(event.target.value)} placeholder="Ex: Porcelana" />
                        <p className="text-xs text-muted-foreground">O nome precisa ser único inclusive entre categorias arquivadas.</p>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={closeForm} disabled={mutationPending}>Cancelar</Button>
                        <Button type="submit" disabled={mutationPending}>{mutationPending ? 'Salvando...' : 'Salvar'}</Button>
                    </div>
                </form>
            </ResponsiveDialog>

            <ResponsiveDialog
                open={subcategoryFormOpen}
                onOpenChange={(open) => open ? setSubcategoryFormOpen(true) : closeSubcategoryForm()}
                title={editingSubcategory ? 'Renomear Subcategoria' : `Nova Subcategoria${subcategoryParent ? ` — ${subcategoryParent.name}` : ''}`}
            >
                <form onSubmit={submitSubcategory} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="subcategoryName">Nome</Label>
                        <Input id="subcategoryName" value={subcategoryName} onChange={event => setSubcategoryName(event.target.value)} placeholder="Ex: Placas" />
                        <p className="text-xs text-muted-foreground">
                            A subcategoria fica somente dentro de {subcategoryParent?.name ?? 'sua categoria'}. O mesmo nome pode existir em outra categoria.
                        </p>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={closeSubcategoryForm} disabled={mutationPending}>Cancelar</Button>
                        <Button type="submit" disabled={mutationPending}>{mutationPending ? 'Salvando...' : 'Salvar'}</Button>
                    </div>
                </form>
            </ResponsiveDialog>

            <ResponsiveDialog
                open={!!categoryToArchive}
                onOpenChange={(open) => !open && setCategoryToArchive(null)}
                title="Arquivar Categoria"
                description={`Arquivar a categoria "${categoryToArchive?.name}"? A operação será bloqueada se houver item ativo ou subcategoria ativa dentro dela.`}
                footer={<><Button variant="outline" onClick={() => setCategoryToArchive(null)} disabled={mutationPending}>Cancelar</Button><Button variant="outline" onClick={archiveSelected} disabled={mutationPending}>Confirmar Arquivamento</Button></>}
            >
                <p className="text-sm text-muted-foreground">Itens inativos e pedidos históricos continuam preservando a classificação original.</p>
            </ResponsiveDialog>

            <ResponsiveDialog
                open={!!categoryToDelete}
                onOpenChange={(open) => !open && setCategoryToDelete(null)}
                title="Excluir Categoria Permanentemente"
                description={`Excluir "${categoryToDelete?.name}" permanentemente?`}
                footer={<><Button variant="outline" onClick={() => setCategoryToDelete(null)} disabled={mutationPending}>Cancelar</Button><Button variant="outline" onClick={deleteSelected} disabled={mutationPending}>Confirmar Exclusão</Button></>}
            >
                <p className="text-sm text-muted-foreground">A exclusão só é permitida quando não existem subcategorias, itens nem snapshots históricos referenciando a categoria.</p>
            </ResponsiveDialog>

            <ResponsiveDialog
                open={!!subcategoryToArchive}
                onOpenChange={(open) => !open && setSubcategoryToArchive(null)}
                title="Arquivar Subcategoria"
                description={`Arquivar a subcategoria "${subcategoryToArchive?.name}"?`}
                footer={<><Button variant="outline" onClick={() => setSubcategoryToArchive(null)} disabled={mutationPending}>Cancelar</Button><Button variant="outline" onClick={archiveSelectedSubcategory} disabled={mutationPending}>Confirmar Arquivamento</Button></>}
            >
                <p className="text-sm text-muted-foreground">A operação será bloqueada enquanto algum item ativo usar esta subcategoria. O histórico antigo continua preservado.</p>
            </ResponsiveDialog>

            <ResponsiveDialog
                open={!!subcategoryToDelete}
                onOpenChange={(open) => !open && setSubcategoryToDelete(null)}
                title="Excluir Subcategoria Permanentemente"
                description={`Excluir "${subcategoryToDelete?.name}" permanentemente?`}
                footer={<><Button variant="outline" onClick={() => setSubcategoryToDelete(null)} disabled={mutationPending}>Cancelar</Button><Button variant="outline" onClick={deleteSelectedSubcategory} disabled={mutationPending}>Confirmar Exclusão</Button></>}
            >
                <p className="text-sm text-muted-foreground">A exclusão só é permitida quando nenhum item e nenhum pedido histórico referenciam esta subcategoria.</p>
            </ResponsiveDialog>
        </div>
    );
}
