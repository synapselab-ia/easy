import { describe, expect, it } from 'vitest';
import {
    createEasySupabaseClient,
    readEasySupabaseConfig,
    SUPABASE_CONFIG_REQUIRED_ERROR,
} from './supabase';

describe('P10-S3-I1 Supabase client foundation', () => {
    it('stays unconfigured when either public environment value is missing', () => {
        expect(readEasySupabaseConfig({})).toBeNull();
        expect(readEasySupabaseConfig({ VITE_SUPABASE_URL: 'https://example.supabase.co' })).toBeNull();
        expect(readEasySupabaseConfig({ VITE_SUPABASE_PUBLISHABLE_KEY: 'public-test-key' })).toBeNull();
    });

    it('normalizes the public project URL and publishable key', () => {
        expect(readEasySupabaseConfig({
            VITE_SUPABASE_URL: '  https://example.supabase.co  ',
            VITE_SUPABASE_PUBLISHABLE_KEY: '  public-test-key  ',
        })).toEqual({
            url: 'https://example.supabase.co',
            publishableKey: 'public-test-key',
        });
    });

    it('creates a typed browser client without a privileged credential', () => {
        const client = createEasySupabaseClient({
            url: 'https://example.supabase.co',
            publishableKey: 'public-test-key',
        });

        expect(client).toBeDefined();
        expect(client.auth).toBeDefined();
        expect(SUPABASE_CONFIG_REQUIRED_ERROR).toContain('VITE_SUPABASE_PUBLISHABLE_KEY');
    });
});
