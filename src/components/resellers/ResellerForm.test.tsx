import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ResellerForm } from './ResellerForm';
import { db, type Reseller } from '../../db/database';
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

describe('ResellerForm P7-S5 save feedback', () => {
    beforeEach(async () => {
        vi.restoreAllMocks();
        vi.clearAllMocks();
        await db.resellers.clear();
        queryClient.clear();
    });

    it('warns on normalized duplicate reseller data and still allows explicit creation', async () => {
        await db.resellers.add({
            name: 'El Dorado',
            phone: '(16) 99999-8888',
            email: 'contato@eldorado.com',
            notes: '',
            isActive: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const onSubmitSuccess = vi.fn();

        render(<ResellerForm onSubmitSuccess={onSubmitSuccess} onCancel={vi.fn()} />, { wrapper });

        fireEvent.change(screen.getByLabelText(/Nome do Revendedor/i), { target: { value: 'ELDORADO' } });
        fireEvent.change(screen.getByLabelText(/Telefone/i), { target: { value: '16 99999 8888' } });
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'CONTATO@ELDORADO.COM' } });

        expect(await screen.findByText('Possível revendedor duplicado')).toBeInTheDocument();
        expect(screen.getByText(/Coincidência em: nome, telefone, e-mail/i)).toBeInTheDocument();
        expect(screen.getByText('El Dorado')).toBeInTheDocument();
        expect(screen.getByText(/arquivado/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Cadastrar mesmo assim' }));

        await waitFor(() => expect(onSubmitSuccess).toHaveBeenCalledTimes(1));
        await expect(db.resellers.count()).resolves.toBe(2);
    });

    it('shows a rejected create error and keeps reseller values for retry', async () => {
        const onSubmitSuccess = vi.fn();
        vi.spyOn(db.resellers, 'add').mockRejectedValueOnce(new Error('Falha simulada ao criar revendedor.'));

        render(<ResellerForm onSubmitSuccess={onSubmitSuccess} onCancel={vi.fn()} />, { wrapper });

        const nameInput = screen.getByLabelText(/Nome do Revendedor/i);
        const phoneInput = screen.getByLabelText(/Telefone/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const notesInput = screen.getByLabelText(/Observações/i);

        fireEvent.change(nameInput, { target: { value: 'Ana Retry' } });
        fireEvent.change(phoneInput, { target: { value: '11999998888' } });
        fireEvent.change(emailInput, { target: { value: 'ana@example.com' } });
        fireEvent.change(notesInput, { target: { value: 'Manter estes dados' } });
        fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

        await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Falha simulada ao criar revendedor.'));
        expect(onSubmitSuccess).not.toHaveBeenCalled();
        expect(nameInput).toHaveValue('Ana Retry');
        expect(phoneInput).toHaveValue('11999998888');
        expect(emailInput).toHaveValue('ana@example.com');
        expect(notesInput).toHaveValue('Manter estes dados');
        expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
    });

    it('shows a rejected edit error and keeps edited reseller values for retry', async () => {
        const onSubmitSuccess = vi.fn();
        const initialData: Reseller = {
            id: 23,
            name: 'Revendedor Original',
            phone: '1100000000',
            email: 'original@example.com',
            notes: 'Original',
            isActive: true,
            createdAt: new Date('2026-08-01T12:00:00.000Z'),
            updatedAt: new Date('2026-08-01T12:00:00.000Z'),
        };
        await db.resellers.put(initialData);
        vi.spyOn(db.resellers, 'update').mockRejectedValueOnce(new Error('Falha simulada ao editar revendedor.'));

        render(
            <ResellerForm initialData={initialData} onSubmitSuccess={onSubmitSuccess} onCancel={vi.fn()} />,
            { wrapper },
        );

        const nameInput = screen.getByLabelText(/Nome do Revendedor/i);
        const phoneInput = screen.getByLabelText(/Telefone/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const notesInput = screen.getByLabelText(/Observações/i);

        fireEvent.change(nameInput, { target: { value: 'Revendedor Editado' } });
        fireEvent.change(phoneInput, { target: { value: '11888887777' } });
        fireEvent.change(emailInput, { target: { value: 'editado@example.com' } });
        fireEvent.change(notesInput, { target: { value: 'Dados editados preservados' } });
        fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

        await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Falha simulada ao editar revendedor.'));
        expect(onSubmitSuccess).not.toHaveBeenCalled();
        expect(nameInput).toHaveValue('Revendedor Editado');
        expect(phoneInput).toHaveValue('11888887777');
        expect(emailInput).toHaveValue('editado@example.com');
        expect(notesInput).toHaveValue('Dados editados preservados');
        expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
    });
});
