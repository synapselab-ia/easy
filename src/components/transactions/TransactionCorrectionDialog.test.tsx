import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TransactionCorrectionDialog } from './TransactionCorrectionDialog';
import * as transactionHooks from '@/hooks/useTransactions';
import * as resellerHooks from '@/hooks/useResellers';
import * as itemHooks from '@/hooks/useItems';
import type { Transaction } from '@/db/database';

vi.mock('@/hooks/useTransactions', () => ({
    useReplaceTransaction: vi.fn(),
}));

vi.mock('@/hooks/useResellers', () => ({
    useResellers: vi.fn(),
}));

vi.mock('@/hooks/useItems', () => ({
    useItems: vi.fn(),
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
const onOpenChange = vi.fn();
const now = new Date('2026-08-17T12:00:00-03:00');

const payment: Transaction = {
    id: 10,
    resellerId: 1,
    type: 'payment',
    totalPrice: 5000,
    observation: 'PIX',
    createdAt: now,
};

const order: Transaction = {
    id: 20,
    resellerId: 1,
    type: 'order',
    itemId: 7,
    itemName: 'Perfume',
    quantity: 10,
    unitPrice: 500,
    totalPrice: 5000,
    observation: 'Cliente X',
    createdAt: now,
};

describe('TransactionCorrectionDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mutateAsync.mockResolvedValue({ replacementTransactionId: 99 });
        vi.mocked(transactionHooks.useReplaceTransaction).mockReturnValue({
            mutateAsync,
            isPending: false,
        } as any);
        vi.mocked(resellerHooks.useResellers).mockReturnValue({
            data: [
                { id: 1, name: 'Ana', isActive: true, createdAt: now, updatedAt: now },
                { id: 2, name: 'Beatriz', isActive: true, createdAt: now, updatedAt: now },
                { id: 3, name: 'Arquivada', isActive: false, createdAt: now, updatedAt: now },
            ],
        } as any);
        vi.mocked(itemHooks.useItems).mockReturnValue({
            data: [
                { id: 7, name: 'Perfume', basePrice: 500, isActive: true, createdAt: now, updatedAt: now },
            ],
        } as any);
    });

    it('prefills a payment correction, requires reason, and allows wrong-reseller/value correction', async () => {
        render(
            <TransactionCorrectionDialog
                transaction={payment}
                open
                onOpenChange={onOpenChange}
            />
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/Original:/i)).toHaveTextContent('#10');
        expect(screen.getByLabelText(/Revendedor da substituição/i)).toHaveValue('1');
        expect(screen.getByLabelText(/Valor corrigido/i)).toHaveValue(5000);

        const confirm = screen.getByRole('button', { name: /Confirmar Correção/i });
        expect(confirm).toBeDisabled();

        fireEvent.change(screen.getByLabelText(/Motivo da correção/i), {
            target: { value: 'Valor e revendedor incorretos' },
        });
        fireEvent.change(screen.getByLabelText(/Revendedor da substituição/i), {
            target: { value: '2' },
        });
        fireEvent.change(screen.getByLabelText(/Valor corrigido/i), {
            target: { value: '500' },
        });

        expect(confirm).not.toBeDisabled();
        fireEvent.click(confirm);

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalledWith({
                originalId: 10,
                reason: 'Valor e revendedor incorretos',
                replacement: {
                    resellerId: 2,
                    totalPrice: 500,
                    observation: 'PIX',
                },
            });
        });
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('guides order value correction while preserving the original item', async () => {
        render(
            <TransactionCorrectionDialog
                transaction={order}
                open
                onOpenChange={onOpenChange}
            />
        );

        expect(screen.getByText(/Item:/i)).toHaveTextContent('Perfume');
        expect(screen.getByLabelText(/Quantidade corrigida/i)).toHaveValue(10);
        expect(screen.getByLabelText(/Valor unitário corrigido/i)).toHaveValue(500);

        fireEvent.change(screen.getByLabelText(/Motivo da correção/i), {
            target: { value: 'Quantidade incorreta' },
        });
        fireEvent.change(screen.getByLabelText(/Quantidade corrigida/i), {
            target: { value: '1' },
        });

        fireEvent.click(screen.getByRole('button', { name: /Confirmar Correção/i }));

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalledWith({
                originalId: 20,
                reason: 'Quantidade incorreta',
                replacement: {
                    resellerId: 1,
                    itemId: 7,
                    itemName: 'Perfume',
                    quantity: 1,
                    unitPrice: 500,
                    totalPrice: 500,
                    observation: 'Cliente X',
                },
            });
        });
    });

    it('blocks guided recreation when the original order item is inactive', () => {
        vi.mocked(itemHooks.useItems).mockReturnValue({
            data: [
                { id: 7, name: 'Perfume', basePrice: 500, isActive: false, createdAt: now, updatedAt: now },
            ],
        } as any);

        render(
            <TransactionCorrectionDialog
                transaction={order}
                open
                onOpenChange={onOpenChange}
            />
        );

        fireEvent.change(screen.getByLabelText(/Motivo da correção/i), {
            target: { value: 'Valor incorreto' },
        });

        expect(screen.getByText(/item original não está ativo/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Confirmar Correção/i })).toBeDisabled();
    });
});
