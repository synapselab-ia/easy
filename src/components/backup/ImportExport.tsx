import React, { useRef, type ChangeEvent } from 'react';
import {
    exportData,
    preflightBackupFile,
    type BackupPreflightResult,
} from '@/services/backupService';
import { exportCloudData, restorePreflightedCloudBackup } from '@/services/cloudBackupService';
import {
    confirmCloudRecoveryCheckpoint,
    recordCloudRecoveryExport,
} from '@/services/cloudRecoveryHealth';
import { restorePreflightedBackup } from '@/services/restoreService';
import { isEasySupabaseConfigured } from '@/lib/supabase';
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
    const cloudMode = isEasySupabaseConfigured();
    const confirmationAvailable = cloudMode ? Boolean(health.pendingExportAt) : !health.setupVerified;

    const resetFileInput = () => {
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleExport = async () => {
        try {
            const result = cloudMode ? await exportCloudData() : await exportData();
            if (cloudMode) {
                await recordCloudRecoveryExport(result.filename);
            } else {
                recordRecoveryExport(result);
            }
            toast.success(`Backup ${result.filename} gerado e download iniciado.`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Falha ao exportar backup.';
            toast.error(message);
        }
    };

    const handleConfirmSetup = async () => {
        try {
            if (cloudMode) {
                await confirmCloudRecoveryCheckpoint();
                toast.success('Cópia manual confirmada para todos os dispositivos do Easy.');
            } else {
                confirmSynchronizedFolderSetup();
                toast.success('Cópia manual confirmada nesta instalação.');
            }
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
        const result = cloudMode
            ? await restorePreflightedCloudBackup(preflight)
            : await restorePreflightedBackup(preflight);
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

        if (result.previousDatabasePreserved) {
            toast.error(`Restauração falhou; o banco anterior foi preservado.${checkpoint} ${result.message}`.trim());
            return;
        }

        toast.error(
            `A restauração foi aplicada, mas a verificação posterior falhou. Não faça novas alterações; use o checkpoint para recuperação.${checkpoint} ${result.message}`.trim(),
        );
    };

    return (
        <div className="flex flex-col gap-6">
            <section className="space-y-3 rounded-lg border p-4" aria-labelledby="recovery-setup-title">
                <div>
                    <h2 id="recovery-setup-title" className="font-semibold">
                        {cloudMode ? 'Cópia manual global do banco online' : 'Proteção de recuperação em até 24 horas'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {cloudMode
                            ? 'Nesta fase, o Supabase é o banco principal. Um Backup v2 confirmado por um operador vale para todos os dispositivos autorizados durante a mesma janela de 24 horas.'
                            : 'O Easy mantém o banco no computador e usa o Backup v2 como cópia de recuperação.'}
                    </p>
                </div>

                <ol className="list-decimal space-y-1 pl-5 text-sm">
                    <li>Exporte um Backup v2 pelo botão abaixo.</li>
                    <li>Guarde o arquivo fora do navegador, preferencialmente também no Google Drive.</li>
                    <li>Confira que o arquivo realmente foi salvo antes de confirmar.</li>
                    <li>{cloudMode ? 'A confirmação libera a mesma janela de 24 horas para todos os operadores e dispositivos autorizados.' : 'Faça uma nova exportação sempre que quiser atualizar sua cópia de segurança.'}</li>
                </ol>

                <div className="rounded-md bg-muted/50 p-3 text-sm">
                    <div className="font-medium">
                        {health.setupVerified
                            ? cloudMode ? 'Cópia manual global confirmada' : 'Cópia manual confirmada'
                            : cloudMode ? 'Cópia manual global ainda não confirmada' : 'Cópia manual ainda não confirmada'}
                    </div>
                    <div className="text-muted-foreground">
                        Última cópia confirmada: {formatDate(health.lastExportedAt)}
                        {health.lastFilename ? ` — ${health.lastFilename}` : ''}
                    </div>
                    {cloudMode && health.pendingExportAt && (
                        <div className="mt-1 text-muted-foreground">
                            Aguardando confirmação: {formatDate(health.pendingExportAt)}
                            {health.pendingFilename ? ` — ${health.pendingFilename}` : ''}
                        </div>
                    )}
                </div>

                {confirmationAvailable && (
                    <button
                        type="button"
                        onClick={() => void handleConfirmSetup()}
                        disabled={cloudMode ? !health.pendingExportAt : !health.lastExportedAt}
                        className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Confirmar que guardei a cópia
                    </button>
                )}

                <p className="text-xs text-muted-foreground">
                    O Easy confirma a geração do JSON e o início do download, mas não consegue verificar sozinho onde você guardou o arquivo.
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
                {isPreflighting ? 'Validando Backup...' : 'Importar / Restaurar Backup'}
            </label>

            <p className="text-sm text-muted-foreground">
                O Easy primeiro valida e mostra a prévia. Antes de substituir os dados, ele baixa automaticamente um checkpoint do banco atual. No modo online, a substituição acontece em uma única operação no Supabase.
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
