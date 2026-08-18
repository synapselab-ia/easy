import { db, type Item, type Reseller, type Transaction, type TransactionType } from '../db/database';

export const BACKUP_FORMAT = 'easy-backup';
export const BACKUP_VERSION = 2 as const;
export const BACKUP_SCHEMA_VERSION = 4 as const;

interface BackupItemV2 {
    id: number;
    name: string;
    basePrice: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface BackupResellerV2 {
    id: number;
    name: string;
    phone?: string;
    email?: string;
    notes?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface BackupTransactionV2 {
    id: number;
    resellerId: number;
    type: TransactionType;
    itemId?: number;
    itemName?: string;
    quantity?: number;
    unitPrice?: number;
    totalPrice: number;
    observation?: string;
    reversal?: {
        reason: string;
        reversedAt: string;
        replacementTransactionId?: number;
    };
    correction?: {
        replacesTransactionId: number;
    };
    occurredAt: string;
    createdAt: string;
}

export interface BackupEnvelopeV2 {
    format: typeof BACKUP_FORMAT;
    version: typeof BACKUP_VERSION;
    exportedAt: string;
    source: {
        database: 'ResellerManagerDB';
        schemaVersion: typeof BACKUP_SCHEMA_VERSION;
    };
    data: {
        items: BackupItemV2[];
        resellers: BackupResellerV2[];
        transactions: BackupTransactionV2[];
    };
}

export interface NormalizedBackupData {
    sourceVersion: 1 | typeof BACKUP_VERSION;
    exportedAt: Date;
    data: {
        items: Item[];
        resellers: Reseller[];
        transactions: Transaction[];
    };
}

export interface BackupPreview {
    sourceVersion: 1 | typeof BACKUP_VERSION;
    targetVersion: typeof BACKUP_VERSION;
    schemaVersion: typeof BACKUP_SCHEMA_VERSION;
    migrated: boolean;
    exportedAt: Date;
    counts: {
        items: number;
        activeItems: number;
        inactiveItems: number;
        resellers: number;
        activeResellers: number;
        inactiveResellers: number;
        transactions: number;
        orders: number;
        payments: number;
        signals: number;
        reversedTransactions: number;
        correctionTransactions: number;
    };
    warnings: string[];
}

export interface BackupPreflightResult {
    normalized: NormalizedBackupData;
    preview: BackupPreview;
}

export interface BackupExportResult {
    filename: string;
    exportedAt: Date;
}

export class BackupValidationError extends Error {
    readonly issues: string[];

    constructor(issues: string[]) {
        super(`Backup inválido: ${issues.join(' | ')}`);
        this.name = 'BackupValidationError';
        this.issues = issues;
    }
}

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function pathError(errors: string[], path: string, message: string) {
    errors.push(`${path}: ${message}`);
}

function positiveInteger(value: unknown, path: string, errors: string[]): number | undefined {
    if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
        pathError(errors, path, 'deve ser um inteiro positivo');
        return undefined;
    }
    return value;
}

function finitePositiveNumber(value: unknown, path: string, errors: string[]): number | undefined {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
        pathError(errors, path, 'deve ser um número finito maior que zero');
        return undefined;
    }
    return value;
}

function requiredString(value: unknown, path: string, errors: string[]): string | undefined {
    if (typeof value !== 'string' || !value.trim()) {
        pathError(errors, path, 'deve ser um texto não vazio');
        return undefined;
    }
    return value;
}

function optionalString(value: unknown, path: string, errors: string[]): string | undefined {
    if (value === undefined) return undefined;
    if (typeof value !== 'string') {
        pathError(errors, path, 'deve ser texto quando informado');
        return undefined;
    }
    return value;
}

function validDate(value: unknown, path: string, errors: string[]): Date | undefined {
    if (typeof value !== 'string') {
        pathError(errors, path, 'deve ser uma data serializada como texto');
        return undefined;
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        pathError(errors, path, 'contém uma data inválida');
        return undefined;
    }
    return parsed;
}

function normalizedActive(
    raw: JsonRecord,
    path: string,
    sourceVersion: 1 | 2,
    errors: string[],
    warnings: string[],
): boolean {
    if (typeof raw.isActive === 'boolean') return raw.isActive;
    if (sourceVersion === 1 && raw.isActive === undefined) {
        warnings.push(`${path}.isActive ausente no v1; normalizado para true.`);
        return true;
    }
    pathError(errors, `${path}.isActive`, 'deve ser booleano');
    return true;
}

