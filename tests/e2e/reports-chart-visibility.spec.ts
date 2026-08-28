import { expect, test } from '@playwright/test';

test('renders visible sales/receipts timeline strokes with the OKLCH theme', async ({ page }) => {
    const resellerName = 'Revendedor Gráfico E2E';

    await page.goto('/easy/resellers');
    await page.getByRole('button', { name: 'Novo Revendedor' }).click();
    await page.getByLabel('Nome do Revendedor').fill(resellerName);
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText(resellerName)).toBeVisible();

    await page.goto('/easy/transactions?type=payment');
    const resellerSelect = page.getByRole('combobox', { name: 'Revendedor' });
    await resellerSelect.click();
    await page.getByPlaceholder('Pesquisar revendedor...').fill(resellerName);
    await page.getByRole('option', { name: resellerName }).click();
    await page.getByLabel('Valor para Abatimento (R$)').fill('123.45');
    await page.getByRole('button', { name: 'Lançar Movimentação' }).click();

    await page.goto('/easy/reports');
    await expect(page.getByText('Vendas e recebimentos', { exact: true })).toBeVisible();

    const curves = page.locator('.recharts-line-curve');
    await expect(curves).toHaveCount(2);

    const strokes = await curves.evaluateAll(elements => elements.map(element => getComputedStyle(element).stroke));
    expect(strokes).toHaveLength(2);
    for (const stroke of strokes) {
        expect(stroke).not.toBe('');
        expect(stroke).not.toBe('none');
        expect(stroke).not.toBe('transparent');
    }
});
