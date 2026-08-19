import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Category, Transaction } from '../../db/database';
import { CategoryReport } from './CategoryReport';

const timestamp = new Date('2026-08-10T12:00:00');

const categories: Category[] = [
    {
        id: 1,
        name: 'Porcelana atual',
        isActive: false,
        createdAt: timestamp,
        updatedAt: timestamp,
    },
];

const transactions: Transaction[] = [
    {
        id: 1,
        resellerId: 1,
        type: 'order',
        itemId: 1,
        itemName: 'Jogo',
        quantity: 2,
        unitPrice: 50,
        categoryId: 1,
        categoryName: 'Porcelana antiga',
        totalPrice: 100,
        occurredAt: timestamp,
        createdAt: timestamp,
    },
    {
        id: 2,
        resellerId: 1,
        type: 'order',
        itemId: 2,
        itemName: 'Legado',
        quantity: 1,
        unitPrice: 25,
        totalPrice: 25,
        occurredAt: timestamp,
        createdAt: timestamp,
    },
];

describe('CategoryReport', () => {
    it('renders archived stable identities and the explicit legacy bucket with order-only metrics', () => {
        render(<CategoryReport categories={categories} transactions={transactions} />);

        expect(screen.getByText('Desempenho por categoria')).toBeInTheDocument();
        expect(screen.getByRole('row', { name: /Porcelana atual Arquivada 1 2/ })).toBeInTheDocument();
        expect(screen.getByRole('row', { name: /Sem categoria — histórico legado Histórico legado 1 1/ })).toBeInTheDocument();
        expect(screen.getByText('2', { selector: 'p' })).toBeInTheDocument();
        expect(screen.getByText('3', { selector: 'p' })).toBeInTheDocument();
    });
});
