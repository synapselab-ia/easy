import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from './database';

describe('AppDatabase', () => {
    beforeEach(async () => {
        await db.items.clear();
        await db.resellers.clear();
        await db.transactions.clear();
    });

    it('should create and retrieve an item', async () => {
        const id = await db.items.add({
            name: 'Test Item',
            basePrice: 100,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const item = await db.items.get(id);
        expect(item).toBeDefined();
        expect(item?.name).toBe('Test Item');
    });

    it('should create and retrieve a reseller', async () => {
        const id = await db.resellers.add({
            name: 'Test Reseller',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const reseller = await db.resellers.get(id);
        expect(reseller).toBeDefined();
        expect(reseller?.name).toBe('Test Reseller');
    });

    it('should create and retrieve a transaction', async () => {
        const id = await db.transactions.add({
            resellerId: 1,
            type: 'order',
            totalPrice: 200,
            createdAt: new Date()
        });

        const transaction = await db.transactions.get(id);
        expect(transaction).toBeDefined();
        expect(transaction?.type).toBe('order');
        expect(transaction?.totalPrice).toBe(200);
    });

    it('should migrate existing resellers to active by default', async () => {
        await db.delete();

        const legacyDb = new Dexie('ResellerManagerDB');
        legacyDb.version(1).stores({
            items: '++id, name',
            resellers: '++id, name',
            transactions: '++id, resellerId, type, createdAt'
        });

        await legacyDb.open();
        const now = new Date();
        await legacyDb.table('resellers').add({
            name: 'Legacy Reseller',
            createdAt: now,
            updatedAt: now,
        });
        legacyDb.close();

        await db.open();
        const reseller = await db.resellers.toCollection().first();

        expect(reseller).toBeDefined();
        expect(reseller?.name).toBe('Legacy Reseller');
        expect(reseller?.isActive).toBe(true);
    });

    it('should migrate V2 items to active without changing existing reseller lifecycle state', async () => {
        await db.delete();

        const legacyDb = new Dexie('ResellerManagerDB');
        legacyDb.version(2).stores({
            items: '++id, name',
            resellers: '++id, name',
            transactions: '++id, resellerId, type, createdAt'
        });

        await legacyDb.open();
        const now = new Date();
        await legacyDb.table('items').add({
            name: 'Legacy Item',
            basePrice: 42,
            createdAt: now,
            updatedAt: now,
        });
        await legacyDb.table('resellers').add({
            name: 'Archived Reseller',
            isActive: false,
            createdAt: now,
            updatedAt: now,
        });
        legacyDb.close();

        await db.open();
        const item = await db.items.toCollection().first();
        const reseller = await db.resellers.toCollection().first();

        expect(item).toBeDefined();
        expect(item?.name).toBe('Legacy Item');
        expect(item?.isActive).toBe(true);
        expect(reseller?.isActive).toBe(false);
    });
});
