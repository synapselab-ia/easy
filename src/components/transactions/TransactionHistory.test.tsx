import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { Reseller, Transaction } from '@/db/database';
import { TransactionHistory } from './TransactionHistory';

const ana = {
    userId: '11111111-1111-4111-8111-111111111111',
    email: 'ana@easy.local',
};
const bruno = {
    userId: '22222222-2222-4222-8222-222222222222',
    email: 'bruno@easy.local',
};

const resellers: Reseller[] = [
    {
        id: 1,
        name: 'Elétrico Centro',
        isActive: true,
        createdAt: new Date('2026-08-01T10:00:00-03:00'),
        updatedAt: new Date('2026-08-01T10:00:00-03:00'),
    },
    {
        id: 2,
        name: 'Eudorado',
        isActive: true,
        createdAt: new Date('2026-08-01T10:00:00-03:00'),
        updatedAt: new Date('2026-08-01T10:00:00-03:00'),
    },
];

const transactions: Transaction[] = [
    {
        id: 10,
        resellerId: 1,
        type: 'order',
        itemId: 5,
        itemName: 'Cabo elétrico',
        quantity: 2,
        unitPrice: 50,
        totalPrice: 100,
        createdBy: ana,
        occurredAt: new Date('2026-08-20T12:00:00-03:00'),
        createdAt: new Date('2026-08-21T09:00:00-03:00'),
    },
    {
        id: 11,
        resellerId: 2,
        type: 'payment',
        totalPrice: 75,
        observation: 'PIX duplicado',
        createdBy: ana,
        reversal: {
            reason: 'Pagamento duplicado',
            reversedAt: '2026-08-22T15:00:00-03:00',
            replacementTransactionId: 12,
            reversedBy: bruno,
        },
        occurredAt: new Date('2026-08-22T12:00:00-03:00'),
        createdAt: new Date('2026-08-22T13:00:00-03:00'),
    },
    {
        id: 13,
        resellerId: 2,
        type: 'signal',
        totalPrice: 25,
        reversal: {
            reason: 'Lançamento indevido',
            reversedAt: '2026-08-23T14:00:00-03:00',
            reversedBy: bruno,
        },
        occurredAt: new Date('2026-08-23T12:00:00-03:00'),
        createdAt: new Date('2026-08-23T13:00:00-03:00'),
    },
];

function renderHistory() {
    return render(
        <MemoryRouter>
            <TransactionHistory transactions={transactions} resellers={resellers} isLoading={false} />
        </MemoryRouter>,
    );
}

describe('TransactionHistory', () => {
    it('shows the complete financial history and server-attributed actors', () => {
        renderHistory();

        expect(screen.getByText('3 de 3 lançamento(s)')).toBeInTheDocument();
        expect(screen.getAllByText('ana@easy.local').length).toBeGreaterThan(0);
        expect(screen.getAllByText('bruno@easy.local').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Corrigido').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Estornado').length).toBeGreaterThan(0);
    });

    it('filters by user across both registration and correction/reversal actors', () => {
        renderHistory();

        fireEvent.change(screen.getByLabelText('Usuário'), { target: { value: bruno.userId } });

        expect(screen.getByText('2 de 3 lançamento(s)')).toBeInTheDocument();
        expect(screen.queryAllByText('Cabo elétrico')).toHaveLength(0);
    });

    it('searches accent-insensitively and can filter by occurrence date', () => {
        renderHistory();

        fireEvent.change(screen.getByLabelText('Buscar'), { target: { value: 'eletrico' } });
        expect(screen.getByText('1 de 3 lançamento(s)')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }));
        fireEvent.change(screen.getByLabelText('Filtrar data de'), { target: { value: 'occurred' } });
        fireEvent.change(screen.getByLabelText('De'), { target: { value: '2026-08-23' } });
        fireEvent.change(screen.getByLabelText('Até'), { target: { value: '2026-08-23' } });

        expect(screen.getByText('1 de 3 lançamento(s)')).toBeInTheDocument();
        expect(screen.getAllByText('Sinal').length).toBeGreaterThan(0);
    });
});
