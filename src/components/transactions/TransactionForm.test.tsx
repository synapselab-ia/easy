import 'fake-indexeddb/auto';
import '@testing-library/jest-dom';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TransactionForm } from './TransactionForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { db } from '../../db/database';

vi.mock('../ui/select', () => ({
    Select: ({ value, onValueChange, children, ...props }: any) => (
        <select
            data-testid="mock-select"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            {...props}
        >
            {children}
        </select>
    ),
    SelectContent: ({ children }: any) => <>{children}</>,
    SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
    SelectTrigger: ({ children, id }: any) => <span id={id}>{children}</span>,
    SelectValue: ({ placeholder, children }: any) => <option disabled value="">{children || placeholder}</option>,
}));

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        {children}
    </QueryClientProvider>
);

describe('TransactionForm', () => {
    beforeEach(async () => {
        await db.items.clear();
        await db.resellers.clear();
        await db.transactions.clear();
        queryClient.clear();

        // Seed basic data
        await db.items.add({ name: 'Perfume', basePrice: 150, isActive: true, createdAt: new Date(), updatedAt: new Date() });
        await db.items.add({ name: 'Perfume Arquivado', basePrice: 90, isActive: false, createdAt: new Date(), updatedAt: new Date() });
        await db.resellers.add({ name: 'Joãozinho', isActive: true, createdAt: new Date(), updatedAt: new Date() });
        await db.resellers.add({ name: 'Maria Arquivada', isActive: false, createdAt: new Date(), updatedAt: new Date() });
    });

    it('should render conditional fields based on type', async () => {
        render(<TransactionForm onSubmitSuccess={vi.fn()} onCancel={vi.fn()} />, { wrapper });

        // Wait for components to render
        expect(await screen.findByText("Revendedor")).toBeInTheDocument();

        // Default type is "order"
        expect(screen.getByText(/Item do Catálogo/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Quantidade/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Valor Unitário/i)).toBeInTheDocument();
        expect(screen.queryByLabelText(/Valor para Abatimento/i)).not.toBeInTheDocument();

        // Change type to "payment"
        const selects = screen.getAllByTestId('mock-select');
        // selects[0] is Reseller, selects[1] is Type
        fireEvent.change(selects[1], { target: { value: 'payment' } });

        // Now payment field should be rendered
        expect(await screen.findByText("Valor para Abatimento (R$)")).toBeInTheDocument();
        expect(screen.queryByText("Item do Catálogo")).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/Quantidade/i)).not.toBeInTheDocument();
    });

    it('should only list active resellers for new transactions', async () => {
        render(<TransactionForm onSubmitSuccess={vi.fn()} onCancel={vi.fn()} />, { wrapper });

        await waitFor(() => expect(screen.getByText('Joãozinho')).toBeInTheDocument());
        expect(screen.queryByText('Maria Arquivada')).not.toBeInTheDocument();
    });

    it('should only list active items for new orders', async () => {
        render(<TransactionForm onSubmitSuccess={vi.fn()} onCancel={vi.fn()} />, { wrapper });

        await waitFor(() => expect(screen.getByText(/Perfume \(R\$ 150\.00\)/i)).toBeInTheDocument());
        expect(screen.queryByText(/Perfume Arquivado/i)).not.toBeInTheDocument();
    });

    it('should auto fill price and calculate total automatically', async () => {
        render(<TransactionForm onSubmitSuccess={vi.fn()} onCancel={vi.fn()} />, { wrapper });

        const selects = await screen.findAllByTestId('mock-select');
        // selects[2] Item (since it's order by default)

        // Wait for items to be loaded and reflected in the options
        await waitFor(() => {
            const dbItemOption = screen.queryByText(/Perfume \(R\$ 150\.00\)/i);
            expect(dbItemOption).toBeInTheDocument();
        });

        const itemOption = screen.getByText(/Perfume \(R\$ 150\.00\)/i) as HTMLOptionElement;
        fireEvent.change(selects[2], { target: { value: itemOption.value } });

        // Wait for price to be auto-filled
        const unitPriceInput = await screen.findByLabelText(/Valor Unitário/i) as HTMLInputElement;
        await waitFor(() => {
            expect(unitPriceInput.value).toBe('150');
        });

        // Set quantity to 3
        const qtyInput = screen.getByLabelText(/Quantidade/i);
        fireEvent.change(qtyInput, { target: { value: '3' } });

        // Total should be 450. The total field is disabled input.
        const totalInput = screen.getByLabelText(/Valor Total/i) as HTMLInputElement;
        expect(totalInput.value).toBe('450.00');
    });
});
