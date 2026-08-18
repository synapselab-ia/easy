import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    db,
    isItemActive,
    isResellerActive,
    type Transaction,
    type TransactionCorrection,
} from '../db/database';
import { isTransactionReversed, transactionOccurredAt } from '../domain/transactions';
import { assertRecoveryWriteAllowed } from '../services/recoveryHealth';

export const ORDER_ITEM_REQUIRED_ERROR = 'Pedidos novos devem referenciar um item do catálogo.';
export const NON_ORDER_ITEM_REFERENCE_ERROR = 'Pagamentos e sinais não podem referenciar itens do catálogo.';
export const REVERSAL_REASON_REQUIRED_ERROR = 'Informe o motivo do estorno.';
export const TRANSACTION_NOT_FOUND_ERROR = 'Lançamento não encontrado.';
export const TRANSACTION_ALREADY_REVERSED_ERROR = 'Este lançamento já foi estornado.';
export const CORRECTION_ORDER_ITEM_PRESERVED_ERROR = 'A correção guiada deve preservar o item original do pedido.';
export const CORRECTION_VALUE_REQUIRED_ERROR = 'Informe um valor válido para a correção.';
export const OCCURRENCE_DATE_REQUIRED_ERROR = 'Informe uma data de ocorrência válida.';

export type NewTransactionInput = Omit<Transaction, 'id' | 'reversal' | 'correction' | 'createdAt'>;
export type CorrectionReplacementInput = Omit<NewTransactionInput, 'type' | 'occurredAt'>;

function isValidEntityId(value: unknown): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function isValidOccurrenceDate(value: unknown): value is Date {
    return value instanceof Date && !Number.isNaN(value.getTime());
}

function sanitizeNewTransaction(transaction: NewTransactionInput): NewTransactionInput {
    return {
        resellerId: transaction.resellerId,
        type: transaction.type,
        itemId: transaction.itemId,
        itemName: transaction.itemName,
        quantity: transaction.quantity,
        unitPrice: transaction.unitPrice,
        totalPrice: transaction.totalPrice,
        observation: transaction.observation,
        occurredAt: transaction.occurredAt,
    };
}

async function addValidatedTransaction(
    transaction: NewTransactionInput,
    correction?: TransactionCorrection,
) {
    const cleanTransaction = sanitizeNewTransaction(transaction);
    const registrationTimestamp = new Date();

    if (cleanTransaction.occurredAt !== undefined && !isValidOccurrenceDate(cleanTransaction.occurredAt)) {
        throw new Error(OCCURRENCE_DATE_REQUIRED_ERROR);
    }

    const occurrenceTimestamp = cleanTransaction.occurredAt ?? registrationTimestamp;

    if (!isValidEntityId(cleanTransaction.resellerId)) {
        throw new Error('Revendedor não encontrado.');
    }

    const reseller = await db.resellers.get(cleanTransaction.resellerId);

    if (!reseller) {
        throw new Error('Revendedor não encontrado.');
    }

    if (!isResellerActive(reseller)) {
        throw new Error('Revendedores inativos não podem receber novos lançamentos.');
    }

    const correctionMetadata = correction ? { correction } : {};

    if (cleanTransaction.type !== 'order') {
        if (cleanTransaction.itemId !== undefined) {
            throw new Error(NON_ORDER_ITEM_REFERENCE_ERROR);
        }

        return db.transactions.add({
            ...cleanTransaction,
            occurredAt: occurrenceTimestamp,
            ...correctionMetadata,
            createdAt: registrationTimestamp,
        });
    }

    if (!isValidEntityId(cleanTransaction.itemId)) {
        throw new Error(ORDER_ITEM_REQUIRED_ERROR);
    }

    const item = await db.items.get(cleanTransaction.itemId);

    if (!item) {
        throw new Error('Item não encontrado.');
    }

    if (!isItemActive(item)) {
        throw new Error('Itens inativos não podem ser usados em novos pedidos.');
    }

    return db.transactions.add({
        ...cleanTransaction,
        occurredAt: occurrenceTimestamp,
        itemName: item.name,
        ...correctionMetadata,
        createdAt: registrationTimestamp,
    });
}

function invalidateTransactionConsumers(
    queryClient: ReturnType<typeof useQueryClient>,
    resellerIds: number[],
) {
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    resellerIds.forEach(resellerId => {
        queryClient.invalidateQueries({ queryKey: ['transactions', resellerId] });
    });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useTransactions(resellerId?: number) {
    return useQuery({
        queryKey: ['transactions', resellerId],
        queryFn: () => {
            if (resellerId) {
                return db.transactions.where('resellerId').equals(resellerId).toArray();
            }
            return db.transactions.toArray();
        },
    });
}

export function useCreateTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (transaction: NewTransactionInput) => {
            assertRecoveryWriteAllowed();
            return db.transaction('rw', db.resellers, db.items, db.transactions, () =>
                addValidatedTransaction(transaction)
            );
        },
        onSuccess: (_, variables) => {
            invalidateTransactionConsumers(queryClient, [variables.resellerId]);
        },
    });
}

