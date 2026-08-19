import 'fake-indexeddb/auto';
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import TransactionsPage from './TransactionsPage';
import { db } from '../db/database';

vi.mock('../components/ui/select', () => ({
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

function renderPage(initialEntry = '/transactions') {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <QueryClientProvider client={queryClient}>
                <TransactionsPage />
            </QueryClientProvider>
        </MemoryRouter>,
    );
}

describe('TransactionsPage Integration', () => {
    beforeEach(async () => {
        await db.transactions.clear();
        await db.items.clear();
        await db.categories.clear();
        await db.resellers.clear();
        queryClient.clear();

        await db.categories.add({ id: 1, name: 'Cuidados', isActive: true, createdAt: new Date(), updatedAt: new Date() });
        await db.items.add({ id: 1, name: 'Creme', basePrice: 50, categoryId: 1, createdAt: new Date(), updatedAt: new Date() });
        await db.resellers.add({ id: 1, name: 'Mariazinha', createdAt: new Date(), updatedAt: new Date() });
    });

    it('executes the full order launch flow', async () => {
        renderPage();

        const selects = await screen.findAllByTestId('mock-select');

        await waitFor(() => {
            expect(screen.getByText('Mariazinha')).toBeInTheDocument();
        });

        const resellerOption = screen.getByText('Mariazinha') as HTMLOptionElement;
        fireEvent.change(selects[0], { target: { value: resellerOption.value } });

        await waitFor(() => {
            expect(screen.getByText(/Creme/)).toBeInTheDocument();
        });
        const itemOption = screen.getByText(/Creme/) as HTMLOptionElement;
        fireEvent.change(selects[2], { target: { value: itemOption.value } });

        const qtyInput = await screen.findByLabelText(/Quantidade/i);
        fireEvent.change(qtyInput, { target: { value: '2' } });

        fireEvent.submit(screen.getByRole('button', { name: /Lançar/i }));

        await waitFor(async () => {
            const transactions = await db.transactions.toArray();
            expect(transactions.length).toBe(1);
            expect(transactions[0].type).toBe('order');
            expect(transactions[0].totalPrice).toBe(100);
            expect(transactions[0].categoryId).toBe(1);
            expect(transactions[0].categoryName).toBe('Cuidados');
        });
    });

    it('executes the full payment launch flow', async () => {
        renderPage();

        const selects = await screen.findAllByTestId('mock-select');

        await waitFor(() => {
            expect(screen.getByText('Mariazinha')).toBeInTheDocument();
        });

        const resellerOption = screen.getByText('Mariazinha') as HTMLOptionElement;
        fireEvent.change(selects[0], { target: { value: resellerOption.value } });

        fireEvent.change(selects[1], { target: { value: 'payment' } });

        const paymentValueInput = await screen.findByLabelText(/Valor para Abatimento/i);
        fireEvent.change(paymentValueInput, { target: { value: '250.50' } });

        fireEvent.submit(screen.getByRole('button', { name: /Lançar/i }));

        await waitFor(async () => {
            const transactions = await db.transactions.toArray();
            expect(transactions.length).toBe(1);
            expect(transactions[0].type).toBe('payment');
            expect(transactions[0].totalPrice).toBe(250.5);
            expect(transactions[0].categoryId).toBeUndefined();
            expect(transactions[0].categoryName).toBeUndefined();
        });
    });

    it('preserves signal intent from the transaction URL', async () => {
        renderPage('/transactions?type=signal');

        const selects = await screen.findAllByTestId('mock-select');
        expect((selects[1] as HTMLSelectElement).value).toBe('signal');
        expect(screen.getByLabelText(/Valor para Abatimento/i)).toBeInTheDocument();
        expect(screen.queryByLabelText(/Item do Catálogo/i)).not.toBeInTheDocument();
    });
});
