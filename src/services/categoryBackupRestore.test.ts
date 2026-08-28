import 'fake-indexeddb/auto';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../db/database';
import { BACKUP_SCHEMA_VERSION, exportData, preflightBackupPayload, preflightBackupText } from './backupService';
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

const entityCreatedAt = new Date('2026-01-01T12:00:00.000Z');
const occurredAt = new Date('2026-08-10T12:00:00.000Z');

async function clearDatabase() {
    await db.transaction('rw', [db.categories, db.subcategories, db.items, db.resellers, db.transactions], async () => {
        await Promise.all([
            db.transactions.clear(),
            db.items.clear(),
            db.resellers.clear(),
            db.subcategories.clear(),
            db.categories.clear(),
        ]);
    });
}

async function seedDataset(categoryId: number, itemId: number, resellerId: number, transactionId: number, label: string) {
    await db.categories.add({
        id: categoryId,
        name: label,
        isActive: true,
        createdAt: entityCreatedAt,
        updatedAt: entityCreatedAt,
    });
    await db.items.add({
        id: itemId,
        name: `Item ${label}`,
        basePrice: 30,
        isActive: true,
        categoryId,
        createdAt: entityCreatedAt,
        updatedAt: entityCreatedAt,
    });
    await db.resellers.add({
        id: resellerId,
        name: `Revendedor ${label}`,
        isActive: true,
        createdAt: entityCreatedAt,
        updatedAt: entityCreatedAt,
    });
    await db.transactions.add({
        id: transactionId,
        resellerId,
        type: 'order',
        itemId,
        itemName: `Item ${label}`,
        quantity: 2,
        unitPrice: 30,
        categoryId,
        categoryName: `${label} histórico`,
        totalPrice: 60,
        occurredAt,
        createdAt: new Date('2026-08-17T16:00:00.000Z'),
    });
}

async function snapshotIds() {
    const [categories, subcategories, items, resellers, transactions] = await Promise.all([
        db.categories.toArray(),
        db.subcategories.toArray(),
        db.items.toArray(),
        db.resellers.toArray(),
        db.transactions.toArray(),
    ]);
    return {
        categories: categories.map(row => row.id),
        subcategories: subcategories.map(row => row.id),
        items: items.map(row => row.id),
        resellers: resellers.map(row => row.id),
        transactions: transactions.map(row => row.id),
    };
}

