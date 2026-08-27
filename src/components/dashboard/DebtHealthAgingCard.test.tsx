import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { DashboardAgingBucket } from '@/domain/dashboardSnapshot';
import { DebtHealthAgingCard } from './DebtHealthAgingCard';

const buckets: DashboardAgingBucket[] = [
    { category: 'recent', value: 250, percentage: 25 },
    { category: 'attention', value: 150, percentage: 15 },
    { category: 'critical', value: 600, percentage: 60 },
];

describe('DebtHealthAgingCard', () => {
    it('renders the prepared DR-02 buckets as compact exact-value and percentage context', () => {
        const { container } = render(
            <DebtHealthAgingCard buckets={buckets} totalDebt={1000} isLoading={false} />,
        );

        expect(screen.getByText('Carteira por idade')).toBeInTheDocument();
        expect(screen.getByText('R$ 1.000,00')).toBeInTheDocument();

        expect(screen.getByText('Recente (0–6d)')).toBeInTheDocument();
        expect(screen.getByText('Em atenção (7–30d)')).toBeInTheDocument();
        expect(screen.getByText('Crítico (>30d)')).toBeInTheDocument();

        expect(screen.getByText('R$ 250,00')).toBeInTheDocument();
        expect(screen.getByText('R$ 150,00')).toBeInTheDocument();
        expect(screen.getByText('R$ 600,00')).toBeInTheDocument();
        expect(screen.getByText('25%')).toBeInTheDocument();
        expect(screen.getByText('15%')).toBeInTheDocument();
        expect(screen.getByText('60%')).toBeInTheDocument();

        expect(screen.getAllByRole('progressbar')).toHaveLength(3);
        expect(container.querySelector('svg')).not.toBeInTheDocument();
    });

    it('projects the prepared percentage instead of recalculating it in the component', () => {
        render(
            <DebtHealthAgingCard
                buckets={[
                    { category: 'recent', value: 100, percentage: 12.5 },
                    { category: 'attention', value: 0, percentage: 0 },
                    { category: 'critical', value: 0, percentage: 0 },
                ]}
                totalDebt={1000}
                isLoading={false}
            />,
        );

        expect(screen.getByText('12,5%')).toBeInTheDocument();
        expect(screen.getByRole('progressbar', {
            name: 'Recente (0–6d): R$ 100,00, 12,5%',
        })).toHaveAttribute('aria-valuenow', '12.5');
    });

    it('keeps a business-meaningful empty state while exposing all three zero buckets', () => {
        render(
            <DebtHealthAgingCard
                buckets={buckets.map(bucket => ({ ...bucket, value: 0, percentage: 0 }))}
                totalDebt={0}
                isLoading={false}
            />,
        );

        expect(screen.getByText('Nenhum saldo em aberto hoje.')).toBeInTheDocument();
        expect(screen.getAllByText('R$ 0,00')).toHaveLength(4);
        expect(screen.getAllByText('0%')).toHaveLength(3);
        expect(screen.getAllByRole('progressbar')).toHaveLength(3);
    });

    it('preserves a compact loading state without rendering the former chart', () => {
        const { container } = render(
            <DebtHealthAgingCard isLoading={true} />,
        );

        expect(screen.getByText('Carteira por idade')).toBeInTheDocument();
        expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
        expect(container.querySelector('svg')).not.toBeInTheDocument();
    });
});
