import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { DashboardReportsHandoff } from './DashboardReportsHandoff';

describe('DashboardReportsHandoff', () => {
    it('offers an explicit path from the operational Dashboard to the existing Reports workspace', () => {
        render(
            <MemoryRouter>
                <DashboardReportsHandoff />
            </MemoryRouter>,
        );

        expect(screen.getByRole('heading', { name: 'Análise detalhada' })).toBeInTheDocument();
        expect(screen.getByText(/Compare períodos e aprofunde vendas, recebimentos, produtos, categorias e revendedores/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Abrir Relatórios' })).toHaveAttribute('href', '/reports');
    });
});
