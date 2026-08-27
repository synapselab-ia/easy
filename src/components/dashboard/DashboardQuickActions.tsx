import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';

export function DashboardQuickActions() {
    return (
        <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Ações rápidas de lançamento"
        >
            <Link
                to="/transactions?type=order"
                className={buttonVariants({ size: 'sm' })}
            >
                + Pedido
            </Link>
            <Link
                to="/transactions?type=payment"
                className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
                + Pagamento
            </Link>
            <Link
                to="/transactions?type=signal"
                className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
                + Sinal
            </Link>
        </div>
    );
}
