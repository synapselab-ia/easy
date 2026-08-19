import type { Category, Transaction } from '../db/database';
import { isCategoryActive } from '../db/database';
import { isTransactionReversed, transactionOccurredAt } from './transactions';

export const LEGACY_CATEGORY_LABEL = 'Sem categoria — histórico legado';

export interface CategoryReportRange {
    startDate: Date;
    endDate: Date;
}

export interface CategoryOrderPerformance {
    categoryId?: number;
    label: string;
    isArchived: boolean;
    orderCount: number;
    quantity: number;
    grossValue: number;
}

function categoryLabel(
    categoryId: number,
    categoryById: Map<number, Category>,
    transaction: Transaction,
) {
    const currentCategory = categoryById.get(categoryId);
    return currentCategory?.name || transaction.categoryName || `Categoria #${categoryId}`;
}

export function buildCategoryOrderPerformance(
    transactions: Transaction[],
    categories: Category[],
    range?: CategoryReportRange,
): CategoryOrderPerformance[] {
    if (range && range.startDate > range.endDate) {
        throw new Error('A data de início não pode ser posterior à data de fim.');
    }

    const categoryById = new Map(
        categories
            .filter((category): category is Category & { id: number } => typeof category.id === 'number')
            .map(category => [category.id, category]),
    );

    const groups = new Map<string, CategoryOrderPerformance>();

    transactions.forEach(transaction => {
        if (transaction.type !== 'order' || isTransactionReversed(transaction)) return;

        const occurredAt = transactionOccurredAt(transaction);
        if (range && (occurredAt < range.startDate || occurredAt > range.endDate)) return;

        const categoryId = transaction.categoryId;
        const key = categoryId === undefined ? 'legacy' : `category:${categoryId}`;
        const currentCategory = categoryId === undefined ? undefined : categoryById.get(categoryId);
        const existing = groups.get(key);

        const group = existing || {
            ...(categoryId !== undefined ? { categoryId } : {}),
            label: categoryId === undefined
                ? LEGACY_CATEGORY_LABEL
                : categoryLabel(categoryId, categoryById, transaction),
            isArchived: currentCategory ? !isCategoryActive(currentCategory) : false,
            orderCount: 0,
            quantity: 0,
            grossValue: 0,
        };

        group.orderCount += 1;
        group.quantity += transaction.quantity ?? 0;
        group.grossValue += transaction.totalPrice;
        groups.set(key, group);
    });

    return Array.from(groups.values()).sort((left, right) => {
        const grossDelta = right.grossValue - left.grossValue;
        if (grossDelta !== 0) return grossDelta;
        return left.label.localeCompare(right.label, 'pt-BR');
    });
}
