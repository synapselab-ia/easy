import 'fake-indexeddb/auto';
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import TransactionsPage from './TransactionsPage';
import { db } from '../db/database';

type MockSelectProps = {
    value?: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
};

type MockChildProps = {
    children: React.ReactNode;
};

type MockSelectItemProps = MockChildProps & {
    value: string;
};

vi.mock('../components/ui/select', () => ({
    Select: ({ value, onValueChange, children }: MockSelectProps) => (
        <select
            data-testid="mock-select"
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
        >
            <option value="" />
            {children}
        </select>
    ),
    SelectContent: ({ children }: MockChildProps) => <>{children}</>,
    SelectItem: ({ value, children }: MockSelectItemProps) => <option value={value}>{children}</option>,
    SelectTrigger: () => null,
    SelectValue: () => null,
}));

vi.mock('../components/ui/SearchableSelect', () => ({
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

function renderPage(initialEntry: string) {
    const queryClient = new QueryClient();
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <QueryClientProvider client={queryClient}>
                <TransactionsPage />
            </QueryClientProvider>
        </MemoryRouter>,
    );
}

describe('TransactionsPage reseller context', () => {
    beforeEach(async () => {
        await db.items.clear();
        await db.resellers.clear();
        await db.transactions.clear();

        await db.items.add({ id: 1, name: 'Creme', basePrice: 50, isActive: true, createdAt: new Date(), updatedAt: new Date() });
        await db.resellers.add({ id: 1, name: 'Mariazinha', isActive: true, createdAt: new Date(), updatedAt: new Date() });
    });

    it('preselects the active reseller supplied by the transaction URL', async () => {
        renderPage('/transactions?resellerId=1');

        await waitFor(() => expect(screen.getByText('Mariazinha')).toBeInTheDocument());
        const resellerSelect = screen.getByTestId('mock-searchable-select');
        expect((resellerSelect as HTMLSelectElement).value).toBe('1');
    });

    it('keeps standalone transaction entry unselected when reseller context is malformed', async () => {
        renderPage('/transactions?resellerId=not-a-number');

        await waitFor(() => expect(screen.getByText('Mariazinha')).toBeInTheDocument());
        const resellerSelect = screen.getByTestId('mock-searchable-select');
        expect((resellerSelect as HTMLSelectElement).value).toBe('');
    });
});
