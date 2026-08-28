import { describe, expect, it } from 'vitest';
import { BACKUP_SCHEMA_VERSION, preflightBackupPayload } from './backupService';

const createdBy = {
    userId: '11111111-1111-4111-8111-111111111111',
    email: 'ana@easy.local',
};
const reversedBy = {
    userId: '22222222-2222-4222-8222-222222222222',
    email: 'bruno@easy.local',
};

function payload(schemaVersion: number, includeActors: boolean) {
    return {
        format: 'easy-backup',
        version: 2,
        exportedAt: '2026-08-28T14:00:00.000Z',
        source: {
            database: 'ResellerManagerDB',
            schemaVersion,
        },
        data: {
            categories: [],
            subcategories: [],
            items: [],
            resellers: [
                {
                    id: 1,
                    name: 'Revendedor Teste',
                    isActive: true,
                    createdAt: '2026-08-01T12:00:00.000Z',
                    updatedAt: '2026-08-01T12:00:00.000Z',
                },
            ],
            transactions: [
                {
                    id: 10,
                    resellerId: 1,
                    type: 'payment',
                    totalPrice: 100,
                    ...(includeActors ? { createdBy } : {}),
                    reversal: {
                        reason: 'Pagamento duplicado',
                        reversedAt: '2026-08-28T13:30:00.000Z',
                        ...(includeActors ? { reversedBy } : {}),
                    },
                    occurredAt: '2026-08-28T12:00:00.000Z',
                    createdAt: '2026-08-28T13:00:00.000Z',
                },
            ],
        },
    };
}

describe('Backup v2 transaction actor attribution', () => {
    it('preserves creation and reversal actors in schema 7', () => {
        expect(BACKUP_SCHEMA_VERSION).toBe(7);

        const result = preflightBackupPayload(payload(7, true));
        const transaction = result.normalized.data.transactions[0];

        expect(result.preview.schemaVersion).toBe(7);
        expect(result.preview.migrated).toBe(false);
        expect(transaction.createdBy).toEqual(createdBy);
        expect(transaction.reversal?.reversedBy).toEqual(reversedBy);
    });

    it('continues accepting schema 6 without inventing historical actors', () => {
        const result = preflightBackupPayload(payload(6, false));
        const transaction = result.normalized.data.transactions[0];

        expect(result.preview.schemaVersion).toBe(7);
        expect(result.preview.migrated).toBe(true);
        expect(transaction.createdBy).toBeUndefined();
        expect(transaction.reversal?.reversedBy).toBeUndefined();
        expect(result.preview.warnings.some(warning => warning.includes('autoria'))).toBe(true);
    });

    it('rejects malformed actor identity in schema 7', () => {
        const invalid = payload(7, true);
        invalid.data.transactions[0].createdBy = {
            userId: 'not-a-uuid',
            email: 'ana@easy.local',
        };

        expect(() => preflightBackupPayload(invalid)).toThrow(/UUID válido/i);
    });
});
