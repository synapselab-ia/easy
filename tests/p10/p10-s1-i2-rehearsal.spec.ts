import { expect, test, type BrowserContext, type Download, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const RECOVERY_WRITE_BLOCKED_MESSAGE =
    'Cópia de recuperação ausente ou vencida. Vá para Backup & Restore, gere um novo backup e mantenha a cópia em uma pasta sincronizada.';

interface BackupItem {
    id: number;
    name: string;
    basePrice: number;
    isActive?: boolean;
    categoryId?: number;
    createdAt: string;
    updatedAt: string;
}

interface BackupReseller {
    id: number;
    name: string;
    isActive?: boolean;
    createdAt: string;
    updatedAt: string;
}

interface BackupTransaction {
    id: number;
    resellerId: number;
    type: 'order' | 'payment' | 'signal';
    itemId?: number;
    itemName?: string;
    quantity?: number;
    unitPrice?: number;
    categoryId?: number;
    categoryName?: string;
    totalPrice: number;
    observation?: string;
    occurredAt?: string;
    createdAt: string;
    reversal?: {
        reason: string;
        reversedAt: string;
        replacementTransactionId?: number;
    };
    correction?: {
        replacesTransactionId: number;
    };
}

interface ExportedBackup {
    format: string;
    version: number;
    exportedAt: string;
    source: {
        database: string;
        schemaVersion: number;
    };
    data: {
        categories: Array<{
            id: number;
            name: string;
            isActive: boolean;
            createdAt: string;
            updatedAt: string;
        }>;
        items: BackupItem[];
        resellers: BackupReseller[];
        transactions: BackupTransaction[];
    };
}

const syntheticV1 = {
    version: 1,
    exportedAt: '2026-08-19T16:00:00.000Z',
    data: {
        items: [
            {
                id: 1,
                name: 'Item Legado A',
                basePrice: 20,
                createdAt: '2026-07-01T12:00:00.000Z',
                updatedAt: '2026-07-02T12:00:00.000Z',
            },
            {
                id: 2,
                name: 'Item Legado B',
                basePrice: 35,
                createdAt: '2026-07-03T12:00:00.000Z',
                updatedAt: '2026-07-04T12:00:00.000Z',
            },
        ],
        resellers: [
            {
                id: 1,
                name: 'Revendedor Sintético A',
                phone: '',
                email: '',
                notes: '',
                createdAt: '2026-07-05T12:00:00.000Z',
                updatedAt: '2026-07-06T12:00:00.000Z',
            },
            {
                id: 2,
                name: 'Revendedor Sintético B',
                phone: '',
                email: '',
                notes: '',
                createdAt: '2026-07-07T12:00:00.000Z',
                updatedAt: '2026-07-08T12:00:00.000Z',
            },
        ],
        transactions: [
            {
                id: 1,
                resellerId: 1,
                type: 'order' as const,
                itemId: 1,
                itemName: 'Item Legado A',
                quantity: 2,
                unitPrice: 20,
                totalPrice: 40,
                observation: 'Pedido legado sintético',
                createdAt: '2026-08-01T12:00:00.000Z',
            },
            {
                id: 2,
                resellerId: 1,
                type: 'payment' as const,
                totalPrice: 10,
                createdAt: '2026-08-02T12:00:00.000Z',
            },
            {
                id: 3,
                resellerId: 2,
                type: 'signal' as const,
                totalPrice: 5,
                createdAt: '2026-08-03T12:00:00.000Z',
            },
        ],
    },
};

async function uploadBackup(page: Page, name: string, payload: object) {
    await page.locator('#backup-import').setInputFiles({
        name,
        mimeType: 'application/json',
        buffer: Buffer.from(JSON.stringify(payload)),
    });
    await expect(page.getByRole('heading', { name: 'Prévia do Backup' })).toBeVisible();
}

async function parseDownload(download: Download): Promise<ExportedBackup> {
    const path = await download.path();
    if (!path) throw new Error(`Download ${download.suggestedFilename()} has no local path.`);
    return JSON.parse(await readFile(path, 'utf8')) as ExportedBackup;
}

async function exportBackup(page: Page) {
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Exportar Backup v2' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^easy-backup-v2-.*\.json$/);
    return {
        download,
        payload: await parseDownload(download),
    };
}

async function restoreCurrentPreview(page: Page) {
    const restoreButton = page.getByRole('button', { name: 'Restaurar Backup' });
    await expect(restoreButton).toBeVisible();
    await expect(restoreButton).toBeEnabled();
    const checkpointPromise = page.waitForEvent('download');
    await restoreButton.evaluate((button: HTMLButtonElement) => button.click());
    const checkpoint = await checkpointPromise;
    expect(checkpoint.suggestedFilename()).toMatch(/\.json$/);
    await expect(page.getByText(/Backup restaurado com sucesso/)).toBeVisible();
}

async function chooseRadixOption(page: Page, label: string, option: string | RegExp) {
    await page.getByLabel(label).click();
    await page.getByRole('option', { name: option }).click();
}

async function classifyItem(page: Page, itemName: string) {
    await page.goto('/items');
    const row = page.getByRole('row').filter({ hasText: itemName });
    await expect(row).toBeVisible();
    await row.getByRole('button', { name: 'Editar' }).click();
    await expect(page.getByRole('heading', { name: 'Editar Item' })).toBeVisible();
    await page.locator('#categoryId').selectOption({ label: 'Categoria Rehearsal' });
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByRole('heading', { name: 'Editar Item' })).toBeHidden();
}

