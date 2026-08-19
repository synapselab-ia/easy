import 'fake-indexeddb/auto';
import '@testing-library/jest-dom';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../../db/database';
import { TransactionForm } from './TransactionForm';

vi.mock('../ui/select', () => ({
    Select: ({ value, onValueChange, children, ...props }: any) => (
        <select
            data-testid="mock-select"
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
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

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

function localDateInput(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

describe('P3-S1 transaction form occurrence date', () => {
    beforeEach(async () => {
        await db.items.clear();
        await db.resellers.clear();
        await db.transactions.clear();
        queryClient.clear();
    });

    it('defaults the financial occurrence to today and keeps the field discoverable and editable before save', () => {
        const beforeRender = localDateInput();

        render(
            <TransactionForm
                initialType="payment"
                onSubmitSuccess={vi.fn()}
                onCancel={vi.fn()}
            />,
            { wrapper },
        );

        const afterRender = localDateInput();
        const occurrenceInput = screen.getByLabelText(/Data da ocorrência/i) as HTMLInputElement;

        expect([beforeRender, afterRender]).toContain(occurrenceInput.value);
        expect(screen.getByText(/Data financeira da movimentação\. O momento de registro é salvo automaticamente\./i)).toBeInTheDocument();

        fireEvent.change(occurrenceInput, { target: { value: '2026-07-04' } });
        expect(occurrenceInput).toHaveValue('2026-07-04');
    });

    it('persists the selected financial date independently from registration time', async () => {
        const resellerId = await db.resellers.add({
            name: 'Ana',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }) as number;
        const onSubmitSuccess = vi.fn();

        render(
            <TransactionForm
                initialType="payment"
                onSubmitSuccess={onSubmitSuccess}
                onCancel={vi.fn()}
            />,
            { wrapper },
        );

        await waitFor(() => expect(screen.getByText('Ana')).toBeInTheDocument());
        const selects = screen.getAllByTestId('mock-select');
        fireEvent.change(selects[0], { target: { value: String(resellerId) } });
        fireEvent.change(screen.getByLabelText(/Data da ocorrência/i), {
            target: { value: '2026-07-04' },
        });
        fireEvent.change(screen.getByLabelText(/Valor para Abatimento/i), {
            target: { value: '25' },
        });
        fireEvent.click(screen.getByRole('button', { name: /Lançar Movimentação/i }));

        await waitFor(() => expect(onSubmitSuccess).toHaveBeenCalled());
        const stored = (await db.transactions.toArray())[0];

        expect(stored.occurredAt?.getFullYear()).toBe(2026);
        expect(stored.occurredAt?.getMonth()).toBe(6);
        expect(stored.occurredAt?.getDate()).toBe(4);
        expect(stored.createdAt.toDateString()).not.toBe(stored.occurredAt?.toDateString());
    });
});
