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

    test('faixa invertida é explícita e volta ao extrato formal quando corrigida', async ({ page }) => {
        await page.goto(resellerUrl);
        await page.getByLabel('Data Início').fill('2025-06-01');
        await page.getByLabel('Data Fim').fill('2025-01-01');

        await expect(page.getByRole('alert')).toContainText('Período inválido');
        await expect(page.getByRole('button', { name: 'Gerar PDF' })).toBeDisabled();
        await expect(page.getByText('Saldo Devedor Atual')).toHaveCount(0);
        await expect(page.getByText(/Histórico indisponível enquanto o período estiver inválido/i)).toBeVisible();

        await page.getByLabel('Data Fim').fill('2025-12-31');

        await expect(page.getByRole('alert')).toHaveCount(0);
        await expect(page.getByText('Resumo do Período')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Gerar PDF' })).toBeEnabled();
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
