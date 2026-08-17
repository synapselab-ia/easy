import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ResellerDetailPage from './ResellerDetailPage';
import { useReseller } from '../hooks/useResellers';
import { useTransactions } from '../hooks/useTransactions';
import { generateResellerExtract } from '../services/pdfService';

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
    toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));

describe('P3-S1 reseller period filtering', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useReseller).mockReturnValue({
            data: {
                id: 1,
                name: 'Ana',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            isLoading: false,
        } as any);
    });

    it('filters history/PDF by occurredAt instead of registration createdAt', () => {
        const createdInsideOccurredOutside = {
            id: 1,
            resellerId: 1,
            type: 'order' as const,
            totalPrice: 100,
            itemName: 'Fora do período financeiro',
            occurredAt: new Date('2025-03-15T12:00:00'),
            createdAt: new Date('2025-02-15T12:00:00'),
        };
        const createdOutsideOccurredInside = {
            id: 2,
            resellerId: 1,
            type: 'payment' as const,
            totalPrice: 40,
            occurredAt: new Date('2025-02-20T12:00:00'),
            createdAt: new Date('2025-04-20T12:00:00'),
        };

        vi.mocked(useTransactions).mockReturnValue({
            data: [createdInsideOccurredOutside, createdOutsideOccurredInside],
            isLoading: false,
        } as any);

        render(<MemoryRouter><ResellerDetailPage /></MemoryRouter>);

        fireEvent.change(screen.getByLabelText('Data Início'), { target: { value: '2025-02-01' } });
        fireEvent.change(screen.getByLabelText('Data Fim'), { target: { value: '2025-02-28' } });

        expect(screen.queryByText('Fora do período financeiro')).not.toBeInTheDocument();
        fireEvent.click(screen.getByText('Gerar PDF'));

        expect(generateResellerExtract).toHaveBeenCalledWith(
            expect.objectContaining({ id: 1 }),
            [expect.objectContaining({ id: 2 })],
            -40,
            expect.objectContaining({ startDate: expect.any(Date), endDate: expect.any(Date) }),
        );
    });
});
