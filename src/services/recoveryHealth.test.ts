import { beforeEach, describe, expect, it } from 'vitest';
import {
    RECOVERY_HEALTH_STORAGE_KEY,
    RECOVERY_MAX_AGE_MS,
    RECOVERY_WARNING_AGE_MS,
    RECOVERY_WRITE_BLOCKED_MESSAGE,
    assertRecoveryWriteAllowed,
    confirmSynchronizedFolderSetup,
    getRecoveryHealth,
    recordRecoveryExport,
} from './recoveryHealth';

const BASE_TIME = new Date('2026-08-18T12:00:00.000Z');

beforeEach(() => {
    localStorage.removeItem(RECOVERY_HEALTH_STORAGE_KEY);
});

describe('recovery health', () => {
    it('treats missing metadata as unknown and blocks normal writes', () => {
        expect(getRecoveryHealth(BASE_TIME)).toMatchObject({
            status: 'unknown',
            writeBlocked: true,
            setupVerified: false,
        });
        expect(() => assertRecoveryWriteAllowed(BASE_TIME)).toThrow(RECOVERY_WRITE_BLOCKED_MESSAGE);
    });

    it('records an export but keeps writes blocked until synchronized-folder verification', () => {
        recordRecoveryExport({
            filename: 'easy-backup-v2-test.json',
            exportedAt: BASE_TIME,
        });

        expect(getRecoveryHealth(BASE_TIME)).toMatchObject({
            status: 'due',
            writeBlocked: true,
            setupVerified: false,
            lastFilename: 'easy-backup-v2-test.json',
        });
    });

    it('becomes current after the operator verifies the synchronized copy', () => {
        recordRecoveryExport({
            filename: 'easy-backup-v2-test.json',
            exportedAt: BASE_TIME,
        });
        confirmSynchronizedFolderSetup(BASE_TIME);

        expect(getRecoveryHealth(BASE_TIME)).toMatchObject({
            status: 'current',
            writeBlocked: false,
            setupVerified: true,
            ageMs: 0,
        });
        expect(() => assertRecoveryWriteAllowed(BASE_TIME)).not.toThrow();
    });

    it('warns from 20 hours without changing the accepted 24-hour write boundary', () => {
        recordRecoveryExport({ filename: 'easy-backup-v2-test.json', exportedAt: BASE_TIME });
        confirmSynchronizedFolderSetup(BASE_TIME);

        const warningTime = new Date(BASE_TIME.getTime() + RECOVERY_WARNING_AGE_MS);
        expect(getRecoveryHealth(warningTime)).toMatchObject({
            status: 'warning',
            writeBlocked: false,
            ageMs: RECOVERY_WARNING_AGE_MS,
        });
    });

    it('blocks writes exactly at the 24-hour boundary', () => {
        recordRecoveryExport({ filename: 'easy-backup-v2-test.json', exportedAt: BASE_TIME });
        confirmSynchronizedFolderSetup(BASE_TIME);

        const overdueTime = new Date(BASE_TIME.getTime() + RECOVERY_MAX_AGE_MS);
        expect(getRecoveryHealth(overdueTime)).toMatchObject({
            status: 'overdue',
            writeBlocked: true,
            ageMs: RECOVERY_MAX_AGE_MS,
        });
        expect(() => assertRecoveryWriteAllowed(overdueTime)).toThrow(/Backup & Restore/);
    });

    it('refreshes an overdue installation after a new validated export is initiated', () => {
        recordRecoveryExport({ filename: 'easy-backup-v2-old.json', exportedAt: BASE_TIME });
        confirmSynchronizedFolderSetup(BASE_TIME);
        const overdueTime = new Date(BASE_TIME.getTime() + RECOVERY_MAX_AGE_MS + 1);
        expect(getRecoveryHealth(overdueTime).writeBlocked).toBe(true);

        recordRecoveryExport({ filename: 'easy-backup-v2-new.json', exportedAt: overdueTime });
        expect(getRecoveryHealth(overdueTime)).toMatchObject({
            status: 'current',
            writeBlocked: false,
            setupVerified: true,
            lastFilename: 'easy-backup-v2-new.json',
        });
    });

    it('fails safe when local metadata is corrupted', () => {
        localStorage.setItem(RECOVERY_HEALTH_STORAGE_KEY, '{not-json');
        expect(getRecoveryHealth(BASE_TIME)).toMatchObject({
            status: 'unknown',
            writeBlocked: true,
        });
    });
});
