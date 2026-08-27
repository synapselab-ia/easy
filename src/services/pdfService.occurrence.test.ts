import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Reseller, Transaction } from '../db/database';
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
    createdAt: new Date('2026-01-01T12:00:00'),
    updatedAt: new Date('2026-01-01T12:00:00'),
};

describe('P3-S1 PDF occurrence-date behavior', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('filters by occurredAt even when createdAt belongs to another period', () => {
        const insideOccurrence = new Date('2026-02-10T12:00:00');
        const outsideOccurrence = new Date('2026-03-10T12:00:00');
        const transactions: Transaction[] = [
            {
                id: 1,
                resellerId: 1,
                type: 'order',
                totalPrice: 100,
                occurredAt: outsideOccurrence,
                createdAt: new Date('2026-02-05T12:00:00'),
            },
            {
                id: 2,
                resellerId: 1,
                type: 'payment',
                totalPrice: 40,
                occurredAt: insideOccurrence,
                createdAt: new Date('2026-03-05T12:00:00'),
            },
        ];

        generateResellerExtract(reseller, transactions, -40, {
            startDate: new Date('2026-02-01T00:00:00'),
            endDate: new Date('2026-02-28T23:59:59.999'),
        });

        const itemTable = vi.mocked(autoTable).mock.calls[0][1];
        const settlementTable = vi.mocked(autoTable).mock.calls[1][1];
        const body = settlementTable.body as string[][];

        expect(itemTable.body).toEqual([]);
        expect(body).toHaveLength(1);
        expect(body[0][0]).toBe(insideOccurrence.toLocaleDateString());
        expect(body[0][1]).toBe('Pagamento');
        expect(body[0][2]).toBe('R$ 40,00');
    });
});
