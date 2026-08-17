import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
    NON_ORDER_ITEM_REFERENCE_ERROR,
    ORDER_ITEM_REQUIRED_ERROR,
    REVERSAL_REASON_REQUIRED_ERROR,
    TRANSACTION_ALREADY_REVERSED_ERROR,
    useTransactions,
    useCreateTransaction,
    useReverseTransaction,
} from './useTransactions';
import { db, type TransactionType } from '../db/database';
import React, { ReactNode } from 'react';

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        {children}
    </QueryClientProvider>
);

describe('useTransactions hooks', () => {
    beforeEach(async () => {
        await db.transactions.clear();
        await db.items.clear();
        await db.resellers.clear();
        queryClient.clear();
    });

    it('should fetch transactions', async () => {
        await db.transactions.add({ resellerId: 1, type: 'order', totalPrice: 100, createdAt: new Date() });

        const { result } = renderHook(() => useTransactions(1), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toHaveLength(1);
        expect(result.current.data?.[0].totalPrice).toBe(100);
    });

    it('should create a transaction for an active reseller', async () => {
        const resellerId = await db.resellers.add({
            name: 'Active Reseller',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }) as number;

        const { result } = renderHook(() => useCreateTransaction(), { wrapper });

        result.current.mutate({ resellerId, type: 'payment', totalPrice: 50, createdAt: new Date() });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        const transactions = await db.transactions.toArray();
        expect(transactions).toHaveLength(1);
        expect(transactions[0].type).toBe('payment');
    });

    it('should create an order for an active reseller and active item and derive the item snapshot from the reference', async () => {
        const now = new Date();
        const resellerId = await db.resellers.add({
            name: 'Active Reseller',
            isActive: true,
            createdAt: now,
            updatedAt: now,
        }) as number;
        const itemId = await db.items.add({
            name: 'Canonical Item Name',
            basePrice: 25,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        }) as number;

        const { result } = renderHook(() => useCreateTransaction(), { wrapper });

        await result.current.mutateAsync({
            resellerId,
            type: 'order',
            itemId,
            itemName: 'Stale Caller Name',
            quantity: 2,
            unitPrice: 25,
            totalPrice: 50,
            createdAt: now,
        });

        const transactions = await db.transactions.toArray();
        expect(transactions).toHaveLength(1);
        expect(transactions[0].itemId).toBe(itemId);
        expect(transactions[0].itemName).toBe('Canonical Item Name');
    });

    it('should reject a new transaction for an inactive reseller', async () => {
        const resellerId = await db.resellers.add({
            name: 'Inactive Reseller',
            isActive: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        }) as number;

        const { result } = renderHook(() => useCreateTransaction(), { wrapper });

        await expect(result.current.mutateAsync({
            resellerId,
            type: 'payment',
            totalPrice: 50,
            createdAt: new Date(),
        })).rejects.toThrow('Revendedores inativos não podem receber novos lançamentos.');

        expect(await db.transactions.count()).toBe(0);
    });

    it('should reject a new transaction for a missing reseller', async () => {
        const { result } = renderHook(() => useCreateTransaction(), { wrapper });

        await expect(result.current.mutateAsync({
            resellerId: 999,
            type: 'payment',
            totalPrice: 50,
            createdAt: new Date(),
        })).rejects.toThrow('Revendedor não encontrado.');

        expect(await db.transactions.count()).toBe(0);
    });

    it('should reject a new transaction with an invalid reseller identifier', async () => {
        const { result } = renderHook(() => useCreateTransaction(), { wrapper });

        await expect(result.current.mutateAsync({
            resellerId: 0,
            type: 'payment',
            totalPrice: 50,
            createdAt: new Date(),
        })).rejects.toThrow('Revendedor não encontrado.');

        expect(await db.transactions.count()).toBe(0);
    });

    it('should reject a new order without an item reference', async () => {
        const now = new Date();
        const resellerId = await db.resellers.add({
            name: 'Active Reseller',
            isActive: true,
            createdAt: now,
            updatedAt: now,
        }) as number;

        const { result } = renderHook(() => useCreateTransaction(), { wrapper });

        await expect(result.current.mutateAsync({
            resellerId,
            type: 'order',
            itemName: 'Snapshot Only',
            quantity: 1,
            unitPrice: 30,
            totalPrice: 30,
            createdAt: now,
        })).rejects.toThrow(ORDER_ITEM_REQUIRED_ERROR);

        expect(await db.transactions.count()).toBe(0);
    });

    it('should reject a new order for an inactive item', async () => {
        const now = new Date();
        const resellerId = await db.resellers.add({
            name: 'Active Reseller',
            isActive: true,
            createdAt: now,
            updatedAt: now,
        }) as number;
        const itemId = await db.items.add({
            name: 'Archived Item',
            basePrice: 30,
            isActive: false,
            createdAt: now,
            updatedAt: now,
        }) as number;

        const { result } = renderHook(() => useCreateTransaction(), { wrapper });

        await expect(result.current.mutateAsync({
            resellerId,
            type: 'order',
            itemId,
            itemName: 'Archived Item',
            quantity: 1,
            unitPrice: 30,
            totalPrice: 30,
            createdAt: now,
        })).rejects.toThrow('Itens inativos não podem ser usados em novos pedidos.');

        expect(await db.transactions.count()).toBe(0);
    });

    it('should reject a new order when the referenced item does not exist', async () => {
        const now = new Date();
        const resellerId = await db.resellers.add({
            name: 'Active Reseller',
            isActive: true,
            createdAt: now,
            updatedAt: now,
        }) as number;

        const { result } = renderHook(() => useCreateTransaction(), { wrapper });

        await expect(result.current.mutateAsync({
            resellerId,
            type: 'order',
            itemId: 999,
            itemName: 'Missing Item',
            quantity: 1,
            unitPrice: 30,
            totalPrice: 30,
            createdAt: now,
        })).rejects.toThrow('Item não encontrado.');

        expect(await db.transactions.count()).toBe(0);
    });

    it.each<TransactionType>(['payment', 'signal'])('should reject an item reference on a new %s', async (type) => {
        const now = new Date();
        const resellerId = await db.resellers.add({
            name: 'Active Reseller',
            isActive: true,
            createdAt: now,
            updatedAt: now,
        }) as number;
        const itemId = await db.items.add({
            name: 'Unrelated Item',
            basePrice: 20,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        }) as number;

        const { result } = renderHook(() => useCreateTransaction(), { wrapper });

        await expect(result.current.mutateAsync({
            resellerId,
            type,
            itemId,
            totalPrice: 20,
            createdAt: now,
        })).rejects.toThrow(NON_ORDER_ITEM_REFERENCE_ERROR);

        expect(await db.transactions.count()).toBe(0);
    });

    it('should reverse a transaction without deleting or rewriting the original entry', async () => {
        const createdAt = new Date('2026-08-10T10:00:00-03:00');
        const id = await db.transactions.add({
            resellerId: 7,
            type: 'payment',
            totalPrice: 250,
            observation: 'Pagamento via PIX',
            createdAt,
        }) as number;

        const { result } = renderHook(() => useReverseTransaction(), { wrapper });

        await result.current.mutateAsync({ id, reason: '  Pagamento duplicado  ' });

        const transactions = await db.transactions.toArray();
        const stored = transactions[0];

        expect(transactions).toHaveLength(1);
        expect(stored.id).toBe(id);
        expect(stored.type).toBe('payment');
        expect(stored.totalPrice).toBe(250);
        expect(stored.observation).toBe('Pagamento via PIX');
        expect(stored.createdAt).toEqual(createdAt);
        expect(stored.reversal?.reason).toBe('Pagamento duplicado');
        expect(Number.isNaN(Date.parse(stored.reversal?.reversedAt || ''))).toBe(false);
    });

    it('should require an explicit reversal reason', async () => {
        const id = await db.transactions.add({
            resellerId: 1,
            type: 'order',
            totalPrice: 5000,
            createdAt: new Date(),
        }) as number;

        const { result } = renderHook(() => useReverseTransaction(), { wrapper });

        await expect(result.current.mutateAsync({ id, reason: '   ' }))
            .rejects.toThrow(REVERSAL_REASON_REQUIRED_ERROR);

        expect((await db.transactions.get(id))?.reversal).toBeUndefined();
    });

    it('should reject a second reversal and preserve the original audit reason', async () => {
        const id = await db.transactions.add({
            resellerId: 1,
            type: 'order',
            totalPrice: 5000,
            reversal: {
                reason: 'Valor incorreto',
                reversedAt: '2026-08-17T15:00:00.000Z',
            },
            createdAt: new Date(),
        }) as number;

        const { result } = renderHook(() => useReverseTransaction(), { wrapper });

        await expect(result.current.mutateAsync({ id, reason: 'Outro motivo' }))
            .rejects.toThrow(TRANSACTION_ALREADY_REVERSED_ERROR);

        expect((await db.transactions.get(id))?.reversal?.reason).toBe('Valor incorreto');
    });
});
