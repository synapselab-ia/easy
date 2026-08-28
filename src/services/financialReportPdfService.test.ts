import { beforeEach, describe, expect, it, vi } from 'vitest';
import autoTable from 'jspdf-autotable';
import { generateFinancialReportPdf } from './financialReportPdfService';
import type { FinancialReport } from '../domain/financialReporting';

const mockSave = vi.fn();
const mockText = vi.fn();
const mockSetFontSize = vi.fn();
const mockSetFont = vi.fn();
const mockSetTextColor = vi.fn();
const mockAddPage = vi.fn();

vi.mock('jspdf', () => ({
    default: class {
        internal = {
            pageSize: {
                getWidth: vi.fn().mockReturnValue(210),
                getHeight: vi.fn().mockReturnValue(297),
            },
        };
        save = mockSave;
        text = mockText;
        setFontSize = mockSetFontSize;
        setFont = mockSetFont;
        setTextColor = mockSetTextColor;
        addPage = mockAddPage;
    },
}));

vi.mock('jspdf-autotable', () => ({ default: vi.fn() }));

const report: FinancialReport = {
    range: {
        startDate: new Date(2026, 7, 1, 0, 0, 0),
        endDate: new Date(2026, 7, 31, 23, 59, 59),
    },
    summary: {
        sales: 1000,
        receipts: 700,
        periodNet: 300,
        openDebt: 450,
        orderCount: 5,
        itemQuantity: 8,
    },
    comparison: {
        previousRange: {
            startDate: new Date(2026, 6, 1),
            endDate: new Date(2026, 6, 31, 23, 59, 59),
        },
        sales: 800,
        receipts: 600,
        periodNet: 200,
        orderCount: 4,
        openDebt: 400,
        salesChangePercent: 25,
        receiptsChangePercent: 16.67,
        periodNetChangePercent: 50,
        orderCountChangePercent: 25,
        openDebtChangePercent: 12.5,
    },
    timeline: [
        { key: '2026-08-01', label: '01/08', sales: 600, receipts: 200 },
        { key: '2026-08-02', label: '02/08', sales: 400, receipts: 500 },
    ],
    products: [
        {
            itemId: 1,
            label: 'Placa 15x30',
            categoryLabel: 'Porcelana antiga',
            subcategoryLabel: 'Placas antigas',
            orderCount: 3,
            quantity: 5,
            grossValue: 700,
        },
        {
            itemId: 2,
            label: 'Caneca 325 ml',
            categoryLabel: 'Porcelana',
            orderCount: 2,
            quantity: 3,
            grossValue: 300,
        },
    ],
    categories: [
        {
            categoryId: 1,
            label: 'Porcelana',
            orderCount: 5,
            quantity: 8,
            grossValue: 1000,
            subcategories: [
                { subcategoryId: 10, label: 'Placas', orderCount: 3, quantity: 5, grossValue: 700 },
                { label: 'Sem subcategoria', orderCount: 2, quantity: 3, grossValue: 300 },
            ],
        },
    ],
    resellers: [
        {
            resellerId: 1,
            name: 'Ana',
            orderCount: 5,
            sales: 1000,
            receipts: 700,
            closingBalance: 450,
            openDebt: 450,
        },
    ],
    resellerAnalysis: {
        countTo80: 1,
        pareto: [
            { resellerId: 1, resellerName: 'Ana', revenue: 1000, cumulativePercentage: 100 },
        ],
        topOpenBalances: [
            { resellerId: 1, resellerName: 'Ana', openDebt: 450 },
        ],
    },
};

function tableOptions(index: number) {
    return vi.mocked(autoTable).mock.calls[index][1];
}

describe('financialReportPdfService', () => {
    beforeEach(() => vi.clearAllMocks());

    it('renders the same primary financial hierarchy used by the reports workspace', () => {
        generateFinancialReportPdf(report);

        expect(autoTable).toHaveBeenCalledTimes(5);
        expect(tableOptions(0).head).toEqual([['Vendas', 'Recebimentos', 'Movimento líquido', 'Em aberto no fim']]);
        expect(tableOptions(0).body[0]).toHaveLength(4);
        expect(mockText).toHaveBeenCalledWith('5 pedidos · 8 itens vendidos no período', 14, expect.any(Number));
        expect(tableOptions(1).head).toEqual([['Período', 'Vendas', 'Recebimentos', 'Movimento líquido']]);
        expect(tableOptions(2).head).toEqual([['Produto', 'Classificação', 'Pedidos', 'Itens', 'Vendas']]);
        expect(tableOptions(2).body[0]).toEqual(expect.arrayContaining(['Placa 15x30', 'Porcelana antiga > Placas antigas']));
        expect(tableOptions(3).head).toEqual([['Categoria / subcategoria', 'Pedidos', 'Itens', 'Vendas']]);
        expect(tableOptions(4).head).toEqual([['Revendedor', 'Pedidos', 'Vendas', 'Recebimentos', 'Em aberto no fim']]);
    });

    it('supports a short PDF with only selected sections', () => {
        generateFinancialReportPdf(report, {
            includeSummary: true,
            includeTimeline: false,
            includeCategories: false,
            includeResellers: true,
        });

        expect(autoTable).toHaveBeenCalledTimes(2);
        expect(tableOptions(0).head).toEqual([['Vendas', 'Recebimentos', 'Movimento líquido', 'Em aberto no fim']]);
        expect(tableOptions(1).head).toEqual([['Revendedor', 'Pedidos', 'Vendas', 'Recebimentos', 'Em aberto no fim']]);
    });

    it('uses the selected range in the generated filename', () => {
        generateFinancialReportPdf(report);

        expect(mockSave).toHaveBeenCalledWith('relatorio_financeiro_01-08-2026_a_31-08-2026.pdf');
    });
});
