import React, { useRef, type ChangeEvent } from 'react';
import { exportData, preflightBackupFile, type BackupPreview } from '@/services/backupService';
import { toast } from 'sonner';
import BackupPreflightDialog from './BackupPreflightDialog';

export default function ImportExport() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [preview, setPreview] = React.useState<BackupPreview | null>(null);
    const [fileName, setFileName] = React.useState<string>();
    const [isPreflighting, setIsPreflighting] = React.useState(false);

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
        setPreview(null);
        setFileName(file.name);

        try {
            const result = await preflightBackupFile(file);
            setPreview(result.preview);
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
                disabled={isPreflighting}
            />
            <label
                htmlFor="backup-import"
                aria-disabled={isPreflighting}
                className="cursor-pointer inline-block px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 aria-disabled:opacity-50 aria-disabled:pointer-events-none"
            >
                {isPreflighting ? 'Validando Backup...' : 'Validar Backup para Restauração'}
            </label>

            <p className="text-sm text-muted-foreground">
                Nesta etapa, selecionar um arquivo executa apenas validação e prévia. O banco atual não é substituído.
            </p>

            <BackupPreflightDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                preview={preview}
                fileName={fileName}
            />
        </div>
    );
}
