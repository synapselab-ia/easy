import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db, isItemActive, isResellerActive, type Transaction } from '../db/database';

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
                const reseller = await db.resellers.get(transaction.resellerId);

                if (!reseller) {
                    throw new Error('Revendedor não encontrado.');
                }

                if (!isResellerActive(reseller)) {
                    throw new Error('Revendedores inativos não podem receber novos lançamentos.');
                }

                if (transaction.type === 'order' && transaction.itemId !== undefined) {
                    const item = await db.items.get(transaction.itemId);

                    if (!item) {
                        throw new Error('Item não encontrado.');
                    }

                    if (!isItemActive(item)) {
                        throw new Error('Itens inativos não podem ser usados em novos pedidos.');
                    }
                }

                return db.transactions.add(transaction);
            }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['transactions', variables.resellerId] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

export function useDeleteTransaction() {
    const queryClient = useQueryClient();
    // Using an object to receive both ID and resellerId to invalidate properly
    return useMutation({
        mutationFn: ({ id, resellerId: _resellerId }: { id: number; resellerId: number }) => db.transactions.delete(id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['transactions', variables.resellerId] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}