function normalizeItem(
    value: unknown,
    index: number,
    sourceVersion: 1 | 2,
    errors: string[],
    warnings: string[],
): Item | undefined {
    const path = `data.items[${index}]`;
    if (!isRecord(value)) {
        pathError(errors, path, 'deve ser um objeto');
        return undefined;
    }

    const id = positiveInteger(value.id, `${path}.id`, errors);
    const name = requiredString(value.name, `${path}.name`, errors);
    const basePrice = finitePositiveNumber(value.basePrice, `${path}.basePrice`, errors);
    const createdAt = validDate(value.createdAt, `${path}.createdAt`, errors);
    const updatedAt = validDate(value.updatedAt, `${path}.updatedAt`, errors);
    const isActive = normalizedActive(value, path, sourceVersion, errors, warnings);

    if (id === undefined || name === undefined || basePrice === undefined || !createdAt || !updatedAt) {
        return undefined;
    }

    if (updatedAt.getTime() < createdAt.getTime()) {
        pathError(errors, `${path}.updatedAt`, 'não pode ser anterior a createdAt');
    }

    return { id, name, basePrice, isActive, createdAt, updatedAt };
}

function normalizeReseller(
    value: unknown,
    index: number,
    sourceVersion: 1 | 2,
    errors: string[],
    warnings: string[],
): Reseller | undefined {
    const path = `data.resellers[${index}]`;
    if (!isRecord(value)) {
        pathError(errors, path, 'deve ser um objeto');
        return undefined;
    }

    const id = positiveInteger(value.id, `${path}.id`, errors);
    const name = requiredString(value.name, `${path}.name`, errors);
    const phone = optionalString(value.phone, `${path}.phone`, errors);
    const email = optionalString(value.email, `${path}.email`, errors);
    const notes = optionalString(value.notes, `${path}.notes`, errors);
    const createdAt = validDate(value.createdAt, `${path}.createdAt`, errors);
    const updatedAt = validDate(value.updatedAt, `${path}.updatedAt`, errors);
    const isActive = normalizedActive(value, path, sourceVersion, errors, warnings);

    if (id === undefined || name === undefined || !createdAt || !updatedAt) return undefined;

    if (updatedAt.getTime() < createdAt.getTime()) {
        pathError(errors, `${path}.updatedAt`, 'não pode ser anterior a createdAt');
    }

    return { id, name, phone, email, notes, isActive, createdAt, updatedAt };
}

function normalizeReversal(
    value: unknown,
    path: string,
    createdAt: Date | undefined,
    errors: string[],
): Transaction['reversal'] | undefined {
    if (value === undefined) return undefined;
    if (!isRecord(value)) {
        pathError(errors, path, 'deve ser um objeto');
        return undefined;
    }

    const reason = requiredString(value.reason, `${path}.reason`, errors);
    const reversedAtDate = validDate(value.reversedAt, `${path}.reversedAt`, errors);
    let replacementTransactionId: number | undefined;
    if (value.replacementTransactionId !== undefined) {
        replacementTransactionId = positiveInteger(
            value.replacementTransactionId,
            `${path}.replacementTransactionId`,
            errors,
        );
    }

    if (!reason || !reversedAtDate) return undefined;
    if (createdAt && reversedAtDate.getTime() < createdAt.getTime()) {
        pathError(errors, `${path}.reversedAt`, 'não pode ser anterior ao createdAt do lançamento');
    }

    return {
        reason,
        reversedAt: reversedAtDate.toISOString(),
        ...(replacementTransactionId !== undefined ? { replacementTransactionId } : {}),
    };
}

function normalizeCorrection(value: unknown, path: string, errors: string[]): Transaction['correction'] | undefined {
    if (value === undefined) return undefined;
    if (!isRecord(value)) {
        pathError(errors, path, 'deve ser um objeto');
        return undefined;
    }
    const replacesTransactionId = positiveInteger(value.replacesTransactionId, `${path}.replacesTransactionId`, errors);
    return replacesTransactionId === undefined ? undefined : { replacesTransactionId };
}

