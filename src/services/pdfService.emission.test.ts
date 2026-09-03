import { afterEach, describe, expect, it, vi } from 'vitest';

const mockSave = vi.fn();
const mockText = vi.fn();
const mockSetFontSize = vi.fn();
const mockSetFont = vi.fn();
const mockSetTextColor = vi.fn();

vi.mock('jspdf', () => ({
    default: class {
        internal = {
            pageSize: {
                getWidth: vi.fn().mockReturnValue(210),
            },
        };
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
import type { Reseller } from '../db/database';
import { generateResellerExtract } from './pdfService';

const reseller: Reseller = {
    id: 1,
    name: 'Adriana Salles',
    createdAt: new Date('2026-08-01T00:00:00'),
    updatedAt: new Date('2026-08-01T00:00:00'),
};

describe('reseller PDF issue date', () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it('prints the local PDF generation date in the header', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 8, 3, 10, 12, 0));

        generateResellerExtract(reseller, [], 0);

        expect(mockText).toHaveBeenCalledWith('Emitido em: 03/09/2026', 14, 64);
    });

    it('keeps the selected financial period separate from the issue date', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 8, 3, 10, 12, 0));

        generateResellerExtract(reseller, [], 0, {
            startDate: new Date(2026, 7, 1, 0, 0, 0),
            endDate: new Date(2026, 7, 31, 23, 59, 59),
        });

        expect(mockText).toHaveBeenCalledWith('Emitido em: 03/09/2026', 14, 64);
        expect(mockText).toHaveBeenCalledWith('Período: 01/08/2026 a 31/08/2026', 14, 72);
        expect(vi.mocked(autoTable).mock.calls[0][1]?.startY).toBe(82);
    });
});
