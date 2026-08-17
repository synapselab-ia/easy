import { describe, expect, it } from 'vitest';
import { preflightBackupPayload } from './backupService';

const exportedAt = '2026-08-17T18:00:00.000Z';

describe('P3-S1 occurrence compatibility through P5-S1 preflight', () => {
    it('materializes occurredAt from createdAt for a legacy v1 backup without mutating storage', () => {
        const legacyCreatedAt = '2025-11-03T14:00:00.000Z';
        const result = preflightBackupPayload({
            version: 1,
            exportedAt,
            data: {
                items: [],
                resellers: [{
                    id: 2,
                    name: 'Revendedor',
                    createdAt: '2025-01-01T12:00:00.000Z',
                    updatedAt: '2025-01-01T12:00:00.000Z',
                }],
                transactions: [{
                    id: 1,
                    resellerId: 2,
                    type: 'payment',
                    totalPrice: 25,
                    createdAt: legacyCreatedAt,
                }],
            },
        });

        const restored = result.normalized.data.transactions[0];
        expect(restored.createdAt).toEqual(new Date(legacyCreatedAt));
        expect(restored.occurredAt).toEqual(new Date(legacyCreatedAt));
        expect(result.preview.migrated).toBe(true);
    });

    it('preserves an explicit occurrence date from a v1 backup', () => {
        const createdAt = '2026-08-17T16:30:00.000Z';
        const occurredAt = '2026-07-20T15:00:00.000Z';
        const result = preflightBackupPayload({
            version: 1,
            exportedAt,
            data: {
                items: [{
                    id: 1,
                    name: 'Item',
                    basePrice: 90,
                    createdAt: '2026-01-01T12:00:00.000Z',
                    updatedAt: '2026-01-01T12:00:00.000Z',
                }],
                resellers: [{
                    id: 2,
                    name: 'Revendedor',
                    createdAt: '2026-01-01T12:00:00.000Z',
                    updatedAt: '2026-01-01T12:00:00.000Z',
                }],
                transactions: [{
                    id: 1,
                    resellerId: 2,
                    type: 'order',
                    itemId: 1,
                    itemName: 'Item',
                    quantity: 1,
                    unitPrice: 90,
                    totalPrice: 90,
                    occurredAt,
                    createdAt,
                }],
            },
        });

        const restored = result.normalized.data.transactions[0];
        expect(restored.createdAt).toEqual(new Date(createdAt));
        expect(restored.occurredAt).toEqual(new Date(occurredAt));
    });
});
