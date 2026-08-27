import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardPage from './DashboardPage';
import { useDashboardSnapshot } from '../hooks/useDashboard';

vi.mock('../hooks/useDashboard', () => ({
    useDashboardSnapshot: vi.fn(),
}));

vi.mock('../components/dashboard/DebtHealthAgingCard', () => ({
    DebtHealthAgingCard: () => <div>Debt aging</div>,
}));

vi.mock('../components/dashboard/PerformanceAnalysisSection', () => ({
    PerformanceAnalysisSection: () => <div>Performance analysis</div>,
}));

const dashboardSnapshot = {
    month: {
        sales: 3500,
        receipts: 1250,
        orderCount: 3,
        itemQuantity: 7,
    },
    today: {
        sales: 500,
        receipts: 250,
        orderCount: 1,
        itemQuantity: 2,
    },
    openDebt: {
        amount: 2100,
        resellerCount: 2,
    },
    critical: {
        amount: 900,
        resellerCount: 2,
        oldestAgeDays: 45,
    },
} as any;

describe('DashboardPage integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state for all primary KPI cards', () => {
        vi.mocked(useDashboardSnapshot).mockReturnValue({ data: undefined, isLoading: true } as any);

        render(<DashboardPage />);

        expect(screen.getAllByText('Carregando...')).toHaveLength(4);
    });

    it('renders the four DR-03 KPIs from the canonical Dashboard snapshot', () => {
        vi.mocked(useDashboardSnapshot).mockReturnValue({ data: dashboardSnapshot, isLoading: false } as any);

        render(<DashboardPage />);

        expect(screen.getByText('Vendas este mês')).toBeInTheDocument();
        expect(screen.getByText('Recebimentos este mês')).toBeInTheDocument();
        expect(screen.getByText('Carteira em aberto')).toBeInTheDocument();
        expect(screen.getByText('Crítico > 30 dias')).toBeInTheDocument();

        expect(screen.getByText('R$ 3.500,00')).toBeInTheDocument();
        expect(screen.getByText('R$ 1.250,00')).toBeInTheDocument();
        expect(screen.getByText('R$ 2.100,00')).toBeInTheDocument();
        expect(screen.getByText('R$ 900,00')).toBeInTheDocument();

        expect(screen.getByText('3 pedidos • 7 itens')).toBeInTheDocument();
        expect(screen.getByText('Hoje: 1 pedido • R$ 500,00')).toBeInTheDocument();
        expect(screen.getByText('Pagamentos + sinais')).toBeInTheDocument();
        expect(screen.getByText('Hoje: R$ 250,00')).toBeInTheDocument();
        expect(screen.getByText('2 revendedores com saldo em aberto')).toBeInTheDocument();
        expect(screen.getByText('2 revendedores • mais antigo: 45 dias')).toBeInTheDocument();
        expect(screen.queryByText(/tempo real/i)).not.toBeInTheDocument();
    });

    it('keeps explicit empty-state meaning when the snapshot has no current activity or debt', () => {
        vi.mocked(useDashboardSnapshot).mockReturnValue({
            data: {
                ...dashboardSnapshot,
                month: { sales: 0, receipts: 0, orderCount: 0, itemQuantity: 0 },
                today: { sales: 0, receipts: 0, orderCount: 0, itemQuantity: 0 },
                openDebt: { amount: 0, resellerCount: 0 },
                critical: { amount: 0, resellerCount: 0, oldestAgeDays: null },
            },
            isLoading: false,
        } as any);

        render(<DashboardPage />);

        expect(screen.getByText('Nenhuma venda registrada neste mês.')).toBeInTheDocument();
        expect(screen.getByText('Nenhum recebimento registrado neste mês.')).toBeInTheDocument();
        expect(screen.getByText('Nenhum saldo em aberto hoje.')).toBeInTheDocument();
        expect(screen.getByText('Nenhum valor crítico hoje.')).toBeInTheDocument();
    });
});
