import { ResponsiveDialog } from '@/components/ui/ResponsiveDialog';
import { Button } from '@/components/ui/button';
import type { BackupPreview } from '@/services/backupService';

interface BackupPreflightDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    preview: BackupPreview | null;
    fileName?: string;
}

export default function BackupPreflightDialog({
    open,
    onOpenChange,
    preview,
    fileName,
}: BackupPreflightDialogProps) {
    return (
        <ResponsiveDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Prévia do Backup"
            description="O arquivo foi validado sem alterar os dados atuais. A restauração destrutiva será habilitada somente após o checkpoint da próxima etapa."
            footer={<Button onClick={() => onOpenChange(false)}>Fechar</Button>}
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

                    <p className="text-muted-foreground">
                        Nenhuma tabela foi limpa ou gravada durante este preflight.
                    </p>
                </div>
            )}
        </ResponsiveDialog>
    );
}
