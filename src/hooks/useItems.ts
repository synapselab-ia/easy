import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db, isItemActive, type Item } from '../db/database';
import { requireActiveCategory } from '../services/categoryService';
import { assertRecoveryWriteAllowed } from '../services/recoveryHealth';

export function useItems() {
    return useQuery({
        queryKey: ['items'],
        queryFn: () => db.items.toArray(),
    });
}

export function useItem(id?: number) {
    return useQuery({
        queryKey: ['items', id],
        queryFn: async () => {
            if (!id) return null;
            const item = await db.items.get(id);
            return item ?? null;
        },
        enabled: !!id,
    });
}

export function useCreateItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (item: Omit<Item, 'id'>) => {
            assertRecoveryWriteAllowed();
            return db.transaction('rw', db.categories, db.items, async () => {
                const isActive = item.isActive !== false;
                if (isActive || item.categoryId !== undefined) {
                    await requireActiveCategory(item.categoryId);
                }

                return db.items.add({ ...item, isActive });
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
        },
    });
}

export function useUpdateItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...changes }: Partial<Item> & { id: number }) => {
            assertRecoveryWriteAllowed();
            return db.transaction('rw', db.categories, db.items, async () => {
                const existing = await db.items.get(id);
                if (!existing) {
                    throw new Error('Item não encontrado.');
                }

                const categoryChanged = Object.prototype.hasOwnProperty.call(changes, 'categoryId');
                const nextActive = changes.isActive !== undefined ? changes.isActive : isItemActive(existing);

                if (categoryChanged) {
                    if (changes.categoryId === undefined) {
                        if (nextActive) {
                            await requireActiveCategory(undefined);
                        }
                    } else {
                        await requireActiveCategory(changes.categoryId);
                    }
                }

                if (!isItemActive(existing) && changes.isActive === true) {
                    await requireActiveCategory(categoryChanged ? changes.categoryId : existing.categoryId);
                }

                return db.items.update(id, changes);
            });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            queryClient.invalidateQueries({ queryKey: ['items', variables.id] });
        },
    });
}

function useSetItemActive(isActive: boolean) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => {
            assertRecoveryWriteAllowed();

            if (!isActive) {
                return db.items.update(id, { isActive: false, updatedAt: new Date() });
            }

            return db.transaction('rw', db.categories, db.items, async () => {
                const item = await db.items.get(id);
                if (!item) {
                    throw new Error('Item não encontrado.');
                }

                await requireActiveCategory(item.categoryId);
                return db.items.update(id, { isActive: true, updatedAt: new Date() });
            });
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            queryClient.invalidateQueries({ queryKey: ['items', id] });
        },
    });
}

export function useArchiveItem() {
    return useSetItemActive(false);
}

export function useReactivateItem() {
    return useSetItemActive(true);
}

export function useDeleteItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => {
            assertRecoveryWriteAllowed();
            return db.transaction('rw', db.items, db.transactions, async () => {
                const referencedTransaction = await db.transactions
                    .filter(transaction => transaction.itemId === id)
                    .first();

                if (referencedTransaction) {
                    throw new Error('Itens com histórico de pedidos não podem ser excluídos permanentemente.');
                }

                return db.items.delete(id);
            });
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            queryClient.invalidateQueries({ queryKey: ['items', id] });
        },
    });
}
