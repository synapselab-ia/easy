import { test, expect } from '@playwright/test';

test.describe('Performance Analysis Section', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/easy/');
    });

    test('should display the performance analysis section', async ({ page }) => {
        await expect(page.getByText('Análise de Performance')).toBeVisible();
        await expect(page.getByText('Análise de Pareto (80/20)')).toBeVisible();
        await expect(page.getByText('Ranking de Inadimplência')).toBeVisible();
    });

    test('should change period filter and update insights', async ({ page }) => {
        await expect(page.getByText('Janela:')).toBeVisible();

        await page.getByRole('combobox').click();
        await page.getByRole('option', { name: 'Últimos 180 dias' }).click();

        await expect(page.getByText('Concentração de Vendas')).toBeVisible();
    });

    test('should show pareto chart with correct axes', async ({ page }) => {
        await expect(page.getByText('Faturamento', { exact: true })).toBeVisible();
        await expect(page.getByText('% Acumulado', { exact: true })).toBeVisible();
    });

    test('should show ranking of debtors', async ({ page }) => {
        await expect(page.getByText('Ranking de Inadimplência')).toBeVisible();
        await expect(page.getByText('Top 10 revendedores com maior saldo devedor acumulado')).toBeVisible();
    });
});