async function assertNormalizedStableV1(payload: ExportedBackup) {
    expect(payload.format).toBe('easy-backup');
    expect(payload.version).toBe(2);
    expect(payload.source.database).toBe('ResellerManagerDB');
    expect(payload.source.schemaVersion).toBe(5);
    expect(payload.data.categories).toHaveLength(0);
    expect(payload.data.items).toHaveLength(2);
    expect(payload.data.resellers).toHaveLength(2);
    expect(payload.data.transactions).toHaveLength(3);
    expect(payload.data.items.every(item => item.isActive === true)).toBe(true);
    expect(payload.data.resellers.every(reseller => reseller.isActive === true)).toBe(true);
    expect(payload.data.items.every(item => item.categoryId === undefined)).toBe(true);
    expect(payload.data.transactions.every(transaction => transaction.occurredAt === transaction.createdAt)).toBe(true);
    const legacyOrder = payload.data.transactions.find(transaction => transaction.type === 'order');
    expect(legacyOrder?.categoryId).toBeUndefined();
    expect(legacyOrder?.categoryName).toBeUndefined();
}

async function restoreAndReexportInDisposableContext(
    context: BrowserContext,
    finalBackup: ExportedBackup,
) {
    const page = await context.newPage();
    await page.goto('/backup');
    await uploadBackup(page, 'p10-final-v2.json', finalBackup);

    await expect(page.getByText('v2 → v2', { exact: false })).toBeVisible();
    await expect(page.getByText('Migração em memória: não', { exact: false })).toBeVisible();
    await expect(page.getByText('1 estornos · 1 substituições vinculadas', { exact: false })).toBeVisible();

    await restoreCurrentPreview(page);

    const { payload: reexported } = await exportBackup(page);
    expect(reexported.format).toBe(finalBackup.format);
    expect(reexported.version).toBe(finalBackup.version);
    expect(reexported.source).toEqual(finalBackup.source);
    expect(reexported.data).toEqual(finalBackup.data);

    await page.close();
}

