import { describe, expect, it } from 'vitest';
import type { Category, Transaction } from '../db/database';
import {
    buildCategoryOrderPerformance,
    LEGACY_CATEGORY_LABEL,
} from './categoryReporting';

const createdAt = new Date('2026-08-10T12:00:00');

function category(id: number, name: string, isActive = true): Category {
    return {
        id,
        name,
        isActive,
        createdAt,
        updatedAt: createdAt,
    };
}

function order(overrides: Partial<Transaction> = {}): Transaction {
    return {
        id: 1,
        resellerId: 1,
        type: 'order',
        itemId: 10,
        itemName: 'Item',
        quantity: 1,
        unitPrice: 50,
        categoryId: 1,
        categoryName: 'Nome histórico',
        totalPrice: 50,
        occurredAt: new Date('2026-08-10T10:00:00'),
        createdAt,
        ...overrides,
    };
}

describe('P9-S3-I3 category order-performance reporting', () => {
    it('groups effective orders by historical category id and uses the current category label without rewriting snapshots', () => {
        const categories = [category(1, 'Porcelana atual', false)];
        const transactions: Transaction[] = [
            order({ id: 1, categoryName: 'Porcelana antiga', quantity: 2, totalPrice: 100 }),
            order({
                id: 2,
                categoryName: 'Outro nome histórico',
                quantity: 3,
                totalPrice: 150,
                occurredAt: new Date('2026-08-11T10:00:00'),
            }),
        ];

        expect(buildCategoryOrderPerformance(transactions, categories)).toEqual([
            {
                categoryId: 1,
                label: 'Porcelana atual',
                isArchived: true,
                orderCount: 2,
                quantity: 5,
                grossValue: 250,
            },
        ]);

        expect(transactions[0].categoryName).toBe('Porcelana antiga');
        expect(transactions[1].categoryName).toBe('Outro nome histórico');
    });

    it('counts a linked correction only through the effective replacement and ignores payments/signals', () => {
        const transactions: Transaction[] = [
            order({
                id: 1,
                quantity: 2,
                totalPrice: 100,
                reversal: {
                    reason: 'Valor incorreto',
                    reversedAt: '2026-08-12T12:00:00.000Z',
                    replacementTransactionId: 2,
                },
            }),
            order({
                id: 2,
                quantity: 3,
                totalPrice: 135,
                correction: { replacesTransactionId: 1 },
            }),
            {
                id: 3,
                resellerId: 1,
                type: 'payment',
                totalPrice: 80,
                occurredAt: new Date('2026-08-10T11:00:00'),
                createdAt,
            },
            {
                id: 4,
                resellerId: 1,
                type: 'signal',
                totalPrice: 20,
                occurredAt: new Date('2026-08-10T11:30:00'),
                createdAt,
            },
        ];

        expect(buildCategoryOrderPerformance(transactions, [category(1, 'Bronze')])).toEqual([
            {
                categoryId: 1,
                label: 'Bronze',
                isArchived: false,
                orderCount: 1,
                quantity: 3,
                grossValue: 135,
            },
        ]);
    });

    it('uses occurredAt for inclusive period filtering rather than registration time', () => {
        const transactions = [
            order({
                id: 1,
                occurredAt: new Date('2026-08-05T18:00:00'),
                createdAt: new Date('2026-08-20T09:00:00'),
                totalPrice: 70,
            }),
            order({
                id: 2,
                occurredAt: new Date('2026-08-20T09:00:00'),
                createdAt: new Date('2026-08-05T18:00:00'),
                totalPrice: 90,
            }),
        ];

        const report = buildCategoryOrderPerformance(transactions, [category(1, 'Porcelana')], {
            startDate: new Date('2026-08-01T00:00:00'),
            endDate: new Date('2026-08-10T23:59:59.999'),
        });

        expect(report).toHaveLength(1);
        expect(report[0].orderCount).toBe(1);
        expect(report[0].grossValue).toBe(70);
    });

    it('keeps missing historical snapshots in the explicit legacy bucket', () => {
        const legacyOrder = order({
            id: 7,
            categoryId: undefined,
            categoryName: undefined,
            quantity: 4,
            totalPrice: 200,
        });

        expect(buildCategoryOrderPerformance([legacyOrder], [category(1, 'Bronze')])).toEqual([
            {
                label: LEGACY_CATEGORY_LABEL,
                isArchived: false,
                orderCount: 1,
                quantity: 4,
                grossValue: 200,
            },
        ]);
    });
});
