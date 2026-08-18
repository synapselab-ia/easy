import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    BACKUP_FORMAT,
    BACKUP_SCHEMA_VERSION,
    BACKUP_VERSION,
    BackupValidationError,
    exportData,
    preflightBackupPayload,
    preflightBackupText,
} from './backupService';
import { db } from '../db/database';

vi.mock('../db/database', () => ({
    db: {
        categories: { toArray: vi.fn(), clear: vi.fn(), bulkAdd: vi.fn() },
        items: { toArray: vi.fn(), clear: vi.fn(), bulkAdd: vi.fn() },
        resellers: { toArray: vi.fn(), clear: vi.fn(), bulkAdd: vi.fn() },
        transactions: { toArray: vi.fn(), clear: vi.fn(), bulkAdd: vi.fn() },
        transaction: vi.fn(),
    },
}));

const mockClick = vi.fn();
const mockCreateObjectURL = vi.fn().mockReturnValue('blob:url');
const mockRevokeObjectURL = vi.fn();

vi.stubGlobal('URL', {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
});

vi.stubGlobal('document', {
    createElement: vi.fn().mockReturnValue({ click: mockClick, href: '', download: '' }),
});

const exportedAt = '2026-08-17T18:00:00.000Z';
const entityCreatedAt = '2026-01-01T12:00:00.000Z';
const entityUpdatedAt = '2026-01-02T12:00:00.000Z';
const transactionCreatedAt = '2026-08-17T16:00:00.000Z';
const transactionOccurredAt = '2026-08-10T12:00:00.000Z';

function validV2Payload() {
    return {
        format: BACKUP_FORMAT,
        version: BACKUP_VERSION,
        exportedAt,
        source: {
            database: 'ResellerManagerDB',
            schemaVersion: BACKUP_SCHEMA_VERSION,
        },
        data: {
            categories: [],
            items: [{
                id: 1,
                name: 'Item 1',
                basePrice: 25,
                isActive: true,
                createdAt: entityCreatedAt,
                updatedAt: entityUpdatedAt,
            }],
            resellers: [{
                id: 1,
                name: 'Revendedor 1',
                phone: '',
                email: '',
                notes: '',
                isActive: true,
                createdAt: entityCreatedAt,
                updatedAt: entityUpdatedAt,
            }],
            transactions: [{
                id: 1,
                resellerId: 1,
                type: 'order',
                itemId: 1,
                itemName: 'Item 1',
                quantity: 2,
                unitPrice: 25,
                totalPrice: 50,
                observation: 'Pedido',
                occurredAt: transactionOccurredAt,
                createdAt: transactionCreatedAt,
            }],
        },
    };
}

