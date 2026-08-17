import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardPage from './DashboardPage';
import { useTotalDebt, useTodayOrders } from '../hooks/useDashboard';

vi.mock('../hooks/useDashboard', () => ({
    useTotalDebt: vi.fn(),
    useTodayOrders: vi.fn(),
}));

vi.mock('../components/dashboard/DebtHealthAgingCard', () => ({
    DebtHealthAgingCard: () => <div>Debt aging</div>,
}));

vi.mock('../components/dashboard/PerformanceAnalysisSection', () => ({
    PerformanceAnalysisSection: () => <div>Performance analysis</div>,
}));

describe('DashboardPage integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state from hooks', () => {
        vi.mocked(useTotalDebt).mockReturnValue({ data: undefined, isLoading: true } as any);
        vi.mocked(useTodayOrders).mockReturnValue({ data: undefined, isLoading: true } as any);

        render(<DashboardPage />);

        expect(screen.getAllByText('Carregando...')[0]).toBeInTheDocument();
    });

    it('renders data from hooks', () => {
        vi.mocked(useTotalDebt).mockReturnValue({ data: 1200, isLoading: false } as any);
        vi.mocked(useTodayOrders).mockReturnValue({ data: { count: 5, volume: 800 }, isLoading: false } as any);

        render(<DashboardPage />);

        expect(screen.getByText(/1.200,00/)).toBeInTheDocument();
        expect(screen.getByText('5 pedidos')).toBeInTheDocument();
        expect(screen.getByText(/800,00/)).toBeInTheDocument();
    });
});