function normalizeTransaction(
    value: unknown,
    index: number,
    sourceVersion: 1 | 2,
    errors: string[],
    warnings: string[],
): Transaction | undefined {
    const path = `data.transactions[${index}]`;
    if (!isRecord(value)) {
        pathError(errors, path, 'deve ser um objeto');
        return undefined;
    }

    const id = positiveInteger(value.id, `${path}.id`, errors);
    const resellerId = positiveInteger(value.resellerId, `${path}.resellerId`, errors);
    const createdAt = validDate(value.createdAt, `${path}.createdAt`, errors);
    const totalPrice = finitePositiveNumber(value.totalPrice, `${path}.totalPrice`, errors);

    const type = value.type;
    if (type !== 'order' && type !== 'payment' && type !== 'signal') {
        pathError(errors, `${path}.type`, 'deve ser order, payment ou signal');
    }

    let occurredAt: Date | undefined;
    if (value.occurredAt === undefined && sourceVersion === 1 && createdAt) {
        occurredAt = createdAt;
        warnings.push(`${path}.occurredAt ausente no v1; normalizado a partir de createdAt.`);
    } else {
        occurredAt = validDate(value.occurredAt, `${path}.occurredAt`, errors);
    }

    let itemId: number | undefined;
    if (value.itemId !== undefined) itemId = positiveInteger(value.itemId, `${path}.itemId`, errors);
    const itemName = optionalString(value.itemName, `${path}.itemName`, errors);
    const observation = optionalString(value.observation, `${path}.observation`, errors);

    let quantity: number | undefined;
    if (value.quantity !== undefined) quantity = finitePositiveNumber(value.quantity, `${path}.quantity`, errors);
    let unitPrice: number | undefined;
    if (value.unitPrice !== undefined) unitPrice = finitePositiveNumber(value.unitPrice, `${path}.unitPrice`, errors);

    const reversal = normalizeReversal(value.reversal, `${path}.reversal`, createdAt, errors);
    const correction = normalizeCorrection(value.correction, `${path}.correction`, errors);

    if (type === 'order') {
        if (itemId === undefined) pathError(errors, `${path}.itemId`, 'é obrigatório para pedidos');
        if (!itemName?.trim()) pathError(errors, `${path}.itemName`, 'é obrigatório para preservar o snapshot do pedido');
        if (quantity === undefined) pathError(errors, `${path}.quantity`, 'é obrigatório para pedidos');
        if (unitPrice === undefined) pathError(errors, `${path}.unitPrice`, 'é obrigatório para pedidos');
    } else if (type === 'payment' || type === 'signal') {
        if (value.itemId !== undefined || value.itemName !== undefined || value.quantity !== undefined || value.unitPrice !== undefined) {
            pathError(errors, path, 'pagamentos/sinais não podem conter campos de item/pedido');
        }
    }

    if (
        id === undefined || resellerId === undefined || totalPrice === undefined ||
        (type !== 'order' && type !== 'payment' && type !== 'signal') || !createdAt || !occurredAt
    ) {
        return undefined;
    }

    return {
        id,
        resellerId,
        type,
        itemId,
        itemName,
        quantity,
        unitPrice,
        totalPrice,
        observation,
        reversal,
        correction,
        occurredAt,
        createdAt,
    };
}

function duplicateIds<T extends { id?: number }>(rows: T[], path: string, errors: string[]) {
    const seen = new Set<number>();
    rows.forEach((row, index) => {
        if (row.id === undefined) return;
        if (seen.has(row.id)) pathError(errors, `${path}[${index}].id`, `ID duplicado ${row.id}`);
        seen.add(row.id);
    });
}

