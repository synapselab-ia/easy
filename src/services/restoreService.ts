import { db, type Category, type Item, type Reseller, type Subcategory, type Transaction } from '../db/database';
import {
    BACKUP_FORMAT,
    BACKUP_SCHEMA_VERSION,
    BACKUP_VERSION,
    BackupValidationError,
    preflightBackupPayload,
    type BackupEnvelopeV2,
    type BackupPreflightResult,
    type BackupPreview,
} from './backupService';

export interface RestoreCheckpoint {
    envelope: BackupEnvelopeV2;
    filename: string;
}

export interface BackupRestoreSuccess {
    status: 'success';
    checkpointFilename: string;
    restoredPreview: BackupPreview;
}

export interface BackupRestoreFailure {
    status: 'failure';
    checkpointFilename?: string;
    previousDatabasePreserved: true;
    message: string;
}

export type BackupRestoreResult = BackupRestoreSuccess | BackupRestoreFailure;

function serializeDate(value: Date, path: string): string {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
        throw new BackupValidationError([`${path}: data persistida inválida`]);
    }
    return value.toISOString();
}

function buildEnvelope(
    categories: Category[],
    subcategories: Subcategory[],
    items: Item[],
    resellers: Reseller[],
    transactions: Transaction[],
    exportedAt = new Date(),
): BackupEnvelopeV2 {
    return {
        format: BACKUP_FORMAT,
        version: BACKUP_VERSION,
        exportedAt: serializeDate(exportedAt, 'exportedAt'),
        source: { database: 'ResellerManagerDB', schemaVersion: BACKUP_SCHEMA_VERSION },
        data: {
            categories: categories.map((category, index) => ({
                id: category.id as number,
                name: category.name,
                isActive: category.isActive,
                createdAt: serializeDate(category.createdAt, `categories[${index}].createdAt`),
                updatedAt: serializeDate(category.updatedAt, `categories[${index}].updatedAt`),
            })),
            subcategories: subcategories.map((subcategory, index) => ({
                id: subcategory.id as number,
                categoryId: subcategory.categoryId,
                name: subcategory.name,
                isActive: subcategory.isActive,
                createdAt: serializeDate(subcategory.createdAt, `subcategories[${index}].createdAt`),
                updatedAt: serializeDate(subcategory.updatedAt, `subcategories[${index}].updatedAt`),
            })),
            items: items.map((item, index) => ({
                id: item.id as number,
                name: item.name,
                basePrice: item.basePrice,
                isActive: item.isActive !== false,
                categoryId: item.categoryId,
                subcategoryId: item.subcategoryId,
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
                subcategoryId: transaction.subcategoryId,
                subcategoryName: transaction.subcategoryName,
                totalPrice: transaction.totalPrice,
                observation: transaction.observation,
                reversal: transaction.reversal,
                correction: transaction.correction,
                occurredAt: serializeDate(transaction.occurredAt ?? transaction.createdAt, `transactions[${index}].occurredAt`),
                createdAt: serializeDate(transaction.createdAt, `transactions[${index}].createdAt`),
            })),
        },
    };
}

function sortById<T extends { id?: number }>(rows: T[]) {
    return [...rows].sort((left, right) => (left.id ?? 0) - (right.id ?? 0));
}

function logicalSnapshot(
    categories: Category[],
    subcategories: Subcategory[],
    items: Item[],
    resellers: Reseller[],
    transactions: Transaction[],
) {
    return JSON.stringify(buildEnvelope(
        sortById(categories),
        sortById(subcategories),
        sortById(items),
        sortById(resellers),
        sortById(transactions),
        new Date('2000-01-01T00:00:00.000Z'),
    ).data);
}

function checkpointFilename(exportedAt: string) {
    return `easy-checkpoint-v${BACKUP_VERSION}-${exportedAt.replace(/[:.]/g, '-')}.json`;
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

async function readCurrentDatabase() {
    const [categories, subcategories, items, resellers, transactions] = await Promise.all([
        db.categories.toArray(),
        db.subcategories.toArray(),
        db.items.toArray(),
        db.resellers.toArray(),
        db.transactions.toArray(),
    ]);
    return { categories, subcategories, items, resellers, transactions };
}

/** Creates a validated v2/schema6 checkpoint before destructive local restore. */
export async function createRestoreCheckpoint(): Promise<RestoreCheckpoint> {
    const current = await readCurrentDatabase();
    const envelope = buildEnvelope(
        current.categories,
        current.subcategories,
        current.items,
        current.resellers,
        current.transactions,
    );
    preflightBackupPayload(envelope);

    const filename = checkpointFilename(envelope.exportedAt);
    downloadEnvelope(envelope, filename);
    return { envelope, filename };
}

function errorMessage(error: unknown) {
    return error instanceof Error ? error.message : 'Falha desconhecida durante a restauração.';
}

export async function restorePreflightedBackup(
    preflight: BackupPreflightResult,
): Promise<BackupRestoreResult> {
    let checkpoint: RestoreCheckpoint | undefined;

    try {
        const target = preflight.normalized.data;
        const targetEnvelope = buildEnvelope(
            target.categories,
            target.subcategories,
            target.items,
            target.resellers,
            target.transactions,
            preflight.normalized.exportedAt,
        );
        const targetRevalidation = preflightBackupPayload(targetEnvelope);
        const expectedSnapshot = logicalSnapshot(
            target.categories,
            target.subcategories,
            target.items,
            target.resellers,
            target.transactions,
        );

        checkpoint = await createRestoreCheckpoint();

        await db.transaction('rw', [db.categories, db.subcategories, db.items, db.resellers, db.transactions], async () => {
            await db.transactions.clear();
            await db.items.clear();
            await db.resellers.clear();
            await db.subcategories.clear();
            await db.categories.clear();

            if (target.categories.length) await db.categories.bulkAdd(target.categories);
            if (target.subcategories.length) await db.subcategories.bulkAdd(target.subcategories);
            if (target.resellers.length) await db.resellers.bulkAdd(target.resellers);
            if (target.items.length) await db.items.bulkAdd(target.items);
            if (target.transactions.length) await db.transactions.bulkAdd(target.transactions);

            const restored = await readCurrentDatabase();
            const restoredEnvelope = buildEnvelope(
                restored.categories,
                restored.subcategories,
                restored.items,
                restored.resellers,
                restored.transactions,
                preflight.normalized.exportedAt,
            );
            preflightBackupPayload(restoredEnvelope);

            if (
                logicalSnapshot(
                    restored.categories,
                    restored.subcategories,
                    restored.items,
                    restored.resellers,
                    restored.transactions,
                ) !== expectedSnapshot
            ) {
                throw new Error('A verificação pós-restauração detectou divergência no dataset restaurado.');
            }
        });

        return {
            status: 'success',
            checkpointFilename: checkpoint.filename,
            restoredPreview: targetRevalidation.preview,
        };
    } catch (error) {
        return {
            status: 'failure',
            checkpointFilename: checkpoint?.filename,
            previousDatabasePreserved: true,
            message: errorMessage(error),
        };
    }
}
