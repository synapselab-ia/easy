import ImportExport from '@/components/backup/ImportExport';

export default function BackupPage() {
    return (
        <div className="p-4 lg:p-6 space-y-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Backup &amp; Restore</h1>
                    <p className="text-muted-foreground">
                        Exporte o dataset atual em Backup v2 ou selecione um arquivo para validar e revisar antes da restauração.
                        Após o preflight, o Easy exibe a prévia e só então libera a restauração. Antes de substituir os dados,
                        baixa automaticamente um checkpoint v2 recuperável do banco atual e executa a restauração de forma
                        atômica, preservando o banco anterior se a gravação ou verificação falhar.
                    </p>
                </div>
                <div className="bg-card rounded-xl border p-4 sm:p-6">
                    <ImportExport />
                </div>
            </div>
        </div>
    );
}
