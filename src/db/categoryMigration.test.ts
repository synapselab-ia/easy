import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { afterEach, describe, expect, it } from 'vitest';
import { db } from './database';

const legacyStores = {
    items: '++id, name',
    resellers: '++id, name',
    transactions: '++id, resellerId, type, createdAt, occurredAt',
};

describe('P9-S3-I1 Dexie V4 -> V5 category migration', () => {
    afterEach(async () => {
        await db.delete();
        await db.open();
    });

    it('adds an empty categories table without inventing item or historical order classification', async () => {
        await db.delete();

        const legacyDb = new Dexie('ResellerManagerDB');
        legacyDb.version(4).stores(legacyStores);
        await legacyDb.open();

        const createdAt = new Date('2026-06-01T12:00:00.000Z');
        const occurredAt = new Date('2026-05-28T12:00:00.000Z');
        const itemId = await legacyDb.table('items').add({
            name: 'Item legado V4',
            basePrice: 45,
            isActive: true,
            createdAt,
            updatedAt: createdAt,
        }) as number;
        const resellerId = await legacyDb.table('resellers').add({
            name: 'Revendedor legado V4',
            isActive: true,
            createdAt,
            updatedAt: createdAt,
        }) as number;
        const orderId = await legacyDb.table('transactions').add({
            resellerId,
            type: 'order',
            itemId,
            itemName: 'Item legado V4',
            quantity: 2,
            unitPrice: 45,
            totalPrice: 90,
            occurredAt,
            createdAt,
        }) as number;
        legacyDb.close();

        await db.open();

        expect(db.verno).toBe(5);
        expect(await db.categories.count()).toBe(0);

        const item = await db.items.get(itemId);
        expect(item).toMatchObject({
            id: itemId,
            name: 'Item legado V4',
            basePrice: 45,
            isActive: true,
        });
        expect(item?.categoryId).toBeUndefined();
        expect(item?.createdAt).toEqual(createdAt);
        expect(item?.updatedAt).toEqual(createdAt);

        const order = await db.transactions.get(orderId);
        expect(order).toMatchObject({
            id: orderId,
            resellerId,
            type: 'order',
            itemId,
            itemName: 'Item legado V4',
            quantity: 2,
            unitPrice: 45,
            totalPrice: 90,
        });
        expect(order?.categoryId).toBeUndefined();
        expect(order?.categoryName).toBeUndefined();
        expect(order?.occurredAt).toEqual(occurredAt);
        expect(order?.createdAt).toEqual(createdAt);
    });
});
