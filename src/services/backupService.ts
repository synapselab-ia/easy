import {
    db,
    type Category,
    type Item,
    type Reseller,
    type Transaction,
    type TransactionType,
} from '../db/database';

export const BACKUP_FORMAT = 'easy-backup';
export const BACKUP_VERSION = 2 as const;
export const LEGACY_BACKUP_SCHEMA_VERSION = 4 as const;
export const BACKUP_SCHEMA_VERSION = 5 as const;
export type SupportedBackupSchemaVersion = typeof LEGACY_BACKUP_SCHEMA_VERSION | typeof BACKUP_SCHEMA_VERSION;

interface BackupCategoryV2 {
    id: number;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface BackupItemV2 {
    id: number;
    name: string;
    basePrice: number;
    isActive: boolean;
    categoryId?: number;
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
    categoryId?: number;
    categoryName?: string;
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
        categories: BackupCategoryV2[];
        items: BackupItemV2[];
        resellers: BackupResellerV2[];
        transactions: BackupTransactionV2[];
    };
}

export interface NormalizedBackupData {
    sourceVersion: 1 | typeof BACKUP_VERSION;
    sourceSchemaVersion?: SupportedBackupSchemaVersion;
    exportedAt: Date;
    data: {
        categories: Category[];
        items: Item[];
        resellers: Reseller[];
        transactions: Transaction[];
    };
}

