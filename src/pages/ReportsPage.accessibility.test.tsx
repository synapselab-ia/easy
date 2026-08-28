import React from 'react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ReportsPage from './ReportsPage';

const mockTransactions = [
    {
        id: 1,
        resellerId: 1,
        type: 'order' as const,
        itemId: 1,
        itemName: 'Placa Árvore',
        categoryId: 1,
        categoryName: 'Porcelana',
        quantity: 2,
        unitPrice: 50,
        totalPrice: 100,
        occurredAt: new Date(2026, 7, 2, 12),
        createdAt: new Date(2026, 7, 2, 12),
    },
];

const mockResellers = [
    { id: 1, name: 'Ágata', createdAt: new Date(), updatedAt: new Date() },
];

const mockCategories = [
    { id: 1, name: 'Porcelana', isActive: true, createdAt: new Date(), updatedAt: new Date() },
];

vi.mock('../hooks/useTransactions', () => ({
    useTransactions: () => ({ data: mockTransactions, isLoading: false }),
}));
vi.mock('../hooks/useResellers', () => ({
    useResellers: () => ({ data: mockResellers, isLoading: false }),
}));
vi.mock('../hooks/useCategories', () => ({
    useCategories: () => ({ data: mockCategories, isLoading: false }),
}));
vi.mock('../hooks/useSubcategories', () => ({
    useSubcategories: () => ({ data: [], isLoading: false }),
}));

vi.mock('../components/dashboard/ParetoChart', () => ({
    ParetoChart: () => <div>Gráfico Pareto</div>,
}));

vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    CartesianGrid: () => null,
    Legend: () => null,
    Line: () => null,
    Tooltip: () => null,
    XAxis: () => null,
    YAxis: () => null,
}));

vi.mock('../services/financialReportPdfService', async () => {
    const actual = await vi.importActual<typeof import('../services/financialReportPdfService')>(
        '../services/financialReportPdfService',
    );
    return { ...actual, generateFinancialReportPdf: vi.fn() };
});

describe('ReportsPage DR-09 accessibility acceptance', () => {
    beforeAll(() => {
        global.ResizeObserver = class ResizeObserver {
            observe() { }
            unobserve() { }
            disconnect() { }
        };
    });

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 7, 28, 12, 0, 0));
    });

    it('associates report controls with labels and exposes selection/expansion state', () => {
        render(<ReportsPage />);

        expect(screen.getByLabelText('Período')).toBeInTheDocument();

        const sections = screen.getByRole('group', { name: 'Seções do relatório' });
        const summaryButton = screen.getByRole('button', { name: 'Resumo' });
        const categoryButton = screen.getByRole('button', { name: 'Produtos e categorias' });
        const resellerButton = screen.getByRole('button', { name: 'Revendedores' });

        expect(sections).toContainElement(summaryButton);
        expect(summaryButton).toHaveAttribute('aria-pressed', 'true');
        expect(categoryButton).toHaveAttribute('aria-pressed', 'false');

        fireEvent.click(categoryButton);
        expect(categoryButton).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByLabelText('Categoria histórica')).toBeInTheDocument();
        expect(screen.getByLabelText('Ordenar produtos')).toBeInTheDocument();

        const categoryExpander = screen.getByRole('button', { name: /Porcelana/i });
        expect(categoryExpander).toHaveAttribute('aria-expanded', 'false');
        fireEvent.click(categoryExpander);
        expect(categoryExpander).toHaveAttribute('aria-expanded', 'true');

        fireEvent.click(resellerButton);
        expect(resellerButton).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByLabelText('Ordenar revendedores')).toBeInTheDocument();
    });
});
