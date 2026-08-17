import React, { useRef, type ChangeEvent } from 'react';
import {
    exportData,
    preflightBackupFile,
    type BackupPreflightResult,
} from '@/services/backupService';
import { restorePreflightedBackup } from '@/services/restoreService';
import { toast } from 'sonner';
import BackupPreflightDialog from './BackupPreflightDialog';

export default function ImportExport() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [preflight, setPreflight] = React.useState<BackupPreflightResult | null>(null);
    const [fileName, setFileName] = React.useState<string>();
    const [isPreflighting, setIsPreflighting] = React.useState(false);
    const [isRestoring, setIsRestoring] = React.useState(false);

    const resetFileInput = () => {
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleExport = async () => {
        try {
            await exportData();
            toast.success('Backup v2 exportado com sucesso.');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Falha ao exportar backup.';
            toast.error(message);
        }
    };

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        if (!file) return;

        setIsPreflighting(true);
        setPreflight(null);
        setFileName(file.name);

        try {
            const result = await preflightBackupFile(file);
            setPreflight(result);
            setDialogOpen(true);
            toast.success('Backup validado. Nenhum dado atual foi alterado.');
        } catch (error) {
            setDialogOpen(false);
            setFileName(undefined);
            const message = error instanceof Error ? error.message : 'Falha ao validar backup.';
            toast.error(message);
        } finally {
            setIsPreflighting(false);
            resetFileInput();
        }
    };

    const handleRestore = async () => {
        if (!preflight || isRestoring) return;

        setIsRestoring(true);
        const result = await restorePreflightedBackup(preflight);
        setIsRestoring(false);

        if (result.status === 'success') {
            toast.success(`Backup restaurado com sucesso. Checkpoint salvo em ${result.checkpointFilename}.`);
            setDialogOpen(false);
            setPreflight(null);
            setFileName(undefined);
            return;
        }

        const checkpoint = result.checkpointFilename
            ? ` Checkpoint disponível em ${result.checkpointFilename}.`
            : '';
        toast.error(`Restauração falhou; o banco anterior foi preservado.${checkpoint} ${result.message}`.trim());
    };

    return (
        <div className="flex flex-col gap-4">
            <button
                type="button"
                onClick={handleExport}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
                Exportar Backup v2
            </button>

            <input
                type="file"
                accept=".json,application/json"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                id="backup-import"
                disabled={isPreflighting || isRestoring}
            />
            <label
                htmlFor="backup-import"
                aria-disabled={isPreflighting || isRestoring}
                className="cursor-pointer inline-block px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 aria-disabled:opacity-50 aria-disabled:pointer-events-none"
            >
                {isPreflighting ? 'Validando Backup...' : 'Validar Backup para Restauração'}
            </label>

            <p className="text-sm text-muted-foreground">
                A restauração só é liberada após o preflight. Antes de qualquer substituição, o Easy baixa automaticamente um checkpoint v2 recuperável do banco atual.
            </p>

            <BackupPreflightDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                preview={preflight?.preview ?? null}
                fileName={fileName}
                onRestore={handleRestore}
                isRestoring={isRestoring}
            />
        </div>
    );
}
