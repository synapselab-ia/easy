import ImportExport from '@/components/backup/ImportExport';

export default function BackupPage() {
    return (
        <div className="p-4 lg:p-6 space-y-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Backup &amp; Restore</h1>
                    <p className="text-muted-foreground">
                        Exporte o dataset atual no formato versionado ou valide um backup antes da futura restauração.
                        O preflight desta etapa não substitui os dados atuais.
                    </p>
                </div>
                <div className="bg-card rounded-xl border p-4 sm:p-6">
                    <ImportExport />
                </div>
            </div>
        </div>
    );
}
