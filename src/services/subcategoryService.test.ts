import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../db/database';
import { createCategory } from './categoryService';
import {
    SUBCATEGORY_ACTIVE_REQUIRED_ERROR,
    SUBCATEGORY_ARCHIVE_ACTIVE_ITEMS_ERROR,
    SUBCATEGORY_DELETE_REFERENCED_ERROR,
    SUBCATEGORY_NAME_UNIQUE_ERROR,
    archiveSubcategory,
    createSubcategory,
    deleteSubcategory,
    requireActiveSubcategory,
} from './subcategoryService';

vi.mock('./recoveryHealth', () => ({
    assertRecoveryWriteAllowed: vi.fn(),
}));

describe('subcategoryService I3-D lifecycle', () => {
    beforeEach(async () => {
        await db.transactions.clear();
        await db.items.clear();
        await db.subcategories.clear();
        await db.categories.clear();
    });

    it('enforces name uniqueness only inside the same parent category', async () => {
        const porcelainId = await createCategory('Porcelana') as number;
        const bronzeId = await createCategory('Bronze') as number;

        const firstId = await createSubcategory(porcelainId, '  Placas  ') as number;
        expect((await db.subcategories.get(firstId))?.name).toBe('Placas');

        await expect(createSubcategory(porcelainId, 'placas')).rejects.toThrow(SUBCATEGORY_NAME_UNIQUE_ERROR);
        await expect(createSubcategory(bronzeId, 'Placas')).resolves.toBeTypeOf('number');
    });

    it('rejects a subcategory selected under a different category', async () => {
        const porcelainId = await createCategory('Porcelana') as number;
        const bronzeId = await createCategory('Bronze') as number;
        const plateId = await createSubcategory(porcelainId, 'Placas') as number;

        await expect(requireActiveSubcategory(plateId, bronzeId)).rejects.toThrow(SUBCATEGORY_ACTIVE_REQUIRED_ERROR);
    });

    it('blocks archive while an active item references the subcategory', async () => {
        const categoryId = await createCategory('Porcelana') as number;
        const subcategoryId = await createSubcategory(categoryId, 'Placas') as number;
        const itemId = await db.items.add({
            name: 'Placa 3x8',
            basePrice: 50,
            isActive: true,
            categoryId,
            subcategoryId,
            createdAt: new Date(),
            updatedAt: new Date(),
        }) as number;

        await expect(archiveSubcategory(subcategoryId)).rejects.toThrow(SUBCATEGORY_ARCHIVE_ACTIVE_ITEMS_ERROR);

        await db.items.update(itemId, { isActive: false });
        await archiveSubcategory(subcategoryId);
        expect((await db.subcategories.get(subcategoryId))?.isActive).toBe(false);
    });

    it('preserves permanent identity when historical orders reference the subcategory', async () => {
        const categoryId = await createCategory('Porcelana') as number;
        const subcategoryId = await createSubcategory(categoryId, 'Placas') as number;

        await db.transactions.add({
            resellerId: 1,
            type: 'order',
            itemId: 99,
            itemName: 'Placa 3x8',
            categoryId,
            categoryName: 'Porcelana',
            subcategoryId,
            subcategoryName: 'Placas',
            quantity: 1,
            unitPrice: 50,
            totalPrice: 50,
            occurredAt: new Date(),
            createdAt: new Date(),
        });

        await expect(deleteSubcategory(subcategoryId)).rejects.toThrow(SUBCATEGORY_DELETE_REFERENCED_ERROR);
        expect(await db.subcategories.get(subcategoryId)).toBeDefined();
    });
});
