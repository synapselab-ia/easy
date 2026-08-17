import { ResponsiveDialog } from '@/components/ui/ResponsiveDialog';
import { Button } from '@/components/ui/button';
import type { BackupPreview } from '@/services/backupService';

interface BackupPreflightDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    preview: BackupPreview | null;
    fileName?: string;
    onRestore: () => void;
    isRestoring: boolean;
}

export default function BackupPreflightDialog({
    open,
    onOpenChange,
    preview,
    fileName,
    onRestore,
    isRestoring,
}: BackupPreflightDialogProps) {
    return (
        <ResponsiveDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Prévia do Backup"
            description="O arquivo passou pelo preflight. Ao restaurar, o Easy primeiro baixa um checkpoint v2 do banco atual e só então executa a substituição atômica."
            footer={
                <>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isRestoring}>
                        Cancelar
                    </Button>
                    <Button variant="destructive" onClick={onRestore} disabled={!preview || isRestoring}>
                        {isRestoring ? 'Restaurando...' : 'Restaurar Backup'}
                    </Button>
                </>
            }
        >
            {preview && (
                <div className="space-y-4 text-sm">
                    <div className="rounded-lg border p-3 space-y-1">
                        {fileName && <p><strong>Arquivo:</strong> {fileName}</p>}
                        <p><strong>Formato:</strong> v{preview.sourceVersion} → v{preview.targetVersion}</p>
                        <p><strong>Dexie:</strong> schema V{preview.schemaVersion}</p>
                        <p><strong>Exportado em:</strong> {preview.exportedAt.toLocaleString('pt-BR')}</p>
                        <p><strong>Migração em memória:</strong> {preview.migrated ? 'sim' : 'não'}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="rounded-lg border p-3">
                            <p className="text-muted-foreground">Itens</p>
                            <p className="text-lg font-semibold">{preview.counts.items}</p>
                            <p className="text-xs text-muted-foreground">
                                {preview.counts.activeItems} ativos · {preview.counts.inactiveItems} inativos
                            </p>
                        </div>
                        <div className="rounded-lg border p-3">
                            <p className="text-muted-foreground">Revendedores</p>
                            <p className="text-lg font-semibold">{preview.counts.resellers}</p>
                            <p className="text-xs text-muted-foreground">
                                {preview.counts.activeResellers} ativos · {preview.counts.inactiveResellers} inativos
                            </p>
                        </div>
                        <div className="rounded-lg border p-3">
                            <p className="text-muted-foreground">Lançamentos</p>
                            <p className="text-lg font-semibold">{preview.counts.transactions}</p>
                            <p className="text-xs text-muted-foreground">
                                {preview.counts.orders} pedidos · {preview.counts.payments} pagamentos · {preview.counts.signals} sinais
                            </p>
                        </div>
                    </div>

                    <div className="rounded-lg border p-3">
                        <p><strong>Auditoria:</strong> {preview.counts.reversedTransactions} estornos · {preview.counts.correctionTransactions} substituições vinculadas</p>
                    </div>

                    {preview.warnings.length > 0 && (
                        <div className="rounded-lg border p-3 space-y-2">
                            <p className="font-medium">Normalizações de compatibilidade</p>
                            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                                {preview.warnings.map((warning, index) => <li key={`${warning}-${index}`}>{warning}</li>)}
                            </ul>
                        </div>
                    )}

                    <div className="rounded-lg border p-3 space-y-1">
                        <p className="font-medium">Proteção antes da substituição</p>
                        <p className="text-muted-foreground">
                            O checkpoint do banco atual é validado e baixado antes da transação destrutiva. Se qualquer gravação ou verificação falhar, a transação é revertida e o banco anterior permanece íntegro.
                        </p>
                    </div>
                </div>
            )}
        </ResponsiveDialog>
    );
}
