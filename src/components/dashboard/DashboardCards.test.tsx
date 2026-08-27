import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { DashboardSnapshot } from '@/domain/dashboardSnapshot';
import { DashboardCards } from './DashboardCards';

function cardFor(title: string) {
    return screen.getByText(title).closest('[data-slot="card"]') as HTMLElement;
}

function snapshot(overrides: {
    month?: Partial<DashboardSnapshot['month']>;
    today?: Partial<DashboardSnapshot['today']>;
    openDebt?: Partial<DashboardSnapshot['openDebt']>;
    critical?: Partial<DashboardSnapshot['critical']>;
} = {}) {
    return {
        month: {
            sales: 0,
            receipts: 0,
            orderCount: 0,
            itemQuantity: 0,
            ...overrides.month,
        },
        today: {
            sales: 0,
            receipts: 0,
            orderCount: 0,
            itemQuantity: 0,
            ...overrides.today,
        },
        openDebt: {
            amount: 0,
            resellerCount: 0,
            ...overrides.openDebt,
        },
        critical: {
            amount: 0,
            resellerCount: 0,
            oldestAgeDays: null,
            ...overrides.critical,
        },
    } as unknown as DashboardSnapshot;
}

describe('DashboardCards component', () => {
    it('renders loading state for all four primary KPI cards', () => {
        render(<DashboardCards snapshot={undefined} isLoading={true} />);

        expect(screen.getAllByText('Carregando...')).toHaveLength(4);
        expect(screen.getByText('Vendas este mês')).toBeInTheDocument();
        expect(screen.getByText('Recebimentos este mês')).toBeInTheDocument();
        expect(screen.getByText('Carteira em aberto')).toBeInTheDocument();
        expect(screen.getByText('Crítico > 30 dias')).toBeInTheDocument();
    });

    it('renders explicit empty-state meaning for all four cards', () => {
        render(<DashboardCards snapshot={snapshot()} isLoading={false} />);

        expect(within(cardFor('Vendas este mês')).getByText('Nenhuma venda registrada neste mês.')).toBeInTheDocument();
        expect(within(cardFor('Recebimentos este mês')).getByText('Nenhum recebimento registrado neste mês.')).toBeInTheDocument();
        expect(within(cardFor('Carteira em aberto')).getByText('Nenhum saldo em aberto hoje.')).toBeInTheDocument();
        expect(within(cardFor('Crítico > 30 dias')).getByText('Nenhum valor crítico hoje.')).toBeInTheDocument();
    });

    it('renders singular secondary context correctly', () => {
        render(
            <DashboardCards
                snapshot={snapshot({
                    month: { sales: 50, orderCount: 1, itemQuantity: 1 },
                    today: { sales: 50, orderCount: 1 },
                    openDebt: { amount: 50, resellerCount: 1 },
                    critical: { amount: 50, resellerCount: 1, oldestAgeDays: 1 },
                })}
                isLoading={false}
            />,
        );

        expect(within(cardFor('Vendas este mês')).getByText('1 pedido • 1 item')).toBeInTheDocument();
        expect(within(cardFor('Vendas este mês')).getByText('Hoje: 1 pedido • R$ 50,00')).toBeInTheDocument();
        expect(within(cardFor('Carteira em aberto')).getByText('1 revendedor com saldo em aberto')).toBeInTheDocument();
        expect(within(cardFor('Crítico > 30 dias')).getByText('1 revendedor • mais antigo: 1 dia')).toBeInTheDocument();
    });

    it('renders prepared snapshot values and context without legacy KPI labels', () => {
        render(
            <DashboardCards
                snapshot={snapshot({
                    month: { sales: 3500, receipts: 1250, orderCount: 3, itemQuantity: 7 },
                    today: { sales: 500, receipts: 250, orderCount: 2, itemQuantity: 2 },
                    openDebt: { amount: 2100, resellerCount: 2 },
                    critical: { amount: 900, resellerCount: 2, oldestAgeDays: 45 },
                })}
                isLoading={false}
            />,
        );

        expect(within(cardFor('Vendas este mês')).getByText('R$ 3.500,00')).toBeInTheDocument();
        expect(within(cardFor('Vendas este mês')).getByText('3 pedidos • 7 itens')).toBeInTheDocument();
        expect(within(cardFor('Recebimentos este mês')).getByText('R$ 1.250,00')).toBeInTheDocument();
        expect(within(cardFor('Recebimentos este mês')).getByText('Pagamentos + sinais')).toBeInTheDocument();
        expect(within(cardFor('Carteira em aberto')).getByText('R$ 2.100,00')).toBeInTheDocument();
        expect(within(cardFor('Crítico > 30 dias')).getByText('R$ 900,00')).toBeInTheDocument();
        expect(within(cardFor('Crítico > 30 dias')).getByText('2 revendedores • mais antigo: 45 dias')).toBeInTheDocument();
        expect(screen.queryByText('Dívida Total')).not.toBeInTheDocument();
        expect(screen.queryByText('Pedidos de Hoje')).not.toBeInTheDocument();
    });
});
