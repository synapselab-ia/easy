import 'fake-indexeddb/auto';
import React, { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../db/database';
import {
    CORRECTION_NON_ORDER_SHAPE_ERROR,
    useReplaceTransaction,
} from './useTransactions';
import {
    RECOVERY_HEALTH_STORAGE_KEY,
    RECOVERY_WRITE_BLOCKED_MESSAGE,
} from '../services/recoveryHealth';

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});
const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

async function reseller(name = 'Ana') {
    return db.resellers.add({
        name,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    }) as Promise<number>;
}

async function category(name: string) {
    return db.categories.add({
        name,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    }) as Promise<number>;
}

async function item(name: string, categoryId: number, basePrice = 50) {
    return db.items.add({
        name,
        categoryId,
        basePrice,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    }) as Promise<number>;
}

describe('P9-S4-I1 D-026 full-field replacement', () => {
    beforeEach(async () => {
        await db.transactions.clear();
        await db.items.clear();
        await db.categories.clear();
        await db.resellers.clear();
        queryClient.clear();
    });

    it('changes type, occurrence date and observation while preserving the immutable original and reversal linkage', async () => {
        const resellerId = await reseller();
        const originalOccurredAt = new Date('2026-08-01T12:00:00-03:00');
        const originalCreatedAt = new Date('2026-08-02T10:00:00-03:00');
        const originalId = await db.transactions.add({
            resellerId,
            type: 'payment',
            totalPrice: 500,
            observation: 'PIX original',
            occurredAt: originalOccurredAt,
            createdAt: originalCreatedAt,
        }) as number;
        const { result } = renderHook(() => useReplaceTransaction(), { wrapper });
        const correctedOccurredAt = new Date('2026-08-05T12:00:00-03:00');

        const response = await result.current.mutateAsync({
            originalId,
            reason: 'Tipo, data e observação incorretos',
            replacement: {
                resellerId,
                type: 'signal',
                occurredAt: correctedOccurredAt,
                totalPrice: 450,
                observation: 'Sinal confirmado',
            },
        });

        const original = await db.transactions.get(originalId);
        const replacement = await db.transactions.get(response.replacementTransactionId);
        expect(original).toMatchObject({
            id: originalId,
            type: 'payment',
            totalPrice: 500,
            observation: 'PIX original',
            occurredAt: originalOccurredAt,
            createdAt: originalCreatedAt,
        });
        expect(original?.reversal?.reason).toBe('Tipo, data e observação incorretos');
        expect(original?.reversal?.replacementTransactionId).toBe(replacement?.id);
        expect(replacement).toMatchObject({
            type: 'signal',
            totalPrice: 450,
            observation: 'Sinal confirmado',
            occurredAt: correctedOccurredAt,
            correction: { replacesTransactionId: originalId },
        });
        expect(replacement?.createdAt).not.toEqual(originalCreatedAt);
    });

    it('preserves the historical item/category snapshot when the corrected order keeps the same item', async () => {
        const resellerId = await reseller();
        const oldCategoryId = await category('Categoria histórica');
        const newCategoryId = await category('Categoria atual');
        const itemId = await item('Nome atual', oldCategoryId, 100);
        const originalId = await db.transactions.add({
            resellerId,
            type: 'order',
            itemId,
            itemName: 'Nome histórico',
            categoryId: oldCategoryId,
            categoryName: 'Categoria histórica',
            quantity: 1,
            unitPrice: 90,
            totalPrice: 90,
            observation: 'Original',
            occurredAt: new Date('2026-08-03T12:00:00-03:00'),
            createdAt: new Date('2026-08-03T13:00:00-03:00'),
        }) as number;
        await db.items.update(itemId, { name: 'Nome renomeado', categoryId: newCategoryId });
        const { result } = renderHook(() => useReplaceTransaction(), { wrapper });

        const response = await result.current.mutateAsync({
            originalId,
            reason: 'Quantidade incorreta',
            replacement: {
                resellerId,
                type: 'order',
                occurredAt: new Date('2026-08-04T12:00:00-03:00'),
                itemId,
                quantity: 2,
                unitPrice: 90,
                totalPrice: 999,
                observation: 'Corrigido',
            },
        });

        const replacement = await db.transactions.get(response.replacementTransactionId);
        expect(replacement).toMatchObject({
            itemId,
            itemName: 'Nome histórico',
            categoryId: oldCategoryId,
            categoryName: 'Categoria histórica',
            quantity: 2,
            unitPrice: 90,
            totalPrice: 180,
            observation: 'Corrigido',
        });
    });

    it('captures the current item/category snapshot when changing the order item', async () => {
        const resellerId = await reseller();
        const categoryA = await category('Categoria A');
        const categoryB = await category('Categoria B');
        const itemA = await item('Item A', categoryA, 50);
        const itemB = await item('Item B atual', categoryB, 80);
        const originalId = await db.transactions.add({
            resellerId,
            type: 'order',
            itemId: itemA,
            itemName: 'Item A histórico',
            categoryId: categoryA,
            categoryName: 'Categoria A histórica',
            quantity: 1,
            unitPrice: 50,
            totalPrice: 50,
            occurredAt: new Date('2026-08-01T12:00:00-03:00'),
            createdAt: new Date(),
        }) as number;
        const { result } = renderHook(() => useReplaceTransaction(), { wrapper });

        const response = await result.current.mutateAsync({
            originalId,
            reason: 'Item incorreto',
            replacement: {
                resellerId,
                type: 'order',
                occurredAt: new Date('2026-08-06T12:00:00-03:00'),
                itemId: itemB,
                itemName: 'Nome do caller deve ser ignorado',
                quantity: 3,
                unitPrice: 80,
                totalPrice: 1,
                observation: 'Item corrigido',
            },
        });

        const original = await db.transactions.get(originalId);
        const replacement = await db.transactions.get(response.replacementTransactionId);
        expect(original?.itemId).toBe(itemA);
        expect(original?.categoryName).toBe('Categoria A histórica');
        expect(replacement).toMatchObject({
            itemId: itemB,
            itemName: 'Item B atual',
            categoryId: categoryB,
            categoryName: 'Categoria B',
            quantity: 3,
            totalPrice: 240,
        });
    });

    it('enforces target shape atomically and rejects inactive newly selected items', async () => {
        const resellerId = await reseller();
        const categoryId = await category('Categoria');
        const inactiveItemId = await item('Arquivado', categoryId, 40);
        await db.items.update(inactiveItemId, { isActive: false });
        const originalId = await db.transactions.add({
            resellerId,
            type: 'payment',
            totalPrice: 100,
            occurredAt: new Date('2026-08-01T12:00:00-03:00'),
            createdAt: new Date(),
        }) as number;
        const { result } = renderHook(() => useReplaceTransaction(), { wrapper });

        await expect(result.current.mutateAsync({
            originalId,
            reason: 'Forma inválida',
            replacement: {
                resellerId,
                type: 'signal',
                occurredAt: new Date('2026-08-02T12:00:00-03:00'),
                itemId: inactiveItemId,
                quantity: 1,
                unitPrice: 40,
                totalPrice: 40,
            },
        })).rejects.toThrow(CORRECTION_NON_ORDER_SHAPE_ERROR);
        expect(await db.transactions.count()).toBe(1);
        expect((await db.transactions.get(originalId))?.reversal).toBeUndefined();

        await expect(result.current.mutateAsync({
            originalId,
            reason: 'Item arquivado',
            replacement: {
                resellerId,
                type: 'order',
                occurredAt: new Date('2026-08-02T12:00:00-03:00'),
                itemId: inactiveItemId,
                quantity: 1,
                unitPrice: 40,
                totalPrice: 40,
            },
        })).rejects.toThrow('Itens inativos não podem ser usados em novos pedidos.');
        expect(await db.transactions.count()).toBe(1);
        expect((await db.transactions.get(originalId))?.reversal).toBeUndefined();
    });

    it('keeps the D-024 freshness guard in front of replacement writes', async () => {
        const resellerId = await reseller();
        const originalId = await db.transactions.add({
            resellerId,
            type: 'payment',
            totalPrice: 100,
            occurredAt: new Date(),
            createdAt: new Date(),
        }) as number;
        localStorage.setItem(RECOVERY_HEALTH_STORAGE_KEY, JSON.stringify({
            version: 1,
            setupVerifiedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
            lastExportedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
            lastFilename: 'stale.json',
        }));
        const { result } = renderHook(() => useReplaceTransaction(), { wrapper });

        await expect(result.current.mutateAsync({
            originalId,
            reason: 'Não deve gravar',
            replacement: {
                resellerId,
                type: 'payment',
                occurredAt: new Date(),
                totalPrice: 90,
            },
        })).rejects.toThrow(RECOVERY_WRITE_BLOCKED_MESSAGE);
        expect(await db.transactions.count()).toBe(1);
        expect((await db.transactions.get(originalId))?.reversal).toBeUndefined();
    });
});
