import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateResellerExtract } from './pdfService';

const mockSave = vi.fn();
const mockText = vi.fn();
const mockSetFontSize = vi.fn();
const mockSetFont = vi.fn();
const mockSetTextColor = vi.fn();

vi.mock('jspdf', () => {
    return {
        default: class {
            internal = {
                pageSize: {
                    getWidth: vi.fn().mockReturnValue(210)
                }
            };
            save = mockSave;
            text = mockText;
            setFontSize = mockSetFontSize;
            setFont = mockSetFont;
            setTextColor = mockSetTextColor;
        }
    };
});

vi.mock('jspdf-autotable', () => ({
    default: vi.fn(),
}));

import autoTable from 'jspdf-autotable';
import { type Reseller, type Transaction } from '../db/database';

const mockReseller: Reseller = {
    id: 1,
    name: 'John Doe',
    createdAt: new Date(),
    updatedAt: new Date(),
};

const jan15 = new Date('2025-01-15T10:00:00');
const feb10 = new Date('2025-02-10T10:00:00');
const mar20 = new Date('2025-03-20T10:00:00');

const mockTransactions: Transaction[] = [
    { id: 1, resellerId: 1, type: 'order', totalPrice: 100, createdAt: jan15 },
    { id: 2, resellerId: 1, type: 'payment', totalPrice: 50, createdAt: feb10 },
    { id: 3, resellerId: 1, type: 'order', totalPrice: 200, createdAt: mar20 },
];

describe('pdfService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('generates PDF without errors (sem filtro — comportamento atual preservado)', () => {
        generateResellerExtract(mockReseller, mockTransactions, 100);

        expect(mockSave).toHaveBeenCalledWith('extrato_john_doe.pdf');
        expect(autoTable).toHaveBeenCalled();
        expect(mockText).toHaveBeenCalledWith('Nome: John Doe', 14, 40);
        expect(mockSetTextColor).toHaveBeenCalledWith(220, 38, 38);
    });

    it('gera PDF com dateRange — autoTable chamado apenas com transações do período', () => {
        const dateRange = {
            startDate: new Date('2025-01-01T00:00:00'),
            endDate: new Date('2025-02-28T23:59:59'),
        };

        generateResellerExtract(mockReseller, mockTransactions, 50, dateRange);

        expect(autoTable).toHaveBeenCalled();
        const callArgs = vi.mocked(autoTable).mock.calls[0][1];
        expect(callArgs.body).toHaveLength(2);
    });

    it('includes reversed rows, visible status and mandatory audit reason in the PDF table', () => {
        const reversed: Transaction = {
            id: 4,
            resellerId: 1,
            type: 'payment',
            totalPrice: 90,
            observation: 'PIX',
            reversal: {
                reason: 'Pagamento duplicado',
                reversedAt: '2026-08-17T15:00:00.000Z',
            },
            createdAt: feb10,
        };

        generateResellerExtract(mockReseller, [reversed], 0);

        const callArgs = vi.mocked(autoTable).mock.calls[0][1];
        expect(callArgs.head).toEqual([['Data', 'Tipo', 'Item', 'Qtd', 'Valor', 'Status', 'Observação']]);
        expect(callArgs.body).toHaveLength(1);
        expect(callArgs.body?.[0][5]).toBe('Estornado');
        expect(callArgs.body?.[0][6]).toContain('PIX');
        expect(callArgs.body?.[0][6]).toContain('Motivo do estorno: Pagamento duplicado');
    });

    it('gera PDF com dateRange — nome do arquivo inclui as datas formatadas', () => {
        const dateRange = {
            startDate: new Date('2025-01-01T00:00:00'),
            endDate: new Date('2025-03-31T23:59:59'),
        };

        generateResellerExtract(mockReseller, mockTransactions, 250, dateRange);

        expect(mockSave).toHaveBeenCalledWith(
            expect.stringMatching(/^extrato_john_doe_\d{2}-\d{2}-\d{4}_a_\d{2}-\d{2}-\d{4}\.pdf$/)
        );
        expect(mockSave).not.toHaveBeenCalledWith('extrato_john_doe.pdf');
    });
});
