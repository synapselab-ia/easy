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
});
