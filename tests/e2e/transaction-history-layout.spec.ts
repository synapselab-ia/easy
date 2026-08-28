import { test, expect } from '@playwright/test';

test('transaction history desktop columns contain long variable text', async ({ page }) => {
    await page.goto('/easy/transactions');
    await expect(page.getByRole('heading', { name: 'Lançamentos', exact: true })).toBeVisible();
    await expect(page.locator('section[aria-labelledby="transaction-history-title"]')).toBeVisible();

    const layout = await page.evaluate(() => {
        const section = document.querySelector<HTMLElement>('section[aria-labelledby="transaction-history-title"]');
        if (!section) throw new Error('Transaction history section was not rendered.');

        const fixture = document.createElement('div');
        fixture.style.width = '1000px';
        fixture.innerHTML = `
            <div data-slot="table-container" style="width:100%;overflow-x:auto">
                <table data-slot="table">
                    <thead>
                        <tr>
                            <th data-slot="table-head">Registrado em</th>
                            <th data-slot="table-head">Ocorrência</th>
                            <th data-slot="table-head">Tipo</th>
                            <th data-slot="table-head">Revendedor</th>
                            <th data-slot="table-head">Detalhe</th>
                            <th data-slot="table-head">Valor</th>
                            <th data-slot="table-head">Situação</th>
                            <th data-slot="table-head">Usuário</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td data-slot="table-cell">28/08/2026, 09:29</td>
                            <td data-slot="table-cell">28/08/2026</td>
                            <td data-slot="table-cell">Pedido</td>
                            <td data-slot="table-cell">Revendedor com um nome excepcionalmente longo que precisa permanecer na própria coluna</td>
                            <td data-slot="table-cell">Detalhe muito longo com produto, quantidade, observação, correção, substituição e motivo para reproduzir o caso em que o conteúdo ultrapassava visualmente a coluna de valor.</td>
                            <td data-slot="table-cell">R$ 1.500,00</td>
                            <td data-slot="table-cell">Corrigido</td>
                            <td data-slot="table-cell">Registrado: operador-com-email-extremamente-longo-para-validar-quebra@easy.local</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
        section.appendChild(fixture);

        const table = fixture.querySelector<HTMLElement>('[data-slot="table"]')!;
        const container = fixture.querySelector<HTMLElement>('[data-slot="table-container"]')!;
        const cells = Array.from(fixture.querySelectorAll<HTMLElement>('[data-slot="table-cell"]'));
        const heads = Array.from(fixture.querySelectorAll<HTMLElement>('[data-slot="table-head"]'));

        const resellerStyle = getComputedStyle(cells[3]);
        const detailStyle = getComputedStyle(cells[4]);
        const actorStyle = getComputedStyle(cells[7]);
        const detailRect = cells[4].getBoundingClientRect();
        const valueRect = cells[5].getBoundingClientRect();

        return {
            tableLayout: getComputedStyle(table).tableLayout,
            tableMinWidth: Number.parseFloat(getComputedStyle(table).minWidth),
            containerScrolls: container.scrollWidth > container.clientWidth,
            allCellsHideOverflow: cells.every(cell => getComputedStyle(cell).overflow === 'hidden'),
            resellerWhiteSpace: resellerStyle.whiteSpace,
            detailWhiteSpace: detailStyle.whiteSpace,
            actorWhiteSpace: actorStyle.whiteSpace,
            detailOverflowWrap: detailStyle.overflowWrap,
            actorOverflowWrap: actorStyle.overflowWrap,
            detailWidth: detailRect.width,
            userColumnWidth: heads[7].getBoundingClientRect().width,
            valueStartsAfterDetail: valueRect.left >= detailRect.right - 0.5,
        };
    });

    expect(layout.tableLayout).toBe('fixed');
    expect(layout.tableMinWidth).toBeGreaterThanOrEqual(1320);
    expect(layout.containerScrolls).toBe(true);
    expect(layout.allCellsHideOverflow).toBe(true);
    expect(layout.resellerWhiteSpace).toBe('normal');
    expect(layout.detailWhiteSpace).toBe('normal');
    expect(layout.actorWhiteSpace).toBe('normal');
    expect(layout.detailOverflowWrap).toBe('anywhere');
    expect(layout.actorOverflowWrap).toBe('anywhere');
    expect(layout.detailWidth).toBeLessThan(400);
    expect(layout.userColumnWidth).toBeLessThan(240);
    expect(layout.valueStartsAfterDetail).toBe(true);
});
