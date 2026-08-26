import Dexie, { type EntityTable } from 'dexie';

export interface Category {
    id?: number;
    name: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export function isCategoryActive(category: Pick<Category, 'isActive'>) {
    return category.isActive !== false;
}

export interface Subcategory {
    id?: number;
    categoryId: number;
    name: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export function isSubcategoryActive(subcategory: Pick<Subcategory, 'isActive'>) {
    return subcategory.isActive !== false;
}

export interface Item {
    id?: number;
    name: string;
    basePrice: number;
    isActive?: boolean;
    categoryId?: number;
    subcategoryId?: number;
    createdAt: Date;
    updatedAt: Date;
}

export function isItemActive(item: Pick<Item, 'isActive'>) {
    return item.isActive !== false;
}

export interface Reseller {
    id?: number;
    name: string;
    phone?: string;
    email?: string;
    notes?: string;
    isActive?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export function isResellerActive(reseller: Pick<Reseller, 'isActive'>) {
    return reseller.isActive !== false;
}

export type TransactionType = 'order' | 'payment' | 'signal';

export interface TransactionReversal {
    reason: string;
    reversedAt: string;
    replacementTransactionId?: number;
}

export interface TransactionCorrection {
    replacesTransactionId: number;
}

export interface Transaction {
    id?: number;
    resellerId: number;
    type: TransactionType;
    // Campos para pedido
    itemId?: number;
    itemName?: string;
    quantity?: number;
    unitPrice?: number;
    // Snapshots históricos opcionais de classificação. Ausentes em pedidos legados.
    categoryId?: number;
    categoryName?: string;
    subcategoryId?: number;
    subcategoryName?: string;
    totalPrice: number;
    observation?: string;
    // Auditoria de correção. Ausente significa lançamento efetivo.
    reversal?: TransactionReversal;
    // Presente apenas em uma transação criada como substituição auditável.
    correction?: TransactionCorrection;
    // Data financeira em que a movimentação ocorreu. Opcional apenas para leitura de dados legados.
    occurredAt?: Date;
    // Momento de registro/auditoria do lançamento no Easy.
    createdAt: Date;
}

class AppDatabase extends Dexie {
    categories!: EntityTable<Category, 'id'>;
    subcategories!: EntityTable<Subcategory, 'id'>;
    items!: EntityTable<Item, 'id'>;
    resellers!: EntityTable<Reseller, 'id'>;
    transactions!: EntityTable<Transaction, 'id'>;

    constructor() {
        super('ResellerManagerDB');
        this.version(1).stores({
            items: '++id, name',
            resellers: '++id, name',
            transactions: '++id, resellerId, type, createdAt'
        });

        this.version(2).stores({
            items: '++id, name',
            resellers: '++id, name',
            transactions: '++id, resellerId, type, createdAt'
        }).upgrade(transaction =>
            transaction.table('resellers').toCollection().modify((reseller: Reseller) => {
                if (typeof reseller.isActive !== 'boolean') {
                    reseller.isActive = true;
                }
            })
        );

        this.version(3).stores({
            items: '++id, name',
            resellers: '++id, name',
            transactions: '++id, resellerId, type, createdAt'
        }).upgrade(transaction =>
            transaction.table('items').toCollection().modify((item: Item) => {
                if (typeof item.isActive !== 'boolean') {
                    item.isActive = true;
                }
            })
        );

        this.version(4).stores({
            items: '++id, name',
            resellers: '++id, name',
            transactions: '++id, resellerId, type, createdAt, occurredAt'
        }).upgrade(transaction =>
            transaction.table('transactions').toCollection().modify((financialTransaction: Transaction) => {
                if (!(financialTransaction.occurredAt instanceof Date)) {
                    financialTransaction.occurredAt = financialTransaction.createdAt;
                }
            })
        );

        // P9-S3-I1: additive, lossless migration only. Existing V4 rows are left untouched;
        // no category entity or historical classification is fabricated during upgrade.
        this.version(5).stores({
            categories: '++id, name, isActive',
            items: '++id, name, categoryId',
            resellers: '++id, name',
            transactions: '++id, resellerId, type, createdAt, occurredAt, categoryId'
        });

        // I3-D subcategories: additive only. Existing category/item/order history remains
        // untouched; no subcategory classification is fabricated during upgrade.
        this.version(6).stores({
            categories: '++id, name, isActive',
            subcategories: '++id, categoryId, name, isActive',
            items: '++id, name, categoryId, subcategoryId',
            resellers: '++id, name',
            transactions: '++id, resellerId, type, createdAt, occurredAt, categoryId, subcategoryId'
        });
    }
}

export const db = new AppDatabase();
