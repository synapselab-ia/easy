import { test, expect } from '@playwright/test';

test.describe('Global Search (Command Center)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/easy/');
        await expect(page.locator('body')).toBeVisible();
    });

    test('should open command center with Ctrl+K', async ({ page }) => {
        await page.keyboard.press('Control+k');
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await expect(page.getByPlaceholder('Digite um comando ou pesquise...')).toBeFocused();
    });

    test('should search and navigate to a reseller', async ({ page }) => {
        await page.goto('/easy/resellers');
        await page.getByRole('button', { name: 'Novo Revendedor' }).click();
        await page.getByLabel('Nome do Revendedor').fill('Test Reseller');
        await page.getByRole('button', { name: 'Salvar' }).click();
        await expect(page.getByText('Test Reseller')).toBeVisible();

        await page.keyboard.press('Control+k');
        const input = page.getByPlaceholder('Digite um comando ou pesquise...');
        await input.fill('Test');

        const resultItem = page.locator('[data-slot="command-item"]').filter({ hasText: 'Test Reseller' }).first();
        await expect(resultItem).toBeVisible();
        await resultItem.click();

        await expect(page).toHaveURL(/\/resellers\/\d+/);
        await expect(page.getByRole('heading', { name: 'Ficha do Revendedor' })).toBeVisible();
        await expect(page.getByText('Visualizando dados de Test Reseller')).toBeVisible();
    });

    test('should show actionable suggestions when no reseller result is found', async ({ page }) => {
        await page.keyboard.press('Control+k');
        await page.getByPlaceholder('Digite um comando ou pesquise...').fill('NonExistentThing');

        await expect(page.getByText('Sugestões')).toBeVisible();
        await expect(page.getByText('Cadastrar revendedor: "NonExistentThing"')).toBeVisible();
        await expect(page.getByText('Cadastrar produto: "NonExistentThing"')).toBeVisible();
    });

    test('should open command center via mobile trigger', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });

        const searchButton = page.locator('header.lg\\:hidden').getByRole('button').filter({ has: page.locator('svg') }).nth(1);
        await searchButton.click();
        await expect(page.getByRole('dialog')).toBeVisible();
    });
});
