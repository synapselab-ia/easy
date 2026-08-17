import 'fake-indexeddb/auto';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { db, type Transaction } from '../db/database';
import { calculateBalance } from '../domain/transactions';
import { exportData, preflightBackupPayload, preflightBackupText } from './backupService';
import { restorePreflightedBackup } from './restoreService';

const createObjectURL = vi.fn();
const revokeObjectURL = vi.fn();
const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
let downloadedBlobs: Blob[] = [];

Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: createObjectURL,
});
Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: revokeObjectURL,
});

const itemCreatedAt = new Date('2026-01-01T12:00:00.000Z');
const itemUpdatedAt = new Date('2026-02-01T12:00:00.000Z');
const occurrence = new Date('2026-07-10T12:00:00.000Z');

async function clearDatabase() {
    await db.transaction('rw', [db.items, db.resellers, db.transactions], async () => {
        await Promise.all([db.items.clear(), db.resellers.clear(), db.transactions.clear()]);
    });
}

async function seedCanonicalSource() {
    await db.items.bulkAdd([
        { id: 7, name: 'Perfume histórico', basePrice: 50, isActive: false, createdAt: itemCreatedAt, updatedAt: itemUpdatedAt },
        { id: 8, name: 'Item ativo', basePrice: 20, isActive: true, createdAt: itemCreatedAt, updatedAt: itemUpdatedAt },
    ]);
    await db.resellers.bulkAdd([
        { id: 3, name: 'Ana', isActive: true, createdAt: itemCreatedAt, updatedAt: itemUpdatedAt },
        { id: 4, name: 'Histórica', isActive: false, createdAt: itemCreatedAt, updatedAt: itemUpdatedAt },
    ]);
    await db.transactions.bulkAdd([
        {
            id: 10,
            resellerId: 3,
            type: 'payment',
            totalPrice: 20,
            occurredAt: occurrence,
            createdAt: new Date('2026-08-01T10:00:00.000Z'),
            reversal: {
                reason: 'Valor incorreto',
                reversedAt: '2026-08-01T11:00:00.000Z',
                replacementTransactionId: 11,
            },
        },
        {
            id: 11,
            resellerId: 3,
            type: 'payment',
            totalPrice: 25,
            occurredAt: occurrence,
            createdAt: new Date('2026-08-01T11:00:00.000Z'),
            correction: { replacesTransactionId: 10 },
        },
        {
            id: 20,
            resellerId: 3,
            type: 'order',
            itemId: 7,
            itemName: 'Perfume histórico',
            quantity: 2,
            unitPrice: 50,
            totalPrice: 100,
            occurredAt: new Date('2026-07-01T12:00:00.000Z'),
            createdAt: new Date('2026-08-02T10:00:00.000Z'),
        },
        {
            id: 21,
            resellerId: 3,
            type: 'signal',
            totalPrice: 10,
            occurredAt: new Date('2026-07-02T12:00:00.000Z'),
            createdAt: new Date('2026-08-02T11:00:00.000Z'),
        },
    ]);
}

async function snapshotDatabase() {
    const [items, resellers, transactions] = await Promise.all([
        db.items.toArray(),
        db.resellers.toArray(),
        db.transactions.toArray(),
    ]);
    return { items, resellers, transactions };
}

function ids(rows: Array<{ id?: number }>) {
    return rows.map(row => row.id).sort((a, b) => (a ?? 0) - (b ?? 0));
}

