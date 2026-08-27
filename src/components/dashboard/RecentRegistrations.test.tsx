import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { DashboardRecentRegistration } from '@/domain/dashboardSnapshot';
import { RecentRegistrations } from './RecentRegistrations';

const rows: DashboardRecentRegistration[] = [
    {
        transactionId: 30,
        resellerId: 10,
        resellerName: 'Revenda Alfa',
        type: 'payment',
        totalPrice: 250,
        createdAt: new Date(2026, 7, 27, 15, 30),
        occurredAt: new Date(2026, 7, 26, 12, 0),
    },
    {
        transactionId: 29,
        resellerId: 20,
        resellerName: 'Revenda Beta',
        type: 'order',
        totalPrice: 900,
        createdAt: new Date(2026, 7, 27, 14, 0),
        occurredAt: new Date(2026, 7, 27, 10, 0),
    },
    {
        transactionId: 28,
        resellerId: 30,
        resellerName: 'Revenda Gama',
        type: 'signal',
        totalPrice: 120,
        createdAt: new Date(2026, 7, 27, 13, 0),
        occurredAt: new Date(2026, 7, 27, 9, 0),
    },
];

function LocationProbe() {
    const location = useLocation();
    return <div data-testid="location">{location.pathname}{location.search}</div>;
}

function renderFeed(feedRows = rows) {
    return render(
        <MemoryRouter initialEntries={['/']}>
            <RecentRegistrations rows={feedRows} isLoading={false} />
            <LocationProbe />
        </MemoryRouter>,
    );
}

describe('RecentRegistrations', () => {
    it('projects the prepared order without re-sorting and distinguishes each transaction type', () => {
        renderFeed();

        const rowButtons = screen.getAllByRole('button', { name: /Abrir histórico de/ });
        expect(rowButtons).toHaveLength(3);
        expect(rowButtons[0]).toHaveTextContent('Revenda Alfa');
        expect(rowButtons[1]).toHaveTextContent('Revenda Beta');
        expect(rowButtons[2]).toHaveTextContent('Revenda Gama');

        expect(screen.getByText('Pagamento')).toBeInTheDocument();
        expect(screen.getByText('Pedido')).toBeInTheDocument();
        expect(screen.getByText('Sinal')).toBeInTheDocument();
        expect(screen.getByText('R$ 250,00')).toBeInTheDocument();
        expect(screen.getByText('R$ 900,00')).toBeInTheDocument();
        expect(screen.getByText('R$ 120,00')).toBeInTheDocument();
    });

    it('shows occurrence date only when the financial day differs from the registration day', () => {
        renderFeed();

        expect(screen.getAllByText(/Ocorrência:/)).toHaveLength(1);
        expect(screen.getByText(/Ocorrência: 26\/08\/2026/)).toBeInTheDocument();
    });

    it('navigates a selected registration to the existing reseller detail/history route', () => {
        renderFeed();

        fireEvent.click(screen.getByRole('button', {
            name: 'Abrir histórico de Revenda Alfa: Pagamento, R$ 250,00',
        }));

        expect(screen.getByTestId('location')).toHaveTextContent('/resellers/10');
    });

    it('keeps explicit business empty and compact loading states', () => {
        const { rerender } = render(
            <MemoryRouter>
                <RecentRegistrations rows={[]} isLoading={false} />
            </MemoryRouter>,
        );

        expect(screen.getByText('Nenhum lançamento efetivo registrado ainda.')).toBeInTheDocument();

        rerender(
            <MemoryRouter>
                <RecentRegistrations rows={[]} isLoading={true} />
            </MemoryRouter>,
        );

        expect(screen.getByLabelText('Carregando últimos lançamentos registrados')).toHaveAttribute(
            'aria-busy',
            'true',
        );
    });
});
