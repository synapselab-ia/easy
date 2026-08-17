import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TransactionTable } from './TransactionTable';
import * as transactionHooks from '@/hooks/useTransactions';
import type { Transaction } from '@/db/database';

vi.mock('@/hooks/use-media-query', () => ({
    useMediaQuery: () => true,
}));

vi.mock('@/hooks/useTransactions', () => ({
    useReverseTransaction: vi.fn(),
    useReplaceTransaction: vi.fn(),
}));

vi.mock('../ui/ResponsiveDialog', () => ({
    ResponsiveDialog: ({ open, title, description, children, footer }: any) => open ? (
        <div role="dialog">
            <h2>{title}</h2>
            <p>{description}</p>
            {children}
            <div>{footer}</div>
        </div>
    ) : null,
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const mutateAsync = vi.fn();

const activeTransaction: Transaction = {
    id: 1,
    resellerId: 10,
    type: 'payment',
    totalPrice: 100,
    observation: 'PIX',
    createdAt: new Date('2026-08-17T10:00:00-03:00'),
};

describe('TransactionTable correction/reversal flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mutateAsync.mockResolvedValue({
            resellerId: 10,
            reversal: {
                reason: 'Pagamento duplicado',
                reversedAt: '2026-08-17T15:00:00.000Z',
            },
        });
        vi.mocked(transactionHooks.useReverseTransaction).mockReturnValue({
            mutateAsync,
            isPending: false,
        } as any);
    });

    it('offers both pure reversal and guided correction for an effective transaction', () => {
        render(<TransactionTable transactions={[activeTransaction]} />);

        expect(screen.getByRole('button', { name: /Corrigir/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Estornar/i })).toBeInTheDocument();
    });

    it('requires a reason before confirming and submits an audited reversal', async () => {
        render(<TransactionTable transactions={[activeTransaction]} />);

        fireEvent.click(screen.getByRole('button', { name: /Estornar/i }));

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/lançamento original será preservado/i)).toBeInTheDocument();

        const confirm = screen.getByRole('button', { name: /Confirmar Estorno/i });
        expect(confirm).toBeDisabled();

        fireEvent.change(screen.getByLabelText(/Motivo do estorno/i), {
            target: { value: 'Pagamento duplicado' },
        });
        expect(confirm).not.toBeDisabled();

        fireEvent.click(confirm);

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalledWith({
                id: 1,
                reason: 'Pagamento duplicado',
            });
        });
    });

    it('shows reversal audit/link data and does not offer another correction action', () => {
        const reversedTransaction: Transaction = {
            ...activeTransaction,
            reversal: {
                reason: 'Valor incorreto',
                reversedAt: '2026-08-17T15:00:00.000Z',
                replacementTransactionId: 2,
            },
        };

        render(<TransactionTable transactions={[reversedTransaction]} />);

        expect(screen.getByText('Estornado')).toBeInTheDocument();
        expect(screen.getByText(/Motivo do estorno: Valor incorreto/i)).toBeInTheDocument();
        expect(screen.getByText(/Substituído pelo lançamento #2/i)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Estornar/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Corrigir/i })).not.toBeInTheDocument();
    });

    it('shows the reverse link on a replacement transaction', () => {
        const replacement: Transaction = {
            ...activeTransaction,
            id: 2,
            totalPrice: 50,
            correction: {
                replacesTransactionId: 1,
            },
        };

        render(<TransactionTable transactions={[replacement]} />);

        expect(screen.getByText(/Correção do lançamento #1/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Corrigir/i })).toBeInTheDocument();
    });
});
