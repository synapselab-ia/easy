import 'fake-indexeddb/auto';
import React from 'react';
import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ResellersPage from './ResellersPage';
import ResellerDetailPage from './ResellerDetailPage';
import { db } from '../db/database';

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/resellers']}>
            <Routes>
                <Route path="/resellers" element={children} />
                <Route path="/resellers/:id" element={<ResellerDetailPage />} />
            </Routes>
        </MemoryRouter>
    </QueryClientProvider>
);

describe('ResellersPage Tests', () => {
    beforeEach(async () => {
        await db.transactions.clear();
        await db.resellers.clear();
        queryClient.clear();
    });

    beforeAll(() => {
        global.ResizeObserver = class ResizeObserver {
            observe() { }
            unobserve() { }
            disconnect() { }
        };
    });

    it('renders ResellerForm and ResellerTable components correctly', async () => {
        render(<ResellersPage />, { wrapper });

        expect(await screen.findByText(/Nenhum revendedor encontrado/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Novo Revendedor/i }));
        expect(await screen.findByText('Novo Revendedor', { selector: 'h2' })).toBeInTheDocument();
        expect(screen.getByLabelText(/Nome do Revendedor/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Telefone/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    });

    it('creates, lists, searches, edits, archives and reactivates a reseller (Integration)', async () => {
        render(<ResellersPage />, { wrapper });

        // 1. Create first reseller.
        fireEvent.click(screen.getByRole('button', { name: /Novo Revendedor/i }));
        expect(await screen.findByText('Novo Revendedor', { selector: 'h2' })).toBeInTheDocument();

        const nameInput = screen.getByLabelText(/Nome do Revendedor/i);
        const phoneInput = screen.getByLabelText(/Telefone/i);

        fireEvent.change(nameInput, { target: { value: 'João da Silva' } });
        fireEvent.change(phoneInput, { target: { value: '11999999999' } });
        fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

        await waitFor(() => {
            expect(screen.queryByText('Salvar')).not.toBeInTheDocument();
        });

        expect(await screen.findByText('João da Silva')).toBeInTheDocument();
        expect(screen.getByText('11999999999')).toBeInTheDocument();

        // 2. Create another reseller for the list/search flow.
        fireEvent.click(screen.getByRole('button', { name: /Novo Revendedor/i }));
        const nameInput2 = await screen.findByLabelText(/Nome do Revendedor/i);
        fireEvent.change(nameInput2, { target: { value: 'Maria Souza' } });
        fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

        await waitFor(() => {
            expect(screen.queryByText('Salvar')).not.toBeInTheDocument();
        });
        expect(await screen.findByText('Maria Souza')).toBeInTheDocument();

        // 3. Search remains functional.
        const searchInput = screen.getByPlaceholderText(/Buscar por nome.../i);
        fireEvent.change(searchInput, { target: { value: 'Maria' } });

        await waitFor(() => {
            expect(screen.getByText('Maria Souza')).toBeInTheDocument();
            expect(screen.queryByText('João da Silva')).not.toBeInTheDocument();
        });

        fireEvent.change(searchInput, { target: { value: '' } });
        expect(await screen.findByText('João da Silva')).toBeInTheDocument();

        // 4. Edit João.
        const editButtons = screen.getAllByRole('button', { name: /Editar/i });
        fireEvent.click(editButtons[0]);

        expect(await screen.findByText('Editar Revendedor', { selector: 'h2' })).toBeInTheDocument();
        const editNameInput = screen.getByLabelText(/Nome do Revendedor/i);
        fireEvent.change(editNameInput, { target: { value: 'João da Silva Santos' } });
        fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

        await waitFor(() => {
            expect(screen.queryByText('Editar Revendedor', { selector: 'h2' })).not.toBeInTheDocument();
        });
        expect(await screen.findByText('João da Silva Santos')).toBeInTheDocument();

        // 5. Archive instead of deleting. Keep João filtered so lifecycle controls are unambiguous.
        fireEvent.change(searchInput, { target: { value: 'João da Silva Santos' } });
        await waitFor(() => {
            expect(screen.getByText('João da Silva Santos')).toBeInTheDocument();
            expect(screen.queryByText('Maria Souza')).not.toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: 'Arquivar' }));
        expect(await screen.findByText(/remove o revendedor dos novos lançamentos, mas preserva integralmente sua ficha e histórico financeiro/i)).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /Confirmar Arquivamento/i }));

        await waitFor(() => {
            expect(screen.queryByRole('button', { name: /Confirmar Arquivamento/i })).not.toBeInTheDocument();
        });

        // The archived reseller remains in list/search and becomes inactive.
        expect(await screen.findByText('João da Silva Santos')).toBeInTheDocument();
        expect(await screen.findByText('Inativo')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Reativar' })).toBeInTheDocument();

        // 6. Reactivation is reversible and restores active state.
        fireEvent.click(screen.getByRole('button', { name: 'Reativar' }));
        await waitFor(() => {
            expect(screen.getByText('Ativo')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Arquivar' })).toBeInTheDocument();
        });

        fireEvent.change(searchInput, { target: { value: '' } });
        expect(await screen.findByText('Maria Souza')).toBeInTheDocument();
    });

    it('navigates to reseller details page when clicking on the reseller name', async () => {
        render(<ResellersPage />, { wrapper });

        fireEvent.click(screen.getByRole('button', { name: /Novo Revendedor/i }));
        const nameInput = await screen.findByLabelText(/Nome do Revendedor/i);
        fireEvent.change(nameInput, { target: { value: 'José Pereira' } });
        fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

        const resellerName = await screen.findByText('José Pereira');
        fireEvent.click(resellerName);

        expect(await screen.findByText('Ficha do Revendedor')).toBeInTheDocument();
        expect(screen.getByText('Visualizando dados de José Pereira')).toBeInTheDocument();
        expect(screen.getByText('Status:')).toBeInTheDocument();
        expect(screen.getByText('Ativo')).toBeInTheDocument();
    });
});
