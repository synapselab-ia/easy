import { describe, expect, it } from 'vitest';
import type { Category, Reseller, Subcategory, Transaction } from '../db/database';
import { buildFinancialReport } from './financialReporting';

const categories: Category[] = [
    { id: 1, name: 'Porcelana', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 2, name: 'Molduras', isActive: true, createdAt: new Date(), updatedAt: new Date() },
];

const subcategories: Subcategory[] = [
    { id: 10, categoryId: 1, name: 'Placas', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 11, categoryId: 1, name: 'Outros', isActive: true, createdAt: new Date(), updatedAt: new Date() },
];

const resellers: Reseller[] = [
    { id: 1, name: 'Ana', createdAt: new Date(), updatedAt: new Date() },
    { id: 2, name: 'Beatriz', createdAt: new Date(), updatedAt: new Date() },
];

function at(day: number) {
    return new Date(2026, 7, day, 12, 0, 0);
}

const transactions: Transaction[] = [
    {
        id: 1,
        resellerId: 1,
        type: 'order',
        itemId: 1,
        itemName: 'Placa A',
        categoryId: 1,
        categoryName: 'Porcelana antiga',
        subcategoryId: 10,
        subcategoryName: 'Placas antigas',
        quantity: 2,
        unitPrice: 50,
        totalPrice: 100,
        occurredAt: at(2),
        createdAt: at(2),
    },
    {
        id: 2,
        resellerId: 1,
        type: 'payment',
        totalPrice: 30,
        occurredAt: at(3),
        createdAt: at(3),
    },
    {
        id: 3,
        resellerId: 2,
        type: 'order',
        itemId: 2,
        itemName: 'Peça sem subcategoria',
        categoryId: 1,
        categoryName: 'Porcelana',
        quantity: 1,
        unitPrice: 80,
        totalPrice: 80,
        occurredAt: at(4),
        createdAt: at(4),
    },
    {
        id: 4,
        resellerId: 2,
        type: 'signal',
        totalPrice: 20,
        occurredAt: at(4),
        createdAt: at(4),
    },
    {
        id: 5,
        resellerId: 2,
        type: 'order',
        itemId: 3,
        itemName: 'Estornado',
        categoryId: 2,
        categoryName: 'Molduras',
        quantity: 1,
        unitPrice: 999,
        totalPrice: 999,
        reversal: { reason: 'Teste', reversedAt: '2026-08-05T12:00:00.000Z' },
        occurredAt: at(5),
        createdAt: at(5),
    },
    {
        id: 6,
        resellerId: 1,
        type: 'order',
        itemId: 1,
        itemName: 'Pedido anterior',
        categoryId: 1,
        categoryName: 'Porcelana',
        subcategoryId: 11,
        subcategoryName: 'Outros',
        quantity: 1,
        unitPrice: 40,
        totalPrice: 40,
        occurredAt: new Date(2026, 6, 31, 12, 0, 0),
        createdAt: new Date(2026, 6, 31, 12, 0, 0),
    },
];

describe('buildFinancialReport', () => {
    it('builds period totals using effective occurrence-time movements', () => {
        const report = buildFinancialReport(
            transactions,
            resellers,
            categories,
            subcategories,
            { startDate: at(1), endDate: at(5) },
        );

        expect(report.summary.sales).toBe(180);
        expect(report.summary.receipts).toBe(50);
        expect(report.summary.periodNet).toBe(130);
        expect(report.summary.orderCount).toBe(2);
        expect(report.summary.itemQuantity).toBe(3);
        expect(report.summary.openDebt).toBe(170);
    });

    it('groups products by stable category/subcategory identity and keeps no-subcategory explicit', () => {
        const report = buildFinancialReport(
            transactions,
            resellers,
            categories,
            subcategories,
            { startDate: at(1), endDate: at(5) },
        );

        expect(report.categories).toHaveLength(1);
        expect(report.categories[0]).toMatchObject({
            categoryId: 1,
            label: 'Porcelana',
            orderCount: 2,
            quantity: 3,
            grossValue: 180,
        });
        expect(report.categories[0].subcategories).toEqual([
            expect.objectContaining({ subcategoryId: 10, label: 'Placas', grossValue: 100 }),
            expect.objectContaining({ label: 'Sem subcategoria', grossValue: 80 }),
        ]);
    });

    it('shows reseller period movement while closing debt includes earlier history', () => {
        const report = buildFinancialReport(
            transactions,
            resellers,
            categories,
            subcategories,
            { startDate: at(1), endDate: at(5) },
        );

        expect(report.resellers[0]).toMatchObject({
            resellerId: 1,
            name: 'Ana',
            orderCount: 1,
            sales: 100,
            receipts: 30,
            closingBalance: 110,
            openDebt: 110,
        });
        expect(report.resellers[1]).toMatchObject({
            resellerId: 2,
            name: 'Beatriz',
            orderCount: 1,
            sales: 80,
            receipts: 20,
            closingBalance: 60,
            openDebt: 60,
        });
    });

    it('compares against the immediately preceding period with equal calendar length', () => {
        const report = buildFinancialReport(
            transactions,
            resellers,
            categories,
            subcategories,
            { startDate: at(1), endDate: at(5) },
        );

        expect(report.comparison.previousRange.startDate).toEqual(new Date(2026, 6, 27, 0, 0, 0, 0));
        expect(report.comparison.previousRange.endDate).toEqual(new Date(2026, 6, 31, 23, 59, 59, 999));
        expect(report.comparison.sales).toBe(40);
        expect(report.comparison.salesChangePercent).toBe(350);
    });

    it('creates a complete daily timeline for short ranges, including zero days', () => {
        const report = buildFinancialReport(
            transactions,
            resellers,
            categories,
            subcategories,
            { startDate: at(1), endDate: at(5) },
        );

        expect(report.timeline).toHaveLength(5);
        expect(report.timeline[0]).toMatchObject({ sales: 0, receipts: 0 });
        expect(report.timeline[1]).toMatchObject({ sales: 100, receipts: 0 });
        expect(report.timeline[2]).toMatchObject({ sales: 0, receipts: 30 });
    });

    it('rejects an inverted range', () => {
        expect(() => buildFinancialReport(
            transactions,
            resellers,
            categories,
            subcategories,
            { startDate: at(5), endDate: at(1) },
        )).toThrow('A data de início não pode ser posterior à data de fim.');
    });
});
