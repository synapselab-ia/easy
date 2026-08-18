import { describe, expect, it } from 'vitest';
import {
    BACKUP_FORMAT,
    BACKUP_VERSION,
    preflightBackupPayload,
} from './backupService';

const exportedAt = '2026-08-18T18:00:00.000Z';
const entityCreatedAt = '2026-01-01T12:00:00.000Z';
const entityUpdatedAt = '2026-01-02T12:00:00.000Z';
const occurredAt = '2026-08-10T12:00:00.000Z';
const createdAt = '2026-08-17T16:00:00.000Z';

function schema5Payload() {
    return {
        format: BACKUP_FORMAT,
        version: BACKUP_VERSION,
        exportedAt,
        source: { database: 'ResellerManagerDB', schemaVersion: 5 },
        data: {
            categories: [{
                id: 7,
                name: 'Bronze',
                isActive: true,
                createdAt: entityCreatedAt,
                updatedAt: entityUpdatedAt,
            }],
            items: [{
                id: 1,
                name: 'Item classificado',
                basePrice: 25,
                isActive: true,
                categoryId: 7,
                createdAt: entityCreatedAt,
                updatedAt: entityUpdatedAt,
            }],
            resellers: [{
                id: 2,
                name: 'Revendedor',
                isActive: true,
                createdAt: entityCreatedAt,
                updatedAt: entityUpdatedAt,
            }],
            transactions: [{
                id: 3,
                resellerId: 2,
                type: 'order',
                itemId: 1,
                itemName: 'Item classificado',
                quantity: 2,
                unitPrice: 25,
                categoryId: 7,
                categoryName: 'Bronze original',
                totalPrice: 50,
                occurredAt,
                createdAt,
            }],
        },
    };
}

describe('P9-S3-I1 category-aware backup preflight', () => {
    it('normalizes an existing v2/schema4 backup into the V5 logical target without inventing categories', () => {
        const result = preflightBackupPayload({
            format: BACKUP_FORMAT,
            version: BACKUP_VERSION,
            exportedAt,
            source: { database: 'ResellerManagerDB', schemaVersion: 4 },
            data: {
                items: [{
                    id: 1,
                    name: 'Item legado schema4',
                    basePrice: 25,
                    isActive: true,
                    createdAt: entityCreatedAt,
                    updatedAt: entityUpdatedAt,
                }],
                resellers: [{
                    id: 2,
                    name: 'Revendedor legado',
                    isActive: true,
                    createdAt: entityCreatedAt,
                    updatedAt: entityUpdatedAt,
                }],
                transactions: [{
                    id: 3,
                    resellerId: 2,
                    type: 'order',
                    itemId: 1,
                    itemName: 'Item legado schema4',
                    quantity: 1,
                    unitPrice: 25,
                    totalPrice: 25,
                    occurredAt,
                    createdAt,
                }],
            },
        });

        expect(result.preview).toMatchObject({
            sourceVersion: 2,
            sourceSchemaVersion: 4,
            targetVersion: 2,
            schemaVersion: 5,
            migrated: true,
            counts: {
                categories: 0,
                unclassifiedItems: 1,
                legacyOrdersWithoutCategory: 1,
            },
        });
        expect(result.normalized.data.categories).toEqual([]);
        expect(result.normalized.data.items[0].categoryId).toBeUndefined();
        expect(result.normalized.data.transactions[0].categoryId).toBeUndefined();
        expect(result.normalized.data.transactions[0].categoryName).toBeUndefined();
        expect(result.preview.warnings.join(' ')).toMatch(/schema4 normalizado para schema5/);
    });

    it('accepts a valid schema5 category graph and preserves transaction-time category label', () => {
        const result = preflightBackupPayload(schema5Payload());

        expect(result.preview).toMatchObject({
            sourceSchemaVersion: 5,
            schemaVersion: 5,
            migrated: false,
            counts: {
                categories: 1,
                activeCategories: 1,
                inactiveCategories: 0,
                unclassifiedItems: 0,
                legacyOrdersWithoutCategory: 0,
            },
        });
        expect(result.normalized.data.categories[0]).toMatchObject({ id: 7, name: 'Bronze', isActive: true });
        expect(result.normalized.data.items[0].categoryId).toBe(7);
        expect(result.normalized.data.transactions[0]).toMatchObject({
            categoryId: 7,
            categoryName: 'Bronze original',
        });
    });

    it('rejects duplicate logical category names case-insensitively', () => {
        const payload = schema5Payload();
        payload.data.categories.push({
            id: 8,
            name: 'bronze',
            isActive: false,
            createdAt: entityCreatedAt,
            updatedAt: entityUpdatedAt,
        });

        expect(() => preflightBackupPayload(payload)).toThrow(/duplica o nome lógico/);
    });

    it('rejects missing category references and active-item to archived-category references', () => {
        const missing = schema5Payload();
        missing.data.items[0].categoryId = 999;
        expect(() => preflightBackupPayload(missing)).toThrow(/categoria inexistente 999/);

        const archived = schema5Payload();
        archived.data.categories[0].isActive = false;
        expect(() => preflightBackupPayload(archived)).toThrow(/item ativo não pode referenciar categoria inativa/);
    });

    it('allows an inactive item to retain an archived category reference', () => {
        const payload = schema5Payload();
        payload.data.categories[0].isActive = false;
        payload.data.items[0].isActive = false;

        const result = preflightBackupPayload(payload);
        expect(result.normalized.data.items[0]).toMatchObject({ isActive: false, categoryId: 7 });
        expect(result.normalized.data.categories[0].isActive).toBe(false);
    });

    it('requires order category snapshot fields as a pair', () => {
        const payload = schema5Payload();
        delete (payload.data.transactions[0] as { categoryName?: string }).categoryName;

        expect(() => preflightBackupPayload(payload)).toThrow(/categoryId e categoryName devem ser informados juntos/);
    });

    it('rejects category fields on reseller-level payment or signal movements', () => {
        const payload = schema5Payload();
        payload.data.transactions = [{
            id: 3,
            resellerId: 2,
            type: 'payment',
            categoryId: 7,
            categoryName: 'Bronze',
            totalPrice: 50,
            occurredAt,
            createdAt,
        }];

        expect(() => preflightBackupPayload(payload)).toThrow(/pagamentos\/sinais não podem conter campos de categoria/);
    });

    it('rejects a linked order correction that rewrites the historical category snapshot', () => {
        const payload = schema5Payload();
        payload.data.transactions = [
            {
                id: 10,
                resellerId: 2,
                type: 'order',
                itemId: 1,
                itemName: 'Item classificado',
                quantity: 2,
                unitPrice: 25,
                categoryId: 7,
                categoryName: 'Bronze original',
                totalPrice: 50,
                occurredAt,
                createdAt: '2026-08-17T15:00:00.000Z',
                reversal: {
                    reason: 'Quantidade incorreta',
                    reversedAt: '2026-08-17T16:00:00.000Z',
                    replacementTransactionId: 11,
                },
            },
            {
                id: 11,
                resellerId: 2,
                type: 'order',
                itemId: 1,
                itemName: 'Item classificado',
                quantity: 1,
                unitPrice: 25,
                categoryId: 7,
                categoryName: 'Bronze renomeado',
                totalPrice: 25,
                occurredAt,
                createdAt: '2026-08-17T16:00:00.000Z',
                correction: { replacesTransactionId: 10 },
            },
        ];

        expect(() => preflightBackupPayload(payload)).toThrow(/preservar o snapshot de categoria original/);
    });
});
