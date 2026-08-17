import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSearch } from './useSearch';
import { db } from '../db/database';

describe('useSearch hook', () => {
    beforeEach(async () => {
        await db.items.clear();
        await db.resellers.clear();
        await db.transactions.clear();
        localStorage.clear();
    });

    it('should return empty results when query is empty', async () => {
        const { result } = renderHook(() => useSearch(''));

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.results).toHaveLength(0);
    });

    it('should return recent items and explicitly tracked recent resellers when query is empty', async () => {
        const now = new Date();
        const resellerId = await db.resellers.add({ name: 'Reseller 1', isActive: true, createdAt: now, updatedAt: now }) as number;
        await db.items.add({ name: 'Item 1', basePrice: 10, isActive: true, createdAt: now, updatedAt: now });
        localStorage.setItem('recent_resellers', JSON.stringify([resellerId]));

        const { result } = renderHook(() => useSearch(''));

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.recent).toHaveLength(2);
        expect(result.current.recent[0].title).toBe('Reseller 1');
        expect(result.current.recent[1].title).toBe('Item 1');
        expect(result.current.recent[1].isActive).toBe(true);
    });

    it('should filter resellers and items by name', async () => {
        const now = new Date();
        await db.resellers.add({ name: 'Apple', isActive: true, createdAt: now, updatedAt: now });
        await db.resellers.add({ name: 'Banana', isActive: true, createdAt: now, updatedAt: now });
        await db.items.add({ name: 'Apricot', basePrice: 5, isActive: true, createdAt: now, updatedAt: now });

        const { result } = renderHook(() => useSearch('Ap'));

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.results).toHaveLength(2);
        expect(result.current.results.map(r => r.title)).toContain('Apple');
        expect(result.current.results.map(r => r.title)).toContain('Apricot');
        expect(result.current.results.map(r => r.title)).not.toContain('Banana');
    });

    it('should keep inactive resellers searchable and mark their lifecycle state', async () => {
        const now = new Date();
        await db.resellers.add({
            name: 'Archived Ana',
            isActive: false,
            createdAt: now,
            updatedAt: now,
        });

        const { result } = renderHook(() => useSearch('Archived'));

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        await waitFor(() => expect(result.current.results).toHaveLength(1));

        expect(result.current.results[0].title).toBe('Archived Ana');
        expect(result.current.results[0].type).toBe('reseller');
        expect(result.current.results[0].isActive).toBe(false);
    });

    it('should keep inactive items searchable and mark their lifecycle state', async () => {
        const now = new Date();
        await db.items.add({
            name: 'Archived Perfume',
            basePrice: 75,
            isActive: false,
            createdAt: now,
            updatedAt: now,
        });

        const { result } = renderHook(() => useSearch('Archived'));

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        await waitFor(() => expect(result.current.results).toHaveLength(1));

        expect(result.current.results[0].title).toBe('Archived Perfume');
        expect(result.current.results[0].type).toBe('item');
        expect(result.current.results[0].isActive).toBe(false);
    });

    it('should calculate reseller balance in search results', async () => {
        const now = new Date();
        const resellerId = await db.resellers.add({ name: 'John Doe', isActive: true, createdAt: now, updatedAt: now }) as number;

        await db.transactions.add({
            resellerId,
            type: 'order',
            totalPrice: 100,
            createdAt: now
        });
        await db.transactions.add({
            resellerId,
            type: 'payment',
            totalPrice: 40,
            createdAt: now
        });

        const { result } = renderHook(() => useSearch('John'));

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        await waitFor(() => expect(result.current.results).toHaveLength(1));

        expect(result.current.results[0].subtitle).toBe('Saldo: R$ 60,00');
    });

    it('should limit results to 5 per category', async () => {
        const now = new Date();
        for (let i = 1; i <= 7; i++) {
            await db.resellers.add({ name: `Reseller ${i}`, isActive: true, createdAt: now, updatedAt: now });
        }

        const { result } = renderHook(() => useSearch('Reseller'));

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.results).toHaveLength(5);
    });
});