function validateReferences(
    items: Item[],
    resellers: Reseller[],
    transactions: Transaction[],
    errors: string[],
) {
    const itemIds = new Set(items.flatMap(item => item.id === undefined ? [] : [item.id]));
    const resellerIds = new Set(resellers.flatMap(reseller => reseller.id === undefined ? [] : [reseller.id]));
    const transactionById = new Map(transactions.flatMap(transaction =>
        transaction.id === undefined ? [] : [[transaction.id, transaction] as const]
    ));

    transactions.forEach((transaction, index) => {
        const path = `data.transactions[${index}]`;
        if (!resellerIds.has(transaction.resellerId)) {
            pathError(errors, `${path}.resellerId`, `referencia revendedor inexistente ${transaction.resellerId}`);
        }
        if (transaction.itemId !== undefined && !itemIds.has(transaction.itemId)) {
            pathError(errors, `${path}.itemId`, `referencia item inexistente ${transaction.itemId}`);
        }

        if (transaction.id === undefined) return;

        const replacementId = transaction.reversal?.replacementTransactionId;
        if (replacementId !== undefined) {
            if (replacementId === transaction.id) {
                pathError(errors, `${path}.reversal.replacementTransactionId`, 'não pode apontar para o próprio lançamento');
            }
            const replacement = transactionById.get(replacementId);
            if (!replacement) {
                pathError(errors, `${path}.reversal.replacementTransactionId`, `referencia lançamento inexistente ${replacementId}`);
            } else {
                if (replacement.correction?.replacesTransactionId !== transaction.id) {
                    pathError(errors, `${path}.reversal.replacementTransactionId`, 'não possui vínculo de correção bidirecional correspondente');
                }
                if (replacement.type !== transaction.type) {
                    pathError(errors, `${path}.reversal.replacementTransactionId`, 'a substituição deve preservar o tipo do lançamento original');
                }
                if (replacement.type === 'order' && replacement.itemId !== transaction.itemId) {
                    pathError(errors, `${path}.reversal.replacementTransactionId`, 'a substituição de pedido deve preservar o item original');
                }
                if (
                    replacement.occurredAt && transaction.occurredAt &&
                    replacement.occurredAt.getTime() !== transaction.occurredAt.getTime()
                ) {
                    pathError(errors, `${path}.reversal.replacementTransactionId`, 'a substituição deve preservar occurredAt do lançamento original');
                }
                if (replacement.createdAt.getTime() < transaction.createdAt.getTime()) {
                    pathError(errors, `${path}.reversal.replacementTransactionId`, 'a substituição não pode ser registrada antes do lançamento original');
                }
            }
        }

        const originalId = transaction.correction?.replacesTransactionId;
        if (originalId !== undefined) {
            if (originalId === transaction.id) {
                pathError(errors, `${path}.correction.replacesTransactionId`, 'não pode apontar para o próprio lançamento');
            }
            const original = transactionById.get(originalId);
            if (!original) {
                pathError(errors, `${path}.correction.replacesTransactionId`, `referencia lançamento inexistente ${originalId}`);
            } else if (original.reversal?.replacementTransactionId !== transaction.id) {
                pathError(errors, `${path}.correction.replacesTransactionId`, 'não possui vínculo de reversão bidirecional correspondente');
            }
        }
    });
}

function serializeDate(value: Date, path: string): string {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
        throw new BackupValidationError([`${path}: data persistida inválida`]);
    }
    return value.toISOString();
}

