import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../lib/supabase', () => ({
    isEasySupabaseConfigured: () => true,
}));

import {
    RECOVERY_MAX_AGE_MS,
    RECOVERY_WARNING_AGE_MS,
    assertRecoveryWriteAllowed,
    clearCloudRecoveryHealth,
    getRecoveryHealth,
    setCloudRecoveryHealth,
} from './recoveryHealth';

const BASE_TIME = new Date('2026-08-25T18:00:00.000Z');

beforeEach(() => {
    clearCloudRecoveryHealth();
});

describe('D-031 store-global manual recovery health', () => {
    it('fails closed before the first server checkpoint is loaded', () => {
        expect(getRecoveryHealth(BASE_TIME)).toMatchObject({
            status: 'unknown',
            writeBlocked: true,
            setupVerified: false,
        });
        expect(() => assertRecoveryWriteAllowed(BASE_TIME)).toThrow(/Backup & Restore/);
    });

    it('keeps writes blocked while an export awaits explicit confirmation', () => {
        setCloudRecoveryHealth({
            pendingExportAt: BASE_TIME.toISOString(),
            pendingFilename: 'easy-backup-v2-pending.json',
        });

        expect(getRecoveryHealth(BASE_TIME)).toMatchObject({
            status: 'due',
            writeBlocked: true,
            setupVerified: false,
            pendingFilename: 'easy-backup-v2-pending.json',
        });
    });

    it('uses one confirmed checkpoint for the shared 24-hour window', () => {
        setCloudRecoveryHealth({
            lastExportedAt: BASE_TIME.toISOString(),
            lastFilename: 'easy-backup-v2-global.json',
            confirmedAt: new Date(BASE_TIME.getTime() + 30_000).toISOString(),
        });

        expect(getRecoveryHealth(BASE_TIME)).toMatchObject({
            status: 'current',
            writeBlocked: false,
            setupVerified: true,
            lastFilename: 'easy-backup-v2-global.json',
            ageMs: 0,
        });
        expect(() => assertRecoveryWriteAllowed(BASE_TIME)).not.toThrow();
    });

    it('warns at 20 hours and blocks at the exact 24-hour boundary', () => {
        setCloudRecoveryHealth({
            lastExportedAt: BASE_TIME.toISOString(),
            confirmedAt: BASE_TIME.toISOString(),
        });

        expect(getRecoveryHealth(new Date(BASE_TIME.getTime() + RECOVERY_WARNING_AGE_MS))).toMatchObject({
            status: 'warning',
            writeBlocked: false,
        });

        const exactBoundary = new Date(BASE_TIME.getTime() + RECOVERY_MAX_AGE_MS);
        expect(getRecoveryHealth(exactBoundary)).toMatchObject({
            status: 'overdue',
            writeBlocked: true,
            ageMs: RECOVERY_MAX_AGE_MS,
        });
        expect(() => assertRecoveryWriteAllowed(exactBoundary)).toThrow(/Backup & Restore/);
    });

    it('keeps an existing fresh checkpoint active while a newer export is pending confirmation', () => {
        setCloudRecoveryHealth({
            lastExportedAt: BASE_TIME.toISOString(),
            confirmedAt: BASE_TIME.toISOString(),
            pendingExportAt: new Date(BASE_TIME.getTime() + 60_000).toISOString(),
            pendingFilename: 'easy-backup-v2-new.json',
        });

        expect(getRecoveryHealth(new Date(BASE_TIME.getTime() + 60_000))).toMatchObject({
            status: 'current',
            writeBlocked: false,
            setupVerified: true,
            pendingFilename: 'easy-backup-v2-new.json',
        });
    });
});
