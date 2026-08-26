import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db, isItemActive, type Item } from '../db/database';
import { isEasySupabaseConfigured } from '../lib/supabase';
import { requireActiveCategory } from '../services/categoryService';
import { requireActiveSubcategory } from '../services/subcategoryService';
import {
    createCloudItem,
    deleteCloudItem,
    setCloudItemActive,
    updateCloudItem,
} from '../services/cloudDataService';
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

async function validateActiveClassification(categoryId?: number, subcategoryId?: number) {
    await requireActiveCategory(categoryId);
    if (subcategoryId !== undefined) {
        await requireActiveSubcategory(subcategoryId, categoryId);
    }
}

export function useCreateItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (item: Omit<Item, 'id'>) => {
            assertRecoveryWriteAllowed();

            if (isEasySupabaseConfigured()) {
                return createCloudItem(item);
            }

            return db.transaction('rw', db.categories, db.subcategories, db.items, async () => {
                const isActive = item.isActive !== false;
                if (isActive || item.categoryId !== undefined || item.subcategoryId !== undefined) {
                    await validateActiveClassification(item.categoryId, item.subcategoryId);
                }

                return db.items.add({ ...item, isActive });
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

export function useUpdateItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...changes }: Partial<Item> & { id: number }) => {
            assertRecoveryWriteAllowed();

            if (isEasySupabaseConfigured()) {
                return updateCloudItem(id, changes).then(() => 1);
            }

            return db.transaction('rw', db.categories, db.subcategories, db.items, async () => {
                const existing = await db.items.get(id);
                if (!existing) {
                    throw new Error('Item não encontrado.');
                }

                const categoryChanged = Object.prototype.hasOwnProperty.call(changes, 'categoryId');
                const subcategoryChanged = Object.prototype.hasOwnProperty.call(changes, 'subcategoryId');
                const nextActive = changes.isActive !== undefined ? changes.isActive : isItemActive(existing);
                const nextCategoryId = categoryChanged ? changes.categoryId : existing.categoryId;
                const nextSubcategoryId = subcategoryChanged ? changes.subcategoryId : existing.subcategoryId;

                if (nextActive || categoryChanged || subcategoryChanged) {
                    if (nextActive || nextCategoryId !== undefined || nextSubcategoryId !== undefined) {
                        await validateActiveClassification(nextCategoryId, nextSubcategoryId);
                    }
                }

                return db.items.update(id, changes);
            });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            queryClient.invalidateQueries({ queryKey: ['items', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

function useSetItemActive(isActive: boolean) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => {
            assertRecoveryWriteAllowed();

            if (isEasySupabaseConfigured()) {
                return setCloudItemActive(id, isActive).then(() => 1);
            }

            if (!isActive) {
                return db.items.update(id, { isActive: false, updatedAt: new Date() });
            }

            return db.transaction('rw', db.categories, db.subcategories, db.items, async () => {
                const item = await db.items.get(id);
                if (!item) {
                    throw new Error('Item não encontrado.');
                }

                await validateActiveClassification(item.categoryId, item.subcategoryId);
                return db.items.update(id, { isActive: true, updatedAt: new Date() });
            });
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            queryClient.invalidateQueries({ queryKey: ['items', id] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
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

            if (isEasySupabaseConfigured()) {
                return deleteCloudItem(id);
            }

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
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}
