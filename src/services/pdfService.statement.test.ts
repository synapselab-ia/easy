import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Reseller, Transaction } from '../db/database';
import { buildStatementPeriod } from '../domain/transactions';
import { generateResellerExtract } from './pdfService';

const mockSave = vi.fn();
const mockText = vi.fn();
const mockSetFontSize = vi.fn();
const mockSetFont = vi.fn();
const mockSetTextColor = vi.fn();

vi.mock('jspdf', () => ({
    default: class {
        internal = { pageSize: { getWidth: vi.fn().mockReturnValue(210) } };
        save = mockSave;
        text = mockText;
        setFontSize = mockSetFontSize;
        setFont = mockSetFont;
        setTextColor = mockSetTextColor;
    },
}));

vi.mock('jspdf-autotable', () => ({
    default: vi.fn(),
}));

import autoTable from 'jspdf-autotable';

const reseller: Reseller = {
    id: 1,
    name: 'Ana',
    createdAt: new Date('2025-01-01T12:00:00'),
    updatedAt: new Date('2025-01-01T12:00:00'),
};

const transactions: Transaction[] = [
    {
        id: 1,
        resellerId: 1,
        type: 'order',
        totalPrice: 100,
        occurredAt: new Date('2025-12-31T12:00:00'),
        createdAt: new Date('2025-12-31T12:00:00'),
    },
    {
        id: 2,
        resellerId: 1,
        type: 'payment',
        totalPrice: 20,
        occurredAt: new Date('2026-01-10T12:00:00'),
        createdAt: new Date('2026-01-10T12:00:00'),
    },
    {
        id: 3,
        resellerId: 1,
        type: 'order',
        totalPrice: 50,
        occurredAt: new Date('2026-01-20T12:00:00'),
        createdAt: new Date('2026-01-20T12:00:00'),
    },
];

describe('P3-S2 PDF statement semantics', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders products, closing summary and payment detail using the canonical statement balances', () => {
        const statement = buildStatementPeriod(transactions, {
            startDate: new Date('2026-01-01T00:00:00'),
            endDate: new Date('2026-01-31T23:59:59.999'),
        });

        generateResellerExtract(reseller, transactions, statement);

        expect(mockText).not.toHaveBeenCalledWith('Saldo inicial: R$ 100,00', 14, 76);
        expect(mockText).not.toHaveBeenCalledWith('Movimentos do período: R$ 30,00', 14, 84);
        expect(mockText).not.toHaveBeenCalledWith('Saldo final: R$ 130,00', 14, 92);

        const itemTable = vi.mocked(autoTable).mock.calls[0][1];
        const summaryTable = vi.mocked(autoTable).mock.calls[1][1];
        const settlementTable = vi.mocked(autoTable).mock.calls[2][1];

        expect(itemTable.startY).toBe(74);
        expect(itemTable.body).toHaveLength(1);
        expect(summaryTable.body).toEqual([
            ['Total dos pedidos', 'R$ 50,00'],
            ['Saldo anterior', 'R$ 100,00'],
            ['(-) Total de pagamentos', 'R$ 20,00'],
            ['SALDO ATUAL', 'R$ 130,00'],
        ]);
        expect(settlementTable.body).toHaveLength(1);
        expect((settlementTable.body as string[][])[0][1]).toBe('Pagamento');
    });

    it('keeps the closing summary when the selected period has no products or payments', () => {
        const statement = buildStatementPeriod([transactions[0]], {
            startDate: new Date('2026-01-01T00:00:00'),
            endDate: new Date('2026-01-31T23:59:59.999'),
        });

        generateResellerExtract(reseller, [transactions[0]], statement);

        expect(autoTable).toHaveBeenCalledTimes(2);
        expect(vi.mocked(autoTable).mock.calls[0][1].body).toEqual([]);
        expect(vi.mocked(autoTable).mock.calls[1][1].body).toEqual([
            ['Total dos pedidos', 'R$ 0,00'],
            ['Saldo anterior', 'R$ 100,00'],
            ['(-) Total de pagamentos', 'R$ 0,00'],
            ['SALDO ATUAL', 'R$ 100,00'],
        ]);
    });
});
