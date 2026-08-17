import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTransactions, useCreateTransaction } from './useTransactions';
import { db } from '../db/database';
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

    it('should create an order for an active reseller and active item', async () => {
        const now = new Date();
        const resellerId = await db.resellers.add({
            name: 'Active Reseller',
            isActive: true,
            createdAt: now,
            updatedAt: now,
        }) as number;
        const itemId = await db.items.add({
            name: 'Active Item',
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
            itemName: 'Active Item',
            quantity: 2,
            unitPrice: 25,
            totalPrice: 50,
            createdAt: now,
        });

        const transactions = await db.transactions.toArray();
        expect(transactions).toHaveLength(1);
        expect(transactions[0].itemName).toBe('Active Item');
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
});
