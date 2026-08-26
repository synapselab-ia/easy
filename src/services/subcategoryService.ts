import {
    db,
    isItemActive,
    isSubcategoryActive,
    type Subcategory,
} from '../db/database';
import { isEasySupabaseConfigured } from '../lib/supabase';
import { requireActiveCategory } from './categoryService';
import {
    createCloudSubcategory,
    deleteCloudSubcategory,
    renameCloudSubcategory,
    setCloudSubcategoryActive,
} from './cloudDataService';
import { assertRecoveryWriteAllowed } from './recoveryHealth';

export const SUBCATEGORY_NAME_REQUIRED_ERROR = 'Informe o nome da subcategoria.';
export const SUBCATEGORY_NAME_UNIQUE_ERROR = 'Já existe uma subcategoria com este nome nesta categoria.';
export const SUBCATEGORY_NOT_FOUND_ERROR = 'Subcategoria não encontrada.';
export const SUBCATEGORY_ACTIVE_REQUIRED_ERROR = 'Selecione uma subcategoria ativa da categoria escolhida.';
export const SUBCATEGORY_ARCHIVE_ACTIVE_ITEMS_ERROR = 'Subcategorias usadas por itens ativos não podem ser arquivadas.';
export const SUBCATEGORY_DELETE_REFERENCED_ERROR = 'Subcategorias com itens ou histórico de pedidos não podem ser excluídas permanentemente.';

function isValidEntityId(value: unknown): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

export function normalizeSubcategoryName(name: string) {
    return name.trim().toLocaleLowerCase('pt-BR');
}

async function assertUniqueSubcategoryName(categoryId: number, name: string, excludeId?: number) {
    const normalized = normalizeSubcategoryName(name);
    if (!normalized) throw new Error(SUBCATEGORY_NAME_REQUIRED_ERROR);

    const duplicate = await db.subcategories
        .filter(subcategory =>
            subcategory.id !== excludeId
            && subcategory.categoryId === categoryId
            && normalizeSubcategoryName(subcategory.name) === normalized
        )
        .first();

    if (duplicate) throw new Error(SUBCATEGORY_NAME_UNIQUE_ERROR);
}

export async function requireActiveSubcategory(subcategoryId: unknown, categoryId: unknown): Promise<Subcategory> {
    if (!isValidEntityId(subcategoryId) || !isValidEntityId(categoryId)) {
        throw new Error(SUBCATEGORY_ACTIVE_REQUIRED_ERROR);
    }

    const subcategory = await db.subcategories.get(subcategoryId);
    if (!subcategory) throw new Error(SUBCATEGORY_NOT_FOUND_ERROR);
    if (subcategory.categoryId !== categoryId || !isSubcategoryActive(subcategory)) {
        throw new Error(SUBCATEGORY_ACTIVE_REQUIRED_ERROR);
    }
    return subcategory;
}

export async function createSubcategory(categoryId: number, name: string) {
    assertRecoveryWriteAllowed();
    const trimmedName = name.trim();
    if (!trimmedName) throw new Error(SUBCATEGORY_NAME_REQUIRED_ERROR);
    await requireActiveCategory(categoryId);

    if (isEasySupabaseConfigured()) {
        return createCloudSubcategory(categoryId, trimmedName);
    }

    return db.transaction('rw', db.categories, db.subcategories, async () => {
        await assertUniqueSubcategoryName(categoryId, trimmedName);
        const now = new Date();
        return db.subcategories.add({
            categoryId,
            name: trimmedName,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        });
    });
}

export async function renameSubcategory(id: number, name: string) {
    assertRecoveryWriteAllowed();
    const trimmedName = name.trim();
    if (!trimmedName) throw new Error(SUBCATEGORY_NAME_REQUIRED_ERROR);

    if (isEasySupabaseConfigured()) {
        return renameCloudSubcategory(id, trimmedName);
    }

    return db.transaction('rw', db.subcategories, async () => {
        if (!isValidEntityId(id)) throw new Error(SUBCATEGORY_NOT_FOUND_ERROR);
        const subcategory = await db.subcategories.get(id);
        if (!subcategory) throw new Error(SUBCATEGORY_NOT_FOUND_ERROR);
        await assertUniqueSubcategoryName(subcategory.categoryId, trimmedName, id);
        return db.subcategories.update(id, { name: trimmedName, updatedAt: new Date() });
    });
}

export async function archiveSubcategory(id: number) {
    assertRecoveryWriteAllowed();

    if (isEasySupabaseConfigured()) {
        return setCloudSubcategoryActive(id, false);
    }

    return db.transaction('rw', db.subcategories, db.items, async () => {
        if (!isValidEntityId(id)) throw new Error(SUBCATEGORY_NOT_FOUND_ERROR);
        const subcategory = await db.subcategories.get(id);
        if (!subcategory) throw new Error(SUBCATEGORY_NOT_FOUND_ERROR);

        const activeReference = await db.items
            .filter(item => item.subcategoryId === id && isItemActive(item))
            .first();
        if (activeReference) throw new Error(SUBCATEGORY_ARCHIVE_ACTIVE_ITEMS_ERROR);

        return db.subcategories.update(id, { isActive: false, updatedAt: new Date() });
    });
}

export async function reactivateSubcategory(id: number) {
    assertRecoveryWriteAllowed();

    if (isEasySupabaseConfigured()) {
        return setCloudSubcategoryActive(id, true);
    }

    return db.transaction('rw', db.categories, db.subcategories, async () => {
        if (!isValidEntityId(id)) throw new Error(SUBCATEGORY_NOT_FOUND_ERROR);
        const subcategory = await db.subcategories.get(id);
        if (!subcategory) throw new Error(SUBCATEGORY_NOT_FOUND_ERROR);
        await requireActiveCategory(subcategory.categoryId);
        return db.subcategories.update(id, { isActive: true, updatedAt: new Date() });
    });
}

export async function deleteSubcategory(id: number) {
    assertRecoveryWriteAllowed();

    if (isEasySupabaseConfigured()) {
        return deleteCloudSubcategory(id);
    }

    return db.transaction('rw', db.subcategories, db.items, db.transactions, async () => {
        if (!isValidEntityId(id) || !(await db.subcategories.get(id))) {
            throw new Error(SUBCATEGORY_NOT_FOUND_ERROR);
        }

        const itemReference = await db.items.filter(item => item.subcategoryId === id).first();
        const historicalReference = await db.transactions.filter(transaction => transaction.subcategoryId === id).first();
        if (itemReference || historicalReference) throw new Error(SUBCATEGORY_DELETE_REFERENCED_ERROR);

        return db.subcategories.delete(id);
    });
}