describe('P9-S3-I1 category backup/restore round-trip', () => {
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

    it('round-trips current schema7 categories, references and historical snapshots and checkpoints all business tables', async () => {
        await seedDataset(5, 15, 25, 35, 'Bronze');

        await exportData();
        expect(downloadedBlobs).toHaveLength(1);
        const exportedPreflight = preflightBackupText(await downloadedBlobs[0].text());
        expect(exportedPreflight.preview.counts).toMatchObject({
            categories: 1,
            subcategories: 0,
            unclassifiedItems: 0,
            legacyOrdersWithoutCategory: 0,
        });

        await clearDatabase();
        await seedDataset(9, 19, 29, 39, 'Porcelana atual antes do restore');

        const result = await restorePreflightedBackup(exportedPreflight);
        expect(result.status).toBe('success');
        if (result.status !== 'success') return;

        expect(result.checkpointFilename).toMatch(/^easy-checkpoint-v2-/);
        expect(downloadedBlobs).toHaveLength(2);

        const checkpoint = JSON.parse(await downloadedBlobs[1].text()) as {
            source: { schemaVersion: number };
            data: { categories: Array<{ id: number; name: string }>; subcategories: unknown[] };
        };
        expect(checkpoint.source.schemaVersion).toBe(BACKUP_SCHEMA_VERSION);
        expect(checkpoint.data.subcategories).toEqual([]);
        expect(checkpoint.data.categories).toEqual([
            expect.objectContaining({ id: 9, name: 'Porcelana atual antes do restore' }),
        ]);

        const category = await db.categories.get(5);
        const item = await db.items.get(15);
        const order = await db.transactions.get(35);
        expect(category).toMatchObject({ id: 5, name: 'Bronze', isActive: true });
        expect(item).toMatchObject({ id: 15, categoryId: 5 });
        expect(order).toMatchObject({
            id: 35,
            itemId: 15,
            categoryId: 5,
            categoryName: 'Bronze histórico',
        });
        expect(order?.occurredAt).toEqual(occurredAt);
        expect(await db.categories.get(9)).toBeUndefined();
    });

    it('restores a supported v2/schema4 backup with no invented category data', async () => {
        await seedDataset(5, 15, 25, 35, 'Estado atual');

        const preflight = preflightBackupPayload({
            format: 'easy-backup',
            version: 2,
            exportedAt: '2026-08-18T18:00:00.000Z',
            source: { database: 'ResellerManagerDB', schemaVersion: 4 },
            data: {
                items: [{
                    id: 101,
                    name: 'Item schema4',
                    basePrice: 20,
                    isActive: true,
                    createdAt: '2026-01-01T12:00:00.000Z',
                    updatedAt: '2026-01-01T12:00:00.000Z',
                }],
                resellers: [{
                    id: 201,
                    name: 'Revendedor schema4',
                    isActive: true,
                    createdAt: '2026-01-01T12:00:00.000Z',
                    updatedAt: '2026-01-01T12:00:00.000Z',
                }],
                transactions: [{
                    id: 301,
                    resellerId: 201,
                    type: 'order',
                    itemId: 101,
                    itemName: 'Item schema4',
                    quantity: 1,
                    unitPrice: 20,
                    totalPrice: 20,
                    occurredAt: '2026-07-01T12:00:00.000Z',
                    createdAt: '2026-08-01T12:00:00.000Z',
                }],
            },
        });

        const result = await restorePreflightedBackup(preflight);
        expect(result.status).toBe('success');
        expect(await db.categories.count()).toBe(0);
        expect(await db.subcategories.count()).toBe(0);
        expect((await db.items.get(101))?.categoryId).toBeUndefined();
        expect((await db.transactions.get(301))?.categoryId).toBeUndefined();
        expect((await db.transactions.get(301))?.categoryName).toBeUndefined();
    });

    it('rolls back categories together with the other business tables when a restore write fails', async () => {
        await seedDataset(5, 15, 25, 35, 'Original');
        const before = await snapshotIds();

        const target = preflightBackupPayload({
            format: 'easy-backup',
            version: 2,
            exportedAt: '2026-08-18T18:00:00.000Z',
            source: { database: 'ResellerManagerDB', schemaVersion: 5 },
            data: {
                categories: [{
                    id: 7,
                    name: 'Alvo',
                    isActive: true,
                    createdAt: '2026-01-01T12:00:00.000Z',
                    updatedAt: '2026-01-01T12:00:00.000Z',
                }],
                items: [{
                    id: 17,
                    name: 'Item alvo',
                    basePrice: 40,
                    isActive: true,
                    categoryId: 7,
                    createdAt: '2026-01-01T12:00:00.000Z',
                    updatedAt: '2026-01-01T12:00:00.000Z',
                }],
                resellers: [{
                    id: 27,
                    name: 'Revendedor alvo',
                    isActive: true,
                    createdAt: '2026-01-01T12:00:00.000Z',
                    updatedAt: '2026-01-01T12:00:00.000Z',
                }],
                transactions: [{
                    id: 37,
                    resellerId: 27,
                    type: 'order',
                    itemId: 17,
                    itemName: 'Item alvo',
                    quantity: 1,
                    unitPrice: 40,
                    categoryId: 7,
                    categoryName: 'Alvo',
                    totalPrice: 40,
                    occurredAt: '2026-07-01T12:00:00.000Z',
                    createdAt: '2026-08-01T12:00:00.000Z',
                }],
            },
        });

        const bulkAddSpy = vi.spyOn(db.transactions, 'bulkAdd').mockRejectedValueOnce(new Error('falha simulada'));
        const result = await restorePreflightedBackup(target);
        bulkAddSpy.mockRestore();

        expect(result).toMatchObject({ status: 'failure', previousDatabasePreserved: true });
        expect(await snapshotIds()).toEqual(before);
        expect((await db.categories.get(5))?.name).toBe('Original');
        expect(await db.categories.get(7)).toBeUndefined();
    });
});
