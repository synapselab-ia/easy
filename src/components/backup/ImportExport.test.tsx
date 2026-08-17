import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ImportExport from './ImportExport';
import { preflightBackupFile } from '@/services/backupService';
import { toast } from 'sonner';

vi.mock('@/services/backupService', () => ({
    exportData: vi.fn(),
    preflightBackupFile: vi.fn(),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('./BackupPreflightDialog', () => ({
    default: ({ open, preview, fileName }: any) => open ? (
        <div data-testid="backup-preview">
            {fileName} · {preview?.counts.items} itens · v{preview?.sourceVersion}
        </div>
    ) : null,
}));

const preview = {
    sourceVersion: 1,
    targetVersion: 2,
    schemaVersion: 4,
    migrated: true,
    exportedAt: new Date('2026-08-17T18:00:00.000Z'),
    counts: {
        items: 3,
        activeItems: 2,
        inactiveItems: 1,
        resellers: 2,
        activeResellers: 2,
        inactiveResellers: 0,
        transactions: 4,
        orders: 2,
        payments: 1,
        signals: 1,
        reversedTransactions: 1,
        correctionTransactions: 1,
    },
    warnings: ['migração v1'],
};

describe('P5-S1 ImportExport preflight flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('validates a selected backup and shows preview without offering destructive import', async () => {
        (preflightBackupFile as any).mockResolvedValue({ preview, normalized: {} });
        render(<ImportExport />);

        const file = new File(['{}'], 'legacy.json', { type: 'application/json' });
        const input = screen.getByLabelText('Validar Backup para Restauração');
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => expect(preflightBackupFile).toHaveBeenCalledWith(file));
        expect(await screen.findByTestId('backup-preview')).toHaveTextContent('legacy.json · 3 itens · v1');
        expect(screen.queryByRole('button', { name: /^Importar$/i })).not.toBeInTheDocument();
        expect(toast.success).toHaveBeenCalledWith('Backup validado. Nenhum dado atual foi alterado.');
    });

    it('keeps the preview closed when preflight rejects the file', async () => {
        (preflightBackupFile as any).mockRejectedValue(new Error('Backup inválido: referência quebrada'));
        render(<ImportExport />);

        const file = new File(['{}'], 'invalid.json', { type: 'application/json' });
        fireEvent.change(screen.getByLabelText('Validar Backup para Restauração'), {
            target: { files: [file] },
        });

        await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Backup inválido: referência quebrada'));
        expect(screen.queryByTestId('backup-preview')).not.toBeInTheDocument();
    });
});
