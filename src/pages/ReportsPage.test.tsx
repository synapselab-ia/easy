import React from 'react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
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
        quantity: 4,
        unitPrice: 50,
        totalPrice: 200,
        occurredAt: new Date(2026, 7, 2, 12),
        createdAt: new Date(2026, 7, 2, 12),
    },
    {
        id: 2,
        resellerId: 2,
        type: 'order' as const,
        itemId: 2,
        itemName: 'Caneca Branca',
        categoryId: 2,
        categoryName: 'Canecas',
        quantity: 2,
        unitPrice: 50,
        totalPrice: 100,
        occurredAt: new Date(2026, 7, 3, 12),
        createdAt: new Date(2026, 7, 3, 12),
    },
    {
        id: 3,
        resellerId: 1,
        type: 'payment' as const,
        totalPrice: 50,
        occurredAt: new Date(2026, 7, 4, 12),
        createdAt: new Date(2026, 7, 4, 12),
    },
    {
        id: 4,
        resellerId: 1,
        type: 'order' as const,
        itemId: 9,
        itemName: 'Venda anterior',
        categoryId: 1,
        categoryName: 'Porcelana',
        quantity: 1,
        unitPrice: 40,
        totalPrice: 40,
        occurredAt: new Date(2026, 6, 31, 12),
        createdAt: new Date(2026, 6, 31, 12),
    },
];

const mockResellers = [
    { id: 1, name: 'Ágata', createdAt: new Date(), updatedAt: new Date() },
    { id: 2, name: 'Bruno', createdAt: new Date(), updatedAt: new Date() },
];

const mockCategories = [
    { id: 1, name: 'Porcelana', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 2, name: 'Canecas', isActive: true, createdAt: new Date(), updatedAt: new Date() },
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

vi.mock('../components/ui/select', () => ({
    Select: ({ value, onValueChange, children }: any) => (
        <select
            data-testid="mock-select"
            value={value}
            onChange={event => onValueChange(event.target.value)}
        >
            {children}
        </select>
    ),
    SelectContent: ({ children }: any) => <>{children}</>,
    SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
    SelectTrigger: () => null,
    SelectValue: () => null,
}));

vi.mock('../components/dashboard/ParetoChart', () => ({
    ParetoChart: ({ data }: { data: unknown[] }) => (
        <div data-testid="reports-pareto">Pareto canônico · {data.length} revendedores</div>
    ),
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

describe('ReportsPage DR-08', () => {
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

    it('uses the four primary financial KPIs and exposes the actual previous comparison range', () => {
        render(<ReportsPage />);

        expect(screen.getByText('Vendas', { selector: '[data-slot="card-title"]' })).toBeInTheDocument();
        expect(screen.getByText('Recebimentos', { selector: '[data-slot="card-title"]' })).toBeInTheDocument();
        expect(screen.getByText('Movimento líquido', { selector: '[data-slot="card-title"]' })).toBeInTheDocument();
        expect(screen.getByText('Em aberto no fim', { selector: '[data-slot="card-title"]' })).toBeInTheDocument();
        expect(screen.queryByText('Pedidos', { selector: '[data-slot="card-title"]' })).not.toBeInTheDocument();

        expect(screen.getAllByText(/04\/07\/2026 a 31\/07\/2026/).length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText(/6 itens em 2 pedidos/)).toBeInTheDocument();
    });

    it('adds bounded product search, historical-category filtering and sorting', () => {
        render(<ReportsPage />);
        fireEvent.click(screen.getByRole('button', { name: 'Produtos e categorias' }));

        expect(screen.getByLabelText('Buscar produto')).toBeInTheDocument();
        expect(screen.getByText('Categoria histórica')).toBeInTheDocument();
        expect(screen.getByText('Ordenar produtos')).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText('Buscar produto'), { target: { value: 'arvore' } });
        const productTable = screen.getByRole('table');
        expect(within(productTable).getByText('Placa Árvore')).toBeInTheDocument();
        expect(within(productTable).queryByText('Caneca Branca')).not.toBeInTheDocument();
    });

    it('re-homes period Pareto, report-end open balances and reseller investigation in Reports', () => {
        render(<ReportsPage />);
        fireEvent.click(screen.getByRole('button', { name: 'Revendedores' }));

        expect(screen.getByText('Concentração de vendas')).toBeInTheDocument();
        expect(screen.getByText('Maiores saldos em aberto no fim')).toBeInTheDocument();
        expect(screen.getByText(/não significa inadimplência por si só/i)).toBeInTheDocument();
        expect(screen.getByTestId('reports-pareto')).toHaveTextContent('Pareto canônico · 2 revendedores');
        expect(screen.getByLabelText('Buscar revendedor')).toBeInTheDocument();
        expect(screen.getByText('Ordenar revendedores')).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText('Buscar revendedor'), { target: { value: 'agata' } });
        const resellerTable = screen.getByRole('table');
        expect(within(resellerTable).getByText('Ágata')).toBeInTheDocument();
        expect(within(resellerTable).queryByText('Bruno')).not.toBeInTheDocument();
    });
});
