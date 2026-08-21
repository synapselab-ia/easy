import type { Json } from '@/lib/database.types';
import { getEasySupabaseClient } from '@/lib/supabase';
import {
    db,
    type Category,
    type Item,
    type Reseller,
    type Transaction,
    type TransactionType,
} from '@/db/database';
import { transactionOccurredAt } from '@/domain/transactions';

export interface CloudDataset {
    categories: Category[];
    items: Item[];
    resellers: Reseller[];
    transactions: Transaction[];
}

export interface CloudNewTransactionInput {
    resellerId: number;
    type: TransactionType;
    itemId?: number;
    itemName?: string;
    quantity?: number;
    unitPrice?: number;
    totalPrice: number;
    observation?: string;
    occurredAt?: Date;
}

export interface CloudCorrectionReplacementInput extends Partial<CloudNewTransactionInput> {
    resellerId: number;
    totalPrice: number;
}

function asDate(value: string) {
    return new Date(value);
}

function nullableText(value: string | undefined) {
    return value === undefined ? null : value;
}

function toCategory(row: {
    id: number;
    name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}): Category {
    return {
        id: row.id,
        name: row.name,
        isActive: row.is_active,
        createdAt: asDate(row.created_at),
        updatedAt: asDate(row.updated_at),
    };
}

function toItem(row: {
    id: number;
    name: string;
    base_price: number;
    is_active: boolean;
    category_id: number | null;
    created_at: string;
    updated_at: string;
}): Item {
    return {
        id: row.id,
        name: row.name,
        basePrice: Number(row.base_price),
        isActive: row.is_active,
        ...(row.category_id !== null ? { categoryId: row.category_id } : {}),
        createdAt: asDate(row.created_at),
        updatedAt: asDate(row.updated_at),
    };
}

function toReseller(row: {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    notes: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}): Reseller {
    return {
        id: row.id,
        name: row.name,
        phone: row.phone ?? undefined,
        email: row.email ?? undefined,
        notes: row.notes ?? undefined,
        isActive: row.is_active,
        createdAt: asDate(row.created_at),
        updatedAt: asDate(row.updated_at),
    };
}

function toTransaction(row: {
    id: number;
    reseller_id: number;
    type: string;
    item_id: number | null;
    item_name: string | null;
    quantity: number | null;
    unit_price: number | null;
    category_id: number | null;
    category_name: string | null;
    total_price: number;
    observation: string | null;
    reversal_reason: string | null;
    reversed_at: string | null;
    replacement_transaction_id: number | null;
    replaces_transaction_id: number | null;
    occurred_at: string;
    created_at: string;
}): Transaction {
    const reversal = row.reversal_reason && row.reversed_at
        ? {
            reason: row.reversal_reason,
            reversedAt: row.reversed_at,
            ...(row.replacement_transaction_id !== null
                ? { replacementTransactionId: row.replacement_transaction_id }
                : {}),
        }
        : undefined;
    const correction = row.replaces_transaction_id !== null
        ? { replacesTransactionId: row.replaces_transaction_id }
        : undefined;

    return {
        id: row.id,
        resellerId: row.reseller_id,
        type: row.type as TransactionType,
        ...(row.item_id !== null ? { itemId: row.item_id } : {}),
        ...(row.item_name !== null ? { itemName: row.item_name } : {}),
        ...(row.quantity !== null ? { quantity: row.quantity } : {}),
        ...(row.unit_price !== null ? { unitPrice: Number(row.unit_price) } : {}),
        ...(row.category_id !== null ? { categoryId: row.category_id } : {}),
        ...(row.category_name !== null ? { categoryName: row.category_name } : {}),
        totalPrice: Number(row.total_price),
        ...(row.observation !== null ? { observation: row.observation } : {}),
        ...(reversal ? { reversal } : {}),
        ...(correction ? { correction } : {}),
        occurredAt: asDate(row.occurred_at),
        createdAt: asDate(row.created_at),
    };
}

function throwCloudError(error: { message: string; code?: string } | null, fallback: string): never {
    if (!error) throw new Error(fallback);

    if (error.code === '23505') {
        throw new Error('Já existe um cadastro com estes dados.');
    }
    if (error.code === '23503') {
        throw new Error('Este registro está sendo usado por outro dado e não pode ser removido.');
    }

    throw new Error(error.message || fallback);
}

export async function fetchCloudDataset(): Promise<CloudDataset> {
    const client = getEasySupabaseClient();
    const [categoriesResult, itemsResult, resellersResult, transactionsResult] = await Promise.all([
        client.from('categories').select('*').order('id'),
        client.from('items').select('*').order('id'),
        client.from('resellers').select('*').order('id'),
        client.from('transactions').select('*').order('id'),
    ]);

    if (categoriesResult.error) throwCloudError(categoriesResult.error, 'Falha ao carregar categorias do banco online.');
    if (itemsResult.error) throwCloudError(itemsResult.error, 'Falha ao carregar itens do banco online.');
    if (resellersResult.error) throwCloudError(resellersResult.error, 'Falha ao carregar revendedores do banco online.');
    if (transactionsResult.error) throwCloudError(transactionsResult.error, 'Falha ao carregar lançamentos do banco online.');

    return {
        categories: (categoriesResult.data ?? []).map(toCategory),
        items: (itemsResult.data ?? []).map(toItem),
        resellers: (resellersResult.data ?? []).map(toReseller),
        transactions: (transactionsResult.data ?? []).map(toTransaction),
    };
}

