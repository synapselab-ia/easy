import type { Category, Item, Reseller, Transaction } from '@/db/database';
import {
    BACKUP_FORMAT,
    BACKUP_SCHEMA_VERSION,
    BACKUP_VERSION,
    BackupValidationError,
    preflightBackupPayload,
    type BackupEnvelopeV2,
    type BackupExportResult,
    type BackupPreflightResult,
} from './backupService';
import { fetchCloudDataset, restoreCloudBackup } from './cloudDataService';

function serializeDate(value: Date, path: string): string {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
        throw new BackupValidationError([`${path}: data persistida inválida`]);
    }
    return value.toISOString();
}

function buildEnvelope(
    categories: Category[],
    items: Item[],
    resellers: Reseller[],
    transactions: Transaction[],
    exportedAt = new Date(),
): BackupEnvelopeV2 {
    return {
        format: BACKUP_FORMAT,
        version: BACKUP_VERSION,
        exportedAt: serializeDate(exportedAt, 'exportedAt'),
        source: {
            database: 'ResellerManagerDB',
            schemaVersion: BACKUP_SCHEMA_VERSION,
        },
        data: {
            categories: categories.map((category, index) => ({
                id: category.id as number,
                name: category.name,
                isActive: category.isActive,
                createdAt: serializeDate(category.createdAt, `categories[${index}].createdAt`),
                updatedAt: serializeDate(category.updatedAt, `categories[${index}].updatedAt`),
            })),
            items: items.map((item, index) => ({
                id: item.id as number,
                name: item.name,
                basePrice: item.basePrice,
                isActive: item.isActive !== false,
                categoryId: item.categoryId,
                createdAt: serializeDate(item.createdAt, `items[${index}].createdAt`),
                updatedAt: serializeDate(item.updatedAt, `items[${index}].updatedAt`),
            })),
            resellers: resellers.map((reseller, index) => ({
                id: reseller.id as number,
                name: reseller.name,
                phone: reseller.phone,
                email: reseller.email,
                notes: reseller.notes,
                isActive: reseller.isActive !== false,
                createdAt: serializeDate(reseller.createdAt, `resellers[${index}].createdAt`),
                updatedAt: serializeDate(reseller.updatedAt, `resellers[${index}].updatedAt`),
            })),
            transactions: transactions.map((transaction, index) => ({
                id: transaction.id as number,
                resellerId: transaction.resellerId,
                type: transaction.type,
                itemId: transaction.itemId,
                itemName: transaction.itemName,
                quantity: transaction.quantity,
                unitPrice: transaction.unitPrice,
                categoryId: transaction.categoryId,
                categoryName: transaction.categoryName,
                totalPrice: transaction.totalPrice,
                observation: transaction.observation,
                reversal: transaction.reversal,
                correction: transaction.correction,
                occurredAt: serializeDate(
                    transaction.occurredAt ?? transaction.createdAt,
                    `transactions[${index}].occurredAt`,
                ),
                createdAt: serializeDate(transaction.createdAt, `transactions[${index}].createdAt`),
            })),
        },
    };
}

function downloadEnvelope(envelope: BackupEnvelopeV2, filename: string) {
    const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
}

function sortById<T extends { id?: number }>(rows: T[]) {
    return [...rows].sort((left, right) => (left.id ?? 0) - (right.id ?? 0));
}

function logicalSnapshot(
    categories: Category[],
    items: Item[],
    resellers: Reseller[],
    transactions: Transaction[],
) {
    return JSON.stringify(buildEnvelope(
        sortById(categories),
        sortById(items),
        sortById(resellers),
        sortById(transactions),
        new Date('2000-01-01T00:00:00.000Z'),
    ).data);
}

export async function exportCloudData(): Promise<BackupExportResult> {
    const dataset = await fetchCloudDataset();
    const envelope = buildEnvelope(
        dataset.categories,
        dataset.items,
        dataset.resellers,
        dataset.transactions,
    );
    preflightBackupPayload(envelope);

    const filename = `easy-backup-v${BACKUP_VERSION}-${envelope.exportedAt.replace(/[:.]/g, '-')}.json`;
    downloadEnvelope(envelope, filename);
    return { filename, exportedAt: new Date(envelope.exportedAt) };
}

export async function restorePreflightedCloudBackup(preflight: BackupPreflightResult) {
    let checkpointFilename: string | undefined;

    try {
        const target = preflight.normalized.data;
        const targetEnvelope = buildEnvelope(
            target.categories,
            target.items,
            target.resellers,
            target.transactions,
            preflight.normalized.exportedAt,
        );
        const targetRevalidation = preflightBackupPayload(targetEnvelope);
        const expectedSnapshot = logicalSnapshot(
            target.categories,
            target.items,
            target.resellers,
            target.transactions,
        );

        const current = await fetchCloudDataset();
        const checkpoint = buildEnvelope(
            current.categories,
            current.items,
            current.resellers,
            current.transactions,
        );
        preflightBackupPayload(checkpoint);
        checkpointFilename = `easy-checkpoint-v${BACKUP_VERSION}-${checkpoint.exportedAt.replace(/[:.]/g, '-')}.json`;
        downloadEnvelope(checkpoint, checkpointFilename);

        await restoreCloudBackup(targetEnvelope);

        const restored = await fetchCloudDataset();
        const restoredEnvelope = buildEnvelope(
            restored.categories,
            restored.items,
            restored.resellers,
            restored.transactions,
            preflight.normalized.exportedAt,
        );
        preflightBackupPayload(restoredEnvelope);

        if (
            logicalSnapshot(
                restored.categories,
                restored.items,
                restored.resellers,
                restored.transactions,
            ) !== expectedSnapshot
        ) {
            throw new Error('A verificação pós-restauração detectou divergência no banco online restaurado.');
        }

        return {
            status: 'success' as const,
            checkpointFilename,
            restoredPreview: targetRevalidation.preview,
        };
    } catch (error) {
        return {
            status: 'failure' as const,
            ...(checkpointFilename ? { checkpointFilename } : {}),
            previousDatabasePreserved: true as const,
            message: error instanceof Error ? error.message : 'Falha desconhecida durante a restauração online.',
        };
    }
}
