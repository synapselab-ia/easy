import 'fake-indexeddb/auto';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ItemForm } from './ItemForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { db, type Item } from '../../db/database';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
    },
}));

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        {children}
    </QueryClientProvider>
);

describe('ItemForm', () => {
    let categoryId: number;

    beforeEach(async () => {
        vi.restoreAllMocks();
        vi.clearAllMocks();
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

    it('should render form fields', async () => {
        render(<ItemForm onSubmitSuccess={vi.fn()} onCancel={vi.fn()} />, { wrapper });
        expect(screen.getByLabelText(/Nome do Item/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Preço Base/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Categoria/i)).toBeInTheDocument();
        expect(await screen.findByRole('option', { name: 'Porcelana' })).toBeInTheDocument();
    });

    it('should validate empty values', async () => {
        render(<ItemForm onSubmitSuccess={vi.fn()} onCancel={vi.fn()} />, { wrapper });

        fireEvent.submit(screen.getByRole('button', { name: /Salvar/i }));

        expect(await screen.findByText(/Nome é obrigatório/i)).toBeInTheDocument();
        expect(await screen.findByText(/Preço deve ser maior que 0/i)).toBeInTheDocument();
        expect(await screen.findByText(/Categoria é obrigatória/i)).toBeInTheDocument();
    });

    it('should validate negative price', async () => {
        render(<ItemForm onSubmitSuccess={vi.fn()} onCancel={vi.fn()} />, { wrapper });

        const nameInput = screen.getByLabelText(/Nome do Item/i);
        const priceInput = screen.getByLabelText(/Preço Base/i);

        fireEvent.change(nameInput, { target: { value: 'Produto Teste' } });
        fireEvent.change(priceInput, { target: { value: '-10' } });
        fireEvent.change(screen.getByLabelText(/Categoria/i), { target: { value: String(categoryId) } });

        fireEvent.submit(screen.getByRole('button', { name: /Salvar/i }));

        expect(await screen.findByText(/Preço deve ser maior que 0/i)).toBeInTheDocument();
    });

    it('shows a rejected create error and keeps the item values for retry', async () => {
        const onSubmitSuccess = vi.fn();
        vi.spyOn(db.items, 'add').mockRejectedValueOnce(new Error('Falha simulada ao criar item.'));

        render(<ItemForm onSubmitSuccess={onSubmitSuccess} onCancel={vi.fn()} />, { wrapper });

        const nameInput = screen.getByLabelText(/Nome do Item/i);
        const priceInput = screen.getByLabelText(/Preço Base/i);
        fireEvent.change(nameInput, { target: { value: 'Produto para retry' } });
        fireEvent.change(priceInput, { target: { value: '149.90' } });
        fireEvent.change(screen.getByLabelText(/Categoria/i), { target: { value: String(categoryId) } });
        fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

        await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Falha simulada ao criar item.'));
        expect(onSubmitSuccess).not.toHaveBeenCalled();
        expect(nameInput).toHaveValue('Produto para retry');
        expect(priceInput).toHaveValue(149.9);
        expect(screen.getByLabelText(/Categoria/i)).toHaveValue(String(categoryId));
        expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
    });

    it('shows a rejected edit error and keeps the edited legacy item values for retry', async () => {
        const onSubmitSuccess = vi.fn();
        const initialData: Item = {
            id: 17,
            name: 'Produto Original',
            basePrice: 100,
            isActive: true,
            createdAt: new Date('2026-08-01T12:00:00.000Z'),
            updatedAt: new Date('2026-08-01T12:00:00.000Z'),
        };
        vi.spyOn(db.items, 'update').mockRejectedValueOnce(new Error('Falha simulada ao editar item.'));

        render(
            <ItemForm initialData={initialData} onSubmitSuccess={onSubmitSuccess} onCancel={vi.fn()} />,
            { wrapper },
        );

        const nameInput = screen.getByLabelText(/Nome do Item/i);
        const priceInput = screen.getByLabelText(/Preço Base/i);
        fireEvent.change(nameInput, { target: { value: 'Produto Editado' } });
        fireEvent.change(priceInput, { target: { value: '175.50' } });
        fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

        await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Falha simulada ao editar item.'));
        expect(onSubmitSuccess).not.toHaveBeenCalled();
        expect(nameInput).toHaveValue('Produto Editado');
        expect(priceInput).toHaveValue(175.5);
        expect(screen.getByLabelText(/Categoria/i)).toHaveValue('');
        expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
    });
});
