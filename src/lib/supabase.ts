import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export const SUPABASE_CONFIG_REQUIRED_ERROR =
    'Supabase não está configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.';

export interface EasySupabaseEnv {
    VITE_SUPABASE_URL?: string;
    VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}

export interface EasySupabaseConfig {
    url: string;
    publishableKey: string;
}

export function readEasySupabaseConfig(
    env: EasySupabaseEnv = {
        VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
        VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
): EasySupabaseConfig | null {
    const url = env.VITE_SUPABASE_URL?.trim();
    const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

    if (!url || !publishableKey) {
        return null;
    }

    return { url, publishableKey };
}

export function createEasySupabaseClient(
    config: EasySupabaseConfig,
): SupabaseClient<Database> {
    return createClient<Database>(config.url, config.publishableKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
    });
}

let cachedClient: SupabaseClient<Database> | null = null;

export function getEasySupabaseClient(): SupabaseClient<Database> {
    if (cachedClient) {
        return cachedClient;
    }

    const config = readEasySupabaseConfig();
    if (!config) {
        throw new Error(SUPABASE_CONFIG_REQUIRED_ERROR);
    }

    cachedClient = createEasySupabaseClient(config);
    return cachedClient;
}

export function isEasySupabaseConfigured() {
    return readEasySupabaseConfig() !== null;
}
