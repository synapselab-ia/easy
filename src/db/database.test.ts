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

    it('should upgrade a valid V1 database through the complete P1 migration path without data loss', async () => {
        await db.delete();

        const legacyDb = new Dexie('ResellerManagerDB');
        legacyDb.version(1).stores({
            items: '++id, name',
            resellers: '++id, name',
            transactions: '++id, resellerId, type, createdAt'
        });

        await legacyDb.open();
        const now = new Date('2026-01-15T12:00:00.000Z');
        const itemId = await legacyDb.table('items').add({
            name: 'Legacy Catalog Item',
            basePrice: 75,
            createdAt: now,
            updatedAt: now,
        }) as number;
        const archivedItemId = await legacyDb.table('items').add({
            name: 'Already Archived Item',
            basePrice: 80,
            isActive: false,
            createdAt: now,
            updatedAt: now,
        }) as number;
        const resellerId = await legacyDb.table('resellers').add({
            name: 'Legacy Reseller',
            createdAt: now,
            updatedAt: now,
        }) as number;
        const archivedResellerId = await legacyDb.table('resellers').add({
            name: 'Already Archived Reseller',
            isActive: false,
            createdAt: now,
            updatedAt: now,
        }) as number;
        const orderId = await legacyDb.table('transactions').add({
            resellerId,
            type: 'order',
            itemId,
            itemName: 'Legacy Catalog Item',
            quantity: 2,
            unitPrice: 75,
            totalPrice: 150,
            observation: 'Preserve this snapshot',
            createdAt: now,
        }) as number;
        const paymentId = await legacyDb.table('transactions').add({
            resellerId,
            type: 'payment',
            totalPrice: 50,
            createdAt: now,
        }) as number;
        legacyDb.close();

        await db.open();

        expect(await db.items.count()).toBe(2);
        expect(await db.resellers.count()).toBe(2);
        expect(await db.transactions.count()).toBe(2);

        expect((await db.items.get(itemId))?.isActive).toBe(true);
        expect((await db.items.get(archivedItemId))?.isActive).toBe(false);
        expect((await db.resellers.get(resellerId))?.isActive).toBe(true);
        expect((await db.resellers.get(archivedResellerId))?.isActive).toBe(false);

        const order = await db.transactions.get(orderId);
        expect(order).toMatchObject({
            id: orderId,
            resellerId,
            type: 'order',
            itemId,
            itemName: 'Legacy Catalog Item',
            quantity: 2,
            unitPrice: 75,
            totalPrice: 150,
            observation: 'Preserve this snapshot',
        });
        expect(order?.createdAt).toEqual(now);

        const payment = await db.transactions.get(paymentId);
        expect(payment).toMatchObject({
            id: paymentId,
            resellerId,
            type: 'payment',
            totalPrice: 50,
        });
        expect(payment?.createdAt).toEqual(now);
    });

    it('should preserve a historical order snapshot even when its old catalog reference cannot be resolved', async () => {
        await db.delete();

        const legacyDb = new Dexie('ResellerManagerDB');
        legacyDb.version(1).stores({
            items: '++id, name',
            resellers: '++id, name',
            transactions: '++id, resellerId, type, createdAt'
        });

        await legacyDb.open();
        const now = new Date('2025-06-10T10:00:00.000Z');
        const resellerId = await legacyDb.table('resellers').add({
            name: 'Historical Reseller',
            createdAt: now,
            updatedAt: now,
        }) as number;
        const transactionId = await legacyDb.table('transactions').add({
            resellerId,
            type: 'order',
            itemId: 999,
            itemName: 'Removed Legacy Item',
            quantity: 1,
            unitPrice: 40,
            totalPrice: 40,
            createdAt: now,
        }) as number;
        legacyDb.close();

        await db.open();

        const historicalOrder = await db.transactions.get(transactionId);
        expect(historicalOrder).toMatchObject({
            resellerId,
            type: 'order',
            itemId: 999,
            itemName: 'Removed Legacy Item',
            quantity: 1,
            unitPrice: 40,
            totalPrice: 40,
        });
        expect(historicalOrder?.createdAt).toEqual(now);
    });
});
