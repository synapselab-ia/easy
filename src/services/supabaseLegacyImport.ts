import {
    BackupValidationError,
    preflightBackupPayload,
    type NormalizedBackupData,
} from './backupService';

interface LegacyStagingItem {
    id: number;
    name: string;
    basePriceCents: number;
    isActive: true;
    categoryId: null;
    createdAt: string;
    updatedAt: string;
}

interface LegacyStagingReseller {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    notes: string | null;
    isActive: true;
    createdAt: string;
    updatedAt: string;
}

interface LegacyStagingTransaction {
    id: number;
    resellerId: number;
    type: 'order' | 'payment' | 'signal';
    itemId: number | null;
    itemName: string | null;
    quantity: number | null;
    unitPriceCents: number | null;
    totalPriceCents: number;
    observation: string | null;
    categoryId: null;
    categoryName: null;
    reversal: null;
    correction: null;
    occurredAt: string;
    createdAt: string;
}

export interface LegacyV1StagingPayload {
    sourceVersion: 1;
    exportedAt: string;
    items: LegacyStagingItem[];
    resellers: LegacyStagingReseller[];
    transactions: LegacyStagingTransaction[];
}

type JsonRecord = Record<string, unknown>;

const TOP_LEVEL_KEYS = new Set(['version', 'exportedAt', 'data']);
const DATA_KEYS = new Set(['items', 'resellers', 'transactions']);
const ITEM_KEYS = new Set(['id', 'name', 'basePrice', 'createdAt', 'updatedAt']);
const RESELLER_KEYS = new Set(['id', 'name', 'phone', 'email', 'notes', 'createdAt', 'updatedAt']);
const TRANSACTION_KEYS = new Set([
    'id',
    'resellerId',
    'type',
    'itemId',
    'itemName',
    'quantity',
    'unitPrice',
    'totalPrice',
    'observation',
    'createdAt',
]);

