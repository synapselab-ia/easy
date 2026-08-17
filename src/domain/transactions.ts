import type { Transaction } from '../db/database';

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

export function effectiveTransactions(transactions: Transaction[]) {
    return transactions.filter(transaction => !isTransactionReversed(transaction));
}
