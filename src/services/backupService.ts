// src/services/backupService.ts
import { db } from '../db/database';
import type { Item } from '../db/database';
import type { Reseller } from '../db/database';
import type { Transaction } from '../db/database';

export interface BackupData {
    version: number;
    exportedAt: string;
    data: {
        items: Item[];
        resellers: Reseller[];
        transactions: Transaction[];
    };
}

/**
 * Export all data from Dexie database to a JSON file and trigger download.
 */
export async function exportData(): Promise<void> {
    const [items, resellers, transactions] = await Promise.all([
        db.items.toArray(),
        db.resellers.toArray(),
        db.transactions.toArray(),
    ]);

    const backup: BackupData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        data: { items, resellers, transactions },
    };

    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.json`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Import data from a JSON backup file, replacing current database content.
 * @param file The JSON file selected by the user.
 */
export async function importData(file: File): Promise<void> {
    const text = await file.text();
    let parsed: any;
    try {
        parsed = JSON.parse(text);
    } catch (e) {
        throw new Error('Invalid JSON file');
    }

    // Basic validation
    if (!parsed?.data || typeof parsed.data !== 'object') {
        throw new Error('Invalid backup file structure');
    }

    const { items, resellers, transactions } = parsed.data;

    if (!Array.isArray(items) || !Array.isArray(resellers) || !Array.isArray(transactions)) {
        throw new Error('Backup file missing required data arrays');
    }

    // Validation and Date conversion
    const processedItems = items.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
    }));

    const processedResellers = resellers.map((reseller: any) => ({
        ...reseller,
        createdAt: new Date(reseller.createdAt),
        updatedAt: new Date(reseller.updatedAt),
    }));

    const processedTransactions = transactions.map((tx: any) => {
        const createdAt = new Date(tx.createdAt);
        return {
            ...tx,
            createdAt,
            occurredAt: new Date(tx.occurredAt ?? tx.createdAt),
        };
    });

    // Replace database content inside a transaction for atomicity
    await db.transaction('rw', [db.items, db.resellers, db.transactions], async () => {
        await Promise.all([
            db.items.clear(),
            db.resellers.clear(),
            db.transactions.clear(),
        ]);
        await Promise.all([
            db.items.bulkAdd(processedItems),
            db.resellers.bulkAdd(processedResellers),
            db.transactions.bulkAdd(processedTransactions),
        ]);
    });
}