describe('P5-S1 backup contract', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('accepts the current v2 envelope and returns a non-destructive preview', () => {
        const result = preflightBackupPayload(validV2Payload());

        expect(result.preview).toMatchObject({
            sourceVersion: 2,
            sourceSchemaVersion: 5,
            targetVersion: 2,
            schemaVersion: 5,
            migrated: false,
            counts: {
                categories: 0,
                unclassifiedItems: 1,
                legacyOrdersWithoutCategory: 1,
                items: 1,
                resellers: 1,
                transactions: 1,
                orders: 1,
            },
        });
        expect(result.normalized.data.transactions[0].occurredAt).toEqual(new Date(transactionOccurredAt));
        expect(db.transaction).not.toHaveBeenCalled();
        expect(db.categories.clear).not.toHaveBeenCalled();
        expect(db.items.clear).not.toHaveBeenCalled();
        expect(db.resellers.clear).not.toHaveBeenCalled();
        expect(db.transactions.clear).not.toHaveBeenCalled();
        expect(db.items.bulkAdd).not.toHaveBeenCalled();
    });

    it('migrates legacy v1 lifecycle and occurrence defaults in memory', () => {
        const legacy = {
            version: 1,
            exportedAt,
            data: {
                items: [{
                    id: 1,
                    name: 'Legado',
                    basePrice: 10,
                    createdAt: entityCreatedAt,
                    updatedAt: entityUpdatedAt,
                }],
                resellers: [{
                    id: 1,
                    name: 'Revendedor legado',
                    createdAt: entityCreatedAt,
                    updatedAt: entityUpdatedAt,
                }],
                transactions: [{
                    id: 1,
                    resellerId: 1,
                    type: 'payment',
                    totalPrice: 10,
                    createdAt: transactionCreatedAt,
                }],
            },
        };

        const result = preflightBackupPayload(legacy);

        expect(result.preview.sourceVersion).toBe(1);
        expect(result.preview.schemaVersion).toBe(5);
        expect(result.preview.migrated).toBe(true);
        expect(result.preview.warnings.length).toBeGreaterThanOrEqual(4);
        expect(result.normalized.data.categories).toEqual([]);
        expect(result.normalized.data.items[0].isActive).toBe(true);
        expect(result.normalized.data.resellers[0].isActive).toBe(true);
        expect(result.normalized.data.transactions[0].occurredAt).toEqual(new Date(transactionCreatedAt));
        expect(db.transaction).not.toHaveBeenCalled();
    });

    it('rejects invalid JSON before touching the database', () => {
        expect(() => preflightBackupText('{not-json')).toThrow(BackupValidationError);
        expect(db.transaction).not.toHaveBeenCalled();
        expect(db.transactions.clear).not.toHaveBeenCalled();
    });

    it('rejects duplicate IDs', () => {
        const payload = validV2Payload();
        payload.data.items.push({ ...payload.data.items[0], name: 'Duplicado' });

        expect(() => preflightBackupPayload(payload)).toThrow(/ID duplicado 1/);
    });

    it('rejects missing reseller and item references', () => {
        const payload = validV2Payload();
        payload.data.transactions[0].resellerId = 99;
        payload.data.transactions[0].itemId = 88;

        expect(() => preflightBackupPayload(payload)).toThrow(/revendedor inexistente 99/);
        expect(() => preflightBackupPayload(payload)).toThrow(/item inexistente 88/);
    });

    it('rejects invalid dates and financial numbers', () => {
        const payload = validV2Payload();
        payload.data.items[0].basePrice = 0;
        payload.data.transactions[0].totalPrice = Number.NaN;
        payload.data.transactions[0].createdAt = 'not-a-date';

        expect(() => preflightBackupPayload(payload)).toThrow(/maior que zero/);
        expect(() => preflightBackupPayload(payload)).toThrow(/data inválida/);
    });

    it('accepts a valid P2 correction pair and preserves audit metadata', () => {
        const payload = validV2Payload();
        payload.data.transactions = [
            {
                id: 10,
                resellerId: 1,
                type: 'payment',
                totalPrice: 20,
                occurredAt: transactionOccurredAt,
                createdAt: '2026-08-17T15:00:00.000Z',
                reversal: {
                    reason: 'Valor incorreto',
                    reversedAt: '2026-08-17T16:00:00.000Z',
                    replacementTransactionId: 11,
                },
            },
            {
                id: 11,
                resellerId: 1,
                type: 'payment',
                totalPrice: 25,
                occurredAt: transactionOccurredAt,
                createdAt: '2026-08-17T16:00:00.000Z',
                correction: { replacesTransactionId: 10 },
            },
        ];

        const result = preflightBackupPayload(payload);
        expect(result.preview.counts.reversedTransactions).toBe(1);
        expect(result.preview.counts.correctionTransactions).toBe(1);
        expect(result.normalized.data.transactions[0].reversal).toMatchObject({
            reason: 'Valor incorreto',
            replacementTransactionId: 11,
        });
    });

    it('rejects broken P2 correction linkage', () => {
        const payload = validV2Payload();
        payload.data.transactions = [{
            id: 11,
            resellerId: 1,
            type: 'payment',
            totalPrice: 25,
            occurredAt: transactionOccurredAt,
            createdAt: transactionCreatedAt,
            correction: { replacesTransactionId: 999 },
        }];

        expect(() => preflightBackupPayload(payload)).toThrow(/lançamento inexistente 999/);
    });

    it('exports the current database through the versioned v2/schema5 contract', async () => {
        (db.categories.toArray as any).mockResolvedValue([]);
        (db.items.toArray as any).mockResolvedValue([{
            id: 1,
            name: 'Item 1',
            basePrice: 25,
            isActive: true,
            createdAt: new Date(entityCreatedAt),
            updatedAt: new Date(entityUpdatedAt),
        }]);
        (db.resellers.toArray as any).mockResolvedValue([{
            id: 1,
            name: 'Revendedor 1',
            isActive: true,
            createdAt: new Date(entityCreatedAt),
            updatedAt: new Date(entityUpdatedAt),
        }]);
        (db.transactions.toArray as any).mockResolvedValue([{
            id: 1,
            resellerId: 1,
            type: 'order',
            itemId: 1,
            itemName: 'Item 1',
            quantity: 2,
            unitPrice: 25,
            totalPrice: 50,
            occurredAt: new Date(transactionOccurredAt),
            createdAt: new Date(transactionCreatedAt),
        }]);

        await exportData();

        expect(db.categories.toArray).toHaveBeenCalled();
        expect(db.items.toArray).toHaveBeenCalled();
        expect(db.resellers.toArray).toHaveBeenCalled();
        expect(db.transactions.toArray).toHaveBeenCalled();
        expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
        expect(mockClick).toHaveBeenCalledTimes(1);
        expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:url');
    });
});
