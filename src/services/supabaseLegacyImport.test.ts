import { describe, expect, it } from 'vitest';
import { buildLegacyV1StagingPayload } from './supabaseLegacyImport';

const createdA = '2026-08-01T12:00:00.000Z';
const updatedA = '2026-08-02T12:00:00.000Z';
const createdB = '2026-08-03T15:30:00.000Z';

function stableV1Fixture() {
    return {
        version: 1,
        exportedAt: '2026-08-20T12:00:00.000Z',
        data: {
            items: [
                { id: 10, name: 'Synthetic Item A', basePrice: 12.5, createdAt: createdA, updatedAt: updatedA },
                { id: 25, name: 'Synthetic Item B', basePrice: 0.1 + 0.2, createdAt: createdA, updatedAt: updatedA },
            ],
            resellers: [
                { id: 7, name: 'Synthetic Reseller A', phone: '0000', createdAt: createdA, updatedAt: updatedA },
                { id: 42, name: 'Synthetic Reseller B', createdAt: createdA, updatedAt: updatedA },
            ],
            transactions: [
                {
                    id: 100,
                    resellerId: 7,
                    type: 'order',
                    itemId: 10,
                    itemName: 'Synthetic Item A',
                    quantity: 2,
                    unitPrice: 12.5,
                    totalPrice: 25,
                    observation: 'synthetic order',
                    createdAt: createdA,
                },
                {
                    id: 250,
                    resellerId: 7,
                    type: 'payment',
                    totalPrice: 5.25,
                    createdAt: createdB,
                },
                {
                    id: 900,
                    resellerId: 42,
                    type: 'signal',
                    totalPrice: 7.5,
                    createdAt: createdB,
                },
            ],
        },
    };
}

describe('P10-S3-I2-I1 stable-v1 staging adapter', () => {
    it('reuses accepted v1 normalization while preserving IDs/timestamps and emitting exact cents', () => {
        const result = buildLegacyV1StagingPayload(stableV1Fixture());

        expect(result).toMatchObject({
            sourceVersion: 1,
            exportedAt: '2026-08-20T12:00:00.000Z',
        });
        expect(result.items).toEqual([
            {
                id: 10,
                name: 'Synthetic Item A',
                basePriceCents: 1250,
                isActive: true,
                categoryId: null,
                createdAt: createdA,
                updatedAt: updatedA,
            },
            {
                id: 25,
                name: 'Synthetic Item B',
                basePriceCents: 30,
                isActive: true,
                categoryId: null,
                createdAt: createdA,
                updatedAt: updatedA,
            },
        ]);
        expect(result.resellers[1]).toEqual({
            id: 42,
            name: 'Synthetic Reseller B',
            phone: null,
            email: null,
            notes: null,
            isActive: true,
            createdAt: createdA,
            updatedAt: updatedA,
        });
        expect(result.transactions[0]).toMatchObject({
            id: 100,
            resellerId: 7,
            itemId: 10,
            quantity: 2,
            unitPriceCents: 1250,
            totalPriceCents: 2500,
            categoryId: null,
            categoryName: null,
            reversal: null,
            correction: null,
            occurredAt: createdA,
            createdAt: createdA,
        });
        expect(result.transactions[1]).toMatchObject({
            id: 250,
            type: 'payment',
            itemId: null,
            itemName: null,
            quantity: null,
            unitPriceCents: null,
            totalPriceCents: 525,
            occurredAt: createdB,
            createdAt: createdB,
        });
    });

    it('rejects fields outside the exact historical stable-v1 surface', () => {
        const payload = stableV1Fixture();
        Object.assign(payload.data.items[0], { categoryId: 123 });

        expect(() => buildLegacyV1StagingPayload(payload)).toThrow(/campo não pertence ao backup estável v1/);
    });

    it('rejects values that cannot be represented without changing cents', () => {
        const payload = stableV1Fixture();
        payload.data.transactions[1].totalPrice = 5.255;

        expect(() => buildLegacyV1StagingPayload(payload)).toThrow(/valor monetário exato em centavos/);
    });

    it('rejects an order whose stored total does not equal quantity times unit price in cents', () => {
        const payload = stableV1Fixture();
        payload.data.transactions[0].totalPrice = 25.01;

        expect(() => buildLegacyV1StagingPayload(payload)).toThrow(/quantidade × preço unitário em centavos/);
    });

    it('rejects a non-integer legacy order quantity even though the generic backup preflight accepts a positive number', () => {
        const payload = stableV1Fixture();
        payload.data.transactions[0].quantity = 1.5;
        payload.data.transactions[0].totalPrice = 18.75;

        expect(() => buildLegacyV1StagingPayload(payload)).toThrow(/quantidade inteira positiva/);
    });

    it('rejects a V2 envelope because this boundary is stable-v1 only', () => {
        const payload = stableV1Fixture() as Record<string, unknown>;
        payload.version = 2;
        payload.format = 'easy-backup';

        expect(() => buildLegacyV1StagingPayload(payload)).toThrow(/backup estável v1/);
    });
});
