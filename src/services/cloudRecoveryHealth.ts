import { getEasySupabaseClient } from '../lib/supabase';
import {
    clearCloudRecoveryHealth,
    getRecoveryHealth,
    setCloudRecoveryHealth,
    type CloudRecoveryHealthMetadata,
    type RecoveryHealthSnapshot,
} from './recoveryHealth';

interface ManualRecoveryHealthRow {
    last_exported_at: string | null;
    last_filename: string | null;
    confirmed_at: string | null;
    pending_export_at: string | null;
    pending_filename: string | null;
}

function toMetadata(row?: ManualRecoveryHealthRow | null): CloudRecoveryHealthMetadata {
    if (!row) return {};

    return {
        ...(row.last_exported_at ? { lastExportedAt: row.last_exported_at } : {}),
        ...(row.last_filename ? { lastFilename: row.last_filename } : {}),
        ...(row.confirmed_at ? { confirmedAt: row.confirmed_at } : {}),
        ...(row.pending_export_at ? { pendingExportAt: row.pending_export_at } : {}),
        ...(row.pending_filename ? { pendingFilename: row.pending_filename } : {}),
    };
}

async function currentUserId() {
    const client = getEasySupabaseClient();
    const { data, error } = await client.auth.getUser();
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Sessão do operador não encontrada. Entre novamente no Easy.');
    return data.user.id;
}

export async function refreshCloudRecoveryHealth(): Promise<RecoveryHealthSnapshot> {
    const client = getEasySupabaseClient();
    const { data, error } = await client.rpc('get_manual_recovery_health');

    if (error) {
        clearCloudRecoveryHealth();
        throw new Error(error.message);
    }

    const row = Array.isArray(data) ? data[0] as ManualRecoveryHealthRow | undefined : undefined;
    setCloudRecoveryHealth(toMetadata(row));
    return getRecoveryHealth();
}

export async function recordCloudRecoveryExport(filename: string) {
    const normalizedFilename = filename.trim();
    if (!normalizedFilename) throw new Error('Nome do arquivo de backup inválido.');

    const actorUserId = await currentUserId();
    const { error } = await getEasySupabaseClient()
        .from('manual_recovery_events')
        .insert({
            event_type: 'export',
            filename: normalizedFilename,
            actor_user_id: actorUserId,
        });

    if (error) {
        clearCloudRecoveryHealth();
        throw new Error(error.message);
    }

    return refreshCloudRecoveryHealth();
}

export async function confirmCloudRecoveryCheckpoint() {
    const actorUserId = await currentUserId();
    const { error } = await getEasySupabaseClient()
        .from('manual_recovery_events')
        .insert({
            event_type: 'confirm',
            actor_user_id: actorUserId,
        });

    if (error) {
        clearCloudRecoveryHealth();
        throw new Error(error.message);
    }

    return refreshCloudRecoveryHealth();
}
