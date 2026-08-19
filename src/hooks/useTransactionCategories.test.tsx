import 'fake-indexeddb/auto';
import React, { type ReactNode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { db } from '../db/database';
import { useCreateTransaction, useReplaceTransaction } from './useTransactions';

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        {children}
    </QueryClientProvider>
);

describe('P9-S3-I2 order category snapshot enforcement', () => {
    beforeEach(async () => {
        await db.transactions.clear();
        await db.items.clear();
        await db.categories.clear();
        await db.resellers.clear();
        queryClient.clear();
    });

    async function createActiveReseller() {
        return db.resellers.add({
            name: 'Revendedor ativo',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }) as Promise<number>;
    }

    async function createCategory(name: string) {
        return db.categories.add({
            name,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }) as Promise<number>;
    }

    it('blocks a new order for an active legacy item that is still unclassified', async () => {
        const resellerId = await createActiveReseller();
        const itemId = await db.items.add({
            name: 'Item legado sem categoria',
            basePrice: 30,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }) as number;

        const { result } = renderHook(() => useCreateTransaction(), { wrapper });

        await expect(result.current.mutateAsync({
            resellerId,
            type: 'order',
            itemId,
            quantity: 1,
            unitPrice: 30,
            totalPrice: 30,
            occurredAt: new Date(),
        })).rejects.toThrow('Selecione uma categoria ativa.');

        expect(await db.transactions.count()).toBe(0);
    });

    it('stores category id and transaction-time name and never rewrites the old snapshot after rename or reassignment', async () => {
        const resellerId = await createActiveReseller();
        const porcelainId = await createCategory('Porcelana');
        const bronzeId = await createCategory('Bronze');
        const itemId = await db.items.add({
            name: 'Produto classificado',
            basePrice: 40,
            isActive: true,
            categoryId: porcelainId,
            createdAt: new Date(),
            updatedAt: new Date(),
        }) as number;

        const { result } = renderHook(() => useCreateTransaction(), { wrapper });
        await result.current.mutateAsync({
            resellerId,
            type: 'order',
            itemId,
            itemName: 'Nome forjado pelo caller',
            quantity: 2,
            unitPrice: 40,
            totalPrice: 80,
            occurredAt: new Date('2026-08-18T12:00:00-03:00'),
        });

        const stored = (await db.transactions.toArray())[0];
        expect(stored.itemName).toBe('Produto classificado');
        expect(stored.categoryId).toBe(porcelainId);
        expect(stored.categoryName).toBe('Porcelana');

        await db.categories.update(porcelainId, { name: 'Porcelana Premium', updatedAt: new Date() });
        await db.items.update(itemId, { categoryId: bronzeId, updatedAt: new Date() });

        const unchanged = await db.transactions.get(stored.id!);
        expect(unchanged?.categoryId).toBe(porcelainId);
        expect(unchanged?.categoryName).toBe('Porcelana');
    });

    it('keeps the original category snapshot on guided replacement even after the item is reassigned', async () => {
        const resellerId = await createActiveReseller();
        const originalCategoryId = await createCategory('Original');
        const futureCategoryId = await createCategory('Futura');
        const itemId = await db.items.add({
            name: 'Item corrigível',
            basePrice: 50,
            isActive: true,
            categoryId: originalCategoryId,
            createdAt: new Date(),
            updatedAt: new Date(),
        }) as number;

        const createHook = renderHook(() => useCreateTransaction(), { wrapper });
        const originalId = await createHook.result.current.mutateAsync({
            resellerId,
            type: 'order',
            itemId,
            quantity: 1,
            unitPrice: 50,
            totalPrice: 50,
            occurredAt: new Date('2026-08-10T12:00:00-03:00'),
        }) as number;

        await db.categories.update(originalCategoryId, { name: 'Original renomeada', updatedAt: new Date() });
        await db.items.update(itemId, { categoryId: futureCategoryId, updatedAt: new Date() });

        const replaceHook = renderHook(() => useReplaceTransaction(), { wrapper });
        const response = await replaceHook.result.current.mutateAsync({
            originalId,
            reason: 'Quantidade incorreta',
            replacement: {
                resellerId,
                itemId,
                quantity: 2,
                unitPrice: 50,
                totalPrice: 100,
            },
        });

        const original = await db.transactions.get(originalId);
        const replacement = await db.transactions.get(response.replacementTransactionId);

        expect(original?.categoryId).toBe(originalCategoryId);
        expect(original?.categoryName).toBe('Original');
        expect(replacement?.categoryId).toBe(originalCategoryId);
        expect(replacement?.categoryName).toBe('Original');
        expect(replacement?.correction?.replacesTransactionId).toBe(originalId);
    });
});
