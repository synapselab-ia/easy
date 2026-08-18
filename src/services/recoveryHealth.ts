export const RECOVERY_HEALTH_STORAGE_KEY = 'easy.recoveryHealth.v1';
export const RECOVERY_MAX_AGE_MS = 24 * 60 * 60 * 1000;
export const RECOVERY_WARNING_AGE_MS = 20 * 60 * 60 * 1000;

export const RECOVERY_WRITE_BLOCKED_MESSAGE =
    'Cópia de recuperação ausente ou vencida. Vá para Backup & Restore, gere um novo backup e mantenha a cópia em uma pasta sincronizada.';

export type RecoveryHealthStatus = 'unknown' | 'due' | 'current' | 'warning' | 'overdue';

export interface RecoveryHealthMetadata {
    version: 1;
    setupVerifiedAt?: string;
    lastExportedAt?: string;
    lastFilename?: string;
}

export interface RecoveryHealthSnapshot {
    status: RecoveryHealthStatus;
    writeBlocked: boolean;
    setupVerified: boolean;
    lastExportedAt?: Date;
    lastFilename?: string;
    ageMs?: number;
}

const listeners = new Set<() => void>();

function notifyListeners() {
    listeners.forEach(listener => listener());
}

function storageAvailable() {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function parseDate(value: unknown): Date | undefined {
    if (typeof value !== 'string') return undefined;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

function readMetadata(): RecoveryHealthMetadata | null {
    if (!storageAvailable()) return null;

    const raw = window.localStorage.getItem(RECOVERY_HEALTH_STORAGE_KEY);
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw) as Partial<RecoveryHealthMetadata>;
        if (parsed.version !== 1) return null;
        if (parsed.setupVerifiedAt !== undefined && !parseDate(parsed.setupVerifiedAt)) return null;
        if (parsed.lastExportedAt !== undefined && !parseDate(parsed.lastExportedAt)) return null;
        if (parsed.lastFilename !== undefined && typeof parsed.lastFilename !== 'string') return null;
        return parsed as RecoveryHealthMetadata;
    } catch {
        return null;
    }
}

function writeMetadata(metadata: RecoveryHealthMetadata) {
    if (!storageAvailable()) return;
    window.localStorage.setItem(RECOVERY_HEALTH_STORAGE_KEY, JSON.stringify(metadata));
    notifyListeners();
}

export function getRecoveryHealth(now = new Date()): RecoveryHealthSnapshot {
    const metadata = readMetadata();
    if (!metadata) {
        return {
            status: 'unknown',
            writeBlocked: true,
            setupVerified: false,
        };
    }

    const lastExportedAt = parseDate(metadata.lastExportedAt);
    const setupVerified = Boolean(parseDate(metadata.setupVerifiedAt));

    if (!setupVerified) {
        return {
            status: lastExportedAt ? 'due' : 'unknown',
            writeBlocked: true,
            setupVerified: false,
            lastExportedAt,
            lastFilename: metadata.lastFilename,
        };
    }

    if (!lastExportedAt) {
        return {
            status: 'due',
            writeBlocked: true,
            setupVerified: true,
            lastFilename: metadata.lastFilename,
        };
    }

    const ageMs = now.getTime() - lastExportedAt.getTime();
    if (ageMs < 0) {
        return {
            status: 'due',
            writeBlocked: true,
            setupVerified: true,
            lastExportedAt,
            lastFilename: metadata.lastFilename,
            ageMs,
        };
    }

    if (ageMs >= RECOVERY_MAX_AGE_MS) {
        return {
            status: 'overdue',
            writeBlocked: true,
            setupVerified: true,
            lastExportedAt,
            lastFilename: metadata.lastFilename,
            ageMs,
        };
    }

    if (ageMs >= RECOVERY_WARNING_AGE_MS) {
        return {
            status: 'warning',
            writeBlocked: false,
            setupVerified: true,
            lastExportedAt,
            lastFilename: metadata.lastFilename,
            ageMs,
        };
    }

    return {
        status: 'current',
        writeBlocked: false,
        setupVerified: true,
        lastExportedAt,
        lastFilename: metadata.lastFilename,
        ageMs,
    };
}

export function recordRecoveryExport(result: { filename: string; exportedAt: Date }) {
    const current = readMetadata();
    writeMetadata({
        version: 1,
        ...(current?.setupVerifiedAt ? { setupVerifiedAt: current.setupVerifiedAt } : {}),
        lastExportedAt: result.exportedAt.toISOString(),
        lastFilename: result.filename,
    });
}

export function confirmSynchronizedFolderSetup(now = new Date()) {
    const current = readMetadata();
    if (!current?.lastExportedAt || !parseDate(current.lastExportedAt)) {
        throw new Error('Exporte um backup antes de confirmar a verificação da pasta sincronizada.');
    }

    writeMetadata({
        ...current,
        version: 1,
        setupVerifiedAt: now.toISOString(),
    });
}

export function assertRecoveryWriteAllowed(now = new Date()) {
    if (getRecoveryHealth(now).writeBlocked) {
        throw new Error(RECOVERY_WRITE_BLOCKED_MESSAGE);
    }
}

export function subscribeRecoveryHealth(listener: () => void) {
    listeners.add(listener);

    const handleStorage = (event: StorageEvent) => {
        if (event.key === RECOVERY_HEALTH_STORAGE_KEY) listener();
    };
    if (typeof window !== 'undefined') window.addEventListener('storage', handleStorage);

    return () => {
        listeners.delete(listener);
        if (typeof window !== 'undefined') window.removeEventListener('storage', handleStorage);
    };
}
