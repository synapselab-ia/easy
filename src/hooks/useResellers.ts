import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db, type Reseller } from '../db/database';
import { isEasySupabaseConfigured } from '../lib/supabase';
import {
    createCloudReseller,
    deleteCloudReseller,
    setCloudResellerActive,
    updateCloudReseller,
} from '../services/cloudDataService';
import { assertRecoveryWriteAllowed } from '../services/recoveryHealth';

export const RESELLER_WITH_HISTORY_DELETE_ERROR =
    'Revendedores com histórico financeiro não podem ser excluídos. Arquive o revendedor para preservar o histórico.';

export function useResellers() {
    return useQuery({
        queryKey: ['resellers'],
        queryFn: () => db.resellers.toArray(),
    });
}

export function useReseller(id?: number) {
    return useQuery({
        queryKey: ['resellers', id],
        queryFn: async () => {
            if (!id) return null;
            const reseller = await db.resellers.get(id);
            return reseller ?? null;
        },
        enabled: !!id,
    });
}

export function useCreateReseller() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (reseller: Omit<Reseller, 'id'>) => {
            assertRecoveryWriteAllowed();

            if (isEasySupabaseConfigured()) {
                return createCloudReseller(reseller);
            }

            return db.resellers.add({ ...reseller, isActive: reseller.isActive ?? true });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resellers'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

export function useUpdateReseller() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...changes }: Partial<Reseller> & { id: number }) => {
            assertRecoveryWriteAllowed();

            if (isEasySupabaseConfigured()) {
                return updateCloudReseller(id, changes);
            }

            return db.resellers.update(id, changes);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['resellers'] });
            queryClient.invalidateQueries({ queryKey: ['resellers', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

function useSetResellerActiveState(isActive: boolean) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            assertRecoveryWriteAllowed();

            if (isEasySupabaseConfigured()) {
                await setCloudResellerActive(id, isActive);
                return;
            }

            const updated = await db.resellers.update(id, {
                isActive,
                updatedAt: new Date(),
            });
            if (!updated) {
                throw new Error('Revendedor não encontrado.');
            }
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['resellers'] });
            queryClient.invalidateQueries({ queryKey: ['resellers', id] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

export function useArchiveReseller() {
    return useSetResellerActiveState(false);
}

export function useReactivateReseller() {
    return useSetResellerActiveState(true);
}

export function useDeleteReseller() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => {
            assertRecoveryWriteAllowed();

            if (isEasySupabaseConfigured()) {
                return deleteCloudReseller(id);
            }

            return db.transaction('rw', db.resellers, db.transactions, async () => {
                const transactionCount = await db.transactions
                    .where('resellerId')
                    .equals(id)
                    .count();

                if (transactionCount > 0) {
                    throw new Error(RESELLER_WITH_HISTORY_DELETE_ERROR);
                }

                await db.resellers.delete(id);
            });
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['resellers'] });
            queryClient.invalidateQueries({ queryKey: ['resellers', id] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}
