import { expect, test } from '@playwright/test';

const VIEWPORTS = [
    { name: 'desktop', width: 1440, height: 1000 },
    { name: 'mobile', width: 390, height: 844 },
] as const;

async function expectNoHorizontalPageOverflow(page: import('@playwright/test').Page) {
    const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
    }));

    expect(
        dimensions.scrollWidth,
        `page scrollWidth ${dimensions.scrollWidth}px should fit clientWidth ${dimensions.clientWidth}px`,
    ).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

async function topOf(locator: import('@playwright/test').Locator) {
    const box = await locator.boundingBox();
    expect(box).not.toBeNull();
    return box!.y;
}

test.describe('D-035 DR-09 final Dashboard/Reports acceptance', () => {
    test('preserves Dashboard priority and responsive containment on desktop and mobile', async ({ page }) => {
        for (const viewport of VIEWPORTS) {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.goto('/easy/');

            await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
            await expect(page.getByRole('group', { name: 'Ações rápidas de lançamento' })).toBeVisible();

            const sales = page.getByText('Vendas este mês', { exact: true });
            const attention = page.getByRole('heading', { name: 'Precisa de atenção' });
            const aging = page.getByRole('heading', { name: 'Carteira por idade' });
            const handoff = page.getByRole('heading', { name: 'Análise detalhada' });

            await expect(sales).toBeVisible();
            await expect(attention).toBeVisible();
            await expect(aging).toBeVisible();
            await expect(handoff).toBeVisible();
            await expect(page.getByRole('heading', { name: 'Últimos lançamentos registrados' })).toHaveCount(0);

            const orderedTops = await Promise.all([
                topOf(sales),
                topOf(attention),
                topOf(aging),
                topOf(handoff),
            ]);
            expect(orderedTops, `${viewport.name} Dashboard priority should remain top-to-bottom`).toEqual(
                [...orderedTops].sort((left, right) => left - right),
            );

            await expectNoHorizontalPageOverflow(page);

            await page.getByRole('link', { name: 'Abrir Relatórios' }).click();
            await expect(page).toHaveURL(/\/easy\/reports$/);
            await expect(page.getByRole('heading', { name: 'Relatórios' })).toBeVisible();
        }
    });

    test('keeps Reports directly navigable, labelled and keyboard-operable at representative widths', async ({ page }) => {
        for (const viewport of VIEWPORTS) {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.goto('/easy/reports');

            await expect(page.getByRole('heading', { name: 'Relatórios' })).toBeVisible();
            await expect(page.getByText('Vendas', { exact: true }).first()).toBeVisible();
            await expect(page.getByText('Recebimentos', { exact: true }).first()).toBeVisible();
            await expect(page.getByText('Movimento líquido', { exact: true })).toBeVisible();
            await expect(page.getByText('Em aberto no fim', { exact: true }).first()).toBeVisible();

            const period = page.getByLabel('Período');
            await expect(period).toBeVisible();
            await period.focus();
            await expect(period).toBeFocused();

            const sectionGroup = page.getByRole('group', { name: 'Seções do relatório' });
            const summaryButton = sectionGroup.getByRole('button', { name: 'Resumo' });
            const resellerButton = sectionGroup.getByRole('button', { name: 'Revendedores' });

            await expect(summaryButton).toHaveAttribute('aria-pressed', 'true');
            await resellerButton.focus();
            await expect(resellerButton).toBeFocused();
            await resellerButton.press('Enter');
            await expect(resellerButton).toHaveAttribute('aria-pressed', 'true');
            await expect(summaryButton).toHaveAttribute('aria-pressed', 'false');
            await expect(page.getByText('Concentração de vendas')).toBeVisible();
            await expect(page.getByText('Maiores saldos em aberto no fim')).toBeVisible();
            await expect(page.getByText(/não significa inadimplência por si só/i)).toBeVisible();

            await expectNoHorizontalPageOverflow(page);
        }
    });
});
