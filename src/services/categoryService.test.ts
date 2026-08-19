import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../db/database';
import {
    CATEGORY_ARCHIVE_ACTIVE_ITEMS_ERROR,
    CATEGORY_DELETE_REFERENCED_ERROR,
    CATEGORY_NAME_UNIQUE_ERROR,
    archiveCategory,
    createCategory,
    deleteCategory,
    reactivateCategory,
    renameCategory,
} from './categoryService';

vi.mock('./recoveryHealth', () => ({
    assertRecoveryWriteAllowed: vi.fn(),
}));

describe('categoryService P9-S3-I2 lifecycle', () => {
    beforeEach(async () => {
        await db.transactions.clear();
        await db.items.clear();
        await db.categories.clear();
    });

    it('keeps category identity stable across rename and enforces case-insensitive uniqueness across archived categories', async () => {
        const categoryId = await createCategory('  Porcelana  ') as number;
        await renameCategory(categoryId, 'Porcelana Premium');

        const renamed = await db.categories.get(categoryId);
        expect(renamed?.id).toBe(categoryId);
        expect(renamed?.name).toBe('Porcelana Premium');

        await archiveCategory(categoryId);
        await expect(createCategory('  porcelana premium ')).rejects.toThrow(CATEGORY_NAME_UNIQUE_ERROR);
        expect((await db.categories.get(categoryId))?.isActive).toBe(false);

        await reactivateCategory(categoryId);
        expect((await db.categories.get(categoryId))?.isActive).toBe(true);
    });

    it('blocks archive while an active item references the category but allows inactive historical item references', async () => {
        const categoryId = await createCategory('Bronze') as number;
        const itemId = await db.items.add({
            name: 'Placa bronze',
            basePrice: 100,
            isActive: true,
            categoryId,
            createdAt: new Date(),
            updatedAt: new Date(),
        }) as number;

        await expect(archiveCategory(categoryId)).rejects.toThrow(CATEGORY_ARCHIVE_ACTIVE_ITEMS_ERROR);
        expect((await db.categories.get(categoryId))?.isActive).toBe(true);

        await db.items.update(itemId, { isActive: false });
        await archiveCategory(categoryId);
        expect((await db.categories.get(categoryId))?.isActive).toBe(false);
        expect((await db.items.get(itemId))?.categoryId).toBe(categoryId);
    });

    it('blocks permanent deletion when any item references the category', async () => {
        const categoryId = await createCategory('Madeira') as number;
        await db.items.add({
            name: 'Item histórico',
            basePrice: 50,
            isActive: false,
            categoryId,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await expect(deleteCategory(categoryId)).rejects.toThrow(CATEGORY_DELETE_REFERENCED_ERROR);
        expect(await db.categories.get(categoryId)).toBeDefined();
    });

    it('blocks permanent deletion when a historical order snapshot references the category and allows deletion when unused', async () => {
        const usedCategoryId = await createCategory('Histórica') as number;
        const unusedCategoryId = await createCategory('Sem uso') as number;

        await db.transactions.add({
            resellerId: 1,
            type: 'order',
            itemId: 99,
            itemName: 'Snapshot antigo',
            categoryId: usedCategoryId,
            categoryName: 'Histórica',
            quantity: 1,
            unitPrice: 20,
            totalPrice: 20,
            occurredAt: new Date(),
            createdAt: new Date(),
        });

        await expect(deleteCategory(usedCategoryId)).rejects.toThrow(CATEGORY_DELETE_REFERENCED_ERROR);
        await deleteCategory(unusedCategoryId);

        expect(await db.categories.get(usedCategoryId)).toBeDefined();
        expect(await db.categories.get(unusedCategoryId)).toBeUndefined();
    });
});
