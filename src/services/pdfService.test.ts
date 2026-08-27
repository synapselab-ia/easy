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

type PdfCell = string | { content: string };
type PdfRow = PdfCell[];

function tableOptions(index: number) {
    return vi.mocked(autoTable).mock.calls[index][1];
}

function cellContent(cell: PdfCell) {
    return typeof cell === 'string' ? cell : cell.content;
}

describe('pdfService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('generates the reseller PDF with item and settlement sections', () => {
        generateResellerExtract(mockReseller, mockTransactions, 100);

        expect(mockSave).toHaveBeenCalledWith('extrato_john_doe.pdf');
        expect(autoTable).toHaveBeenCalledTimes(2);
        expect(mockText).toHaveBeenCalledWith('Nome: John Doe', 14, 40);
        expect(mockSetTextColor).toHaveBeenCalledWith(220, 38, 38);
        expect(tableOptions(0).head?.[0]?.[0]).toMatchObject({ content: 'Itens do pedido' });
        expect(tableOptions(1).head?.[0]?.[0]).toMatchObject({ content: 'Pagamentos e sinais' });
    });

    it('groups equal item/price/status orders and lists each written name underneath', () => {
        const transactions: Transaction[] = [
            {
                id: 10,
                resellerId: 1,
                type: 'order',
                itemId: 7,
                itemName: 'Placa 3x8',
                quantity: 1,
                unitPrice: 50,
                totalPrice: 50,
                observation: 'Lucas',
                createdAt: jan15,
            },
            {
                id: 11,
                resellerId: 1,
                type: 'order',
                itemId: 7,
                itemName: 'Placa 3x8',
                quantity: 1,
                unitPrice: 50,
                totalPrice: 50,
                observation: 'Eduardo',
                createdAt: feb10,
            },
            {
                id: 12,
                resellerId: 1,
                type: 'order',
                itemId: 8,
                itemName: 'Moldura Flor Bronze',
                quantity: 1,
                unitPrice: 80,
                totalPrice: 80,
                createdAt: mar20,
            },
        ];

        generateResellerExtract(mockReseller, transactions, 180);

        const body = tableOptions(0).body as PdfRow[];
        expect(body).toHaveLength(4);
        expect(cellContent(body[0][0])).toBe('Placa 3x8');
        expect(cellContent(body[0][1])).toBe('2');
        expect(cellContent(body[0][2])).toBe('R$ 50,00');
        expect(cellContent(body[0][3])).toBe('R$ 100,00');
        expect(cellContent(body[1][0])).toBe('Lucas');
        expect(cellContent(body[2][0])).toBe('Eduardo');
        expect(cellContent(body[3][0])).toBe('Moldura Flor Bronze');
    });

    it('does not merge the same catalog item when the unit price differs', () => {
        const transactions: Transaction[] = [
            {
                id: 20,
                resellerId: 1,
                type: 'order',
                itemId: 7,
                itemName: 'Placa 3x8',
                quantity: 1,
                unitPrice: 50,
                totalPrice: 50,
                observation: 'Lucas',
                createdAt: jan15,
            },
            {
                id: 21,
                resellerId: 1,
                type: 'order',
                itemId: 7,
                itemName: 'Placa 3x8',
                quantity: 1,
                unitPrice: 55,
                totalPrice: 55,
                observation: 'Eduardo',
                createdAt: feb10,
            },
        ];

        generateResellerExtract(mockReseller, transactions, 105);

        const body = tableOptions(0).body as PdfRow[];
        expect(body.filter(row => cellContent(row[0]) === 'Placa 3x8')).toHaveLength(2);
    });

    it('gera PDF com dateRange separando pedidos e pagamentos do período', () => {
        const dateRange = {
            startDate: new Date('2025-01-01T00:00:00'),
            endDate: new Date('2025-02-28T23:59:59'),
        };

        generateResellerExtract(mockReseller, mockTransactions, 50, dateRange);

        expect(tableOptions(0).body).toHaveLength(1);
        expect(tableOptions(1).body).toHaveLength(1);
    });

    it('keeps reversed settlement rows visible with mandatory audit reason', () => {
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

        const row = (tableOptions(1).body?.[0] ?? []) as string[];
        expect(tableOptions(1).head?.[1]).toEqual(['Data', 'Tipo', 'Valor', 'Status', 'Observação']);
        expect(tableOptions(1).body).toHaveLength(1);
        expect(row[2]).toBe('R$ 90,00');
        expect(row[3]).toBe('Estornado');
        expect(row[4]).toContain('PIX');
        expect(row[4]).toContain('Motivo do estorno: Pagamento duplicado');
    });

    it('keeps both directions of a linked settlement correction in audit notes', () => {
        const original: Transaction = {
            id: 10,
            resellerId: 1,
            type: 'payment',
            totalPrice: 5000,
            reversal: {
                reason: 'Valor incorreto',
                reversedAt: '2026-08-17T15:00:00.000Z',
                replacementTransactionId: 11,
            },
            createdAt: feb10,
        };
        const replacement: Transaction = {
            id: 11,
            resellerId: 1,
            type: 'payment',
            totalPrice: 500,
            correction: {
                replacesTransactionId: 10,
            },
            createdAt: mar20,
        };

        generateResellerExtract(mockReseller, [original, replacement], -500);

        const originalRow = tableOptions(1).body?.[0] as string[];
        const replacementRow = tableOptions(1).body?.[1] as string[];

        expect(originalRow[2]).toBe('R$ 5.000,00');
        expect(originalRow[3]).toBe('Estornado');
        expect(originalRow[4]).toContain('Substituído pelo lançamento #11');
        expect(replacementRow[2]).toBe('R$ 500,00');
        expect(replacementRow[3]).toBe('Válido');
        expect(replacementRow[4]).toContain('Correção do lançamento #10');
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
