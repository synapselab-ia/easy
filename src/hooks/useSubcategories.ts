import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { db } from '../db/database';
import {
    archiveSubcategory,
    createSubcategory,
    deleteSubcategory,
    reactivateSubcategory,
    renameSubcategory,
} from '../services/subcategoryService';

export function useSubcategories() {
    return useQuery({
        queryKey: ['subcategories'],
        queryFn: () => db.subcategories.toArray(),
    });
}

function useSubcategoryMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subcategories'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['items'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

export function useCreateSubcategory() {
    return useSubcategoryMutation(({ categoryId, name }: { categoryId: number; name: string }) =>
        createSubcategory(categoryId, name)
    );
}

export function useRenameSubcategory() {
    return useSubcategoryMutation(({ id, name }: { id: number; name: string }) => renameSubcategory(id, name));
}

export function useArchiveSubcategory() {
    return useSubcategoryMutation((id: number) => archiveSubcategory(id));
}

export function useReactivateSubcategory() {
    return useSubcategoryMutation((id: number) => reactivateSubcategory(id));
}

export function useDeleteSubcategory() {
    return useSubcategoryMutation((id: number) => deleteSubcategory(id));
}
