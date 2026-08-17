import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Transaction } from '@/db/database';
import { TransactionTable } from './TransactionTable';
import * as transactionHooks from '@/hooks/useTransactions';

vi.mock('@/hooks/use-media-query', () => ({
    useMediaQuery: () => true,
}));

vi.mock('@/hooks/useTransactions', () => ({
    useReverseTransaction: vi.fn(),
    useReplaceTransaction: vi.fn(),
}));

vi.mock('sonner', () => ({
    toast: { success: vi.fn(), error: vi.fn() },
}));

describe('P3-S1 transaction history occurrence date', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(transactionHooks.useReverseTransaction).mockReturnValue({
            mutateAsync: vi.fn(),
            isPending: false,
        } as any);
    });

    it('shows the financial occurrence date instead of the registration date', () => {
        const createdAt = new Date('2026-01-03T12:00:00');
        const occurredAt = new Date('2026-02-10T12:00:00');
        const transaction: Transaction = {
            id: 1,
            resellerId: 1,
            type: 'payment',
            totalPrice: 25,
            occurredAt,
            createdAt,
        };

        render(<TransactionTable transactions={[transaction]} />);

        expect(screen.getByText(occurredAt.toLocaleDateString())).toBeInTheDocument();
        expect(screen.queryByText(createdAt.toLocaleDateString())).not.toBeInTheDocument();
    });
});
