import { describe, expect, it } from 'vitest';
import type { Transaction } from '../db/database';
import { calculateBalance, effectiveTransactions, isTransactionReversed, transactionSignedAmount } from './transactions';

const now = new Date('2026-08-17T12:00:00-03:00');

function tx(partial: Partial<Transaction>): Transaction {
    return {
        resellerId: 1,
        type: 'order',
        totalPrice: 100,
        createdAt: now,
        ...partial,
    };
}

describe('transaction domain rules', () => {
    it('treats non-reversed orders and payments with opposite financial signs', () => {
        expect(transactionSignedAmount(tx({ type: 'order', totalPrice: 100 }))).toBe(100);
        expect(transactionSignedAmount(tx({ type: 'payment', totalPrice: 40 }))).toBe(-40);
    });

    it('keeps reversed transactions auditable but removes their financial effect', () => {
        const reversed = tx({
            type: 'order',
            totalPrice: 5000,
            reversal: {
                reason: 'Valor digitado incorretamente',
                reversedAt: '2026-08-17T15:00:00.000Z',
            },
        });

        expect(isTransactionReversed(reversed)).toBe(true);
        expect(transactionSignedAmount(reversed)).toBe(0);
        expect(reversed.totalPrice).toBe(5000);
        expect(reversed.reversal?.reason).toBe('Valor digitado incorretamente');
    });

    it('calculates balance from effective transactions only', () => {
        const transactions = [
            tx({ id: 1, type: 'order', totalPrice: 500 }),
            tx({ id: 2, type: 'payment', totalPrice: 100 }),
            tx({
                id: 3,
                type: 'payment',
                totalPrice: 250,
                reversal: {
                    reason: 'Pagamento duplicado',
                    reversedAt: '2026-08-17T15:00:00.000Z',
                },
            }),
        ];

        expect(calculateBalance(transactions)).toBe(400);
        expect(effectiveTransactions(transactions).map(transaction => transaction.id)).toEqual([1, 2]);
    });
});
