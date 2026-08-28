import { describe, expect, it } from 'vitest';
import { BACKUP_SCHEMA_VERSION, preflightBackupPayload } from './backupService';

const exportedAt = '2026-08-26T12:00:00.000Z';
const createdAt = '2026-08-01T12:00:00.000Z';

function baseData() {
    return {
        categories: [{
            id: 1,
            name: 'Porcelana',
            isActive: true,
            createdAt,
            updatedAt: createdAt,
        }],
        items: [{
            id: 1,
            name: 'Placa 3x8',
            basePrice: 50,
            isActive: true,
            categoryId: 1,
            createdAt,
            updatedAt: createdAt,
        }],
        resellers: [{
            id: 1,
            name: 'Revendedor teste',
            isActive: true,
            createdAt,
            updatedAt: createdAt,
        }],
        transactions: [],
    };
}

describe('Backup v2 subcategory schema', () => {
    it('accepts schema6, preserves historical subcategory snapshots and upgrades without inventing actors', () => {
        const data = baseData();
        const result = preflightBackupPayload({
            format: 'easy-backup',
            version: 2,
            exportedAt,
            source: { database: 'ResellerManagerDB', schemaVersion: 6 },
            data: {
                ...data,
                subcategories: [{
                    id: 10,
                    categoryId: 1,
                    name: 'Placas Premium',
                    isActive: true,
                    createdAt,
                    updatedAt: exportedAt,
                }],
                items: [{ ...data.items[0], subcategoryId: 10 }],
                transactions: [{
                    id: 1,
                    resellerId: 1,
                    type: 'order',
                    itemId: 1,
                    itemName: 'Placa 3x8',
                    quantity: 2,
                    unitPrice: 50,
                    categoryId: 1,
                    categoryName: 'Porcelana',
                    subcategoryId: 10,
                    subcategoryName: 'Placas',
                    totalPrice: 100,
                    occurredAt: exportedAt,
                    createdAt: exportedAt,
                }],
            },
        });

        expect(result.normalized.data.subcategories).toHaveLength(1);
        expect(result.normalized.data.items[0].subcategoryId).toBe(10);
        expect(result.normalized.data.transactions[0]).toMatchObject({
            subcategoryId: 10,
            subcategoryName: 'Placas',
        });
        expect(result.normalized.data.transactions[0].createdBy).toBeUndefined();
        expect(result.preview.schemaVersion).toBe(BACKUP_SCHEMA_VERSION);
        expect(result.preview.migrated).toBe(true);
        expect(result.preview.warnings.join(' ')).toContain('schema6 normalizado para schema7');
        expect(result.preview.warnings.join(' ')).toContain('autoria');
    });

    it('normalizes schema5 to schema7 without inventing subcategories or actors', () => {
        const data = baseData();
        const result = preflightBackupPayload({
            format: 'easy-backup',
            version: 2,
            exportedAt,
            source: { database: 'ResellerManagerDB', schemaVersion: 5 },
            data,
        });

        expect(result.normalized.data.subcategories).toEqual([]);
        expect(result.normalized.data.items[0].subcategoryId).toBeUndefined();
        expect(result.preview.schemaVersion).toBe(BACKUP_SCHEMA_VERSION);
        expect(result.preview.migrated).toBe(true);
        expect(result.preview.warnings.join(' ')).toContain('schema5');
        expect(result.preview.warnings.join(' ')).toContain('schema7');
    });
});
