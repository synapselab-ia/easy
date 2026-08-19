import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { db } from '../db/database';
import {
    archiveCategory,
    createCategory,
    deleteCategory,
    reactivateCategory,
    renameCategory,
} from '../services/categoryService';

export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: () => db.categories.toArray(),
    });
}

function useCategoryMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['items'] });
        },
    });
}

export function useCreateCategory() {
    return useCategoryMutation((name: string) => createCategory(name));
}

export function useRenameCategory() {
    return useCategoryMutation(({ id, name }: { id: number; name: string }) => renameCategory(id, name));
}

export function useArchiveCategory() {
    return useCategoryMutation((id: number) => archiveCategory(id));
}

export function useReactivateCategory() {
    return useCategoryMutation((id: number) => reactivateCategory(id));
}

export function useDeleteCategory() {
    return useCategoryMutation((id: number) => deleteCategory(id));
}
