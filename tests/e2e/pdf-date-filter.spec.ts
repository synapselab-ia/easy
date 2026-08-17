import { test, expect } from '@playwright/test';

test.describe('Filtro de Datas no Extrato PDF do Revendedor', () => {
    let resellerUrl: string;

    test.beforeEach(async ({ page }) => {
        await page.goto('/easy/resellers');
        await page.getByRole('button', { name: 'Novo Revendedor' }).click();
        await page.getByLabel('Nome do Revendedor').fill('Revendedor Teste PDF');
        await page.getByRole('button', { name: 'Salvar' }).click();
        await expect(page.getByText('Revendedor Teste PDF')).toBeVisible();

        await page.getByText('Revendedor Teste PDF').click();
        resellerUrl = page.url();
        await expect(page.getByRole('heading', { name: 'Ficha do Revendedor' })).toBeVisible();
    });

    test('botão Gerar PDF deve estar desabilitado quando apenas Data Início é preenchida', async ({ page }) => {
        await page.goto(resellerUrl);
        await page.getByLabel('Data Início').fill('2025-01-01');
        await expect(page.getByRole('button', { name: 'Gerar PDF' })).toBeDisabled();
    });

    test('botão Gerar PDF deve estar desabilitado quando apenas Data Fim é preenchida', async ({ page }) => {
        await page.goto(resellerUrl);
        await page.getByLabel('Data Fim').fill('2025-03-31');
        await expect(page.getByRole('button', { name: 'Gerar PDF' })).toBeDisabled();
    });

    test('botão Gerar PDF deve estar habilitado quando ambas as datas são preenchidas', async ({ page }) => {
        await page.goto(resellerUrl);
        await page.getByLabel('Data Início').fill('2025-01-01');
        await page.getByLabel('Data Fim').fill('2025-03-31');
        await expect(page.getByRole('button', { name: 'Gerar PDF' })).toBeEnabled();
    });

    test('deve exibir toast de erro quando Data Fim é anterior a Data Início', async ({ page }) => {
        await page.goto(resellerUrl);
        await page.getByLabel('Data Início').fill('2025-06-01');
        await page.getByLabel('Data Fim').fill('2025-01-01');

        await page.getByRole('button', { name: 'Gerar PDF' }).click();

        await expect(page.locator('[data-sonner-toast]')).toBeVisible();
        await expect(page.locator('[data-sonner-toast]')).toContainText('data de início não pode ser posterior');
    });

    test('período sem movimentos continua sendo um extrato válido', async ({ page }) => {
        await page.goto(resellerUrl);
        await page.getByLabel('Data Início').fill('2020-01-01');
        await page.getByLabel('Data Fim').fill('2020-12-31');

        await expect(page.getByText('Resumo do Período')).toBeVisible();
        const pdfButton = page.getByRole('button', { name: 'Gerar PDF' });
        await expect(pdfButton).toBeEnabled();

        const downloadPromise = page.waitForEvent('download');
        await pdfButton.click();
        await downloadPromise;

        await expect(page.locator('[data-sonner-toast]')).toHaveCount(0);
    });
});
