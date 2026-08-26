import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    BACKUP_FORMAT,
    BACKUP_SCHEMA_VERSION,
    BACKUP_VERSION,
    exportData,
    preflightBackupPayload,
} from './backupService';
import { db, type Category, type Item, type Reseller, type Transaction } from '../db/database';

vi.mock('../db/database', () => ({
    db: {
        categories: { toArray: vi.fn() },
        subcategories: { toArray: vi.fn() },
        items: { toArray: vi.fn() },
        resellers: { toArray: vi.fn() },
        transactions: { toArray: vi.fn() },
    },
}));

const mockClick = vi.fn();
const mockCreateObjectURL = vi.fn().mockReturnValue('blob:p10-s1');
const mockRevokeObjectURL = vi.fn();

vi.stubGlobal('URL', {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
});

vi.stubGlobal('document', {
    createElement: vi.fn().mockReturnValue({ click: mockClick, href: '', download: '' }),
});

const entityCreatedAt = '2026-01-01T12:00:00.000Z';
const entityUpdatedAt = '2026-01-02T12:00:00.000Z';
const originalCreatedAt = '2026-08-17T15:00:00.000Z';
const replacementCreatedAt = '2026-08-17T16:00:00.000Z';
const originalOccurredAt = '2026-08-10T12:00:00.000Z';
const replacementOccurredAt = '2026-08-12T12:00:00.000Z';

const categories = [
    {
        id: 1,
        name: 'Categoria A',
        isActive: true,
        createdAt: entityCreatedAt,
        updatedAt: entityUpdatedAt,
    },
    {
        id: 2,
        name: 'Categoria B',
        isActive: true,
        createdAt: entityCreatedAt,
        updatedAt: entityUpdatedAt,
    },
];

const items = [
    {
        id: 1,
        name: 'Item A',
        basePrice: 25,
        isActive: true,
        categoryId: 1,
        createdAt: entityCreatedAt,
        updatedAt: entityUpdatedAt,
    },
    {
        id: 2,
        name: 'Item B',
        basePrice: 40,
        isActive: true,
        categoryId: 2,
        createdAt: entityCreatedAt,
        updatedAt: entityUpdatedAt,
    },
];

const resellers = [{
    id: 1,
    name: 'Revendedor 1',
    isActive: true,
    createdAt: entityCreatedAt,
    updatedAt: entityUpdatedAt,
}];

function envelope(transactions: unknown[]) {
    return {
        format: BACKUP_FORMAT,
        version: BACKUP_VERSION,
        exportedAt: '2026-08-19T18:00:00.000Z',
        source: {
            database: 'ResellerManagerDB',
            schemaVersion: BACKUP_SCHEMA_VERSION,
        },
        data: { categories, subcategories: [], items, resellers, transactions },
    };
}

function originalOrder(replacementTransactionId: number) {
    return {
        id: 10,
        resellerId: 1,
        type: 'order',
        itemId: 1,
        itemName: 'Item A',
        quantity: 2,
        unitPrice: 25,
        categoryId: 1,
        categoryName: 'Categoria A',
        totalPrice: 50,
        occurredAt: originalOccurredAt,
        createdAt: originalCreatedAt,
        reversal: {
            reason: 'Correção completa',
            reversedAt: replacementCreatedAt,
            replacementTransactionId,
        },
    };
}

