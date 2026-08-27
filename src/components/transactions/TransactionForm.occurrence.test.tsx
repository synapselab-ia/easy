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

vi.mock('../ui/SearchableSelect', () => ({
    SearchableSelect: ({ id, value, onValueChange, options, disabled }: any) => (
        <select
            id={id}
            data-testid="mock-searchable-select"
            value={value}
            disabled={disabled}
            onChange={(event) => onValueChange(event.target.value)}
        >
            {options.map((option: any) => (
                <option key={`${option.value}-${option.label}`} value={option.value} disabled={option.disabled}>
                    {option.label}
                </option>
            ))}
        </select>
    ),
}));

vi.mock('../ui/ResponsiveDialog', () => ({
    ResponsiveDialog: ({ open, title, description, children, footer }: any) => open ? (
        <div role="dialog" aria-label={title}>
            <h2>{title}</h2>
            {description && <p>{description}</p>}
            {children}
            {footer}
        </div>
    ) : null,
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

function futureLocalDateInput(daysAhead = 5) {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    return localDateInput(date);
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
        fireEvent.change(screen.getByTestId('mock-searchable-select'), { target: { value: String(resellerId) } });
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
        expect(screen.queryByRole('dialog', { name: /Data de ocorrência no futuro/i })).not.toBeInTheDocument();
    });

    it('requires explicit non-blocking confirmation before saving a future occurrence date', async () => {
        const resellerId = await db.resellers.add({
            name: 'Bruna',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }) as number;
        const onSubmitSuccess = vi.fn();
        const futureDate = futureLocalDateInput();
        const [expectedYear, expectedMonth, expectedDay] = futureDate.split('-').map(Number);

        render(
            <TransactionForm
                initialType="payment"
                onSubmitSuccess={onSubmitSuccess}
                onCancel={vi.fn()}
            />,
            { wrapper },
        );

        await waitFor(() => expect(screen.getByText('Bruna')).toBeInTheDocument());
        fireEvent.change(screen.getByTestId('mock-searchable-select'), { target: { value: String(resellerId) } });
        fireEvent.change(screen.getByLabelText(/Data da ocorrência/i), {
            target: { value: futureDate },
        });
        fireEvent.change(screen.getByLabelText(/Valor para Abatimento/i), {
            target: { value: '40' },
        });
        fireEvent.click(screen.getByRole('button', { name: /Lançar Movimentação/i }));

        expect(screen.getByRole('dialog', { name: /Data de ocorrência no futuro/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Voltar e corrigir/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Cadastrar mesmo assim/i })).toBeInTheDocument();
        expect(await db.transactions.count()).toBe(0);
        expect(onSubmitSuccess).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole('button', { name: /Voltar e corrigir/i }));
        expect(screen.queryByRole('dialog', { name: /Data de ocorrência no futuro/i })).not.toBeInTheDocument();
        expect(await db.transactions.count()).toBe(0);

        fireEvent.click(screen.getByRole('button', { name: /Lançar Movimentação/i }));
        fireEvent.click(screen.getByRole('button', { name: /Cadastrar mesmo assim/i }));

        await waitFor(() => expect(onSubmitSuccess).toHaveBeenCalledTimes(1));
        const stored = (await db.transactions.toArray())[0];

        expect(stored.occurredAt?.getFullYear()).toBe(expectedYear);
        expect(stored.occurredAt?.getMonth()).toBe(expectedMonth - 1);
        expect(stored.occurredAt?.getDate()).toBe(expectedDay);
    });
});
