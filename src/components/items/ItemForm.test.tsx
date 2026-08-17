import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ItemForm } from './ItemForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        {children}
    </QueryClientProvider>
);

describe('ItemForm', () => {
    beforeEach(() => {
        queryClient.clear();
    });

    it('should render form fields', () => {
        render(<ItemForm onSubmitSuccess={vi.fn()} onCancel={vi.fn()} />, { wrapper });
        expect(screen.getByLabelText(/Nome do Item/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Preço Base/i)).toBeInTheDocument();
    });

    it('should validate empty values', async () => {
        render(<ItemForm onSubmitSuccess={vi.fn()} onCancel={vi.fn()} />, { wrapper });

        fireEvent.submit(screen.getByRole('button', { name: /Salvar/i }));

        expect(await screen.findByText(/Nome é obrigatório/i)).toBeInTheDocument();
        expect(await screen.findByText(/Preço deve ser maior que 0/i)).toBeInTheDocument();
    });

    it('should validate negative price', async () => {
        render(<ItemForm onSubmitSuccess={vi.fn()} onCancel={vi.fn()} />, { wrapper });

        const nameInput = screen.getByLabelText(/Nome do Item/i);
        const priceInput = screen.getByLabelText(/Preço Base/i);

        fireEvent.change(nameInput, { target: { value: 'Produto Teste' } });
        fireEvent.change(priceInput, { target: { value: '-10' } });

        fireEvent.submit(screen.getByRole('button', { name: /Salvar/i }));

        expect(await screen.findByText(/Preço deve ser maior que 0/i)).toBeInTheDocument();
    });
});