function currentEnvelope(items: Item[], resellers: Reseller[], transactions: Transaction[]): BackupEnvelopeV2 {
    return {
        format: BACKUP_FORMAT,
        version: BACKUP_VERSION,
        exportedAt: new Date().toISOString(),
        source: { database: 'ResellerManagerDB', schemaVersion: BACKUP_SCHEMA_VERSION },
        data: {
            items: items.map((item, index) => ({
                id: item.id as number,
                name: item.name,
                basePrice: item.basePrice,
                isActive: item.isActive !== false,
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

export function preflightBackupPayload(payload: unknown): BackupPreflightResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!isRecord(payload)) throw new BackupValidationError(['raiz: deve ser um objeto JSON']);

    const sourceVersion = payload.version;
    if (sourceVersion !== 1 && sourceVersion !== BACKUP_VERSION) {
        throw new BackupValidationError([`version: versão não suportada ${String(sourceVersion)}`]);
    }

    if (sourceVersion === BACKUP_VERSION) {
        if (payload.format !== BACKUP_FORMAT) pathError(errors, 'format', `deve ser ${BACKUP_FORMAT}`);
        if (!isRecord(payload.source)) {
            pathError(errors, 'source', 'deve ser um objeto');
        } else {
            if (payload.source.database !== 'ResellerManagerDB') {
                pathError(errors, 'source.database', 'deve identificar ResellerManagerDB');
            }
            if (payload.source.schemaVersion !== BACKUP_SCHEMA_VERSION) {
                pathError(errors, 'source.schemaVersion', `deve ser ${BACKUP_SCHEMA_VERSION}`);
            }
        }
    }

    const exportedAt = validDate(payload.exportedAt, 'exportedAt', errors);
    if (!isRecord(payload.data)) {
        pathError(errors, 'data', 'deve ser um objeto');
        throw new BackupValidationError(errors);
    }

    const rawItems = payload.data.items;
    const rawResellers = payload.data.resellers;
    const rawTransactions = payload.data.transactions;
    if (!Array.isArray(rawItems)) pathError(errors, 'data.items', 'deve ser um array');
    if (!Array.isArray(rawResellers)) pathError(errors, 'data.resellers', 'deve ser um array');
    if (!Array.isArray(rawTransactions)) pathError(errors, 'data.transactions', 'deve ser um array');
    if (!Array.isArray(rawItems) || !Array.isArray(rawResellers) || !Array.isArray(rawTransactions) || !exportedAt) {
        throw new BackupValidationError(errors);
    }

    const items = rawItems.flatMap((value, index) => {
        const item = normalizeItem(value, index, sourceVersion, errors, warnings);
        return item ? [item] : [];
    });
    const resellers = rawResellers.flatMap((value, index) => {
        const reseller = normalizeReseller(value, index, sourceVersion, errors, warnings);
        return reseller ? [reseller] : [];
    });
    const transactions = rawTransactions.flatMap((value, index) => {
        const transaction = normalizeTransaction(value, index, sourceVersion, errors, warnings);
        return transaction ? [transaction] : [];
    });

    duplicateIds(items, 'data.items', errors);
    duplicateIds(resellers, 'data.resellers', errors);
    duplicateIds(transactions, 'data.transactions', errors);
    validateReferences(items, resellers, transactions, errors);

    if (errors.length) throw new BackupValidationError(errors);

    const normalized: NormalizedBackupData = {
        sourceVersion,
        exportedAt,
        data: { items, resellers, transactions },
    };

    const preview: BackupPreview = {
        sourceVersion,
        targetVersion: BACKUP_VERSION,
        schemaVersion: BACKUP_SCHEMA_VERSION,
        migrated: sourceVersion !== BACKUP_VERSION || warnings.length > 0,
        exportedAt,
        counts: {
            items: items.length,
            activeItems: items.filter(item => item.isActive !== false).length,
            inactiveItems: items.filter(item => item.isActive === false).length,
            resellers: resellers.length,
            activeResellers: resellers.filter(reseller => reseller.isActive !== false).length,
            inactiveResellers: resellers.filter(reseller => reseller.isActive === false).length,
            transactions: transactions.length,
            orders: transactions.filter(transaction => transaction.type === 'order').length,
            payments: transactions.filter(transaction => transaction.type === 'payment').length,
            signals: transactions.filter(transaction => transaction.type === 'signal').length,
            reversedTransactions: transactions.filter(transaction => transaction.reversal !== undefined).length,
            correctionTransactions: transactions.filter(transaction => transaction.correction !== undefined).length,
        },
        warnings,
    };

    return { normalized, preview };
}

export function preflightBackupText(text: string): BackupPreflightResult {
    let parsed: unknown;
    try {
        parsed = JSON.parse(text);
    } catch {
        throw new BackupValidationError(['arquivo: JSON inválido']);
    }
    return preflightBackupPayload(parsed);
}

export async function preflightBackupFile(file: Pick<File, 'text'>): Promise<BackupPreflightResult> {
    return preflightBackupText(await file.text());
}

/** Exporta um envelope lógico v2. O próprio dataset é validado antes do download. */
export async function exportData(): Promise<BackupExportResult> {
    const [items, resellers, transactions] = await Promise.all([
        db.items.toArray(),
        db.resellers.toArray(),
        db.transactions.toArray(),
    ]);

    const backup = currentEnvelope(items, resellers, transactions);
    preflightBackupPayload(backup);

    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const exportedAt = new Date(backup.exportedAt);
    const timestamp = backup.exportedAt.replace(/[:.]/g, '-');
    const filename = `easy-backup-v${BACKUP_VERSION}-${timestamp}.json`;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);

    return { filename, exportedAt };
}
