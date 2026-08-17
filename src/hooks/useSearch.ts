import { useLiveQuery } from 'dexie-react-hooks';
import { db, isItemActive, isResellerActive, type Reseller } from '../db/database';
import { calculateBalance } from '../domain/transactions';

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

        const foundResellers = await db.resellers
            .filter(r => r.name.toLowerCase().startsWith(formattedQuery))
            .limit(5)
            .toArray();

        const foundItems = await db.items
            .filter(i => i.name.toLowerCase().startsWith(formattedQuery))
            .limit(5)
            .toArray();

        const resellerResults: SearchResult[] = await Promise.all(
            foundResellers.map(async (r) => {
                const transactions = await db.transactions
                    .where('resellerId')
                    .equals(r.id!)
                    .toArray();

                const balance = calculateBalance(transactions);

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
        const recentResellerIds: number[] = JSON.parse(localStorage.getItem('recent_resellers') || '[]');

        const foundResellers = await Promise.all(
            recentResellerIds.map(id => db.resellers.get(id))
        );
        const validResellers = foundResellers.filter((r): r is Reseller => !!r);

        const recentItems = await db.items
            .orderBy('id')
            .reverse()
            .limit(2)
            .toArray();

        const resellerResults: SearchResult[] = await Promise.all(
            validResellers.map(async (r) => {
                const transactions = await db.transactions
                    .where('resellerId')
                    .equals(r.id!)
                    .toArray();

                const balance = calculateBalance(transactions);

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
