import type { Category, Item, Subcategory } from "../db/database";

export function getCurrentItemClassificationLabel(
    item: Pick<Item, "categoryId" | "subcategoryId">,
    categories: Category[],
    subcategories: Subcategory[],
) {
    if (item.categoryId === undefined) {
        return "Sem classificação";
    }

    const category = categories.find(candidate => candidate.id === item.categoryId);
    if (!category) {
        return "Sem classificação";
    }

    if (item.subcategoryId === undefined) {
        return category.name;
    }

    const subcategory = subcategories.find(candidate =>
        candidate.id === item.subcategoryId && candidate.categoryId === category.id
    );

    return subcategory ? `${category.name} › ${subcategory.name}` : category.name;
}