describe('P5-S2 checkpointed atomic restore', () => {
    beforeEach(async () => {
        await clearDatabase();
        downloadedBlobs = [];
        createObjectURL.mockReset().mockImplementation((blob: Blob) => {
            downloadedBlobs.push(blob);
            return `blob:${downloadedBlobs.length}`;
        });
        revokeObjectURL.mockReset();
        anchorClick.mockClear();
    });

    afterAll(async () => {
        await clearDatabase();
        db.close();
        anchorClick.mockRestore();
    });

    it('proves current v2 export -> clean restore preserves IDs, lifecycle, P2/P3 history and financial result', async () => {
        await seedCanonicalSource();
        const source = await snapshotDatabase();
        const sourceBalance = calculateBalance(source.transactions);

        await exportData();
        expect(downloadedBlobs).toHaveLength(1);
        const exportedText = await downloadedBlobs[0].text();
        const exportedPreflight = preflightBackupText(exportedText);

        await clearDatabase();
        const result = await restorePreflightedBackup(exportedPreflight);

        expect(result.status).toBe('success');
        if (result.status !== 'success') return;
        expect(result.checkpointFilename).toMatch(/^easy-checkpoint-v2-/);
        expect(downloadedBlobs).toHaveLength(2);

        const restored = await snapshotDatabase();
        expect(ids(restored.items)).toEqual([7, 8]);
        expect(ids(restored.resellers)).toEqual([3, 4]);
        expect(ids(restored.transactions)).toEqual([10, 11, 20, 21]);
        expect(restored.items.find(item => item.id === 7)?.isActive).toBe(false);
        expect(restored.resellers.find(reseller => reseller.id === 4)?.isActive).toBe(false);
        expect(restored.transactions.find(tx => tx.id === 10)?.reversal?.replacementTransactionId).toBe(11);
        expect(restored.transactions.find(tx => tx.id === 11)?.correction?.replacesTransactionId).toBe(10);
        expect(restored.transactions.find(tx => tx.id === 11)?.occurredAt).toEqual(occurrence);
        expect(calculateBalance(restored.transactions)).toBe(sourceBalance);
        expect(sourceBalance).toBe(65);
    });

    it('proves supported v1 migration -> restore materializes lifecycle/occurrence defaults without changing IDs or finance', async () => {
        await seedCanonicalSource();
        const legacyCreatedAt = '2025-11-03T14:00:00.000Z';
        const legacy = {
            version: 1,
            exportedAt: '2026-08-17T18:00:00.000Z',
            data: {
                items: [{
                    id: 101,
                    name: 'Legado',
                    basePrice: 30,
                    createdAt: '2025-01-01T12:00:00.000Z',
                    updatedAt: '2025-01-02T12:00:00.000Z',
                }],
                resellers: [{
                    id: 201,
                    name: 'Revendedor legado',
                    createdAt: '2025-01-01T12:00:00.000Z',
                    updatedAt: '2025-01-02T12:00:00.000Z',
                }],
                transactions: [{
                    id: 301,
                    resellerId: 201,
                    type: 'payment',
                    totalPrice: 30,
                    createdAt: legacyCreatedAt,
                }],
            },
        };

        const preflight = preflightBackupPayload(legacy);
        const result = await restorePreflightedBackup(preflight);

        expect(result.status).toBe('success');
        const restored = await snapshotDatabase();
        expect(ids(restored.items)).toEqual([101]);
        expect(ids(restored.resellers)).toEqual([201]);
        expect(ids(restored.transactions)).toEqual([301]);
        expect(restored.items[0].isActive).toBe(true);
        expect(restored.resellers[0].isActive).toBe(true);
        expect(restored.transactions[0].occurredAt).toEqual(new Date(legacyCreatedAt));
        expect(calculateBalance(restored.transactions)).toBe(-30);
    });

    it('rolls back the whole replacement if a table write fails after clears begin', async () => {
        await seedCanonicalSource();
        const before = await snapshotDatabase();
        const target = preflightBackupPayload({
            format: 'easy-backup',
            version: 2,
            exportedAt: '2026-08-17T18:00:00.000Z',
            source: { database: 'ResellerManagerDB', schemaVersion: 4 },
            data: {
                items: [{ id: 90, name: 'Novo', basePrice: 10, isActive: true, createdAt: '2026-01-01T12:00:00.000Z', updatedAt: '2026-01-01T12:00:00.000Z' }],
                resellers: [{ id: 91, name: 'Nova', isActive: true, createdAt: '2026-01-01T12:00:00.000Z', updatedAt: '2026-01-01T12:00:00.000Z' }],
                transactions: [{ id: 92, resellerId: 91, type: 'payment', totalPrice: 5, occurredAt: '2026-01-01T12:00:00.000Z', createdAt: '2026-01-01T12:00:00.000Z' }],
            },
        });

        const bulkAddSpy = vi.spyOn(db.transactions, 'bulkAdd').mockRejectedValueOnce(new Error('falha simulada de gravação'));
        const result = await restorePreflightedBackup(target);
        bulkAddSpy.mockRestore();

        expect(result).toMatchObject({ status: 'failure', previousDatabasePreserved: true });
        if (result.status === 'failure') expect(result.checkpointFilename).toMatch(/^easy-checkpoint-v2-/);

        const after = await snapshotDatabase();
        expect(ids(after.items)).toEqual(ids(before.items));
        expect(ids(after.resellers)).toEqual(ids(before.resellers));
        expect(ids(after.transactions)).toEqual(ids(before.transactions));
        expect(calculateBalance(after.transactions)).toBe(calculateBalance(before.transactions));
    });

    it('revalidates the normalized target before checkpoint or mutation', async () => {
        await seedCanonicalSource();
        const before = await snapshotDatabase();
        const valid = preflightBackupPayload({
            format: 'easy-backup',
            version: 2,
            exportedAt: '2026-08-17T18:00:00.000Z',
            source: { database: 'ResellerManagerDB', schemaVersion: 4 },
            data: {
                items: [],
                resellers: [{ id: 1, name: 'Alvo', isActive: true, createdAt: '2026-01-01T12:00:00.000Z', updatedAt: '2026-01-01T12:00:00.000Z' }],
                transactions: [{ id: 1, resellerId: 1, type: 'payment', totalPrice: 5, occurredAt: '2026-01-01T12:00:00.000Z', createdAt: '2026-01-01T12:00:00.000Z' }],
            },
        });

        (valid.normalized.data.transactions[0] as Transaction).resellerId = 999;
        const downloadsBefore = downloadedBlobs.length;
        const result = await restorePreflightedBackup(valid);

        expect(result).toMatchObject({
            status: 'failure',
            previousDatabasePreserved: true,
            checkpointFilename: undefined,
        });
        expect(downloadedBlobs).toHaveLength(downloadsBefore);
        const after = await snapshotDatabase();
        expect(ids(after.transactions)).toEqual(ids(before.transactions));
    });
});