export async function replaceDexieCache(dataset: CloudDataset) {
    await db.transaction('rw', [db.categories, db.items, db.resellers, db.transactions], async () => {
        await db.transactions.clear();
        await db.items.clear();
        await db.resellers.clear();
        await db.categories.clear();

        if (dataset.categories.length) await db.categories.bulkPut(dataset.categories);
        if (dataset.resellers.length) await db.resellers.bulkPut(dataset.resellers);
        if (dataset.items.length) await db.items.bulkPut(dataset.items);
        if (dataset.transactions.length) await db.transactions.bulkPut(dataset.transactions);
    });
}

export async function refreshCloudCache() {
    const dataset = await fetchCloudDataset();
    await replaceDexieCache(dataset);
    return dataset;
}

export async function isCurrentUserApprovedOperator() {
    const client = getEasySupabaseClient();
    const { data, error } = await client.rpc('is_easy_operator');
    if (error) throwCloudError(error, 'Não foi possível confirmar a autorização da conta.');
    return data === true;
}

export async function createCloudCategory(name: string) {
    const client = getEasySupabaseClient();
    const { data, error } = await client
        .from('categories')
        .insert({ name: name.trim(), is_active: true })
        .select('id')
        .single();
    if (error || !data) throwCloudError(error, 'Falha ao criar categoria.');
    await refreshCloudCache();
    return data.id;
}

export async function renameCloudCategory(id: number, name: string) {
    const client = getEasySupabaseClient();
    const { error } = await client.from('categories').update({ name: name.trim() }).eq('id', id);
    if (error) throwCloudError(error, 'Falha ao renomear categoria.');
    await refreshCloudCache();
}

export async function setCloudCategoryActive(id: number, isActive: boolean) {
    const client = getEasySupabaseClient();
    const { error } = await client.from('categories').update({ is_active: isActive }).eq('id', id);
    if (error) throwCloudError(error, 'Falha ao atualizar categoria.');
    await refreshCloudCache();
}

export async function deleteCloudCategory(id: number) {
    const client = getEasySupabaseClient();
    const { error } = await client.from('categories').delete().eq('id', id);
    if (error) throwCloudError(error, 'Falha ao excluir categoria.');
    await refreshCloudCache();
}

export async function createCloudItem(item: Omit<Item, 'id'>) {
    const client = getEasySupabaseClient();
    const { data, error } = await client
        .from('items')
        .insert({
            name: item.name,
            base_price: item.basePrice,
            is_active: item.isActive !== false,
            category_id: item.categoryId ?? null,
        })
        .select('id')
        .single();
    if (error || !data) throwCloudError(error, 'Falha ao criar item.');
    await refreshCloudCache();
    return data.id;
}

export async function updateCloudItem(id: number, changes: Partial<Item>) {
    const update: {
        name?: string;
        base_price?: number;
        is_active?: boolean;
        category_id?: number | null;
    } = {};

    if (changes.name !== undefined) update.name = changes.name;
    if (changes.basePrice !== undefined) update.base_price = changes.basePrice;
    if (changes.isActive !== undefined) update.is_active = changes.isActive;
    if (Object.prototype.hasOwnProperty.call(changes, 'categoryId')) {
        update.category_id = changes.categoryId ?? null;
    }

    const client = getEasySupabaseClient();
    const { error } = await client.from('items').update(update).eq('id', id);
    if (error) throwCloudError(error, 'Falha ao atualizar item.');
    await refreshCloudCache();
}

export async function setCloudItemActive(id: number, isActive: boolean) {
    return updateCloudItem(id, { isActive });
}

export async function deleteCloudItem(id: number) {
    const client = getEasySupabaseClient();
    const { error } = await client.from('items').delete().eq('id', id);
    if (error) throwCloudError(error, 'Falha ao excluir item.');
    await refreshCloudCache();
}

export async function createCloudReseller(reseller: Omit<Reseller, 'id'>) {
    const client = getEasySupabaseClient();
    const { data, error } = await client
        .from('resellers')
        .insert({
            name: reseller.name,
            phone: nullableText(reseller.phone),
            email: nullableText(reseller.email),
            notes: nullableText(reseller.notes),
            is_active: reseller.isActive !== false,
        })
        .select('id')
        .single();
    if (error || !data) throwCloudError(error, 'Falha ao criar revendedor.');
    await refreshCloudCache();
    return data.id;
}

