import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
    useItems,
    useCreateItem,
    useUpdateItem,
    useArchiveItem,
    useReactivateItem,
    useDeleteItem,
} from './useItems';
import { db } from '../db/database';
import React, { ReactNode } from 'react';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
});

const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        {children}
    </QueryClientProvider>
);

describe('useItems hooks', () => {
    let categoryId: number;

    beforeEach(async () => {
        await db.transactions.clear();
        await db.items.clear();
        await db.categories.clear();
        categoryId = await db.categories.add({
            name: 'Categoria ativa',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }) as number;
        queryClient.clear();
    });

    it('should fetch items', async () => {
        await db.items.add({ name: 'Item 1', basePrice: 10, createdAt: new Date(), updatedAt: new Date() });

        const { result } = renderHook(() => useItems(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toHaveLength(1);
        expect(result.current.data?.[0].name).toBe('Item 1');
    });

    it('should create new items as active with an active category', async () => {
        const { result } = renderHook(() => useCreateItem(), { wrapper });

        result.current.mutate({
            name: 'New Item',
            basePrice: 20,
            categoryId,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        const items = await db.items.toArray();
        expect(items).toHaveLength(1);
        expect(items[0].name).toBe('New Item');
        expect(items[0].isActive).toBe(true);
        expect(items[0].categoryId).toBe(categoryId);
    });

    it('should reject a new active item without an active category', async () => {
        const { result } = renderHook(() => useCreateItem(), { wrapper });

        await expect(result.current.mutateAsync({
            name: 'Sem categoria',
            basePrice: 20,
            createdAt: new Date(),
            updatedAt: new Date(),
        })).rejects.toThrow('Selecione uma categoria ativa.');

        expect(await db.items.count()).toBe(0);
    });

    it('should allow editing a migrated active legacy item without inventing a category', async () => {
        const itemId = await db.items.add({
            name: 'Legado',
            basePrice: 30,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }) as number;

        const { result } = renderHook(() => useUpdateItem(), { wrapper });
        await result.current.mutateAsync({ id: itemId, name: 'Legado editado', updatedAt: new Date() });

        const item = await db.items.get(itemId);
        expect(item?.name).toBe('Legado editado');
        expect(item?.categoryId).toBeUndefined();
    });

    it('should archive and reactivate a classified item without deleting it', async () => {
        const itemId = await db.items.add({
            name: 'Lifecycle Item',
            basePrice: 30,
            isActive: true,
            categoryId,
            createdAt: new Date(),
            updatedAt: new Date(),
        }) as number;

        const archiveHook = renderHook(() => useArchiveItem(), { wrapper });
        await archiveHook.result.current.mutateAsync(itemId);

        expect((await db.items.get(itemId))?.isActive).toBe(false);

        const reactivateHook = renderHook(() => useReactivateItem(), { wrapper });
        await reactivateHook.result.current.mutateAsync(itemId);

        const item = await db.items.get(itemId);
        expect(item).toBeDefined();
        expect(item?.isActive).toBe(true);
    });

    it('should reject reactivation of an unclassified legacy item', async () => {
        const itemId = await db.items.add({
            name: 'Legado arquivado',
            basePrice: 30,
            isActive: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        }) as number;

        const reactivateHook = renderHook(() => useReactivateItem(), { wrapper });
        await expect(reactivateHook.result.current.mutateAsync(itemId)).rejects.toThrow('Selecione uma categoria ativa.');
        expect((await db.items.get(itemId))?.isActive).toBe(false);
    });

    it('should reject permanent deletion when an order references the item', async () => {
        const now = new Date();
        const itemId = await db.items.add({
            name: 'Historical Item',
            basePrice: 50,
            isActive: false,
            createdAt: now,
            updatedAt: now,
        }) as number;

        await db.transactions.add({
            resellerId: 1,
            type: 'order',
            itemId,
            itemName: 'Historical Item',
            quantity: 1,
            unitPrice: 50,
            totalPrice: 50,
            createdAt: now,
        });

        const { result } = renderHook(() => useDeleteItem(), { wrapper });

        await expect(result.current.mutateAsync(itemId)).rejects.toThrow(
            'Itens com histórico de pedidos não podem ser excluídos permanentemente.'
        );

        expect(await db.items.get(itemId)).toBeDefined();
        expect(await db.transactions.count()).toBe(1);
    });

    it('should allow permanent deletion for an item with no transaction history', async () => {
        const itemId = await db.items.add({
            name: 'Unused Item',
            basePrice: 15,
            isActive: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        }) as number;

        const { result } = renderHook(() => useDeleteItem(), { wrapper });
        await result.current.mutateAsync(itemId);

        expect(await db.items.get(itemId)).toBeUndefined();
    });
});
