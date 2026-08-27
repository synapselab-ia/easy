import { ArrowRight, ChartColumn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';

export function DashboardReportsHandoff() {
    return (
        <section
            aria-labelledby="dashboard-reports-title"
            className="rounded-xl border bg-muted/20 p-4 sm:flex sm:items-center sm:justify-between sm:gap-6"
        >
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <ChartColumn className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <h2 id="dashboard-reports-title" className="font-semibold">
                        Análise detalhada
                    </h2>
                </div>
                <p className="max-w-3xl text-sm text-muted-foreground">
                    Compare períodos e aprofunde vendas, recebimentos, produtos, categorias e revendedores no espaço de Relatórios.
                </p>
            </div>

            <Link
                to="/reports"
                className={`${buttonVariants({ variant: 'outline' })} mt-4 w-full shrink-0 sm:mt-0 sm:w-auto`}
            >
                Abrir Relatórios
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
        </section>
    );
}
