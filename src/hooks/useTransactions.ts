import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db, isItemActive, isResellerActive, type Transaction } from '../db/database';
import { isTransactionReversed } from '../domain/transactions';

export const ORDER_ITEM_REQUIRED_ERROR = 'Pedidos novos devem referenciar um item do catálogo.';
export const NON_ORDER_ITEM_REFERENCE_ERROR = 'Pagamentos e sinais não podem referenciar itens do catálogo.';
export const REVERSAL_REASON_REQUIRED_ERROR = 'Informe o motivo do estorno.';
export const TRANSACTION_NOT_FOUND_ERROR = 'Lançamento não encontrado.';
export const TRANSACTION_ALREADY_REVERSED_ERROR = 'Este lançamento já foi estornado.';

function isValidEntityId(value: unknown): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value > 0;
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
        mutationFn: (transaction: Omit<Transaction, 'id'>) =>
            db.transaction('rw', db.resellers, db.items, db.transactions, async () => {
                if (!isValidEntityId(transaction.resellerId)) {
                    throw new Error('Revendedor não encontrado.');
                }

                const reseller = await db.resellers.get(transaction.resellerId);

                if (!reseller) {
                    throw new Error('Revendedor não encontrado.');
                }

                if (!isResellerActive(reseller)) {
                    throw new Error('Revendedores inativos não podem receber novos lançamentos.');
                }

                if (transaction.type !== 'order') {
                    if (transaction.itemId !== undefined) {
                        throw new Error(NON_ORDER_ITEM_REFERENCE_ERROR);
                    }

                    return db.transactions.add(transaction);
                }

                if (!isValidEntityId(transaction.itemId)) {
                    throw new Error(ORDER_ITEM_REQUIRED_ERROR);
                }

                const item = await db.items.get(transaction.itemId);

                if (!item) {
                    throw new Error('Item não encontrado.');
                }

                if (!isItemActive(item)) {
                    throw new Error('Itens inativos não podem ser usados em novos pedidos.');
                }

                return db.transactions.add({
                    ...transaction,
                    itemName: item.name,
                });
            }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['transactions', variables.resellerId] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

export function useReverseTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: number; reason: string }) =>
            db.transaction('rw', db.transactions, async () => {
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
            }),
        onSuccess: ({ resellerId }) => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['transactions', resellerId] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}