export async function updateCloudReseller(id: number, changes: Partial<Reseller>) {
    const update: {
        name?: string;
        phone?: string | null;
        email?: string | null;
        notes?: string | null;
        is_active?: boolean;
    } = {};

    if (changes.name !== undefined) update.name = changes.name;
    if (Object.prototype.hasOwnProperty.call(changes, 'phone')) update.phone = changes.phone ?? null;
    if (Object.prototype.hasOwnProperty.call(changes, 'email')) update.email = changes.email ?? null;
    if (Object.prototype.hasOwnProperty.call(changes, 'notes')) update.notes = changes.notes ?? null;
    if (changes.isActive !== undefined) update.is_active = changes.isActive;

    const client = getEasySupabaseClient();
    const { error } = await client.from('resellers').update(update).eq('id', id);
    if (error) throwCloudError(error, 'Falha ao atualizar revendedor.');
    await refreshCloudCache();
}

export async function setCloudResellerActive(id: number, isActive: boolean) {
    return updateCloudReseller(id, { isActive });
}

export async function deleteCloudReseller(id: number) {
    const client = getEasySupabaseClient();
    const { error } = await client.from('resellers').delete().eq('id', id);
    if (error) throwCloudError(error, 'Falha ao excluir revendedor.');
    await refreshCloudCache();
}

export async function createCloudTransaction(transaction: CloudNewTransactionInput) {
    const client = getEasySupabaseClient();
    const isOrder = transaction.type === 'order';
    const { data, error } = await client.rpc('create_transaction', {
        p_reseller_id: transaction.resellerId,
        p_type: transaction.type,
        p_occurred_at: (transaction.occurredAt ?? new Date()).toISOString(),
        p_observation: transaction.observation ?? undefined,
        p_item_id: isOrder ? transaction.itemId : undefined,
        p_quantity: isOrder ? transaction.quantity : undefined,
        p_unit_price: isOrder ? transaction.unitPrice : undefined,
        p_total_price: isOrder ? undefined : transaction.totalPrice,
    });
    if (error || data === null) throwCloudError(error, 'Falha ao registrar movimentação.');
    await refreshCloudCache();
    return data;
}

export async function reverseCloudTransaction(id: number, reason: string) {
    let original = await db.transactions.get(id);
    if (!original) {
        await refreshCloudCache();
        original = await db.transactions.get(id);
    }
    if (!original) throw new Error('Lançamento não encontrado.');

    const client = getEasySupabaseClient();
    const { data, error } = await client.rpc('reverse_transaction', {
        p_transaction_id: id,
        p_reason: reason.trim(),
    });
    if (error || data === null) throwCloudError(error, 'Falha ao estornar lançamento.');
    await refreshCloudCache();
    return {
        resellerId: original.resellerId,
        reversal: {
            reason: reason.trim(),
            reversedAt: data,
        },
    };
}

export async function correctCloudTransaction(
    originalId: number,
    reason: string,
    replacement: CloudCorrectionReplacementInput,
) {
    let original = await db.transactions.get(originalId);
    if (!original) {
        await refreshCloudCache();
        original = await db.transactions.get(originalId);
    }
    if (!original) throw new Error('Lançamento não encontrado.');

    const usesExpandedCorrection = replacement.type !== undefined || replacement.occurredAt !== undefined;
    const targetType = replacement.type ?? original.type;
    const targetOccurredAt = replacement.occurredAt ?? transactionOccurredAt(original);
    const targetObservation = usesExpandedCorrection ? replacement.observation : original.observation;
    const targetResellerId = replacement.resellerId;

    const isOrder = targetType === 'order';
    const targetItemId = isOrder
        ? (replacement.itemId ?? (original.type === 'order' ? original.itemId : undefined))
        : undefined;

    const client = getEasySupabaseClient();
    const { data, error } = await client.rpc('correct_transaction', {
        p_original_id: originalId,
        p_reason: reason.trim(),
        p_reseller_id: targetResellerId,
        p_type: targetType,
        p_occurred_at: targetOccurredAt.toISOString(),
        p_observation: targetObservation ?? undefined,
        p_item_id: isOrder ? targetItemId : undefined,
        p_quantity: isOrder ? replacement.quantity : undefined,
        p_unit_price: isOrder ? replacement.unitPrice : undefined,
        p_total_price: isOrder ? undefined : replacement.totalPrice,
    });
    if (error || data === null) throwCloudError(error, 'Falha ao corrigir lançamento.');
    await refreshCloudCache();

    return {
        originalResellerId: original.resellerId,
        replacementResellerId: targetResellerId,
        originalId,
        replacementTransactionId: data,
    };
}

export async function restoreCloudBackup(payload: unknown) {
    const client = getEasySupabaseClient();
    const { data, error } = await client.rpc('restore_easy_backup', {
        p_payload: payload as Json,
    });
    if (error) throwCloudError(error, 'Falha ao restaurar o backup no banco online.');
    await refreshCloudCache();
    return data;
}
