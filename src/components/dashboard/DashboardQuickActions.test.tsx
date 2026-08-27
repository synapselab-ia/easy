import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { DashboardQuickActions } from './DashboardQuickActions';

describe('DashboardQuickActions', () => {
    it('reuses the existing transaction route with the three accepted type intents', () => {
        render(
            <MemoryRouter>
                <DashboardQuickActions />
            </MemoryRouter>,
        );

        expect(screen.getByRole('group', { name: 'Ações rápidas de lançamento' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: '+ Pedido' })).toHaveAttribute(
            'href',
            '/transactions?type=order',
        );
        expect(screen.getByRole('link', { name: '+ Pagamento' })).toHaveAttribute(
            'href',
            '/transactions?type=payment',
        );
        expect(screen.getByRole('link', { name: '+ Sinal' })).toHaveAttribute(
            'href',
            '/transactions?type=signal',
        );
    });
});
