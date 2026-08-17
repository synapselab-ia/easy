import { useLiveQuery } from 'dexie-react-hooks';
import { db, isItemActive, isResellerActive, type Reseller } from '../db/database';

export interface SearchResult {
    id: number;
    title: string;
    subtitle?: string;
    type: 'reseller' | 'item';
    isActive?: boolean;
}

export interface SearchHookResult {
    results: SearchResult[];
    recent: SearchResult[];
    isLoading: boolean;
}

export function useSearch(query: string): SearchHookResult {
    const formattedQuery = query.trim().toLowerCase();

    const results = useLiveQuery(async () => {
        if (!formattedQuery) return [];

        // 1. Search Resellers (using startsWith case-insensitively via filter if necessary)
        // For performance, we'll try to use startsWith if possible, but for case-insensitivity
        // with small datasets, filter is safer.
        const foundResellers = await db.resellers
            .filter(r => r.name.toLowerCase().startsWith(formattedQuery))
            .limit(5)
            .toArray();

        // 2. Search Items, including inactive catalog identities for traceability.
        const foundItems = await db.items
            .filter(i => i.name.toLowerCase().startsWith(formattedQuery))
            .limit(5)
            .toArray();

        // 3. Calculate balances and format results
        const resellerResults: SearchResult[] = await Promise.all(
            foundResellers.map(async (r) => {
                const transactions = await db.transactions
                    .where('resellerId')
                    .equals(r.id!)
                    .toArray();

                let balance = 0;
                for (const t of transactions) {
                    if (t.type === 'order') balance += t.totalPrice;
                    else balance -= t.totalPrice;
                }

                return {
                    id: r.id!,
                    title: r.name,
                    subtitle: `Saldo: R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                    type: 'reseller',
                    isActive: isResellerActive(r),
                };
            })
        );

        const itemResults: SearchResult[] = foundItems.map((item) => ({
            id: item.id!,
            title: item.name,
            subtitle: `R$ ${item.basePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            type: 'item',
            isActive: isItemActive(item),
        }));

        return [...resellerResults, ...itemResults];
    }, [formattedQuery]);

    const recent = useLiveQuery(async () => {
        // 1. Get recent resellers from localStorage
        const recentResellerIds: number[] = JSON.parse(localStorage.getItem('recent_resellers') || '[]');

        // Fetch these resellers from Dexie
        const foundResellers = await Promise.all(
            recentResellerIds.map(id => db.resellers.get(id))
        );
        const validResellers = foundResellers.filter((r): r is Reseller => !!r);

        // 2. Get 2 most recent items from Dexie (by id desc), including inactive identities.
        const recentItems = await db.items
            .orderBy('id')
            .reverse()
            .limit(2)
            .toArray();

        // 3. Calculate balances and format results
        const resellerResults: SearchResult[] = await Promise.all(
            validResellers.map(async (r) => {
                const transactions = await db.transactions
                    .where('resellerId')
                    .equals(r.id!)
                    .toArray();

                let balance = 0;
                for (const t of transactions) {
                    if (t.type === 'order') balance += t.totalPrice;
                    else balance -= t.totalPrice;
                }

                return {
                    id: r.id!,
                    title: r.name,
                    subtitle: `Saldo: R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                    type: 'reseller',
                    isActive: isResellerActive(r),
                };
            })
        );

        const itemResults: SearchResult[] = recentItems.map((item) => ({
            id: item.id!,
            title: item.name,
            subtitle: `R$ ${item.basePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            type: 'item',
            isActive: isItemActive(item),
        }));

        return [...resellerResults, ...itemResults];
    }, []);

    return {
        results: results || [],
        recent: recent || [],
        isLoading: results === undefined || recent === undefined,
    };
}

export function addToRecentResellers(resellerId: number) {
    const recent = JSON.parse(localStorage.getItem('recent_resellers') || '[]');
    const updated = [resellerId, ...recent.filter((id: number) => id !== resellerId)].slice(0, 3);
    localStorage.setItem('recent_resellers', JSON.stringify(updated));
}