export function useReverseTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: number; reason: string }) => {
            assertRecoveryWriteAllowed();
            return db.transaction('rw', db.transactions, async () => {
                if (!isValidEntityId(id)) {
                    throw new Error(TRANSACTION_NOT_FOUND_ERROR);
                }

                const normalizedReason = reason.trim();
                if (!normalizedReason) {
                    throw new Error(REVERSAL_REASON_REQUIRED_ERROR);
                }

                const transaction = await db.transactions.get(id);
                if (!transaction) {
                    throw new Error(TRANSACTION_NOT_FOUND_ERROR);
                }

                if (isTransactionReversed(transaction)) {
                    throw new Error(TRANSACTION_ALREADY_REVERSED_ERROR);
                }

                const reversal = {
                    reason: normalizedReason,
                    reversedAt: new Date().toISOString(),
                };

                await db.transactions.update(id, { reversal });

                return {
                    resellerId: transaction.resellerId,
                    reversal,
                };
            });
        },
        onSuccess: ({ resellerId }) => {
            invalidateTransactionConsumers(queryClient, [resellerId]);
        },
    });
}

export function useReplaceTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            originalId,
            reason,
            replacement,
        }: {
            originalId: number;
            reason: string;
            replacement: CorrectionReplacementInput;
        }) => {
            assertRecoveryWriteAllowed();
            return db.transaction('rw', db.resellers, db.items, db.transactions, async () => {
                if (!isValidEntityId(originalId)) {
                    throw new Error(TRANSACTION_NOT_FOUND_ERROR);
                }

                const normalizedReason = reason.trim();
                if (!normalizedReason) {
                    throw new Error(REVERSAL_REASON_REQUIRED_ERROR);
                }

                const original = await db.transactions.get(originalId);
                if (!original) {
                    throw new Error(TRANSACTION_NOT_FOUND_ERROR);
                }

                if (isTransactionReversed(original)) {
                    throw new Error(TRANSACTION_ALREADY_REVERSED_ERROR);
                }

                let normalizedReplacement: NewTransactionInput = {
                    ...replacement,
                    type: original.type,
                    occurredAt: transactionOccurredAt(original),
                };

                if (original.type === 'order') {
                    if (replacement.itemId !== original.itemId) {
                        throw new Error(CORRECTION_ORDER_ITEM_PRESERVED_ERROR);
                    }

                    const quantity = replacement.quantity;
                    const unitPrice = replacement.unitPrice;
                    if (!Number.isInteger(quantity) || !quantity || quantity <= 0 || typeof unitPrice !== 'number' || unitPrice < 0) {
                        throw new Error(CORRECTION_VALUE_REQUIRED_ERROR);
                    }

                    normalizedReplacement = {
                        ...normalizedReplacement,
                        itemId: original.itemId,
                        itemName: original.itemName,
                        quantity,
                        unitPrice,
                        totalPrice: quantity * unitPrice,
                        observation: original.observation,
                    };
                } else {
                    if (typeof replacement.totalPrice !== 'number' || !Number.isFinite(replacement.totalPrice) || replacement.totalPrice <= 0) {
                        throw new Error(CORRECTION_VALUE_REQUIRED_ERROR);
                    }

                    normalizedReplacement = {
                        ...normalizedReplacement,
                        itemId: undefined,
                        itemName: undefined,
                        quantity: undefined,
                        unitPrice: undefined,
                        totalPrice: replacement.totalPrice,
                        observation: original.observation,
                    };
                }

                const replacementTransactionId = await addValidatedTransaction(
                    normalizedReplacement,
                    { replacesTransactionId: originalId },
                ) as number;

                const reversal = {
                    reason: normalizedReason,
                    reversedAt: new Date().toISOString(),
                    replacementTransactionId,
                };

                await db.transactions.update(originalId, { reversal });

                return {
                    originalResellerId: original.resellerId,
                    replacementResellerId: normalizedReplacement.resellerId,
                    originalId,
                    replacementTransactionId,
                    reversal,
                };
            });
        },
        onSuccess: ({ originalResellerId, replacementResellerId }) => {
            invalidateTransactionConsumers(
                queryClient,
                Array.from(new Set([originalResellerId, replacementResellerId])),
            );
        },
    });
}
