import { describe, expect, it } from 'vitest';
import type { Transaction } from '../db/database';
import {
    buildStatementPeriod,
    calculateOutstandingDebtLots,
    calculateTotalDebt,
    debtAgeCategory,
} from './transactions';

function tx({
    id,
    resellerId = 1,
    type,
    totalPrice,
    occurredAt,
    reversal,
    correction,
}: {
    id: number;
    resellerId?: number;
    type: Transaction['type'];
    totalPrice: number;
    occurredAt: string;
    reversal?: Transaction['reversal'];
    correction?: Transaction['correction'];
}): Transaction {
    const occurrence = new Date(occurredAt);
    return {
        id,
        resellerId,
        type,
        totalPrice,
        occurredAt: occurrence,
        createdAt: new Date(occurrence.getTime() + id * 1000),
        reversal,
        correction,
    };
}

describe('P3-S2 statement and debt-aging domain rules', () => {
    it('builds opening balance, period movement and closing balance from occurredAt', () => {
        const transactions = [
            tx({ id: 1, type: 'order', totalPrice: 100, occurredAt: '2025-12-31T12:00:00' }),
            tx({ id: 2, type: 'payment', totalPrice: 20, occurredAt: '2026-01-10T12:00:00' }),
            tx({
                id: 3,
                type: 'order',
                totalPrice: 500,
                occurredAt: '2026-01-15T12:00:00',
                reversal: { reason: 'Valor incorreto', reversedAt: '2026-02-01T12:00:00.000Z' },
            }),
            tx({ id: 4, type: 'order', totalPrice: 50, occurredAt: '2026-01-20T12:00:00' }),
            tx({ id: 5, type: 'payment', totalPrice: 10, occurredAt: '2026-02-01T12:00:00' }),
        ];

        const statement = buildStatementPeriod(transactions, {
            startDate: new Date('2026-01-01T00:00:00'),
            endDate: new Date('2026-01-31T23:59:59.999'),
        });

        expect(statement.openingBalance).toBe(100);
        expect(statement.periodMovement).toBe(30);
        expect(statement.closingBalance).toBe(130);
        expect(statement.movements.map(transaction => transaction.id)).toEqual([2, 3, 4]);
    });

    it('keeps a linked correction auditable while counting only the replacement in the statement', () => {
        const original = tx({
            id: 10,
            type: 'order',
            totalPrice: 5000,
            occurredAt: '2026-01-15T12:00:00',
            reversal: {
                reason: 'Valor incorreto',
                reversedAt: '2026-02-01T12:00:00.000Z',
                replacementTransactionId: 11,
            },
        });
        const replacement = tx({
            id: 11,
            type: 'order',
            totalPrice: 500,
            occurredAt: '2026-01-15T12:00:00',
            correction: { replacesTransactionId: 10 },
        });

        const statement = buildStatementPeriod([original, replacement], {
            startDate: new Date('2026-01-01T00:00:00'),
            endDate: new Date('2026-01-31T23:59:59.999'),
        });

        expect(statement.movements.map(transaction => transaction.id)).toEqual([10, 11]);
        expect(statement.periodMovement).toBe(500);
        expect(statement.closingBalance).toBe(500);
    });

    it('keeps old debt old after a recent payment by applying credit FIFO', () => {
        const oldOrder = tx({
            id: 1,
            type: 'order',
            totalPrice: 100,
            occurredAt: '2026-07-01T12:00:00',
        });
        const recentPayment = tx({
            id: 2,
            type: 'payment',
            totalPrice: 20,
            occurredAt: '2026-08-17T12:00:00',
        });

        const lots = calculateOutstandingDebtLots([oldOrder, recentPayment]);

        expect(lots).toHaveLength(1);
        expect(lots[0].amount).toBe(80);
        expect(lots[0].occurredAt).toEqual(oldOrder.occurredAt);
        expect(debtAgeCategory(lots[0].occurredAt, new Date('2026-08-17T15:00:00'))).toBe('critical');
    });

    it('allocates payments to the oldest debt before newer debt', () => {
        const oldOrder = tx({ id: 1, type: 'order', totalPrice: 100, occurredAt: '2026-07-01T12:00:00' });
        const newerOrder = tx({ id: 2, type: 'order', totalPrice: 100, occurredAt: '2026-08-07T12:00:00' });
        const payment = tx({ id: 3, type: 'payment', totalPrice: 120, occurredAt: '2026-08-17T12:00:00' });

        const lots = calculateOutstandingDebtLots([oldOrder, newerOrder, payment]);

        expect(lots).toHaveLength(1);
        expect(lots[0].amount).toBe(80);
        expect(lots[0].occurredAt).toEqual(newerOrder.occurredAt);
        expect(debtAgeCategory(lots[0].occurredAt, new Date('2026-08-17T15:00:00'))).toBe('attention');
    });

    it('carries prepayment credit forward without inventing a debt lot', () => {
        const prepayment = tx({ id: 1, type: 'signal', totalPrice: 50, occurredAt: '2026-08-01T12:00:00' });
        const order = tx({ id: 2, type: 'order', totalPrice: 100, occurredAt: '2026-08-12T12:00:00' });

        const lots = calculateOutstandingDebtLots([prepayment, order]);

        expect(lots).toHaveLength(1);
        expect(lots[0].amount).toBe(50);
        expect(lots[0].occurredAt).toEqual(order.occurredAt);
    });

    it('defines total debt as the sum of positive reseller balances rather than netting credits across resellers', () => {
        const transactions = [
            tx({ id: 1, resellerId: 1, type: 'payment', totalPrice: 100, occurredAt: '2026-08-01T12:00:00' }),
            tx({ id: 2, resellerId: 2, type: 'order', totalPrice: 200, occurredAt: '2026-08-01T12:00:00' }),
        ];

        expect(calculateTotalDebt(transactions)).toBe(200);
    });
});
