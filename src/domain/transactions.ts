import type { Transaction } from '../db/database';
import { differenceInCalendarDays } from 'date-fns';

const FINANCIAL_EPSILON = 0.000001;

export function isTransactionReversed(transaction: Pick<Transaction, 'reversal'>) {
    return transaction.reversal !== undefined;
}

export function transactionOccurredAt(transaction: Pick<Transaction, 'occurredAt' | 'createdAt'>) {
    return transaction.occurredAt instanceof Date ? transaction.occurredAt : transaction.createdAt;
}

export function transactionSignedAmount(transaction: Transaction) {
    if (isTransactionReversed(transaction)) return 0;
    return transaction.type === 'order' ? transaction.totalPrice : -transaction.totalPrice;
}

export function calculateBalance(transactions: Transaction[]) {
    return transactions.reduce((sum, transaction) => sum + transactionSignedAmount(transaction), 0);
}

export function calculateBalancesByReseller(transactions: Transaction[]) {
    const balances = new Map<number, number>();

    transactions.forEach(transaction => {
        balances.set(
            transaction.resellerId,
            (balances.get(transaction.resellerId) || 0) + transactionSignedAmount(transaction),
        );
    });

    return balances;
}

export function calculateTotalDebt(transactions: Transaction[]) {
    return Array.from(calculateBalancesByReseller(transactions).values())
        .reduce((total, balance) => total + Math.max(balance, 0), 0);
}

export function effectiveTransactions(transactions: Transaction[]) {
    return transactions.filter(transaction => !isTransactionReversed(transaction));
}

export interface StatementRange {
    startDate: Date;
    endDate: Date;
}

export interface StatementPeriod {
    range: StatementRange;
    openingBalance: number;
    periodMovement: number;
    closingBalance: number;
    movements: Transaction[];
}

export function buildStatementPeriod(
    transactions: Transaction[],
    range: StatementRange,
): StatementPeriod {
    if (range.startDate > range.endDate) {
        throw new Error('A data de início não pode ser posterior à data de fim.');
    }

    const openingTransactions = transactions.filter(
        transaction => transactionOccurredAt(transaction) < range.startDate,
    );
    const movements = transactions.filter(transaction => {
        const occurredAt = transactionOccurredAt(transaction);
        return occurredAt >= range.startDate && occurredAt <= range.endDate;
    });

    const openingBalance = calculateBalance(openingTransactions);
    const periodMovement = calculateBalance(movements);

    return {
        range,
        openingBalance,
        periodMovement,
        closingBalance: openingBalance + periodMovement,
        movements,
    };
}

export interface OutstandingDebtLot {
    amount: number;
    occurredAt: Date;
    sourceTransactionId?: number;
}

function compareFinancialChronology(left: Transaction, right: Transaction) {
    const occurrenceDelta = transactionOccurredAt(left).getTime() - transactionOccurredAt(right).getTime();
    if (occurrenceDelta !== 0) return occurrenceDelta;

    const registrationDelta = left.createdAt.getTime() - right.createdAt.getTime();
    if (registrationDelta !== 0) return registrationDelta;

    return (left.id || 0) - (right.id || 0);
}

/**
 * Reconstructs open reseller debt using the accepted P3-S2 allocation convention:
 * reseller-level payments/signals consume the oldest effective order debt first (FIFO).
 * Excess credit is carried forward to later orders. No persistent order/payment link is invented.
 */
export function calculateOutstandingDebtLots(transactions: Transaction[]): OutstandingDebtLot[] {
    const chronological = [...effectiveTransactions(transactions)].sort(compareFinancialChronology);
    const lots: OutstandingDebtLot[] = [];
    let unappliedCredit = 0;

    chronological.forEach(transaction => {
        const signedAmount = transactionSignedAmount(transaction);

        if (signedAmount > FINANCIAL_EPSILON) {
            let outstanding = signedAmount;

            if (unappliedCredit > FINANCIAL_EPSILON) {
                const appliedCredit = Math.min(outstanding, unappliedCredit);
                outstanding -= appliedCredit;
                unappliedCredit -= appliedCredit;
            }

            if (outstanding > FINANCIAL_EPSILON) {
                lots.push({
                    amount: outstanding,
                    occurredAt: transactionOccurredAt(transaction),
                    sourceTransactionId: transaction.id,
                });
            }
            return;
        }

        if (signedAmount < -FINANCIAL_EPSILON) {
            let credit = -signedAmount;

            while (credit > FINANCIAL_EPSILON && lots.length > 0) {
                const oldest = lots[0];
                const appliedCredit = Math.min(oldest.amount, credit);
                oldest.amount -= appliedCredit;
                credit -= appliedCredit;

                if (oldest.amount <= FINANCIAL_EPSILON) {
                    lots.shift();
                }
            }

            if (credit > FINANCIAL_EPSILON) {
                unappliedCredit += credit;
            }
        }
    });

    return lots;
}

export type DebtAgeCategory = 'recent' | 'attention' | 'critical';

export function debtAgeCategory(occurredAt: Date, asOf: Date): DebtAgeCategory {
    const ageInDays = Math.max(0, differenceInCalendarDays(asOf, occurredAt));
    if (ageInDays < 7) return 'recent';
    if (ageInDays <= 30) return 'attention';
    return 'critical';
}
