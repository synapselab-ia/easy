import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardSnapshot } from '@/domain/dashboardSnapshot';
import type { LucideIcon } from 'lucide-react';
import { Banknote, ShoppingCart, ShieldAlert, WalletCards } from 'lucide-react';

interface DashboardCardsProps {
    snapshot?: DashboardSnapshot;
    isLoading: boolean;
}

interface DashboardMetricCardProps {
    title: string;
    icon: LucideIcon;
    value: string;
    supporting: string[];
    emptyMessage?: string;
    isEmpty?: boolean;
    isLoading: boolean;
}

function formatCurrency(value: number) {
    return `R$ ${value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function pluralize(value: number, singular: string, plural: string) {
    return `${value} ${value === 1 ? singular : plural}`;
}

function DashboardMetricCard({
    title,
    icon: Icon,
    value,
    supporting,
    emptyMessage,
    isEmpty = false,
    isLoading,
}: DashboardMetricCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {isLoading ? 'Carregando...' : value}
                </div>
                {!isLoading && supporting.map(line => (
                    <p key={line} className="mt-1 text-xs text-muted-foreground">
                        {line}
                    </p>
                ))}
                {!isLoading && isEmpty && emptyMessage && (
                    <p className="mt-1 text-xs text-muted-foreground">{emptyMessage}</p>
                )}
            </CardContent>
        </Card>
    );
}

export function DashboardCards({ snapshot, isLoading }: DashboardCardsProps) {
    const month = snapshot?.month;
    const today = snapshot?.today;
    const openDebt = snapshot?.openDebt;
    const critical = snapshot?.critical;

    const monthSales = month?.sales ?? 0;
    const monthReceipts = month?.receipts ?? 0;
    const monthOrderCount = month?.orderCount ?? 0;
    const monthItemQuantity = month?.itemQuantity ?? 0;
    const todaySales = today?.sales ?? 0;
    const todayOrderCount = today?.orderCount ?? 0;
    const todayReceipts = today?.receipts ?? 0;
    const openDebtAmount = openDebt?.amount ?? 0;
    const openDebtResellerCount = openDebt?.resellerCount ?? 0;
    const criticalAmount = critical?.amount ?? 0;
    const criticalResellerCount = critical?.resellerCount ?? 0;
    const oldestCriticalAge = critical?.oldestAgeDays ?? null;

    const criticalContext = criticalResellerCount > 0
        ? `${pluralize(criticalResellerCount, 'revendedor', 'revendedores')}${oldestCriticalAge !== null ? ` • mais antigo: ${pluralize(oldestCriticalAge, 'dia', 'dias')}` : ''}`
        : 'Nenhum revendedor em faixa crítica.';

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardMetricCard
                title="Vendas este mês"
                icon={ShoppingCart}
                value={formatCurrency(monthSales)}
                supporting={[
                    `${pluralize(monthOrderCount, 'pedido', 'pedidos')} • ${pluralize(monthItemQuantity, 'item', 'itens')}`,
                    `Hoje: ${pluralize(todayOrderCount, 'pedido', 'pedidos')} • ${formatCurrency(todaySales)}`,
                ]}
                emptyMessage="Nenhuma venda registrada neste mês."
                isEmpty={monthSales === 0}
                isLoading={isLoading}
            />

            <DashboardMetricCard
                title="Recebimentos este mês"
                icon={Banknote}
                value={formatCurrency(monthReceipts)}
                supporting={[
                    'Pagamentos + sinais',
                    `Hoje: ${formatCurrency(todayReceipts)}`,
                ]}
                emptyMessage="Nenhum recebimento registrado neste mês."
                isEmpty={monthReceipts === 0}
                isLoading={isLoading}
            />

            <DashboardMetricCard
                title="Carteira em aberto"
                icon={WalletCards}
                value={formatCurrency(openDebtAmount)}
                supporting={[
                    `${pluralize(openDebtResellerCount, 'revendedor', 'revendedores')} com saldo em aberto`,
                ]}
                emptyMessage="Nenhum saldo em aberto hoje."
                isEmpty={openDebtAmount === 0}
                isLoading={isLoading}
            />

            <DashboardMetricCard
                title="Crítico > 30 dias"
                icon={ShieldAlert}
                value={formatCurrency(criticalAmount)}
                supporting={[criticalContext]}
                emptyMessage="Nenhum valor crítico hoje."
                isEmpty={criticalAmount === 0}
                isLoading={isLoading}
            />
        </div>
    );
}
