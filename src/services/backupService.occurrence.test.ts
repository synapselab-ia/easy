import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { importData } from './backupService';
import { db } from '../db/database';

vi.mock('../db/database', () => ({
    db: {
        items: { clear: vi.fn(), bulkAdd: vi.fn() },
        resellers: { clear: vi.fn(), bulkAdd: vi.fn() },
        transactions: { clear: vi.fn(), bulkAdd: vi.fn() },
        transaction: vi.fn((_type, _tables, callback) => callback()),
    },
}));

describe('P3-S1 backup occurrence-date compatibility', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('materializes occurredAt from createdAt when restoring a legacy backup', async () => {
        const legacyCreatedAt = '2025-11-03T14:00:00.000Z';
        const file = new File([JSON.stringify({
            version: 1,
            data: {
                items: [],
                resellers: [],
                transactions: [{
                    id: 1,
                    resellerId: 2,
                    type: 'payment',
                    totalPrice: 25,
                    createdAt: legacyCreatedAt,
                }],
            },
        })], 'legacy-backup.json', { type: 'application/json' });

        await importData(file);

        const restored = (db.transactions.bulkAdd as any).mock.calls[0][0][0];
        expect(restored.createdAt).toEqual(new Date(legacyCreatedAt));
        expect(restored.occurredAt).toEqual(new Date(legacyCreatedAt));
    });

    it('preserves an explicit occurrence date from a P3 backup', async () => {
        const createdAt = '2026-08-17T16:30:00.000Z';
        const occurredAt = '2026-07-20T15:00:00.000Z';
        const file = new File([JSON.stringify({
            version: 1,
            data: {
                items: [],
                resellers: [],
                transactions: [{
                    id: 1,
                    resellerId: 2,
                    type: 'order',
                    totalPrice: 90,
                    occurredAt,
                    createdAt,
                }],
            },
        })], 'p3-backup.json', { type: 'application/json' });

        await importData(file);

        const restored = (db.transactions.bulkAdd as any).mock.calls[0][0][0];
        expect(restored.createdAt).toEqual(new Date(createdAt));
        expect(restored.occurredAt).toEqual(new Date(occurredAt));
    });
});
