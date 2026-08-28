import { test, expect } from '@playwright/test';

test('reseller detail launches transaction entry with reseller context preserved', async ({ page }) => {
    await page.goto('/easy/resellers');
    await page.getByRole('button', { name: 'Novo Revendedor' }).click();
    await page.getByLabel('Nome do Revendedor').fill('Revendedor Contexto E2E');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Revendedor Contexto E2E')).toBeVisible();

    await page.getByText('Revendedor Contexto E2E').click();
    await expect(page.getByRole('heading', { name: 'Ficha do Revendedor' })).toBeVisible();

    await page.getByRole('button', { name: 'Novo lançamento' }).click();

    await expect(page).toHaveURL(/\/transactions\?resellerId=\d+$/);
    await expect(page.getByRole('heading', { name: 'Lançamentos', exact: true })).toBeVisible();
    await expect(page.getByText('Nova Movimentação', { exact: true })).toBeVisible();
    await expect(page.locator('#resellerId')).toContainText('Revendedor Contexto E2E');

    await page.getByRole('button', { name: 'Cancelar' }).click();

    await expect(page.locator('#resellerId')).toContainText('Revendedor Contexto E2E');
    await expect(page).toHaveURL(/\/transactions\?resellerId=\d+$/);
});
