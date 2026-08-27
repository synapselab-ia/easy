import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardPage from './DashboardPage';
import { useDashboardSnapshot } from '../hooks/useDashboard';

vi.mock('../hooks/useDashboard', () => ({
    useDashboardSnapshot: vi.fn(),
}));

vi.mock('../components/dashboard/DashboardQuickActions', () => ({
    DashboardQuickActions: () => <div>Quick actions</div>,
}));

vi.mock('../components/dashboard/AttentionCenter', () => ({
    AttentionCenter: ({ rows, isLoading }: { rows: unknown[]; isLoading: boolean }) => (
        <div>{isLoading ? 'Attention loading' : `Attention center ${rows.length}`}</div>
    ),
}));

vi.mock('../components/dashboard/DebtHealthAgingCard', () => ({
    DebtHealthAgingCard: ({
        buckets,
        totalDebt,
        isLoading,
    }: {
        buckets?: unknown[];
        totalDebt?: number;
        isLoading: boolean;
    }) => (
        <div>
            {isLoading ? 'Debt aging loading' : `Debt aging ${buckets?.length ?? 0} / ${totalDebt ?? 0}`}
        </div>
    ),
}));

vi.mock('../components/dashboard/RecentRegistrations', () => ({
    RecentRegistrations: ({ rows, isLoading }: { rows: unknown[]; isLoading: boolean }) => (
        <div>{isLoading ? 'Recent loading' : `Recent registrations ${rows.length}`}</div>
    ),
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
    agingBuckets: [
        { category: 'recent', value: 700, percentage: 33.3333 },
        { category: 'attention', value: 500, percentage: 23.8095 },
        { category: 'critical', value: 900, percentage: 42.8571 },
    ],
    attentionRows: [
        {
            resellerId: 10,
            resellerName: 'Revendedor em risco',
            status: 'critical',
            alertAmount: 900,
            totalOpenDebt: 1000,
            oldestOutstandingAt: new Date('2026-07-01T12:00:00'),
            ageDays: 45,
        },
    ],
    recentRegistrations: [
        {
            transactionId: 30,
            resellerId: 10,
            resellerName: 'Revendedor em risco',
            type: 'payment',
            totalPrice: 250,
            createdAt: new Date('2026-08-27T15:30:00'),
            occurredAt: new Date('2026-08-26T12:00:00'),
        },
        {
            transactionId: 29,
            resellerId: 20,
            resellerName: 'Revendedor recente',
            type: 'order',
            totalPrice: 500,
            createdAt: new Date('2026-08-27T14:30:00'),
            occurredAt: new Date('2026-08-27T12:00:00'),
        },
    ],
} as any;

describe('DashboardPage integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state for the primary KPIs and all operational blocks', () => {
        vi.mocked(useDashboardSnapshot).mockReturnValue({ data: undefined, isLoading: true } as any);

        render(<DashboardPage />);

        expect(screen.getAllByText('Carregando...')).toHaveLength(4);
        expect(screen.getByText('Quick actions')).toBeInTheDocument();
        expect(screen.getByText('Attention loading')).toBeInTheDocument();
        expect(screen.getByText('Debt aging loading')).toBeInTheDocument();
        expect(screen.getByText('Recent loading')).toBeInTheDocument();
    });

    it('renders the four KPIs and hands prepared DR-04/DR-05/DR-06 data to the operational blocks', () => {
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
        expect(screen.getByText('Quick actions')).toBeInTheDocument();
        expect(screen.getByText('Attention center 1')).toBeInTheDocument();
        expect(screen.getByText('Debt aging 3 / 2100')).toBeInTheDocument();
        expect(screen.getByText('Recent registrations 2')).toBeInTheDocument();
        expect(screen.queryByText(/tempo real/i)).not.toBeInTheDocument();
    });

    it('keeps explicit empty-state meaning when the snapshot has no current activity, debt, attention or recent rows', () => {
        vi.mocked(useDashboardSnapshot).mockReturnValue({
            data: {
                ...dashboardSnapshot,
                month: { sales: 0, receipts: 0, orderCount: 0, itemQuantity: 0 },
                today: { sales: 0, receipts: 0, orderCount: 0, itemQuantity: 0 },
                openDebt: { amount: 0, resellerCount: 0 },
                critical: { amount: 0, resellerCount: 0, oldestAgeDays: null },
                agingBuckets: dashboardSnapshot.agingBuckets.map((bucket: any) => ({
                    ...bucket,
                    value: 0,
                    percentage: 0,
                })),
                attentionRows: [],
                recentRegistrations: [],
            },
            isLoading: false,
        } as any);

        render(<DashboardPage />);

        expect(screen.getByText('Nenhuma venda registrada neste mês.')).toBeInTheDocument();
        expect(screen.getByText('Nenhum recebimento registrado neste mês.')).toBeInTheDocument();
        expect(screen.getByText('Nenhum saldo em aberto hoje.')).toBeInTheDocument();
        expect(screen.getByText('Nenhum valor crítico hoje.')).toBeInTheDocument();
        expect(screen.getByText('Attention center 0')).toBeInTheDocument();
        expect(screen.getByText('Debt aging 3 / 0')).toBeInTheDocument();
        expect(screen.getByText('Recent registrations 0')).toBeInTheDocument();
    });
});
