import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TransactionCorrectionDialog } from './TransactionCorrectionDialog';
import * as transactionHooks from '@/hooks/useTransactions';
import * as resellerHooks from '@/hooks/useResellers';
import * as itemHooks from '@/hooks/useItems';
import * as categoryHooks from '@/hooks/useCategories';
import type { Transaction } from '@/db/database';

vi.mock('@/hooks/useTransactions', () => ({ useReplaceTransaction: vi.fn() }));
vi.mock('@/hooks/useResellers', () => ({ useResellers: vi.fn() }));
vi.mock('@/hooks/useItems', () => ({ useItems: vi.fn() }));
vi.mock('@/hooks/useCategories', () => ({ useCategories: vi.fn() }));
vi.mock('../ui/ResponsiveDialog', () => ({
    ResponsiveDialog: ({ open, title, description, children, footer }: any) => open ? (
        <div role="dialog"><h2>{title}</h2><p>{description}</p>{children}<div>{footer}</div></div>
    ) : null,
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mutateAsync = vi.fn();
const onOpenChange = vi.fn();
const now = new Date('2026-08-17T12:00:00-03:00');

const payment: Transaction = {
    id: 10,
    resellerId: 1,
    type: 'payment',
    totalPrice: 5000,
    observation: 'PIX',
    occurredAt: new Date('2026-08-10T12:00:00-03:00'),
    createdAt: now,
};

const order: Transaction = {
    id: 20,
    resellerId: 1,
    type: 'order',
    itemId: 7,
    itemName: 'Perfume histórico',
    categoryId: 1,
    categoryName: 'Perfumaria histórica',
    quantity: 10,
    unitPrice: 500,
    totalPrice: 5000,
    observation: 'Cliente X',
    occurredAt: new Date('2026-08-09T12:00:00-03:00'),
    createdAt: now,
};

describe('TransactionCorrectionDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mutateAsync.mockResolvedValue({ replacementTransactionId: 99 });
        vi.mocked(transactionHooks.useReplaceTransaction).mockReturnValue({ mutateAsync, isPending: false } as any);
        vi.mocked(resellerHooks.useResellers).mockReturnValue({ data: [
            { id: 1, name: 'Ana', isActive: true, createdAt: now, updatedAt: now },
            { id: 2, name: 'Beatriz', isActive: true, createdAt: now, updatedAt: now },
            { id: 3, name: 'Arquivada', isActive: false, createdAt: now, updatedAt: now },
        ] } as any);
        vi.mocked(categoryHooks.useCategories).mockReturnValue({ data: [
            { id: 1, name: 'Perfumaria atual', isActive: true, createdAt: now, updatedAt: now },
            { id: 2, name: 'Outra categoria', isActive: true, createdAt: now, updatedAt: now },
        ] } as any);
        vi.mocked(itemHooks.useItems).mockReturnValue({ data: [
            { id: 7, name: 'Perfume renomeado', basePrice: 550, isActive: true, categoryId: 1, createdAt: now, updatedAt: now },
            { id: 8, name: 'Creme', basePrice: 60, isActive: true, categoryId: 2, createdAt: now, updatedAt: now },
            { id: 9, name: 'Sem categoria', basePrice: 20, isActive: true, createdAt: now, updatedAt: now },
        ] } as any);
    });

    it('submits edited reseller, date, observation and value for a payment', async () => {
        render(<TransactionCorrectionDialog transaction={payment} open onOpenChange={onOpenChange} />);

        expect(screen.getByLabelText(/Revendedor da substituição/i)).toHaveValue('1');
        expect(screen.getByLabelText(/Tipo da substituição/i)).toHaveValue('payment');
        expect(screen.getByLabelText(/Data da ocorrência/i)).toHaveValue('2026-08-10');
        expect(screen.getByLabelText(/Observação da substituição/i)).toHaveValue('PIX');

        fireEvent.change(screen.getByLabelText(/Motivo da correção/i), { target: { value: 'Dados incorretos' } });
        fireEvent.change(screen.getByLabelText(/Revendedor da substituição/i), { target: { value: '2' } });
        fireEvent.change(screen.getByLabelText(/Data da ocorrência/i), { target: { value: '2026-08-11' } });
        fireEvent.change(screen.getByLabelText(/Valor corrigido/i), { target: { value: '500' } });
        fireEvent.change(screen.getByLabelText(/Observação da substituição/i), { target: { value: 'TED' } });
        fireEvent.click(screen.getByRole('button', { name: /Confirmar Correção/i }));

        await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1));
        const call = mutateAsync.mock.calls[0][0];
        expect(call.originalId).toBe(10);
        expect(call.reason).toBe('Dados incorretos');
        expect(call.replacement).toMatchObject({ resellerId: 2, type: 'payment', totalPrice: 500, observation: 'TED' });
        expect(call.replacement.occurredAt).toBeInstanceOf(Date);
        expect(call.replacement.occurredAt.getDate()).toBe(11);
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('allows changing an order item and sends the full target order state', async () => {
        render(<TransactionCorrectionDialog transaction={order} open onOpenChange={onOpenChange} />);

        expect(screen.getByLabelText(/Item da substituição/i)).toHaveValue('7');
        expect(screen.getByLabelText(/Valor unitário corrigido/i)).toHaveValue(500);
        expect(screen.queryByRole('option', { name: /Sem categoria/i })).not.toBeInTheDocument();

        fireEvent.change(screen.getByLabelText(/Motivo da correção/i), { target: { value: 'Item errado' } });
        fireEvent.change(screen.getByLabelText(/Item da substituição/i), { target: { value: '8' } });
        fireEvent.change(screen.getByLabelText(/Quantidade corrigida/i), { target: { value: '2' } });
        fireEvent.change(screen.getByLabelText(/Observação da substituição/i), { target: { value: 'Cliente Y' } });
        fireEvent.click(screen.getByRole('button', { name: /Confirmar Correção/i }));

        await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1));
        expect(mutateAsync.mock.calls[0][0].replacement).toMatchObject({
            resellerId: 1,
            type: 'order',
            itemId: 8,
            itemName: 'Creme',
            quantity: 2,
            unitPrice: 60,
            totalPrice: 120,
            observation: 'Cliente Y',
        });
    });

    it('removes order fields when changing an order into a payment', async () => {
        render(<TransactionCorrectionDialog transaction={order} open onOpenChange={onOpenChange} />);

        fireEvent.change(screen.getByLabelText(/Motivo da correção/i), { target: { value: 'Tipo incorreto' } });
        fireEvent.change(screen.getByLabelText(/Tipo da substituição/i), { target: { value: 'payment' } });
        fireEvent.change(screen.getByLabelText(/Valor corrigido/i), { target: { value: '90' } });
        fireEvent.click(screen.getByRole('button', { name: /Confirmar Correção/i }));

        await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1));
        const replacement = mutateAsync.mock.calls[0][0].replacement;
        expect(replacement).toMatchObject({ type: 'payment', totalPrice: 90, observation: 'Cliente X' });
        expect(replacement).not.toHaveProperty('itemId');
        expect(replacement).not.toHaveProperty('quantity');
        expect(replacement).not.toHaveProperty('unitPrice');
    });

    it('blocks reusing an inactive historical item but permits choosing another valid item', () => {
        vi.mocked(itemHooks.useItems).mockReturnValue({ data: [
            { id: 7, name: 'Perfume', basePrice: 500, isActive: false, categoryId: 1, createdAt: now, updatedAt: now },
            { id: 8, name: 'Creme', basePrice: 60, isActive: true, categoryId: 2, createdAt: now, updatedAt: now },
        ] } as any);

        render(<TransactionCorrectionDialog transaction={order} open onOpenChange={onOpenChange} />);
        fireEvent.change(screen.getByLabelText(/Motivo da correção/i), { target: { value: 'Corrigir item' } });

        expect(screen.getByText(/item original não está ativo\/disponível/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Confirmar Correção/i })).toBeDisabled();

        fireEvent.change(screen.getByLabelText(/Item da substituição/i), { target: { value: '8' } });
        expect(screen.getByRole('button', { name: /Confirmar Correção/i })).not.toBeDisabled();
    });
});
