import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DashboardCards } from './DashboardCards';

function cardFor(title: string) {
    return screen.getByText(title).closest('[data-slot="card"]') as HTMLElement;
}

describe('DashboardCards component', () => {
    it('renders loading state', () => {
        render(<DashboardCards totalDebt={0} todayOrdersCount={0} todayOrdersVolume={0} isLoading={true} />);

        expect(screen.getAllByText('Carregando...')).toHaveLength(2);
    });

    it('renders empty states correctly', () => {
        render(<DashboardCards totalDebt={0} todayOrdersCount={0} todayOrdersVolume={0} isLoading={false} />);

        const debtCard = cardFor('Dívida Total');
        const ordersCard = cardFor('Pedidos de Hoje');

        expect(within(debtCard).getByText('Nenhuma dívida pendente.')).toBeInTheDocument();
        expect(within(debtCard).getByText(/0,00/)).toBeInTheDocument();
        expect(within(ordersCard).getByText('Nenhum pedido realizado hoje.')).toBeInTheDocument();
        expect(within(ordersCard).getByText(/Volume total:/)).toHaveTextContent(/0,00/);
    });

    it('renders single order text', () => {
        render(<DashboardCards totalDebt={50} todayOrdersCount={1} todayOrdersVolume={50} isLoading={false} />);

        const debtCard = cardFor('Dívida Total');
        const ordersCard = cardFor('Pedidos de Hoje');

        expect(within(debtCard).getByText(/50,00/)).toBeInTheDocument();
        expect(within(ordersCard).getByText('1 pedido')).toBeInTheDocument();
        expect(within(ordersCard).getByText(/Volume total:/)).toHaveTextContent(/50,00/);
    });

    it('renders data correctly', () => {
        render(<DashboardCards totalDebt={150.5} todayOrdersCount={3} todayOrdersVolume={500} isLoading={false} />);

        const debtCard = cardFor('Dívida Total');
        const ordersCard = cardFor('Pedidos de Hoje');
        const debtValue = within(debtCard).getByText(/150,50/);

        expect(debtValue).toBeInTheDocument();
        expect(debtValue.className).toContain('text-debt');
        expect(within(ordersCard).getByText('3 pedidos')).toBeInTheDocument();
        expect(within(ordersCard).getByText(/Volume total:/)).toHaveTextContent(/500,00/);
    });
});
