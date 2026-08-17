import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDebtAging, usePerformanceAnalysis, useTodayOrders, useTotalDebt } from './useDashboard';
import { db } from '../db/database';
import React, { ReactNode } from 'react';

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        {children}
    </QueryClientProvider>
);

describe('useDashboard hooks', () => {
    beforeEach(async () => {
        await db.transactions.clear();
        await db.resellers.clear();
        queryClient.clear();
    });

    it('should calculate total debt', async () => {
        await db.transactions.add({ resellerId: 1, type: 'order', totalPrice: 100, createdAt: new Date() });
        await db.transactions.add({ resellerId: 1, type: 'payment', totalPrice: 30, createdAt: new Date() });

        const { result } = renderHook(() => useTotalDebt(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toBe(70);
    });

    it('should exclude reversed transactions from total debt', async () => {
        await db.transactions.add({ resellerId: 1, type: 'order', totalPrice: 100, createdAt: new Date() });
        await db.transactions.add({
            resellerId: 1,
            type: 'payment',
            totalPrice: 30,
            reversal: { reason: 'Duplicado', reversedAt: '2026-08-17T15:00:00.000Z' },
            createdAt: new Date(),
        });

        const { result } = renderHook(() => useTotalDebt(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toBe(100);
    });

    it('should calculate today orders', async () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        await db.transactions.add({ resellerId: 1, type: 'order', totalPrice: 100, createdAt: yesterday });
        await db.transactions.add({ resellerId: 1, type: 'order', totalPrice: 50, createdAt: new Date() });

        const { result } = renderHook(() => useTodayOrders(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data?.count).toBe(1);
        expect(result.current.data?.volume).toBe(50);
    });

    it('should exclude reversed orders from today order count and volume', async () => {
        await db.transactions.add({ resellerId: 1, type: 'order', totalPrice: 50, createdAt: new Date() });
        await db.transactions.add({
            resellerId: 1,
            type: 'order',
            totalPrice: 200,
            reversal: { reason: 'Pedido duplicado', reversedAt: '2026-08-17T15:00:00.000Z' },
            createdAt: new Date(),
        });

        const { result } = renderHook(() => useTodayOrders(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual({ count: 1, volume: 50 });
    });

    it('should exclude reversed transactions from debt aging and performance analysis', async () => {
        const now = new Date();
        const resellerId = await db.resellers.add({
            name: 'Maria',
            isActive: true,
            createdAt: now,
            updatedAt: now,
        }) as number;

        await db.transactions.add({ resellerId, type: 'order', totalPrice: 100, createdAt: now });
        await db.transactions.add({ resellerId, type: 'payment', totalPrice: 20, createdAt: now });
        await db.transactions.add({
            resellerId,
            type: 'order',
            totalPrice: 900,
            reversal: { reason: 'Valor lançado por engano', reversedAt: '2026-08-17T15:00:00.000Z' },
            createdAt: now,
        });

        const aging = renderHook(() => useDebtAging(), { wrapper });
        const performance = renderHook(() => usePerformanceAnalysis(90), { wrapper });

        await waitFor(() => expect(aging.result.current.isSuccess).toBe(true));
        await waitFor(() => expect(performance.result.current.isSuccess).toBe(true));

        expect(aging.result.current.data?.totalDebt).toBe(80);
        expect(performance.result.current.data?.ranking[0]).toEqual({ resellerName: 'Maria', balance: 80 });
        expect(performance.result.current.data?.pareto[0].revenue).toBe(100);
    });
});
