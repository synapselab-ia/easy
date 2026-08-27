import 'fake-indexeddb/auto';
import '@testing-library/jest-dom';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TransactionForm } from './TransactionForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { db } from '../../db/database';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
    },
}));

vi.mock('../ui/select', () => ({
    Select: ({ value, onValueChange, children, ...props }: any) => (
        <select
            data-testid="mock-select"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            {...props}
        >
            <option value="" />
            {children}
        </select>
    ),
    SelectContent: ({ children }: any) => <>{children}</>,
    SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
    SelectTrigger: () => null,
    SelectValue: () => null,
}));

vi.mock('../ui/SearchableSelect', () => ({
    SearchableSelect: ({ id, value, onValueChange, options, disabled }: any) => (
        <select
            id={id}
            data-testid="mock-searchable-select"
            value={value}
            disabled={disabled}
            onChange={(event) => onValueChange(event.target.value)}
        >
            <option value="" />
            {options.map((option: any) => (
                <option key={`${option.value}-${option.label}`} value={option.value} disabled={option.disabled}>
                    {option.label}
                </option>
            ))}
        </select>
    ),
}));

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        {children}
    </QueryClientProvider>
);

describe('TransactionForm', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        await db.items.clear();
        await db.resellers.clear();
        await db.transactions.clear();
        await db.subcategories.clear();
        await db.categories.clear();
        queryClient.clear();

        await db.items.add({ name: 'Perfume', basePrice: 150, isActive: true, createdAt: new Date(), updatedAt: new Date() });
        await db.items.add({ name: 'Perfume Arquivado', basePrice: 90, isActive: false, createdAt: new Date(), updatedAt: new Date() });
        await db.resellers.add({ name: 'Joãozinho', isActive: true, createdAt: new Date(), updatedAt: new Date() });
        await db.resellers.add({ name: 'Maria Arquivada', isActive: false, createdAt: new Date(), updatedAt: new Date() });
    });

    it('should render conditional fields based on type', async () => {
        render(<TransactionForm onSubmitSuccess={vi.fn()} onCancel={vi.fn()} />, { wrapper });

        expect(await screen.findByText("Revendedor")).toBeInTheDocument();
        expect(screen.getByText(/Item do Catálogo/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Quantidade/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Valor Unitário/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Observação/i)).toBeInTheDocument();
        expect(screen.queryByLabelText(/Valor para Abatimento/i)).not.toBeInTheDocument();

        fireEvent.change(screen.getByTestId('mock-select'), { target: { value: 'payment' } });

        expect(await screen.findByText("Valor para Abatimento (R$)")).toBeInTheDocument();
        expect(screen.getByLabelText(/Observação/i)).toBeInTheDocument();
        expect(screen.queryByText("Item do Catálogo")).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/Quantidade/i)).not.toBeInTheDocument();
    });

    it('should only list active resellers for new transactions', async () => {
        render(<TransactionForm onSubmitSuccess={vi.fn()} onCancel={vi.fn()} />, { wrapper });

        await waitFor(() => expect(screen.getByText('Joãozinho')).toBeInTheDocument());
        expect(screen.queryByText('Maria Arquivada')).not.toBeInTheDocument();
    });

    it('should preselect and preserve the requested active reseller context on cancel', async () => {
        const activeReseller = (await db.resellers.toArray()).find((reseller) => reseller.name === 'Joãozinho');
        expect(activeReseller?.id).toBeDefined();

        render(
            <TransactionForm
                onSubmitSuccess={vi.fn()}
                onCancel={vi.fn()}
                initialResellerId={activeReseller!.id}
            />,
            { wrapper },
        );

        const searchableSelects = await screen.findAllByTestId('mock-searchable-select');
        await waitFor(() => expect(screen.getByText('Joãozinho')).toBeInTheDocument());
        expect((searchableSelects[0] as HTMLSelectElement).value).toBe(String(activeReseller!.id));

        fireEvent.change(screen.getByTestId('mock-select'), { target: { value: 'payment' } });
        fireEvent.change(screen.getByLabelText(/Valor para Abatimento/i), { target: { value: '25.00' } });
        fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

        await waitFor(() => {
            const resetSearchableSelects = screen.getAllByTestId('mock-searchable-select');
            expect((resetSearchableSelects[0] as HTMLSelectElement).value).toBe(String(activeReseller!.id));
            expect((screen.getByTestId('mock-select') as HTMLSelectElement).value).toBe('order');
        });
    });

    it('should reject an inactive reseller supplied as initial context', async () => {
        const inactiveReseller = (await db.resellers.toArray()).find((reseller) => reseller.name === 'Maria Arquivada');
        expect(inactiveReseller?.id).toBeDefined();
        const onSubmitSuccess = vi.fn();

        render(
            <TransactionForm
                onSubmitSuccess={onSubmitSuccess}
                initialResellerId={inactiveReseller!.id}
                initialType="payment"
            />,
            { wrapper },
        );

        await waitFor(() => expect(screen.getByText('Joãozinho')).toBeInTheDocument());
        fireEvent.change(screen.getByLabelText(/Valor para Abatimento/i), { target: { value: '10.00' } });
        fireEvent.click(screen.getByRole('button', { name: 'Lançar Movimentação' }));

        expect(await screen.findByText('Revendedor inativo não pode receber novos lançamentos')).toBeInTheDocument();
        expect(onSubmitSuccess).not.toHaveBeenCalled();
        expect(await db.transactions.count()).toBe(0);
    });

    it('should reject a missing reseller supplied as initial context', async () => {
        const onSubmitSuccess = vi.fn();

        render(
            <TransactionForm
                onSubmitSuccess={onSubmitSuccess}
                initialResellerId={999999}
                initialType="payment"
            />,
            { wrapper },
        );

        await waitFor(() => expect(screen.getByText('Joãozinho')).toBeInTheDocument());
        fireEvent.change(screen.getByLabelText(/Valor para Abatimento/i), { target: { value: '10.00' } });
        fireEvent.click(screen.getByRole('button', { name: 'Lançar Movimentação' }));

        expect(await screen.findByText('Revendedor inativo não pode receber novos lançamentos')).toBeInTheDocument();
        expect(onSubmitSuccess).not.toHaveBeenCalled();
        expect(await db.transactions.count()).toBe(0);
    });

    it('should only list active items for new orders and identify legacy unclassified items', async () => {
        render(<TransactionForm onSubmitSuccess={vi.fn()} onCancel={vi.fn()} />, { wrapper });

        await waitFor(() => expect(screen.getByText(/Perfume — Sem classificação \(R\$ 150,00\)/i)).toBeInTheDocument());
        expect(screen.queryByText('Perfume Arquivado')).not.toBeInTheDocument();
    });

    it('should show current category and optional subcategory in the new-order item option', async () => {
        const categoryId = await db.categories.add({
            name: 'Porcelana',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }) as number;
        const subcategoryId = await db.subcategories.add({
            categoryId,
            name: 'Canecas',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }) as number;
        const perfume = (await db.items.toArray()).find(item => item.name === 'Perfume');
        await db.items.update(perfume!.id!, { categoryId, subcategoryId });

        render(<TransactionForm onSubmitSuccess={vi.fn()} onCancel={vi.fn()} />, { wrapper });

        expect(await screen.findByText(/Perfume — Porcelana › Canecas \(R\$ 150,00\)/i)).toBeInTheDocument();
    });

    it('should auto fill price and calculate total automatically', async () => {
        render(<TransactionForm onSubmitSuccess={vi.fn()} onCancel={vi.fn()} />, { wrapper });

        await waitFor(() => {
            expect(screen.queryByText(/Perfume — Sem classificação \(R\$ 150,00\)/i)).toBeInTheDocument();
        });

        const searchableSelects = screen.getAllByTestId('mock-searchable-select');
        const itemOption = screen.getByText(/Perfume — Sem classificação \(R\$ 150,00\)/i) as HTMLOptionElement;
        fireEvent.change(searchableSelects[1], { target: { value: itemOption.value } });

        const unitPriceInput = await screen.findByLabelText(/Valor Unitário/i) as HTMLInputElement;
        await waitFor(() => {
            expect(unitPriceInput.value).toBe('150');
        });

        const qtyInput = screen.getByLabelText(/Quantidade/i);
        fireEvent.change(qtyInput, { target: { value: '3' } });

        const totalInput = screen.getByLabelText(/Valor Total/i) as HTMLInputElement;
        expect(totalInput.value).toBe('R$ 450,00');
    });

    it.each(['payment', 'signal'] as const)('should persist an optional observation for %s creation', async (movementType) => {
        const onSubmitSuccess = vi.fn();
        render(
            <TransactionForm onSubmitSuccess={onSubmitSuccess} initialType={movementType} />,
            { wrapper },
        );

        await waitFor(() => expect(screen.getByText('Joãozinho')).toBeInTheDocument());
        const resellerSelect = (await screen.findAllByTestId('mock-searchable-select'))[0];
        const resellerOption = screen.getByText('Joãozinho') as HTMLOptionElement;
        fireEvent.change(resellerSelect, { target: { value: resellerOption.value } });
        fireEvent.change(screen.getByLabelText(/Valor para Abatimento/i), { target: { value: '125.50' } });
        fireEvent.change(screen.getByLabelText(/Observação/i), { target: { value: '  PIX referente ao pedido das canecas  ' } });
        fireEvent.click(screen.getByRole('button', { name: 'Lançar Movimentação' }));

        await waitFor(() => expect(onSubmitSuccess).toHaveBeenCalledOnce());
        const transactions = await db.transactions.toArray();
        expect(transactions).toHaveLength(1);
        expect(transactions[0]).toMatchObject({
            type: movementType,
            totalPrice: 125.5,
            observation: 'PIX referente ao pedido das canecas',
        });
        expect(transactions[0].itemId).toBeUndefined();
    });

    it('should clear entered data on cancel and restore the requested initial type', async () => {
        const onCancel = vi.fn();
        render(
            <TransactionForm onSubmitSuccess={vi.fn()} onCancel={onCancel} initialType="signal" />,
            { wrapper },
        );

        const searchableSelects = await screen.findAllByTestId('mock-searchable-select');
        await waitFor(() => expect(screen.getByText('Joãozinho')).toBeInTheDocument());

        const resellerOption = screen.getByText('Joãozinho') as HTMLOptionElement;
        fireEvent.change(searchableSelects[0], { target: { value: resellerOption.value } });
        fireEvent.change(screen.getByTestId('mock-select'), { target: { value: 'payment' } });

        const paymentValueInput = screen.getByLabelText(/Valor para Abatimento/i) as HTMLInputElement;
        fireEvent.change(paymentValueInput, { target: { value: '99.50' } });
        fireEvent.change(screen.getByLabelText(/Observação/i), { target: { value: 'Teste' } });

        fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

        expect(onCancel).toHaveBeenCalledOnce();
        await waitFor(() => {
            const resetSearchableSelects = screen.getAllByTestId('mock-searchable-select');
            expect((resetSearchableSelects[0] as HTMLSelectElement).value).toBe('');
            expect((screen.getByTestId('mock-select') as HTMLSelectElement).value).toBe('signal');
            expect((screen.getByLabelText(/Valor para Abatimento/i) as HTMLInputElement).value).toBe('');
            expect((screen.getByLabelText(/Observação/i) as HTMLInputElement).value).toBe('');
        });
    });

    it('should surface mutation failure and preserve entered data for retry', async () => {
        const onSubmitSuccess = vi.fn();
        render(<TransactionForm onSubmitSuccess={onSubmitSuccess} />, { wrapper });

        await waitFor(() => expect(screen.getByText('Joãozinho')).toBeInTheDocument());
        const searchableSelects = screen.getAllByTestId('mock-searchable-select');

        const resellerOption = screen.getByText('Joãozinho') as HTMLOptionElement;
        fireEvent.change(searchableSelects[0], { target: { value: resellerOption.value } });

        await waitFor(() => expect(screen.getByText(/Perfume — Sem classificação \(R\$ 150,00\)/i)).toBeInTheDocument());
        const itemOption = screen.getByText(/Perfume — Sem classificação \(R\$ 150,00\)/i) as HTMLOptionElement;
        fireEvent.change(searchableSelects[1], { target: { value: itemOption.value } });

        const qtyInput = screen.getByLabelText(/Quantidade/i) as HTMLInputElement;
        fireEvent.change(qtyInput, { target: { value: '2' } });

        await db.resellers.delete(Number(resellerOption.value));
        fireEvent.click(screen.getByRole('button', { name: 'Lançar Movimentação' }));

        await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Revendedor não encontrado.'));
        expect(onSubmitSuccess).not.toHaveBeenCalled();
        expect((searchableSelects[0] as HTMLSelectElement).value).toBe(resellerOption.value);
        expect((searchableSelects[1] as HTMLSelectElement).value).toBe(itemOption.value);
        expect(qtyInput.value).toBe('2');
    });
});
