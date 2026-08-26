import {
    db,
    isCategoryActive,
    isItemActive,
    isSubcategoryActive,
    type Category,
} from '../db/database';
import { isEasySupabaseConfigured } from '../lib/supabase';
import {
    createCloudCategory,
    deleteCloudCategory,
    renameCloudCategory,
    setCloudCategoryActive,
} from './cloudDataService';
import { assertRecoveryWriteAllowed } from './recoveryHealth';

export const CATEGORY_NAME_REQUIRED_ERROR = 'Informe o nome da categoria.';
export const CATEGORY_NAME_UNIQUE_ERROR = 'Já existe uma categoria com este nome.';
export const CATEGORY_NOT_FOUND_ERROR = 'Categoria não encontrada.';
export const CATEGORY_ACTIVE_REQUIRED_ERROR = 'Selecione uma categoria ativa.';
export const CATEGORY_ARCHIVE_ACTIVE_ITEMS_ERROR = 'Categorias com itens ou subcategorias ativos não podem ser arquivadas.';
export const CATEGORY_DELETE_REFERENCED_ERROR = 'Categorias com subcategorias, itens ou histórico de pedidos não podem ser excluídas permanentemente.';

function isValidEntityId(value: unknown): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

export function normalizeCategoryName(name: string) {
    return name.trim().toLocaleLowerCase('pt-BR');
}

async function assertUniqueCategoryName(name: string, excludeId?: number) {
    const normalized = normalizeCategoryName(name);
    if (!normalized) {
        throw new Error(CATEGORY_NAME_REQUIRED_ERROR);
    }

    const duplicate = await db.categories
        .filter(category => category.id !== excludeId && normalizeCategoryName(category.name) === normalized)
        .first();

    if (duplicate) {
        throw new Error(CATEGORY_NAME_UNIQUE_ERROR);
    }
}

export function requireActiveCategory(categoryId: unknown): Promise<Category> {
    if (!isValidEntityId(categoryId)) {
        throw new Error(CATEGORY_ACTIVE_REQUIRED_ERROR);
    }

    return db.categories.get(categoryId).then(category => {
        if (!category) {
            throw new Error(CATEGORY_NOT_FOUND_ERROR);
        }

        if (!isCategoryActive(category)) {
            throw new Error(CATEGORY_ACTIVE_REQUIRED_ERROR);
        }

        return category;
    });
}

export async function createCategory(name: string) {
    assertRecoveryWriteAllowed();
    const trimmedName = name.trim();
    if (!trimmedName) throw new Error(CATEGORY_NAME_REQUIRED_ERROR);

    if (isEasySupabaseConfigured()) {
        return createCloudCategory(trimmedName);
    }

    return db.transaction('rw', db.categories, async () => {
        await assertUniqueCategoryName(trimmedName);
        const now = new Date();
        return db.categories.add({
            name: trimmedName,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        });
    });
}

export async function renameCategory(id: number, name: string) {
    assertRecoveryWriteAllowed();
    const trimmedName = name.trim();
    if (!trimmedName) throw new Error(CATEGORY_NAME_REQUIRED_ERROR);

    if (isEasySupabaseConfigured()) {
        return renameCloudCategory(id, trimmedName);
    }

    return db.transaction('rw', db.categories, async () => {
        if (!isValidEntityId(id) || !(await db.categories.get(id))) {
            throw new Error(CATEGORY_NOT_FOUND_ERROR);
        }

        await assertUniqueCategoryName(trimmedName, id);
        return db.categories.update(id, {
            name: trimmedName,
            updatedAt: new Date(),
        });
    });
}

export async function archiveCategory(id: number) {
    assertRecoveryWriteAllowed();

    if (isEasySupabaseConfigured()) {
        return setCloudCategoryActive(id, false);
    }

    return db.transaction('rw', db.categories, db.subcategories, db.items, async () => {
        if (!isValidEntityId(id)) {
            throw new Error(CATEGORY_NOT_FOUND_ERROR);
        }

        const category = await db.categories.get(id);
        if (!category) {
            throw new Error(CATEGORY_NOT_FOUND_ERROR);
        }

        const activeItemReference = await db.items
            .filter(item => item.categoryId === id && isItemActive(item))
            .first();
        const activeSubcategoryReference = await db.subcategories
            .filter(subcategory => subcategory.categoryId === id && isSubcategoryActive(subcategory))
            .first();

        if (activeItemReference || activeSubcategoryReference) {
            throw new Error(CATEGORY_ARCHIVE_ACTIVE_ITEMS_ERROR);
        }

        return db.categories.update(id, {
            isActive: false,
            updatedAt: new Date(),
        });
    });
}

export async function reactivateCategory(id: number) {
    assertRecoveryWriteAllowed();

    if (isEasySupabaseConfigured()) {
        return setCloudCategoryActive(id, true);
    }

    return db.transaction('rw', db.categories, async () => {
        if (!isValidEntityId(id) || !(await db.categories.get(id))) {
            throw new Error(CATEGORY_NOT_FOUND_ERROR);
        }

        return db.categories.update(id, {
            isActive: true,
            updatedAt: new Date(),
        });
    });
}

export async function deleteCategory(id: number) {
    assertRecoveryWriteAllowed();

    if (isEasySupabaseConfigured()) {
        return deleteCloudCategory(id);
    }

    return db.transaction('rw', db.categories, db.subcategories, db.items, db.transactions, async () => {
        if (!isValidEntityId(id) || !(await db.categories.get(id))) {
            throw new Error(CATEGORY_NOT_FOUND_ERROR);
        }

        const subcategoryReference = await db.subcategories
            .filter(subcategory => subcategory.categoryId === id)
            .first();
        const itemReference = await db.items
            .filter(item => item.categoryId === id)
            .first();
        const historicalReference = await db.transactions
            .filter(transaction => transaction.categoryId === id)
            .first();

        if (subcategoryReference || itemReference || historicalReference) {
            throw new Error(CATEGORY_DELETE_REFERENCED_ERROR);
        }

        return db.categories.delete(id);
    });
}
