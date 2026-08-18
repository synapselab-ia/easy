import React, { useRef, type ChangeEvent } from 'react';
import {
    exportData,
    preflightBackupFile,
    type BackupPreflightResult,
} from '@/services/backupService';
import { restorePreflightedBackup } from '@/services/restoreService';
import {
    confirmSynchronizedFolderSetup,
    recordRecoveryExport,
} from '@/services/recoveryHealth';
import { useRecoveryHealth } from '@/hooks/useRecoveryHealth';
import { toast } from 'sonner';
import BackupPreflightDialog from './BackupPreflightDialog';

function formatDate(value?: Date) {
    if (!value) return 'Nenhuma exportação registrada';
    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(value);
}

export default function ImportExport() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [preflight, setPreflight] = React.useState<BackupPreflightResult | null>(null);
    const [fileName, setFileName] = React.useState<string>();
    const [isPreflighting, setIsPreflighting] = React.useState(false);
    const [isRestoring, setIsRestoring] = React.useState(false);
    const health = useRecoveryHealth();

    const resetFileInput = () => {
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleExport = async () => {
        try {
            const result = await exportData();
            recordRecoveryExport(result);
            toast.success(`Backup ${result.filename} gerado e download iniciado.`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Falha ao exportar backup.';
            toast.error(message);
        }
    };

    const handleConfirmSetup = () => {
        try {
            confirmSynchronizedFolderSetup();
            toast.success('Pasta sincronizada verificada nesta instalação.');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Não foi possível confirmar a configuração.';
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
        <div className="flex flex-col gap-6">
            <section className="space-y-3 rounded-lg border p-4" aria-labelledby="recovery-setup-title">
                <div>
                    <h2 id="recovery-setup-title" className="font-semibold">Proteção de recuperação em até 24 horas</h2>
                    <p className="text-sm text-muted-foreground">
                        O Easy mantém o banco no computador e usa o Backup v2 como cópia de recuperação. Configure o navegador
                        para salvar estes backups em uma pasta local sincronizada pelo Google Drive para computador ou outro
                        provedor aceito.
                    </p>
                </div>

                <ol className="list-decimal space-y-1 pl-5 text-sm">
                    <li>Configure a pasta de download dos backups dentro da pasta sincronizada.</li>
                    <li>Exporte um Backup v2 pelo botão abaixo.</li>
                    <li>Confirme no Drive, fora do contexto local do PC, que o arquivo exportado aparece lá.</li>
                    <li>Somente depois dessa conferência, confirme a verificação nesta instalação.</li>
                </ol>

                <div className="rounded-md bg-muted/50 p-3 text-sm">
                    <div className="font-medium">
                        {health.setupVerified ? 'Pasta sincronizada verificada' : 'Configuração externa pendente'}
                    </div>
                    <div className="text-muted-foreground">
                        Última exportação: {formatDate(health.lastExportedAt)}
                        {health.lastFilename ? ` — ${health.lastFilename}` : ''}
                    </div>
                </div>

                {!health.setupVerified && (
                    <button
                        type="button"
                        onClick={handleConfirmSetup}
                        disabled={!health.lastExportedAt}
                        className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Confirmar que verifiquei a cópia no Drive
                    </button>
                )}

                <p className="text-xs text-muted-foreground">
                    O Easy confirma a geração validada e o início do download. Ele não consulta nem confirma o status de
                    sincronização do Google Drive.
                </p>
            </section>

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
                A restauração continua disponível mesmo quando a proteção está pendente ou vencida. Ela só é liberada após o
                preflight. Antes de qualquer substituição, o Easy baixa automaticamente um checkpoint v2 recuperável do banco atual.
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