export interface BackupPreview {
    sourceVersion: 1 | typeof BACKUP_VERSION;
    sourceSchemaVersion?: SupportedBackupSchemaVersion;
    targetVersion: typeof BACKUP_VERSION;
    schemaVersion: typeof BACKUP_SCHEMA_VERSION;
    migrated: boolean;
    exportedAt: Date;
    counts: {
        categories: number;
        activeCategories: number;
        inactiveCategories: number;
        unclassifiedItems: number;
        legacyOrdersWithoutCategory: number;
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

function requiredTrimmedString(value: unknown, path: string, errors: string[]): string | undefined {
    const normalized = requiredString(value, path, errors);
    if (normalized === undefined) return undefined;
    if (normalized !== normalized.trim()) {
        pathError(errors, path, 'não pode conter espaços nas extremidades');
        return undefined;
    }
    return normalized;
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

function normalizeCategory(
    value: unknown,
    index: number,
    errors: string[],
): Category | undefined {
    const path = `data.categories[${index}]`;
    if (!isRecord(value)) {
        pathError(errors, path, 'deve ser um objeto');
        return undefined;
    }

    const id = positiveInteger(value.id, `${path}.id`, errors);
    const name = requiredTrimmedString(value.name, `${path}.name`, errors);
    const createdAt = validDate(value.createdAt, `${path}.createdAt`, errors);
    const updatedAt = validDate(value.updatedAt, `${path}.updatedAt`, errors);
    const isActive = typeof value.isActive === 'boolean' ? value.isActive : undefined;
    if (isActive === undefined) pathError(errors, `${path}.isActive`, 'deve ser booleano');

    if (id === undefined || name === undefined || isActive === undefined || !createdAt || !updatedAt) {
        return undefined;
    }

    if (updatedAt.getTime() < createdAt.getTime()) {
        pathError(errors, `${path}.updatedAt`, 'não pode ser anterior a createdAt');
    }

    return { id, name, isActive, createdAt, updatedAt };
}

function normalizeItem(
    value: unknown,
    index: number,
    sourceVersion: 1 | 2,
    usesCategorySchema: boolean,
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
    let categoryId: number | undefined;
    if (usesCategorySchema && value.categoryId !== undefined) {
        categoryId = positiveInteger(value.categoryId, `${path}.categoryId`, errors);
    }

    if (id === undefined || name === undefined || basePrice === undefined || !createdAt || !updatedAt) {
        return undefined;
    }

    if (updatedAt.getTime() < createdAt.getTime()) {
        pathError(errors, `${path}.updatedAt`, 'não pode ser anterior a createdAt');
    }

    return {
        id,
        name,
        basePrice,
        isActive,
        ...(categoryId !== undefined ? { categoryId } : {}),
        createdAt,
        updatedAt,
    };
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
    usesCategorySchema: boolean,
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

    let categoryId: number | undefined;
    let categoryName: string | undefined;
    const hasCategoryId = usesCategorySchema && value.categoryId !== undefined;
    const hasCategoryName = usesCategorySchema && value.categoryName !== undefined;

    if (usesCategorySchema && type === 'order') {
        if (hasCategoryId !== hasCategoryName) {
            pathError(errors, path, 'categoryId e categoryName devem ser informados juntos no snapshot de categoria');
        }
        if (hasCategoryId) categoryId = positiveInteger(value.categoryId, `${path}.categoryId`, errors);
        if (hasCategoryName) categoryName = requiredTrimmedString(value.categoryName, `${path}.categoryName`, errors);
    } else if (usesCategorySchema && (type === 'payment' || type === 'signal')) {
        if (hasCategoryId || hasCategoryName) {
            pathError(errors, path, 'pagamentos/sinais não podem conter campos de categoria');
        }
    }

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
        ...(categoryId !== undefined ? { categoryId } : {}),
        ...(categoryName !== undefined ? { categoryName } : {}),
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

function validateCategoryNames(categories: Category[], errors: string[]) {
    const seen = new Map<string, number>();
    categories.forEach((category, index) => {
        const key = category.name.trim().toLowerCase();
        const previousIndex = seen.get(key);
        if (previousIndex !== undefined) {
            pathError(
                errors,
                `data.categories[${index}].name`,
                `duplica o nome lógico de data.categories[${previousIndex}].name`,
            );
            return;
        }
        seen.set(key, index);
    });
}

function validateReferences(
    categories: Category[],
    items: Item[],
    resellers: Reseller[],
    transactions: Transaction[],
    errors: string[],
) {
    const categoryById = new Map(categories.flatMap(category =>
        category.id === undefined ? [] : [[category.id, category] as const]
    ));
    const itemIds = new Set(items.flatMap(item => item.id === undefined ? [] : [item.id]));
    const resellerIds = new Set(resellers.flatMap(reseller => reseller.id === undefined ? [] : [reseller.id]));
    const transactionById = new Map(transactions.flatMap(transaction =>
        transaction.id === undefined ? [] : [[transaction.id, transaction] as const]
    ));

    items.forEach((item, index) => {
        if (item.categoryId === undefined) return;
        const category = categoryById.get(item.categoryId);
        const path = `data.items[${index}].categoryId`;
        if (!category) {
            pathError(errors, path, `referencia categoria inexistente ${item.categoryId}`);
            return;
        }
        if (item.isActive !== false && category.isActive === false) {
            pathError(errors, path, 'item ativo não pode referenciar categoria inativa');
        }
    });

    transactions.forEach((transaction, index) => {
        const path = `data.transactions[${index}]`;
        if (!resellerIds.has(transaction.resellerId)) {
            pathError(errors, `${path}.resellerId`, `referencia revendedor inexistente ${transaction.resellerId}`);
        }
        if (transaction.itemId !== undefined && !itemIds.has(transaction.itemId)) {
            pathError(errors, `${path}.itemId`, `referencia item inexistente ${transaction.itemId}`);
        }
        if (transaction.categoryId !== undefined && !categoryById.has(transaction.categoryId)) {
            pathError(errors, `${path}.categoryId`, `referencia categoria inexistente ${transaction.categoryId}`);
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
                    replacement.type === 'order' &&
                    (replacement.categoryId !== transaction.categoryId || replacement.categoryName !== transaction.categoryName)
                ) {
                    pathError(errors, `${path}.reversal.replacementTransactionId`, 'a substituição de pedido deve preservar o snapshot de categoria original');
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

function currentEnvelope(
    categories: Category[],
    items: Item[],
    resellers: Reseller[],
    transactions: Transaction[],
): BackupEnvelopeV2 {
    return {
        format: BACKUP_FORMAT,
        version: BACKUP_VERSION,
        exportedAt: new Date().toISOString(),
        source: { database: 'ResellerManagerDB', schemaVersion: BACKUP_SCHEMA_VERSION },
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

    let sourceSchemaVersion: SupportedBackupSchemaVersion | undefined;
    if (sourceVersion === BACKUP_VERSION) {
        if (payload.format !== BACKUP_FORMAT) pathError(errors, 'format', `deve ser ${BACKUP_FORMAT}`);
        if (!isRecord(payload.source)) {
            pathError(errors, 'source', 'deve ser um objeto');
        } else {
            if (payload.source.database !== 'ResellerManagerDB') {
                pathError(errors, 'source.database', 'deve identificar ResellerManagerDB');
            }
            if (
                payload.source.schemaVersion !== LEGACY_BACKUP_SCHEMA_VERSION &&
                payload.source.schemaVersion !== BACKUP_SCHEMA_VERSION
            ) {
                pathError(
                    errors,
                    'source.schemaVersion',
                    `deve ser ${LEGACY_BACKUP_SCHEMA_VERSION} ou ${BACKUP_SCHEMA_VERSION}`,
                );
            } else {
                sourceSchemaVersion = payload.source.schemaVersion;
            }
        }
    }

    const exportedAt = validDate(payload.exportedAt, 'exportedAt', errors);
    if (!isRecord(payload.data)) {
        pathError(errors, 'data', 'deve ser um objeto');
        throw new BackupValidationError(errors);
    }

    const usesCategorySchema = sourceVersion === BACKUP_VERSION && sourceSchemaVersion === BACKUP_SCHEMA_VERSION;
    const rawCategoriesValue = payload.data.categories;
    const rawItems = payload.data.items;
    const rawResellers = payload.data.resellers;
    const rawTransactions = payload.data.transactions;

    if (usesCategorySchema && !Array.isArray(rawCategoriesValue)) pathError(errors, 'data.categories', 'deve ser um array');
    if (!Array.isArray(rawItems)) pathError(errors, 'data.items', 'deve ser um array');
    if (!Array.isArray(rawResellers)) pathError(errors, 'data.resellers', 'deve ser um array');
    if (!Array.isArray(rawTransactions)) pathError(errors, 'data.transactions', 'deve ser um array');
    if (
        (usesCategorySchema && !Array.isArray(rawCategoriesValue)) ||
        !Array.isArray(rawItems) || !Array.isArray(rawResellers) || !Array.isArray(rawTransactions) || !exportedAt
    ) {
        throw new BackupValidationError(errors);
    }

    const rawCategories: unknown[] = usesCategorySchema && Array.isArray(rawCategoriesValue)
        ? rawCategoriesValue
        : [];

    if (sourceVersion === BACKUP_VERSION && sourceSchemaVersion === LEGACY_BACKUP_SCHEMA_VERSION) {
        warnings.push('Backup v2/schema4 normalizado para schema5 sem inventar categorias ou classificação histórica.');
    }
    if (sourceVersion === 1) {
        warnings.push('Backup v1 normalizado para schema5 sem inventar categorias ou classificação histórica.');
    }

    const categories: Category[] = rawCategories.flatMap((value, index) => {
        const category = normalizeCategory(value, index, errors);
        return category ? [category] : [];
    });
    const items = rawItems.flatMap((value, index) => {
        const item = normalizeItem(value, index, sourceVersion, usesCategorySchema, errors, warnings);
        return item ? [item] : [];
    });
    const resellers = rawResellers.flatMap((value, index) => {
        const reseller = normalizeReseller(value, index, sourceVersion, errors, warnings);
        return reseller ? [reseller] : [];
    });
    const transactions = rawTransactions.flatMap((value, index) => {
        const transaction = normalizeTransaction(value, index, sourceVersion, usesCategorySchema, errors, warnings);
        return transaction ? [transaction] : [];
    });

    duplicateIds(categories, 'data.categories', errors);
    duplicateIds(items, 'data.items', errors);
    duplicateIds(resellers, 'data.resellers', errors);
    duplicateIds(transactions, 'data.transactions', errors);
    validateCategoryNames(categories, errors);
    validateReferences(categories, items, resellers, transactions, errors);

    if (errors.length) throw new BackupValidationError(errors);

    const normalized: NormalizedBackupData = {
        sourceVersion,
        ...(sourceSchemaVersion !== undefined ? { sourceSchemaVersion } : {}),
        exportedAt,
        data: { categories, items, resellers, transactions },
    };

    const preview: BackupPreview = {
        sourceVersion,
        ...(sourceSchemaVersion !== undefined ? { sourceSchemaVersion } : {}),
        targetVersion: BACKUP_VERSION,
        schemaVersion: BACKUP_SCHEMA_VERSION,
        migrated: sourceVersion !== BACKUP_VERSION || sourceSchemaVersion !== BACKUP_SCHEMA_VERSION || warnings.length > 0,
        exportedAt,
        counts: {
            categories: categories.length,
            activeCategories: categories.filter(category => category.isActive !== false).length,
            inactiveCategories: categories.filter(category => category.isActive === false).length,
            unclassifiedItems: items.filter(item => item.categoryId === undefined).length,
            legacyOrdersWithoutCategory: transactions.filter(
                transaction => transaction.type === 'order' && transaction.categoryId === undefined,
            ).length,
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

/** Exporta um envelope lógico v2/schema5. O próprio dataset é validado antes do download. */
export async function exportData(): Promise<BackupExportResult> {
    const [categories, items, resellers, transactions] = await Promise.all([
        db.categories.toArray(),
        db.items.toArray(),
        db.resellers.toArray(),
        db.transactions.toArray(),
    ]);

    const backup = currentEnvelope(categories, items, resellers, transactions);
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
