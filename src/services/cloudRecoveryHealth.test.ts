import { beforeEach, describe, expect, it, vi } from 'vitest';

const rpc = vi.fn();
const insert = vi.fn();
const from = vi.fn(() => ({ insert }));
const getUser = vi.fn();

vi.mock('../lib/supabase', () => ({
    isEasySupabaseConfigured: () => true,
    getEasySupabaseClient: () => ({
        rpc,
        from,
        auth: { getUser },
    }),
}));

import {
    confirmCloudRecoveryCheckpoint,
    recordCloudRecoveryExport,
    refreshCloudRecoveryHealth,
} from './cloudRecoveryHealth';
import { clearCloudRecoveryHealth, getRecoveryHealth } from './recoveryHealth';

beforeEach(() => {
    vi.clearAllMocks();
    clearCloudRecoveryHealth();
    getUser.mockResolvedValue({ data: { user: { id: 'operator-1' } }, error: null });
});

describe('cloudRecoveryHealth', () => {
    it('hydrates the browser guard from the store-global confirmed checkpoint', async () => {
        rpc.mockResolvedValue({
            data: [{
                last_exported_at: '2026-08-25T18:00:00.000Z',
                last_filename: 'easy-backup-v2-global.json',
                confirmed_at: '2026-08-25T18:01:00.000Z',
                pending_export_at: null,
                pending_filename: null,
            }],
            error: null,
        });

        const health = await refreshCloudRecoveryHealth();

        expect(rpc).toHaveBeenCalledWith('get_manual_recovery_health');
        expect(health.setupVerified).toBe(true);
        expect(health.lastFilename).toBe('easy-backup-v2-global.json');
    });

    it('records only an operator export event and then refreshes shared health', async () => {
        insert.mockResolvedValue({ error: null });
        rpc.mockResolvedValue({
            data: [{
                last_exported_at: null,
                last_filename: null,
                confirmed_at: null,
                pending_export_at: '2026-08-25T18:00:00.000Z',
                pending_filename: 'easy-backup-v2-new.json',
            }],
            error: null,
        });

        const health = await recordCloudRecoveryExport('easy-backup-v2-new.json');

        expect(from).toHaveBeenCalledWith('manual_recovery_events');
        expect(insert).toHaveBeenCalledWith({
            event_type: 'export',
            filename: 'easy-backup-v2-new.json',
            actor_user_id: 'operator-1',
        });
        expect(health.writeBlocked).toBe(true);
        expect(health.pendingFilename).toBe('easy-backup-v2-new.json');
    });

    it('records confirmation without browser-supplied timestamps or export ids', async () => {
        insert.mockResolvedValue({ error: null });
        rpc.mockResolvedValue({
            data: [{
                last_exported_at: '2026-08-25T18:00:00.000Z',
                last_filename: 'easy-backup-v2-new.json',
                confirmed_at: '2026-08-25T18:01:00.000Z',
                pending_export_at: null,
                pending_filename: null,
            }],
            error: null,
        });

        await confirmCloudRecoveryCheckpoint();

        expect(insert).toHaveBeenCalledWith({
            event_type: 'confirm',
            actor_user_id: 'operator-1',
        });
    });

    it('fails closed when global health cannot be read', async () => {
        rpc.mockResolvedValue({ data: null, error: { message: 'network down' } });

        await expect(refreshCloudRecoveryHealth()).rejects.toThrow('network down');
        expect(getRecoveryHealth()).toMatchObject({
            status: 'unknown',
            writeBlocked: true,
        });
    });
});
