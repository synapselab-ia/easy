import { test, expect } from '@playwright/test';

const RECOVERY_KEY = 'easy.recoveryHealth.v1';

test('blocks normal writes when recovery health is unknown while keeping Backup/Restore available', async ({ page }) => {
    await page.goto('resellers');
    await page.evaluate((key) => localStorage.removeItem(key), RECOVERY_KEY);
    await page.reload();

    await expect(page.locator('[data-recovery-status="unknown"]')).toBeVisible();

    await page.getByRole('button', { name: 'Novo Revendedor' }).click();
    await page.getByLabel('Nome do Revendedor').fill('Bloqueado pelo recovery guard');
    await page.getByRole('button', { name: 'Salvar' }).click();

    await expect(page.getByText(/Cópia de recuperação ausente ou vencida/)).toBeVisible();

    await page.locator('[data-recovery-status] a').click();
    await expect(page.getByRole('heading', { name: 'Backup & Restore' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Exportar Backup v2' })).toBeEnabled();
    await expect(page.getByText('Validar Backup para Restauração')).toBeVisible();
});

test('records export metadata and allows setup verification after the operator checks the synchronized copy', async ({ page }) => {
    await page.goto('backup');
    await page.evaluate((key) => localStorage.removeItem(key), RECOVERY_KEY);
    await page.reload();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Exportar Backup v2' }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^easy-backup-v2-.*\.json$/);
    await expect(page.locator('[data-recovery-status="due"]')).toBeVisible();
    await expect(page.getByText(download.suggestedFilename(), { exact: false })).toBeVisible();

    await page.getByRole('button', { name: 'Confirmar que verifiquei a cópia no Drive' }).click();

    await expect(page.locator('[data-recovery-status="current"]')).toBeVisible();
    await expect(page.getByText('Pasta sincronizada verificada')).toBeVisible();
});
