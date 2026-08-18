import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, useLocation } from 'react-router-dom';
import ResellerDetailPage from './ResellerDetailPage';
import { useReseller } from '../hooks/useResellers';
import { useTransactions } from '../hooks/useTransactions';

vi.mock('../hooks/useResellers', () => ({
    useReseller: vi.fn(),
}));

vi.mock('../hooks/useTransactions', () => ({
    useTransactions: vi.fn(),
    useReverseTransaction: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}));

vi.mock('../services/pdfService', () => ({
    generateResellerExtract: vi.fn(),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        warning: vi.fn(),
    },
}));

function LocationProbe() {
    const location = useLocation();
    return <div data-testid="location">{location.pathname}{location.search}</div>;
}

function renderDetail(reseller: { id: number; name: string; isActive?: boolean }) {
    vi.mocked(useReseller).mockReturnValue({
        data: {
            ...reseller,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        isLoading: false,
    } as ReturnType<typeof useReseller>);
    vi.mocked(useTransactions).mockReturnValue({ data: [], isLoading: false } as ReturnType<typeof useTransactions>);

    render(
        <MemoryRouter initialEntries={['/resellers/1']}>
            <ResellerDetailPage />
            <LocationProbe />
        </MemoryRouter>,
    );
}

describe('ResellerDetailPage transaction context launch', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('launches transaction entry with the active reseller context', () => {
        renderDetail({ id: 1, name: 'Revendedor Contexto', isActive: true });

        fireEvent.click(screen.getByRole('button', { name: 'Novo lançamento' }));

        expect(screen.getByTestId('location')).toHaveTextContent('/transactions?resellerId=1');
    });

    it('keeps contextual launch blocked for an inactive reseller', () => {
        renderDetail({ id: 1, name: 'Revendedor Inativo', isActive: false });

        const launchButton = screen.getByRole('button', { name: 'Novo lançamento' });
        expect(launchButton).toBeDisabled();
        fireEvent.click(launchButton);

        expect(screen.getByTestId('location')).toHaveTextContent('/resellers/1');
        expect(screen.getByText(/novos lançamentos estão bloqueados até a reativação/i)).toBeInTheDocument();
    });
});
