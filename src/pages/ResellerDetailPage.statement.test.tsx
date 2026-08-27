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

describe('P3-S2 reseller statement semantics', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useReseller).mockReturnValue({
            data: {
                id: 1,
                name: 'Ana',
                createdAt: new Date('2025-01-01T12:00:00'),
                updatedAt: new Date('2025-01-01T12:00:00'),
            },
            isLoading: false,
        } as any);
    });

    it('shows opening balance, period movement and closing balance from one statement contract', () => {
        const transactions = [
            {
                id: 1,
                resellerId: 1,
                type: 'order' as const,
                totalPrice: 100,
                itemName: 'Saldo anterior',
                occurredAt: new Date('2025-12-31T12:00:00'),
                createdAt: new Date('2025-12-31T12:00:00'),
            },
            {
                id: 2,
                resellerId: 1,
                type: 'payment' as const,
                totalPrice: 20,
                occurredAt: new Date('2026-01-10T12:00:00'),
                createdAt: new Date('2026-01-10T12:00:00'),
            },
            {
                id: 3,
                resellerId: 1,
                type: 'order' as const,
                totalPrice: 50,
                itemName: 'Pedido do período',
                occurredAt: new Date('2026-01-20T12:00:00'),
                createdAt: new Date('2026-01-20T12:00:00'),
            },
            {
                id: 4,
                resellerId: 1,
                type: 'order' as const,
                totalPrice: 40,
                itemName: 'Depois do período',
                occurredAt: new Date('2026-02-10T12:00:00'),
                createdAt: new Date('2026-02-10T12:00:00'),
            },
        ];
        vi.mocked(useTransactions).mockReturnValue({ data: transactions, isLoading: false } as any);

        render(<MemoryRouter><ResellerDetailPage /></MemoryRouter>);
        fireEvent.change(screen.getByLabelText('Data Início'), { target: { value: '2026-01-01' } });
        fireEvent.change(screen.getByLabelText('Data Fim'), { target: { value: '2026-01-31' } });

        expect(screen.getByText('Resumo do Período')).toBeInTheDocument();
        expect(screen.getByText('Saldo inicial')).toBeInTheDocument();
        expect(screen.getByText('Movimentos do período')).toBeInTheDocument();
        expect(screen.getByText('Saldo final')).toBeInTheDocument();
        expect(screen.getByText('R$ 100,00')).toBeInTheDocument();
        expect(screen.getByText('R$ 30,00')).toBeInTheDocument();
        expect(screen.getByText('R$ 130,00')).toBeInTheDocument();
        expect(screen.queryByText('Saldo anterior')).not.toBeInTheDocument();
        expect(screen.getByText('Pedido do período')).toBeInTheDocument();
        expect(screen.queryByText('Depois do período')).not.toBeInTheDocument();

        fireEvent.click(screen.getByText('Gerar PDF'));

        expect(generateResellerExtract).toHaveBeenCalledWith(
            expect.objectContaining({ id: 1 }),
            expect.any(Array),
            expect.objectContaining({
                openingBalance: 100,
                periodMovement: 30,
                closingBalance: 130,
                movements: expect.arrayContaining([
                    expect.objectContaining({ id: 2 }),
                    expect.objectContaining({ id: 3 }),
                ]),
                range: expect.objectContaining({
                    startDate: expect.any(Date),
                    endDate: expect.any(Date),
                }),
            }),
        );
    });

    it('still generates a formal statement when the period has no movements', () => {
        vi.mocked(useTransactions).mockReturnValue({
            data: [{
                id: 1,
                resellerId: 1,
                type: 'order' as const,
                totalPrice: 100,
                occurredAt: new Date('2025-12-31T12:00:00'),
                createdAt: new Date('2025-12-31T12:00:00'),
            }],
            isLoading: false,
        } as any);

        render(<MemoryRouter><ResellerDetailPage /></MemoryRouter>);
        fireEvent.change(screen.getByLabelText('Data Início'), { target: { value: '2026-01-01' } });
        fireEvent.change(screen.getByLabelText('Data Fim'), { target: { value: '2026-01-31' } });
        fireEvent.click(screen.getByText('Gerar PDF'));

        expect(generateResellerExtract).toHaveBeenCalledWith(
            expect.objectContaining({ id: 1 }),
            expect.any(Array),
            expect.objectContaining({
                openingBalance: 100,
                periodMovement: 0,
                closingBalance: 100,
                movements: [],
            }),
        );
    });
});
