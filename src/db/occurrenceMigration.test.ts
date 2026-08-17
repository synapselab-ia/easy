import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { db } from './database';

describe('P3-S1 occurrence-date migration', () => {
    beforeEach(async () => {
        db.close();
        await db.delete();
    });

    afterEach(async () => {
        db.close();
        await db.delete();
    });

    it('migrates V3 transactions with occurredAt = createdAt without rewriting P2 audit metadata', async () => {
        const legacyDb = new Dexie('ResellerManagerDB');
        legacyDb.version(3).stores({
            items: '++id, name',
            resellers: '++id, name',
            transactions: '++id, resellerId, type, createdAt',
        });

        await legacyDb.open();
        const createdAt = new Date('2026-03-10T14:30:00.000Z');
        const transactionId = await legacyDb.table('transactions').add({
            resellerId: 7,
            type: 'payment',
            totalPrice: 125,
            observation: 'Legacy P2 row',
            reversal: {
                reason: 'Pagamento duplicado',
                reversedAt: '2026-04-01T12:00:00.000Z',
                replacementTransactionId: 22,
            },
            createdAt,
        }) as number;
        legacyDb.close();

        await db.open();
        const migrated = await db.transactions.get(transactionId);

        expect(db.verno).toBe(4);
        expect(migrated?.createdAt).toEqual(createdAt);
        expect(migrated?.occurredAt).toEqual(createdAt);
        expect(migrated?.reversal).toEqual({
            reason: 'Pagamento duplicado',
            reversedAt: '2026-04-01T12:00:00.000Z',
            replacementTransactionId: 22,
        });
        expect(migrated?.observation).toBe('Legacy P2 row');
    });

    it('preserves an already materialized occurrence date while upgrading the V3 store', async () => {
        const legacyDb = new Dexie('ResellerManagerDB');
        legacyDb.version(3).stores({
            items: '++id, name',
            resellers: '++id, name',
            transactions: '++id, resellerId, type, createdAt',
        });

        await legacyDb.open();
        const createdAt = new Date('2026-08-17T16:00:00.000Z');
        const occurredAt = new Date('2026-07-05T12:00:00.000Z');
        const transactionId = await legacyDb.table('transactions').add({
            resellerId: 3,
            type: 'order',
            totalPrice: 300,
            correction: { replacesTransactionId: 11 },
            occurredAt,
            createdAt,
        }) as number;
        legacyDb.close();

        await db.open();
        const migrated = await db.transactions.get(transactionId);

        expect(migrated?.createdAt).toEqual(createdAt);
        expect(migrated?.occurredAt).toEqual(occurredAt);
        expect(migrated?.correction).toEqual({ replacesTransactionId: 11 });
    });
});
