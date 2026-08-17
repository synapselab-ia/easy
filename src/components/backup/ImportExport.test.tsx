import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ImportExport from './ImportExport';
import { preflightBackupFile } from '@/services/backupService';
import { restorePreflightedBackup } from '@/services/restoreService';
import { toast } from 'sonner';

vi.mock('@/services/backupService', () => ({
    exportData: vi.fn(),
    preflightBackupFile: vi.fn(),
}));

vi.mock('@/services/restoreService', () => ({
    restorePreflightedBackup: vi.fn(),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('./BackupPreflightDialog', () => ({
    default: ({ open, preview, fileName, onRestore, isRestoring }: any) => open ? (
        <div data-testid="backup-preview">
            <span>{fileName} · {preview?.counts.items} itens · v{preview?.sourceVersion}</span>
            <button type="button" onClick={onRestore} disabled={isRestoring}>Restaurar Backup</button>
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

const preflightResult = {
    preview,
    normalized: {
        sourceVersion: 1,
        exportedAt: preview.exportedAt,
        data: { items: [], resellers: [], transactions: [] },
    },
};

describe('P5-S2 ImportExport restore flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('keeps restore gated behind successful preflight', async () => {
        (preflightBackupFile as any).mockResolvedValue(preflightResult);
        render(<ImportExport />);

        const file = new File(['{}'], 'legacy.json', { type: 'application/json' });
        fireEvent.change(screen.getByLabelText('Validar Backup para Restauração'), {
            target: { files: [file] },
        });

        await waitFor(() => expect(preflightBackupFile).toHaveBeenCalledWith(file));
        expect(await screen.findByTestId('backup-preview')).toHaveTextContent('legacy.json · 3 itens · v1');
        expect(screen.getByRole('button', { name: 'Restaurar Backup' })).toBeInTheDocument();
        expect(restorePreflightedBackup).not.toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('Backup validado. Nenhum dado atual foi alterado.');
    });

    it('restores exactly the preflighted result and reports the checkpoint', async () => {
        (preflightBackupFile as any).mockResolvedValue(preflightResult);
        (restorePreflightedBackup as any).mockResolvedValue({
            status: 'success',
            checkpointFilename: 'easy-checkpoint-v2-2026.json',
            restoredPreview: preview,
        });
        render(<ImportExport />);

        const file = new File(['{}'], 'valid.json', { type: 'application/json' });
        fireEvent.change(screen.getByLabelText('Validar Backup para Restauração'), {
            target: { files: [file] },
        });

        fireEvent.click(await screen.findByRole('button', { name: 'Restaurar Backup' }));

        await waitFor(() => expect(restorePreflightedBackup).toHaveBeenCalledWith(preflightResult));
        expect(toast.success).toHaveBeenCalledWith(
            'Backup restaurado com sucesso. Checkpoint salvo em easy-checkpoint-v2-2026.json.',
        );
        expect(screen.queryByTestId('backup-preview')).not.toBeInTheDocument();
    });

    it('reports rollback-safe failure and keeps the validated preview available', async () => {
        (preflightBackupFile as any).mockResolvedValue(preflightResult);
        (restorePreflightedBackup as any).mockResolvedValue({
            status: 'failure',
            previousDatabasePreserved: true,
            checkpointFilename: 'easy-checkpoint-v2-before.json',
            message: 'falha simulada',
        });
        render(<ImportExport />);

        const file = new File(['{}'], 'valid.json', { type: 'application/json' });
        fireEvent.change(screen.getByLabelText('Validar Backup para Restauração'), {
            target: { files: [file] },
        });

        fireEvent.click(await screen.findByRole('button', { name: 'Restaurar Backup' }));

        await waitFor(() => expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('o banco anterior foi preservado')));
        expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('easy-checkpoint-v2-before.json'));
        expect(screen.getByTestId('backup-preview')).toBeInTheDocument();
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
        expect(restorePreflightedBackup).not.toHaveBeenCalled();
    });
});
