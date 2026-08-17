import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
    RESELLER_WITH_HISTORY_DELETE_ERROR,
    useArchiveReseller,
    useCreateReseller,
    useDeleteReseller,
    useReactivateReseller,
    useResellers,
} from './useResellers';
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

describe('useResellers hooks', () => {
    beforeEach(async () => {
        await db.transactions.clear();
        await db.resellers.clear();
        queryClient.clear();
    });

    it('should fetch resellers', async () => {
        await db.resellers.add({ name: 'Reseller 1', isActive: true, createdAt: new Date(), updatedAt: new Date() });

        const { result } = renderHook(() => useResellers(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toHaveLength(1);
        expect(result.current.data?.[0].name).toBe('Reseller 1');
    });

    it('should create a reseller as active by default', async () => {
        const { result } = renderHook(() => useCreateReseller(), { wrapper });

        result.current.mutate({ name: 'New Reseller', createdAt: new Date(), updatedAt: new Date() });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        const resellers = await db.resellers.toArray();
        expect(resellers).toHaveLength(1);
        expect(resellers[0].name).toBe('New Reseller');
        expect(resellers[0].isActive).toBe(true);
    });

    it('should archive and reactivate a reseller without deleting it', async () => {
        const resellerId = await db.resellers.add({
            name: 'Lifecycle Reseller',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }) as number;

        const archiveHook = renderHook(() => useArchiveReseller(), { wrapper });
        await archiveHook.result.current.mutateAsync(resellerId);

        expect((await db.resellers.get(resellerId))?.isActive).toBe(false);

        const reactivateHook = renderHook(() => useReactivateReseller(), { wrapper });
        await reactivateHook.result.current.mutateAsync(resellerId);

        expect((await db.resellers.get(resellerId))?.isActive).toBe(true);
    });

    it('should block physical deletion when reseller has financial history', async () => {
        const now = new Date();
        const resellerId = await db.resellers.add({
            name: 'Historical Reseller',
            isActive: false,
            createdAt: now,
            updatedAt: now,
        }) as number;

        await db.transactions.add({
            resellerId,
            type: 'order',
            totalPrice: 100,
            createdAt: now,
        });

        const { result } = renderHook(() => useDeleteReseller(), { wrapper });

        await expect(result.current.mutateAsync(resellerId)).rejects.toThrow(RESELLER_WITH_HISTORY_DELETE_ERROR);
        expect(await db.resellers.get(resellerId)).toBeDefined();
        expect(await db.transactions.where('resellerId').equals(resellerId).count()).toBe(1);
    });

    it('should allow physical deletion only when reseller has no history', async () => {
        const resellerId = await db.resellers.add({
            name: 'Unused Reseller',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }) as number;

        const { result } = renderHook(() => useDeleteReseller(), { wrapper });
        await result.current.mutateAsync(resellerId);

        expect(await db.resellers.get(resellerId)).toBeUndefined();
    });
});
