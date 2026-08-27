import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { DashboardAttentionRow } from '@/domain/dashboardSnapshot';
import { AttentionCenter } from './AttentionCenter';

const rows: DashboardAttentionRow[] = [
    {
        resellerId: 11,
        resellerName: 'Alfa Crítica',
        status: 'critical',
        alertAmount: 450,
        totalOpenDebt: 700,
        oldestOutstandingAt: new Date('2026-06-01T12:00:00'),
        ageDays: 87,
    },
    {
        resellerId: 22,
        resellerName: 'Beta Crítica',
        status: 'critical',
        alertAmount: 300,
        totalOpenDebt: 300,
        oldestOutstandingAt: new Date('2026-07-01T12:00:00'),
        ageDays: 57,
    },
    {
        resellerId: 33,
        resellerName: 'Gama Atenção',
        status: 'attention',
        alertAmount: 180,
        totalOpenDebt: 180,
        oldestOutstandingAt: new Date('2026-08-10T12:00:00'),
        ageDays: 17,
    },
];

function renderCenter(centerRows = rows) {
    return render(
        <MemoryRouter initialEntries={['/']}>
            <Routes>
                <Route path="/" element={<AttentionCenter rows={centerRows} isLoading={false} />} />
                <Route path="/resellers/:id" element={<div>Detalhe do revendedor</div>} />
            </Routes>
        </MemoryRouter>,
    );
}

describe('AttentionCenter', () => {
    it('projects the canonical row order with explicit severity, prepared age and alert amounts', () => {
        renderCenter();

        const items = screen.getAllByRole('listitem');
        expect(items).toHaveLength(3);
        expect(within(items[0]).getByText('Alfa Crítica')).toBeInTheDocument();
        expect(within(items[1]).getByText('Beta Crítica')).toBeInTheDocument();
        expect(within(items[2]).getByText('Gama Atenção')).toBeInTheDocument();

        expect(within(items[0]).getByText('CRÍTICO')).toBeInTheDocument();
        expect(within(items[2]).getByText('ATENÇÃO')).toBeInTheDocument();
        expect(within(items[0]).getByText(/87 dias desde o lançamento/i)).toBeInTheDocument();
        expect(within(items[0]).getByText('R$ 450,00')).toBeInTheDocument();
        expect(within(items[0]).getByText(/carteira total R\$ 700,00/i)).toBeInTheDocument();
        expect(within(items[1]).queryByText(/carteira total/i)).not.toBeInTheDocument();
    });

    it('navigates an attention row to the existing reseller detail route', () => {
        renderCenter();

        fireEvent.click(screen.getByRole('button', { name: /Beta Crítica, CRÍTICO, 57 dias, R\$ 300,00/i }));

        expect(screen.getByText('Detalhe do revendedor')).toBeInTheDocument();
    });

    it('keeps the initial action center compact and can reveal remaining prepared rows', () => {
        const extendedRows = Array.from({ length: 7 }, (_, index): DashboardAttentionRow => ({
            resellerId: 100 + index,
            resellerName: `Revendedor ${index + 1}`,
            status: index < 3 ? 'critical' : 'attention',
            alertAmount: 100 - index,
            totalOpenDebt: 100 - index,
            oldestOutstandingAt: new Date(2026, 6, index + 1),
            ageDays: 60 - index,
        }));

        renderCenter(extendedRows);

        expect(screen.getAllByRole('listitem')).toHaveLength(6);
        expect(screen.queryByText('Revendedor 7')).not.toBeInTheDocument();
        expect(screen.getByText('1 prioridade adicional.')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Ver todos' }));

        expect(screen.getAllByRole('listitem')).toHaveLength(7);
        expect(screen.getByText('Revendedor 7')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Mostrar menos' })).toBeInTheDocument();
    });

    it('uses a business-meaningful empty state instead of implying missing reseller data', () => {
        renderCenter([]);

        expect(screen.getByText('Nenhuma pendência em atenção ou crítica hoje.')).toBeInTheDocument();
        expect(screen.queryByText(/nenhum revendedor encontrado/i)).not.toBeInTheDocument();
    });
});
