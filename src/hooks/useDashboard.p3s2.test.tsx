import 'fake-indexeddb/auto';
import React, { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../db/database';
import { useDebtAging, useTotalDebt } from './useDashboard';

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

describe('P3-S2 dashboard balance and aging semantics', () => {
    beforeEach(async () => {
        await db.transactions.clear();
        await db.resellers.clear();
        queryClient.clear();
    });

    it('keeps old outstanding debt critical after a recent partial payment', async () => {
        const now = daysAgo(0);
        const oldOccurrence = daysAgo(45);
        const resellerId = await db.resellers.add({
            name: 'Maria',
            isActive: true,
            createdAt: now,
            updatedAt: now,
        }) as number;

        await db.transactions.add({
            resellerId,
            type: 'order',
            totalPrice: 100,
            occurredAt: oldOccurrence,
            createdAt: oldOccurrence,
        });
        await db.transactions.add({
            resellerId,
            type: 'payment',
            totalPrice: 20,
            occurredAt: now,
            createdAt: now,
        });

        const { result } = renderHook(() => useDebtAging(), { wrapper });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data?.totalDebt).toBe(80);
        expect(result.current.data?.buckets.find(bucket => bucket.category === 'critical')?.value).toBe(80);
        expect(result.current.data?.criticalResellers[0]).toMatchObject({
            id: resellerId,
            name: 'Maria',
            balance: 80,
            totalBalance: 80,
        });
        expect(result.current.data?.criticalResellers[0].oldestOutstandingAt).toEqual(oldOccurrence);
    });

    it('uses FIFO payment allocation so only the newer residual debt remains', async () => {
        const now = daysAgo(0);
        const oldOccurrence = daysAgo(45);
        const newerOccurrence = daysAgo(10);
        const resellerId = await db.resellers.add({
            name: 'Ana',
            isActive: true,
            createdAt: now,
            updatedAt: now,
        }) as number;

        await db.transactions.add({ resellerId, type: 'order', totalPrice: 100, occurredAt: oldOccurrence, createdAt: oldOccurrence });
        await db.transactions.add({ resellerId, type: 'order', totalPrice: 100, occurredAt: newerOccurrence, createdAt: newerOccurrence });
        await db.transactions.add({ resellerId, type: 'payment', totalPrice: 120, occurredAt: now, createdAt: now });

        const { result } = renderHook(() => useDebtAging(), { wrapper });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data?.totalDebt).toBe(80);
        expect(result.current.data?.buckets.find(bucket => bucket.category === 'critical')?.value).toBe(0);
        expect(result.current.data?.buckets.find(bucket => bucket.category === 'attention')?.value).toBe(80);
        expect(result.current.data?.attentionResellers[0].oldestOutstandingAt).toEqual(newerOccurrence);
    });

    it('does not let one reseller credit reduce another reseller debt in the total-debt card', async () => {
        const now = daysAgo(0);
        const creditResellerId = await db.resellers.add({ name: 'Crédito', createdAt: now, updatedAt: now }) as number;
        const debtorResellerId = await db.resellers.add({ name: 'Devedor', createdAt: now, updatedAt: now }) as number;

        await db.transactions.add({ resellerId: creditResellerId, type: 'payment', totalPrice: 100, occurredAt: now, createdAt: now });
        await db.transactions.add({ resellerId: debtorResellerId, type: 'order', totalPrice: 200, occurredAt: now, createdAt: now });

        const { result } = renderHook(() => useTotalDebt(), { wrapper });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toBe(200);
    });
});