function isRecord(value: unknown): value is JsonRecord {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function rejectUnknownKeys(value: unknown, allowed: Set<string>, path: string, issues: string[]) {
    if (!isRecord(value)) return;
    Object.keys(value).forEach(key => {
        if (!allowed.has(key)) issues.push(`${path}.${key}: campo não pertence ao backup estável v1`);
    });
}

function validateStableV1Surface(payload: unknown) {
    const issues: string[] = [];
    if (!isRecord(payload)) return;

    rejectUnknownKeys(payload, TOP_LEVEL_KEYS, 'raiz', issues);
    if (!isRecord(payload.data)) {
        if (issues.length) throw new BackupValidationError(issues);
        return;
    }

    rejectUnknownKeys(payload.data, DATA_KEYS, 'data', issues);

    const rows: Array<[unknown, Set<string>, string]> = [];
    if (Array.isArray(payload.data.items)) {
        payload.data.items.forEach((row, index) => rows.push([row, ITEM_KEYS, `data.items[${index}]`]));
    }
    if (Array.isArray(payload.data.resellers)) {
        payload.data.resellers.forEach((row, index) => rows.push([row, RESELLER_KEYS, `data.resellers[${index}]`]));
    }
    if (Array.isArray(payload.data.transactions)) {
        payload.data.transactions.forEach((row, index) => rows.push([row, TRANSACTION_KEYS, `data.transactions[${index}]`]));
    }
    rows.forEach(([row, allowed, path]) => rejectUnknownKeys(row, allowed, path, issues));

    if (issues.length) throw new BackupValidationError(issues);
}

function safePositiveInteger(value: number, path: string) {
    if (!Number.isSafeInteger(value) || value <= 0) {
        throw new BackupValidationError([`${path}: deve caber com exatidão em um inteiro positivo JavaScript`]);
    }
    return value;
}

function exactCents(value: number, path: string) {
    const scaled = value * 100;
    const cents = Math.round(scaled);
    if (!Number.isSafeInteger(cents) || Math.abs(scaled - cents) > 1e-7) {
        throw new BackupValidationError([`${path}: deve representar um valor monetário exato em centavos`]);
    }
    return cents;
}

function assertCanonicalV1Normalization(normalized: NormalizedBackupData) {
    if (normalized.sourceVersion !== 1) {
        throw new BackupValidationError(['version: somente o backup estável v1 pode entrar no staging legado']);
    }
    if (normalized.data.categories.length !== 0) {
        throw new BackupValidationError(['data.categories: backup estável v1 não pode carregar categorias']);
    }

    normalized.data.items.forEach((item, index) => {
        if (item.isActive === false || item.categoryId !== undefined) {
            throw new BackupValidationError([
                `data.items[${index}]: normalização v1 deve produzir item ativo e ainda sem categoria`,
            ]);
        }
        safePositiveInteger(item.id as number, `data.items[${index}].id`);
    });

    normalized.data.resellers.forEach((reseller, index) => {
        if (reseller.isActive === false) {
            throw new BackupValidationError([
                `data.resellers[${index}]: normalização v1 deve produzir revendedor ativo`,
            ]);
        }
        safePositiveInteger(reseller.id as number, `data.resellers[${index}].id`);
    });

    normalized.data.transactions.forEach((transaction, index) => {
        safePositiveInteger(transaction.id as number, `data.transactions[${index}].id`);
        safePositiveInteger(transaction.resellerId, `data.transactions[${index}].resellerId`);
        if (transaction.reversal !== undefined || transaction.correction !== undefined) {
            throw new BackupValidationError([
                `data.transactions[${index}]: backup estável v1 não pode carregar auditoria de reversão/correção V2`,
            ]);
        }
        if (transaction.categoryId !== undefined || transaction.categoryName !== undefined) {
            throw new BackupValidationError([
                `data.transactions[${index}]: histórico v1 não pode carregar snapshot de categoria`,
            ]);
        }
        if (transaction.occurredAt.getTime() !== transaction.createdAt.getTime()) {
            throw new BackupValidationError([
                `data.transactions[${index}].occurredAt: normalização v1 deve preservar exatamente createdAt`,
            ]);
        }
    });
}

/**
 * Produces the only normalized payload accepted by the D-030 private staging boundary.
 * Raw stable-v1 validation remains owned by backupService.preflightBackupPayload; this
 * adapter only tightens the known stable-main surface and converts money to exact cents.
 */
export function buildLegacyV1StagingPayload(payload: unknown): LegacyV1StagingPayload {
    validateStableV1Surface(payload);
    const { normalized } = preflightBackupPayload(payload);
    assertCanonicalV1Normalization(normalized);

    const items = normalized.data.items.map((item, index): LegacyStagingItem => ({
        id: safePositiveInteger(item.id as number, `data.items[${index}].id`),
        name: item.name,
        basePriceCents: exactCents(item.basePrice, `data.items[${index}].basePrice`),
        isActive: true,
        categoryId: null,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
    }));

    const resellers = normalized.data.resellers.map((reseller, index): LegacyStagingReseller => ({
        id: safePositiveInteger(reseller.id as number, `data.resellers[${index}].id`),
        name: reseller.name,
        phone: reseller.phone ?? null,
        email: reseller.email ?? null,
        notes: reseller.notes ?? null,
        isActive: true,
        createdAt: reseller.createdAt.toISOString(),
        updatedAt: reseller.updatedAt.toISOString(),
    }));

    const transactions = normalized.data.transactions.map((transaction, index): LegacyStagingTransaction => {
        const totalPriceCents = exactCents(transaction.totalPrice, `data.transactions[${index}].totalPrice`);
        let quantity: number | null = null;
        let unitPriceCents: number | null = null;

        if (transaction.type === 'order') {
            if (!Number.isSafeInteger(transaction.quantity) || (transaction.quantity as number) <= 0) {
                throw new BackupValidationError([
                    `data.transactions[${index}].quantity: pedido v1 exige quantidade inteira positiva`,
                ]);
            }
            quantity = transaction.quantity as number;
            unitPriceCents = exactCents(
                transaction.unitPrice as number,
                `data.transactions[${index}].unitPrice`,
            );
            if (totalPriceCents !== quantity * unitPriceCents) {
                throw new BackupValidationError([
                    `data.transactions[${index}].totalPrice: deve ser exatamente quantidade × preço unitário em centavos`,
                ]);
            }
        }

        return {
            id: safePositiveInteger(transaction.id as number, `data.transactions[${index}].id`),
            resellerId: safePositiveInteger(transaction.resellerId, `data.transactions[${index}].resellerId`),
            type: transaction.type,
            itemId: transaction.itemId === undefined
                ? null
                : safePositiveInteger(transaction.itemId, `data.transactions[${index}].itemId`),
            itemName: transaction.itemName ?? null,
            quantity,
            unitPriceCents,
            totalPriceCents,
            observation: transaction.observation ?? null,
            categoryId: null,
            categoryName: null,
            reversal: null,
            correction: null,
            occurredAt: transaction.createdAt.toISOString(),
            createdAt: transaction.createdAt.toISOString(),
        };
    });

    return {
        sourceVersion: 1,
        exportedAt: normalized.exportedAt.toISOString(),
        items,
        resellers,
        transactions,
    };
}
