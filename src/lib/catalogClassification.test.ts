import { describe, expect, it } from "vitest";
import type { Category, Item, Subcategory } from "../db/database";
import { getCurrentItemClassificationLabel } from "./catalogClassification";

const categories: Category[] = [
    {
        id: 1,
        name: "Porcelana",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

const subcategories: Subcategory[] = [
    {
        id: 10,
        categoryId: 1,
        name: "Canecas",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

function item(classification: Pick<Item, "categoryId" | "subcategoryId">): Item {
    return {
        name: "Item",
        basePrice: 10,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...classification,
    };
}

describe("getCurrentItemClassificationLabel", () => {
    it("shows category and optional subcategory from the current catalog", () => {
        expect(getCurrentItemClassificationLabel(item({ categoryId: 1, subcategoryId: 10 }), categories, subcategories))
            .toBe("Porcelana › Canecas");
        expect(getCurrentItemClassificationLabel(item({ categoryId: 1 }), categories, subcategories))
            .toBe("Porcelana");
    });

    it("does not invent classification for legacy or unresolved references", () => {
        expect(getCurrentItemClassificationLabel(item({}), categories, subcategories))
            .toBe("Sem classificação");
        expect(getCurrentItemClassificationLabel(item({ categoryId: 999 }), categories, subcategories))
            .toBe("Sem classificação");
    });

    it("does not present a subcategory that does not belong to the resolved category", () => {
        const mismatchedSubcategories = [{ ...subcategories[0], categoryId: 2 }];
        expect(getCurrentItemClassificationLabel(item({ categoryId: 1, subcategoryId: 10 }), categories, mismatchedSubcategories))
            .toBe("Porcelana");
    });
});
