import 'fake-indexeddb/auto';
import React, { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../db/database';
import {
    OCCURRENCE_DATE_REQUIRED_ERROR,
    useCreateTransaction,
    useReplaceTransaction,
} from './useTransactions';

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('P3-S1 transaction date semantics', () => {
    beforeEach(async () => {
        await db.transactions.clear();
        await db.items.clear();
        await db.resellers.clear();
        queryClient.clear();
    });

    it('stores operator-selected occurredAt while generating createdAt as registration time', async () => {
        const resellerId = await db.resellers.add({
            name: 'Ana',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }) as number;
        const occurredAt = new Date('2026-06-15T12:00:00-03:00');
        const beforeRegistration = new Date();

        const { result } = renderHook(() => useCreateTransaction(), { wrapper });
        await result.current.mutateAsync({
            resellerId,
            type: 'payment',
            totalPrice: 80,
            occurredAt,
        });

        const stored = (await db.transactions.toArray())[0];
        expect(stored.occurredAt).toEqual(occurredAt);
        expect(stored.createdAt.getTime()).toBeGreaterThanOrEqual(beforeRegistration.getTime());
        expect(stored.createdAt).not.toEqual(occurredAt);
    });

    it('rejects an explicitly invalid occurrence date', async () => {
        const resellerId = await db.resellers.add({
            name: 'Ana',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }) as number;

        const { result } = renderHook(() => useCreateTransaction(), { wrapper });
        await expect(result.current.mutateAsync({
            resellerId,
            type: 'payment',
            totalPrice: 80,
            occurredAt: new Date('invalid'),
        })).rejects.toThrow(OCCURRENCE_DATE_REQUIRED_ERROR);

        expect(await db.transactions.count()).toBe(0);
    });

    it('keeps legacy callers safe by defaulting a missing occurrence to registration time', async () => {
        const resellerId = await db.resellers.add({
            name: 'Ana',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }) as number;

        const { result } = renderHook(() => useCreateTransaction(), { wrapper });
        await result.current.mutateAsync({
            resellerId,
            type: 'signal',
            totalPrice: 30,
        });

        const stored = (await db.transactions.toArray())[0];
        expect(stored.occurredAt).toBeInstanceOf(Date);
        expect(Math.abs(stored.createdAt.getTime() - stored.occurredAt!.getTime())).toBeLessThan(10);
    });

    it('preserves the original financial occurrence across a linked correction while recording new audit time', async () => {
        const resellerId = await db.resellers.add({
            name: 'Ana',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }) as number;
        const originalOccurredAt = new Date('2026-05-03T12:00:00-03:00');
        const originalCreatedAt = new Date('2026-05-10T09:00:00-03:00');
        const originalId = await db.transactions.add({
            resellerId,
            type: 'payment',
            totalPrice: 500,
            occurredAt: originalOccurredAt,
            createdAt: originalCreatedAt,
        }) as number;
        const beforeCorrection = new Date();

        const { result } = renderHook(() => useReplaceTransaction(), { wrapper });
        const response = await result.current.mutateAsync({
            originalId,
            reason: 'Valor incorreto',
            replacement: {
                resellerId,
                totalPrice: 50,
            },
        });

        const original = await db.transactions.get(originalId);
        const replacement = await db.transactions.get(response.replacementTransactionId);

        expect(original?.occurredAt).toEqual(originalOccurredAt);
        expect(original?.createdAt).toEqual(originalCreatedAt);
        expect(replacement?.occurredAt).toEqual(originalOccurredAt);
        expect(replacement?.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCorrection.getTime());
        expect(Date.parse(original?.reversal?.reversedAt || '')).toBeGreaterThanOrEqual(beforeCorrection.getTime());
        expect(original?.reversal?.replacementTransactionId).toBe(replacement?.id);
        expect(replacement?.correction?.replacesTransactionId).toBe(originalId);
    });
});
