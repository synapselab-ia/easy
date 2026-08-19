import 'fake-indexeddb/auto';
import React from 'react';
import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import ItemsPage from './ItemsPage';
import { db } from '../db/database';

vi.mock('@/hooks/use-media-query', () => ({
    useMediaQuery: () => true,
}));

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/items']}>
            {children}
        </MemoryRouter>
    </QueryClientProvider>
);

describe('ItemsPage Integration', () => {
    let categoryId: number;

    beforeEach(async () => {
        await db.transactions.clear();
        await db.items.clear();
        await db.categories.clear();
        categoryId = await db.categories.add({
            name: 'Porcelana',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }) as number;
        queryClient.clear();
    });

    beforeAll(() => {
        global.ResizeObserver = class ResizeObserver {
            observe() { }
            unobserve() { }
            disconnect() { }
        };
    });

    it('creates, lists, edits, archives and reactivates a classified item', async () => {
        render(<ItemsPage />, { wrapper });

        expect(await screen.findByText(/Nenhum item cadastrado/i)).toBeInTheDocument();

        // 1. Create with required category classification.
        fireEvent.click(screen.getByRole('button', { name: /Novo Item/i }));
        expect(await screen.findByText('Novo Item', { selector: 'h2' })).toBeInTheDocument();

        const nameInput = screen.getByLabelText(/Nome do Item/i);
        const priceInput = screen.getByLabelText(/Preço Base/i);
        const categoryInput = screen.getByLabelText(/Categoria/i);

        fireEvent.change(nameInput, { target: { value: 'Perfume Teste' } });
        fireEvent.change(priceInput, { target: { value: '150.50' } });
        fireEvent.change(categoryInput, { target: { value: String(categoryId) } });
        fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

        await waitFor(() => {
            expect(screen.queryByText('Salvar')).not.toBeInTheDocument();
        });

        // 2. List as active.
        expect(await screen.findByText('Perfume Teste')).toBeInTheDocument();
        expect(screen.getByText(/150,50/)).toBeInTheDocument();
        expect(screen.getByText('Ativo')).toBeInTheDocument();
        expect((await db.items.toArray())[0].categoryId).toBe(categoryId);

        // 3. Edit without changing category.
        fireEvent.click(screen.getByRole('button', { name: /Editar/i }));
        expect(await screen.findByText('Editar Item', { selector: 'h2' })).toBeInTheDocument();

        const priceInputEdit = screen.getByLabelText(/Preço Base/i);
        fireEvent.change(priceInputEdit, { target: { value: '160.00' } });
        fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

        await waitFor(() => {
            expect(screen.queryByText('Editar Item', { selector: 'h2' })).not.toBeInTheDocument();
        });

        expect(await screen.findByText(/160,00/)).toBeInTheDocument();
        expect((await db.items.toArray())[0].categoryId).toBe(categoryId);

        // 4. Archive instead of deleting.
        fireEvent.click(screen.getByRole('button', { name: 'Arquivar' }));
        expect(await screen.findByText(/não poderá ser usado em novos pedidos até ser reativado/i)).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /Confirmar Arquivamento/i }));

        await waitFor(() => {
            expect(screen.queryByRole('button', { name: /Confirmar Arquivamento/i })).not.toBeInTheDocument();
        });

        expect(await screen.findByText('Perfume Teste')).toBeInTheDocument();
        expect(await screen.findByText('Inativo')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Reativar' })).toBeInTheDocument();

        // 5. Reactivate succeeds because classification is still active.
        fireEvent.click(screen.getByRole('button', { name: 'Reativar' }));
        await waitFor(() => {
            expect(screen.getByText('Ativo')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Arquivar' })).toBeInTheDocument();
        });
    });
});
