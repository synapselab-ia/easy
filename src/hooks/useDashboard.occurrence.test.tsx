import 'fake-indexeddb/auto';
import React, { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../db/database';
import { useDebtAging, usePerformanceAnalysis, useTodayOrders } from './useDashboard';

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

function daysAgo(days: number) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(12, 0, 0, 0);
    return date;
}

describe('P3-S1 dashboard occurrence-date behavior', () => {
    beforeEach(async () => {
        await db.transactions.clear();
        await db.resellers.clear();
        queryClient.clear();
    });

    it('counts today orders by occurredAt rather than registration createdAt', async () => {
        const today = daysAgo(0);
        const yesterday = daysAgo(1);

        await db.transactions.add({
            resellerId: 1,
            type: 'order',
            totalPrice: 100,
            occurredAt: yesterday,
            createdAt: today,
        });
        await db.transactions.add({
            resellerId: 1,
            type: 'order',
            totalPrice: 50,
            occurredAt: today,
            createdAt: yesterday,
        });

        const { result } = renderHook(() => useTodayOrders(), { wrapper });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual({ count: 1, volume: 50 });
    });

    it('uses the last financial occurrence, not registration time, for the existing aging model', async () => {
        const today = daysAgo(0);
        const fortyDaysAgo = daysAgo(40);
        const resellerId = await db.resellers.add({
            name: 'Maria',
            isActive: true,
            createdAt: today,
            updatedAt: today,
        }) as number;

        await db.transactions.add({
            resellerId,
            type: 'order',
            totalPrice: 100,
            occurredAt: fortyDaysAgo,
            createdAt: today,
        });

        const { result } = renderHook(() => useDebtAging(), { wrapper });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data?.criticalResellers[0]).toMatchObject({
            id: resellerId,
            name: 'Maria',
            balance: 100,
        });
        expect(result.current.data?.criticalResellers[0].lastMovement).toEqual(fortyDaysAgo);
    });

    it('uses occurredAt for performance-period revenue while preserving all-time balance math', async () => {
        const today = daysAgo(0);
        const oldOccurrence = daysAgo(120);
        const resellerId = await db.resellers.add({
            name: 'Ana',
            isActive: true,
            createdAt: today,
            updatedAt: today,
        }) as number;

        await db.transactions.add({
            resellerId,
            type: 'order',
            totalPrice: 100,
            occurredAt: oldOccurrence,
            createdAt: today,
        });
        await db.transactions.add({
            resellerId,
            type: 'order',
            totalPrice: 40,
            occurredAt: today,
            createdAt: oldOccurrence,
        });

        const { result } = renderHook(() => usePerformanceAnalysis(90), { wrapper });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data?.pareto[0]).toMatchObject({
            resellerName: 'Ana',
            revenue: 40,
        });
        expect(result.current.data?.ranking[0]).toEqual({ resellerName: 'Ana', balance: 140 });
    });
});
