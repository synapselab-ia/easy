import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { preflightBackupPayload, type BackupEnvelopeV2 } from './backupService';
import { fetchCloudDataset, restoreCloudBackup, type CloudDataset } from './cloudDataService';
import { restorePreflightedCloudBackup } from './cloudBackupService';

vi.mock('./cloudDataService', () => ({
    fetchCloudDataset: vi.fn(),
    restoreCloudBackup: vi.fn(),
}));

const NOW = '2026-08-21T12:00:00.000Z';

const emptyDataset: CloudDataset = {
    categories: [],
    items: [],
    resellers: [],
    transactions: [],
};

const targetEnvelope: BackupEnvelopeV2 = {
    format: 'easy-backup',
    version: 2,
    exportedAt: NOW,
    source: {
        database: 'ResellerManagerDB',
        schemaVersion: 5,
    },
    data: {
        categories: [{
            id: 1,
            name: 'Categoria',
            isActive: true,
            createdAt: NOW,
            updatedAt: NOW,
        }],
        items: [{
            id: 1,
            name: 'Produto',
            basePrice: 10,
            isActive: true,
            categoryId: 1,
            createdAt: NOW,
            updatedAt: NOW,
        }],
        resellers: [{
            id: 1,
            name: 'Revendedor',
            isActive: true,
            createdAt: NOW,
            updatedAt: NOW,
        }],
        transactions: [{
            id: 1,
            resellerId: 1,
            type: 'order',
            itemId: 1,
            itemName: 'Produto',
            quantity: 1,
            unitPrice: 10,
            categoryId: 1,
            categoryName: 'Categoria',
            totalPrice: 10,
            occurredAt: NOW,
            createdAt: NOW,
        }],
    },
};

const preflight = preflightBackupPayload(targetEnvelope);
const targetDataset = preflight.normalized.data;

beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(URL, 'createObjectURL', {
        configurable: true,
        writable: true,
        value: vi.fn(() => 'blob:checkpoint'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
        configurable: true,
        writable: true,
        value: vi.fn(),
    });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('cloud backup restore safety', () => {
    it('reports the previous database as preserved when the atomic server restore rejects', async () => {
        vi.mocked(fetchCloudDataset).mockResolvedValueOnce(emptyDataset);
        vi.mocked(restoreCloudBackup).mockRejectedValueOnce(new Error('restore rejected'));

        const result = await restorePreflightedCloudBackup(preflight);

        expect(result).toMatchObject({
            status: 'failure',
            previousDatabasePreserved: true,
            restoreApplied: false,
            message: 'restore rejected',
        });
        expect(result.checkpointFilename).toMatch(/^easy-checkpoint-v2-/);
    });

    it('does not claim the previous database was preserved when post-restore verification fails', async () => {
        vi.mocked(fetchCloudDataset)
            .mockResolvedValueOnce(emptyDataset)
            .mockResolvedValueOnce(emptyDataset);
        vi.mocked(restoreCloudBackup).mockResolvedValueOnce({ categories: 1, items: 1, resellers: 1, transactions: 1 });

        const result = await restorePreflightedCloudBackup(preflight);

        expect(result).toMatchObject({
            status: 'failure',
            previousDatabasePreserved: false,
            restoreApplied: true,
        });
        expect(result.message).toContain('verificação pós-restauração');
        expect(result.checkpointFilename).toMatch(/^easy-checkpoint-v2-/);
    });

    it('accepts the restore only after the canonical cloud dataset matches exactly', async () => {
        vi.mocked(fetchCloudDataset)
            .mockResolvedValueOnce(emptyDataset)
            .mockResolvedValueOnce(targetDataset);
        vi.mocked(restoreCloudBackup).mockResolvedValueOnce({ categories: 1, items: 1, resellers: 1, transactions: 1 });

        const result = await restorePreflightedCloudBackup(preflight);

        expect(result).toMatchObject({
            status: 'success',
        });
        expect(restoreCloudBackup).toHaveBeenCalledOnce();
        expect(fetchCloudDataset).toHaveBeenCalledTimes(2);
    });
});