test('P10-S1-I2 rehearses synthetic stable-v1 migration, recovery, operations and V2 round-trip on the pinned candidate', async ({ page, browser }) => {
    test.info().annotations.push({
        type: 'candidate-sha',
        description: process.env.P10_CANDIDATE_SHA ?? 'not-provided',
    });

    await page.goto('/backup');
    await expect(page.getByRole('heading', { name: 'Backup & Restore' })).toBeVisible();
    await expect(page.locator('[data-recovery-status="unknown"]')).toBeVisible();

    await uploadBackup(page, 'p10-stable-v1-synthetic.json', syntheticV1);
    await expect(page.getByText('v1 → v2', { exact: false })).toBeVisible();
    await expect(page.getByText('Migração em memória: sim', { exact: false })).toBeVisible();
    await expect(page.getByText('2 itens sem categoria · 1 pedidos sem snapshot de categoria', { exact: false })).toBeVisible();
    await restoreCurrentPreview(page);

    await page.goto('/categories');
    await page.getByRole('button', { name: 'Nova Categoria' }).click();
    await page.getByLabel('Nome').fill('Categoria bloqueada antes do setup');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText(RECOVERY_WRITE_BLOCKED_MESSAGE)).toBeVisible();
    await page.getByRole('button', { name: 'Cancelar' }).click();

    await page.goto('/backup');
    const setupExport = await exportBackup(page);
    await assertNormalizedStableV1(setupExport.payload);
    await expect(page.locator('[data-recovery-status="due"]')).toBeVisible();
    await page.getByRole('button', { name: 'Confirmar que verifiquei a cópia no Drive' }).click();
    await expect(page.locator('[data-recovery-status="current"]')).toBeVisible();
    await expect(page.getByText('Pasta sincronizada verificada', { exact: true })).toBeVisible();

    await page.goto('/transactions');
    await chooseRadixOption(page, 'Revendedor', 'Revendedor Sintético A');
    await chooseRadixOption(page, 'Item do Catálogo', /^Item Legado A/);
    await page.getByLabel('Observação').fill('Tentativa antes da classificação');
    await page.getByRole('button', { name: 'Lançar Movimentação' }).click();
    await expect(page.getByText('Selecione uma categoria ativa.')).toBeVisible();

    await page.goto('/categories');
    await page.getByRole('button', { name: 'Nova Categoria' }).click();
    await page.getByLabel('Nome').fill('Categoria Rehearsal');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Categoria criada.')).toBeVisible();

    await classifyItem(page, 'Item Legado A');
    await classifyItem(page, 'Item Legado B');

    await page.goto('/transactions');
    await chooseRadixOption(page, 'Revendedor', 'Revendedor Sintético A');
    await chooseRadixOption(page, 'Item do Catálogo', /^Item Legado A/);
    await page.getByLabel('Quantidade').fill('2');
    await page.getByLabel('Observação').fill('Rehearsal order original');
    await page.getByRole('button', { name: 'Lançar Movimentação' }).click();
    await expect(page.getByText('Lançamento salvo com sucesso!')).toBeVisible();

    await page.goto('/resellers/1');
    const originalRow = page.getByRole('row').filter({ hasText: 'Rehearsal order original' });
    await expect(originalRow).toBeVisible();
    await originalRow.getByRole('button', { name: 'Corrigir' }).click();

    await expect(page.getByRole('heading', { name: 'Corrigir movimentação' })).toBeVisible();
    await page.getByLabel('Motivo da correção').fill('Rehearsal D-026: item e data corrigidos');
    await page.locator('#correctionItem').selectOption({ label: 'Item Legado B' });
    await page.getByLabel('Data da ocorrência').fill('2026-08-18');
    await page.getByLabel('Quantidade corrigida').fill('3');
    await page.getByLabel('Valor unitário corrigido (R$)').fill('35');
    await page.getByLabel('Observação da substituição').fill('Rehearsal order corrected');
    await page.getByRole('button', { name: 'Confirmar Correção' }).click();
    await expect(page.getByText('Correção registrada com original e substituição preservados.')).toBeVisible();

    const reversedRow = page.getByRole('row').filter({ hasText: 'Rehearsal order original' });
    const replacementRow = page.getByRole('row').filter({ hasText: 'Rehearsal order corrected' });
    await expect(reversedRow.getByText('Estornado')).toBeVisible();
    await expect(replacementRow.getByText('Válido')).toBeVisible();
    await expect(replacementRow.getByText('Item Legado B')).toBeVisible();

    await page.goto('/backup');
    const { payload: finalBackup } = await exportBackup(page);

    expect(finalBackup.format).toBe('easy-backup');
    expect(finalBackup.version).toBe(2);
    expect(finalBackup.source.schemaVersion).toBe(5);
    expect(finalBackup.data.categories).toHaveLength(1);
    expect(finalBackup.data.items).toHaveLength(2);
    expect(finalBackup.data.resellers).toHaveLength(2);
    expect(finalBackup.data.transactions).toHaveLength(5);
    expect(finalBackup.data.items.every(item => item.categoryId === finalBackup.data.categories[0].id)).toBe(true);

    const original = finalBackup.data.transactions.find(transaction => transaction.observation === 'Rehearsal order original');
    const replacement = finalBackup.data.transactions.find(transaction => transaction.observation === 'Rehearsal order corrected');
    expect(original).toBeDefined();
    expect(replacement).toBeDefined();
    expect(original?.itemId).toBe(1);
    expect(replacement?.itemId).toBe(2);
    expect(replacement?.itemName).toBe('Item Legado B');
    expect(replacement?.categoryName).toBe('Categoria Rehearsal');
    expect(replacement?.occurredAt).not.toBe(original?.occurredAt);
    expect(original?.reversal?.replacementTransactionId).toBe(replacement?.id);
    expect(replacement?.correction?.replacesTransactionId).toBe(original?.id);

    const roundTripContext = await browser.newContext({
        acceptDownloads: true,
        baseURL: process.env.P10_CANDIDATE_URL,
    });
    try {
        await restoreAndReexportInDisposableContext(roundTripContext, finalBackup);
    } finally {
        await roundTripContext.close();
    }
});
