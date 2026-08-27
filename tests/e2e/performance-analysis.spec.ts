import { test, expect } from '@playwright/test';

test.describe('Dashboard Reports handoff', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/easy/');
    });

    test('should retire the legacy performance surface and show the Reports handoff', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Análise detalhada' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Abrir Relatórios' })).toBeVisible();
        await expect(page.getByText('Análise de Performance')).toHaveCount(0);
    });

    test('should not expose the legacy analytical period window on the operational Dashboard', async ({ page }) => {
        await expect(page.getByText('Janela:')).toHaveCount(0);
        await expect(page.getByText('Concentração de Vendas')).toHaveCount(0);
    });

    test('should keep the legacy Pareto and debt ranking off the operational Dashboard', async ({ page }) => {
        await expect(page.getByText('Análise de Pareto (80/20)')).toHaveCount(0);
        await expect(page.getByText('Ranking de Inadimplência')).toHaveCount(0);
    });

    test('should open the existing Reports workspace from the contextual handoff', async ({ page }) => {
        await page.getByRole('link', { name: 'Abrir Relatórios' }).click();

        await expect(page).toHaveURL(/\/easy\/reports$/);
        await expect(page.getByRole('heading', { name: 'Relatórios' })).toBeVisible();
        await expect(page.getByText(/Entenda vendas, recebimentos, produtos, categorias e revendedores/i)).toBeVisible();
    });
});
