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

    it('renders products, financial closing and payment detail in client-reading order', () => {
        generateResellerExtract(mockReseller, mockTransactions, 250);

        expect(mockSave).toHaveBeenCalledWith('extrato_john_doe.pdf');
        expect(autoTable).toHaveBeenCalledTimes(3);
        expect(mockText).toHaveBeenCalledWith('Nome: John Doe', 14, 40);
        expect(tableOptions(0).head?.[0]?.[0]).toMatchObject({ content: 'Itens do pedido' });
        expect(tableOptions(1).body).toEqual([
            ['Total dos pedidos', 'R$ 300,00'],
            ['Saldo anterior', 'R$ 0,00'],
            ['(-) Total de pagamentos', 'R$ 50,00'],
            ['SALDO ATUAL', 'R$ 250,00'],
        ]);
        expect(tableOptions(2).head?.[0]?.[0]).toMatchObject({ content: 'Pagamentos e sinais' });
        expect(tableOptions(2).head?.[1]).toEqual(['Data', 'Tipo', 'Valor']);
        expect(tableOptions(2).body).toHaveLength(1);
    });

    it('groups equal item/price orders and keeps each written name underneath', () => {
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
        expect(autoTable).toHaveBeenCalledTimes(2);
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

    it('uses the selected period for products, payment detail and the financial closing', () => {
        const dateRange = {
            startDate: new Date('2025-01-01T00:00:00'),
            endDate: new Date('2025-02-28T23:59:59'),
        };

        generateResellerExtract(mockReseller, mockTransactions, 50, dateRange);

        expect(tableOptions(0).body).toHaveLength(1);
        expect(tableOptions(1).body).toEqual([
            ['Total dos pedidos', 'R$ 100,00'],
            ['Saldo anterior', 'R$ 0,00'],
            ['(-) Total de pagamentos', 'R$ 50,00'],
            ['SALDO ATUAL', 'R$ 50,00'],
        ]);
        expect(tableOptions(2).body).toHaveLength(1);
    });

    it('omits a reversed settlement entirely and does not render a payment table for it', () => {
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

        expect(autoTable).toHaveBeenCalledTimes(2);
        expect(tableOptions(1).body).toEqual([
            ['Total dos pedidos', 'R$ 0,00'],
            ['Saldo anterior', 'R$ 0,00'],
            ['(-) Total de pagamentos', 'R$ 0,00'],
            ['SALDO ATUAL', 'R$ 0,00'],
        ]);
        const renderedTables = JSON.stringify(vi.mocked(autoTable).mock.calls);
        expect(renderedTables).not.toContain('Pagamento duplicado');
        expect(renderedTables).not.toContain('PIX');
        expect(renderedTables).not.toContain('Estornado');
    });

    it('shows only the valid replacement of a corrected settlement without audit annotations', () => {
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

        expect(tableOptions(1).body).toEqual([
            ['Total dos pedidos', 'R$ 0,00'],
            ['Saldo anterior', 'R$ 0,00'],
            ['(-) Total de pagamentos', 'R$ 500,00'],
            ['SALDO ATUAL', 'R$ -500,00'],
        ]);
        const paymentBody = tableOptions(2).body as string[][];
        expect(paymentBody).toHaveLength(1);
        expect(paymentBody[0][2]).toBe('R$ 500,00');

        const renderedTables = JSON.stringify(vi.mocked(autoTable).mock.calls);
        expect(renderedTables).not.toContain('R$ 5.000,00');
        expect(renderedTables).not.toContain('Valor incorreto');
        expect(renderedTables).not.toContain('Substituído pelo lançamento');
        expect(renderedTables).not.toContain('Correção do lançamento');
    });

    it('shows only the valid corrected order while preserving its written name', () => {
        const original: Transaction = {
            id: 30,
            resellerId: 1,
            type: 'order',
            itemId: 7,
            itemName: 'Placa 3x8',
            quantity: 1,
            unitPrice: 50,
            totalPrice: 50,
            observation: 'NOME ANTIGO',
            reversal: {
                reason: 'Nome incorreto',
                reversedAt: '2026-08-17T15:00:00.000Z',
                replacementTransactionId: 31,
            },
            createdAt: feb10,
        };
        const replacement: Transaction = {
            id: 31,
            resellerId: 1,
            type: 'order',
            itemId: 7,
            itemName: 'Placa 3x8',
            quantity: 1,
            unitPrice: 50,
            totalPrice: 50,
            observation: 'ROBERTO RAMOS',
            correction: {
                replacesTransactionId: 30,
            },
            createdAt: mar20,
        };

        generateResellerExtract(mockReseller, [original, replacement], 50);

        const body = tableOptions(0).body as PdfRow[];
        expect(body).toHaveLength(2);
        expect(cellContent(body[0][0])).toBe('Placa 3x8');
        expect(cellContent(body[0][1])).toBe('1');
        expect(cellContent(body[1][0])).toBe('ROBERTO RAMOS');
        expect(tableOptions(1).body).toEqual([
            ['Total dos pedidos', 'R$ 50,00'],
            ['Saldo anterior', 'R$ 0,00'],
            ['(-) Total de pagamentos', 'R$ 0,00'],
            ['SALDO ATUAL', 'R$ 50,00'],
        ]);

        const renderedTables = JSON.stringify(vi.mocked(autoTable).mock.calls);
        expect(renderedTables).not.toContain('NOME ANTIGO');
        expect(renderedTables).not.toContain('Nome incorreto');
        expect(renderedTables).not.toContain('ESTORNADO');
        expect(renderedTables).not.toContain('Correção do lançamento');
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
