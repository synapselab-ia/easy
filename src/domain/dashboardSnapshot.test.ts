import { describe, expect, it } from 'vitest';
import type { Reseller, Transaction } from '../db/database';
import { buildDashboardSnapshot } from './dashboardSnapshot';

function reseller(id: number, name: string): Reseller {
    const createdAt = new Date(2026, 0, 1, 9, 0, 0);
    return { id, name, isActive: true, createdAt, updatedAt: createdAt };
}

function transaction(input: Omit<Transaction, 'createdAt'> & { createdAt?: Date }): Transaction {
    return {
        ...input,
        createdAt: input.createdAt ?? input.occurredAt ?? new Date(2026, 7, 27, 9, 0, 0),
    };
}

describe('buildDashboardSnapshot', () => {
    it('centralizes flow, as-of-today debt, FIFO aging, attention and recent registrations', () => {
        const asOf = new Date(2026, 7, 27, 12, 0, 0);
        const resellers = [reseller(1, 'Ana'), reseller(2, 'Bia'), reseller(3, 'Carla')];
        const transactions: Transaction[] = [
            transaction({ id: 1, resellerId: 1, type: 'order', totalPrice: 100, quantity: 1, occurredAt: new Date(2026, 6, 20, 10) }),
            transaction({ id: 2, resellerId: 1, type: 'order', totalPrice: 50, quantity: 1, occurredAt: new Date(2026, 7, 10, 10) }),
            transaction({ id: 3, resellerId: 1, type: 'payment', totalPrice: 30, occurredAt: new Date(2026, 7, 15, 10) }),
            transaction({
                id: 4,
                resellerId: 1,
                type: 'order',
                totalPrice: 20,
                quantity: 2,
                occurredAt: new Date(2026, 7, 27, 10),
                createdAt: new Date(2026, 7, 27, 10, 5),
            }),
            transaction({ id: 5, resellerId: 2, type: 'order', totalPrice: 80, quantity: 4, occurredAt: new Date(2026, 7, 5, 10) }),
            transaction({ id: 6, resellerId: 2, type: 'payment', totalPrice: 10, occurredAt: new Date(2026, 7, 12, 10) }),
            transaction({
                id: 7,
                resellerId: 2,
                type: 'payment',
                totalPrice: 60,
                occurredAt: new Date(2026, 7, 28, 10),
                createdAt: new Date(2026, 7, 27, 11),
            }),
            transaction({
                id: 8,
                resellerId: 3,
                type: 'order',
                totalPrice: 500,
                quantity: 5,
                occurredAt: new Date(2026, 7, 30, 10),
                createdAt: new Date(2026, 7, 27, 11, 30),
            }),
            transaction({
                id: 9,
                resellerId: 3,
                type: 'order',
                totalPrice: 999,
                quantity: 9,
                occurredAt: new Date(2026, 7, 27, 9),
                createdAt: new Date(2026, 7, 27, 11, 45),
                reversal: { reason: 'Duplicado', reversedAt: '2026-08-27T14:50:00.000Z' },
            }),
        ];

        const snapshot = buildDashboardSnapshot(transactions, resellers, asOf, 10);

        expect(snapshot.month).toEqual({ sales: 150, receipts: 40, orderCount: 3, itemQuantity: 7 });
        expect(snapshot.today).toEqual({ sales: 20, receipts: 0, orderCount: 1, itemQuantity: 2 });

        // Future occurrences are valid registrations but do not affect current position yet.
        expect(snapshot.openDebt).toEqual({ amount: 210, resellerCount: 2 });
        expect(snapshot.critical).toEqual({ amount: 70, resellerCount: 1, oldestAgeDays: 38 });
        expect(snapshot.agingBuckets).toEqual([
            { category: 'recent', value: 20, percentage: (20 / 210) * 100 },
            { category: 'attention', value: 120, percentage: (120 / 210) * 100 },
            { category: 'critical', value: 70, percentage: (70 / 210) * 100 },
        ]);

        expect(snapshot.attentionRows).toHaveLength(2);
        expect(snapshot.attentionRows[0]).toMatchObject({
            resellerId: 1,
            resellerName: 'Ana',
            status: 'critical',
            alertAmount: 70,
            totalOpenDebt: 140,
            ageDays: 38,
        });
        expect(snapshot.attentionRows[1]).toMatchObject({
            resellerId: 2,
            resellerName: 'Bia',
            status: 'attention',
            alertAmount: 70,
            totalOpenDebt: 70,
            ageDays: 22,
        });
        expect(snapshot.attentionRows.filter(row => row.resellerId === 1)).toHaveLength(1);
        expect(snapshot.resellerDebtProfiles.find(profile => profile.resellerId === 1)).toMatchObject({
            criticalAmount: 70,
            attentionAmount: 50,
            totalOpenDebt: 140,
        });

        expect(snapshot.recentRegistrations.map(row => row.transactionId)).toEqual([
            8, 7, 4, 3, 6, 2, 5, 1,
        ]);
        expect(snapshot.recentRegistrations.some(row => row.transactionId === 9)).toBe(false);
    });

    it('uses deterministic attention ordering', () => {
        const asOf = new Date(2026, 7, 27, 12);
        const resellers = [
            reseller(1, 'Zulu'),
            reseller(2, 'Ana'),
            reseller(3, 'Bia'),
            reseller(4, 'Caio'),
        ];
        const transactions: Transaction[] = [
            transaction({ id: 1, resellerId: 1, type: 'order', totalPrice: 20, occurredAt: new Date(2026, 6, 10) }),
            transaction({ id: 2, resellerId: 2, type: 'order', totalPrice: 50, occurredAt: new Date(2026, 6, 12) }),
            transaction({ id: 3, resellerId: 3, type: 'order', totalPrice: 40, occurredAt: new Date(2026, 7, 10) }),
            transaction({ id: 4, resellerId: 4, type: 'order', totalPrice: 40, occurredAt: new Date(2026, 7, 10) }),
        ];

        const snapshot = buildDashboardSnapshot(transactions, resellers, asOf);

        expect(snapshot.attentionRows.map(row => row.resellerName)).toEqual([
            'Zulu',
            'Ana',
            'Bia',
            'Caio',
        ]);
    });

    it('rejects an invalid reference date', () => {
        expect(() => buildDashboardSnapshot([], [], new Date(Number.NaN))).toThrow(
            'A data de referência do Dashboard é inválida.',
        );
    });
});