describe('P10-S1-I1 backup compatibility with D-026', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('accepts a linked replacement that changes transaction type and occurredAt', () => {
        const payload = envelope([
            originalOrder(11),
            {
                id: 11,
                resellerId: 1,
                type: 'payment',
                totalPrice: 50,
                occurredAt: replacementOccurredAt,
                createdAt: replacementCreatedAt,
                correction: { replacesTransactionId: 10 },
            },
        ]);

        const result = preflightBackupPayload(payload);

        expect(result.preview.counts.reversedTransactions).toBe(1);
        expect(result.preview.counts.correctionTransactions).toBe(1);
        expect(result.normalized.data.transactions[1]).toMatchObject({
            type: 'payment',
            correction: { replacesTransactionId: 10 },
            occurredAt: new Date(replacementOccurredAt),
        });
    });

    it('accepts a linked order replacement with a different item and category snapshot', () => {
        const payload = envelope([
            originalOrder(11),
            {
                id: 11,
                resellerId: 1,
                type: 'order',
                itemId: 2,
                itemName: 'Item B',
                quantity: 3,
                unitPrice: 40,
                categoryId: 2,
                categoryName: 'Categoria B',
                totalPrice: 120,
                occurredAt: replacementOccurredAt,
                createdAt: replacementCreatedAt,
                correction: { replacesTransactionId: 10 },
            },
        ]);

        const result = preflightBackupPayload(payload);

        expect(result.normalized.data.transactions[1]).toMatchObject({
            type: 'order',
            itemId: 2,
            itemName: 'Item B',
            categoryId: 2,
            categoryName: 'Categoria B',
            occurredAt: new Date(replacementOccurredAt),
        });
    });

    it('still rejects a broken bidirectional correction link', () => {
        const payload = envelope([
            originalOrder(11),
            {
                id: 11,
                resellerId: 1,
                type: 'payment',
                totalPrice: 50,
                occurredAt: replacementOccurredAt,
                createdAt: replacementCreatedAt,
            },
        ]);

        expect(() => preflightBackupPayload(payload)).toThrow(/vínculo de correção bidirecional/);
    });

    it('still rejects a replacement whose own target shape is invalid', () => {
        const payload = envelope([
            originalOrder(11),
            {
                id: 11,
                resellerId: 1,
                type: 'payment',
                itemId: 2,
                itemName: 'Item B',
                quantity: 1,
                unitPrice: 40,
                totalPrice: 40,
                occurredAt: replacementOccurredAt,
                createdAt: replacementCreatedAt,
                correction: { replacesTransactionId: 10 },
            },
        ]);

        expect(() => preflightBackupPayload(payload)).toThrow(/pagamentos\/sinais não podem conter campos de item\/pedido/);
    });

    it('exports and self-preflights a persisted D-026 order replacement with changed item/date', async () => {
        const persistedCategories: Category[] = categories.map(category => ({
            ...category,
            createdAt: new Date(category.createdAt),
            updatedAt: new Date(category.updatedAt),
        }));
        const persistedItems: Item[] = items.map(item => ({
            ...item,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
        }));
        const persistedResellers: Reseller[] = resellers.map(reseller => ({
            ...reseller,
            createdAt: new Date(reseller.createdAt),
            updatedAt: new Date(reseller.updatedAt),
        }));
        const persistedTransactions: Transaction[] = [
            {
                ...originalOrder(11),
                type: 'order',
                occurredAt: new Date(originalOccurredAt),
                createdAt: new Date(originalCreatedAt),
            },
            {
                id: 11,
                resellerId: 1,
                type: 'order',
                itemId: 2,
                itemName: 'Item B',
                quantity: 3,
                unitPrice: 40,
                categoryId: 2,
                categoryName: 'Categoria B',
                totalPrice: 120,
                occurredAt: new Date(replacementOccurredAt),
                createdAt: new Date(replacementCreatedAt),
                correction: { replacesTransactionId: 10 },
            },
        ];

        vi.mocked(db.categories.toArray).mockResolvedValue(persistedCategories);
        vi.mocked(db.subcategories.toArray).mockResolvedValue([]);
        vi.mocked(db.items.toArray).mockResolvedValue(persistedItems);
        vi.mocked(db.resellers.toArray).mockResolvedValue(persistedResellers);
        vi.mocked(db.transactions.toArray).mockResolvedValue(persistedTransactions);

        await exportData();

        expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
        expect(mockClick).toHaveBeenCalledTimes(1);
        expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:p10-s1');
    });
});
