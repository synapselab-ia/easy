import { Link } from 'react-router-dom';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { useRecoveryHealth } from '@/hooks/useRecoveryHealth';

function formatDate(value?: Date) {
    if (!value) return 'nenhuma exportação registrada';
    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(value);
}

export function RecoveryHealthBanner() {
    const health = useRecoveryHealth();
    const healthy = health.status === 'current';

    const message = (() => {
        switch (health.status) {
            case 'current':
                return 'Cópia de recuperação em dia.';
            case 'warning':
                return 'A cópia de recuperação se aproxima do limite de 24 horas.';
            case 'overdue':
                return 'Cópia de recuperação vencida. Alterações de dados estão bloqueadas até uma nova exportação.';
            case 'due':
                return health.setupVerified
                    ? 'Cópia de recuperação pendente. Gere uma nova exportação antes de alterar dados.'
                    : 'Proteção externa ainda não verificada. Exporte e confirme a cópia na pasta sincronizada.';
            case 'unknown':
                return 'Estado da proteção de recuperação desconhecido. Configure o backup antes de alterar dados.';
        }
    })();

    return (
        <div
            role="status"
            data-recovery-status={health.status}
            className="border-b bg-muted/40 px-4 py-2 text-sm lg:px-6"
        >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {healthy ? <ShieldCheck className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
                <span className="font-medium">{message}</span>
                <span className="text-muted-foreground">Última exportação: {formatDate(health.lastExportedAt)}.</span>
                <Link to="/backup" className="font-medium underline underline-offset-4">
                    Backup &amp; Restore
                </Link>
            </div>
        </div>
    );
}
