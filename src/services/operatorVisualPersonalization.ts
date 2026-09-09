import { getEasySupabaseClient, isEasySupabaseConfigured } from '@/lib/supabase'

export type OperatorVisualMode = 'corner' | 'watermark'
export type OperatorVisualIntensity = 'subtle' | 'soft'

export interface OperatorVisualPreference {
    allowed: boolean
    enabled: boolean
    mode: OperatorVisualMode
    intensity: OperatorVisualIntensity
}

export interface OperatorVisualPreferenceUpdate {
    enabled: boolean
    mode: OperatorVisualMode
    intensity: OperatorVisualIntensity
}

export const DEFAULT_OPERATOR_VISUAL_PREFERENCE: OperatorVisualPreference = {
    allowed: false,
    enabled: false,
    mode: 'corner',
    intensity: 'subtle',
}

interface OperatorVisualPreferenceRow {
    visual_personalization_allowed: boolean
    visual_personalization_enabled: boolean
    visual_personalization_mode: string
    visual_personalization_intensity: string
}

function normalizeMode(value: string): OperatorVisualMode {
    return value === 'watermark' ? 'watermark' : 'corner'
}

function normalizeIntensity(value: string): OperatorVisualIntensity {
    return value === 'soft' ? 'soft' : 'subtle'
}

export function normalizeOperatorVisualPreference(
    row: OperatorVisualPreferenceRow | null | undefined,
): OperatorVisualPreference {
    if (!row) return DEFAULT_OPERATOR_VISUAL_PREFERENCE

    return {
        allowed: row.visual_personalization_allowed === true,
        enabled:
            row.visual_personalization_allowed === true
            && row.visual_personalization_enabled === true,
        mode: normalizeMode(row.visual_personalization_mode),
        intensity: normalizeIntensity(row.visual_personalization_intensity),
    }
}

async function getAuthenticatedOperatorId() {
    const client = getEasySupabaseClient()
    const { data, error } = await client.auth.getSession()

    if (error) {
        throw new Error('Não foi possível carregar a preferência visual desta conta.')
    }

    if (!data.session?.user.id) {
        throw new Error('Sessão autenticada não encontrada para salvar a preferência visual.')
    }

    return data.session.user.id
}

export async function fetchOperatorVisualPreference(): Promise<OperatorVisualPreference> {
    if (!isEasySupabaseConfigured()) {
        return DEFAULT_OPERATOR_VISUAL_PREFERENCE
    }

    const userId = await getAuthenticatedOperatorId()
    const client = getEasySupabaseClient()
    const { data, error } = await client
        .from('easy_operators')
        .select(
            'visual_personalization_allowed, visual_personalization_enabled, visual_personalization_mode, visual_personalization_intensity',
        )
        .eq('user_id', userId)
        .maybeSingle()

    if (error) {
        throw new Error('Não foi possível carregar a preferência visual desta conta.')
    }

    return normalizeOperatorVisualPreference(data)
}

export async function saveOperatorVisualPreference(
    preference: OperatorVisualPreferenceUpdate,
): Promise<OperatorVisualPreference> {
    if (!isEasySupabaseConfigured()) {
        return DEFAULT_OPERATOR_VISUAL_PREFERENCE
    }

    const userId = await getAuthenticatedOperatorId()
    const client = getEasySupabaseClient()
    const { data, error } = await client
        .from('easy_operators')
        .update({
            visual_personalization_enabled: preference.enabled,
            visual_personalization_mode: preference.mode,
            visual_personalization_intensity: preference.intensity,
        })
        .eq('user_id', userId)
        .eq('visual_personalization_allowed', true)
        .select(
            'visual_personalization_allowed, visual_personalization_enabled, visual_personalization_mode, visual_personalization_intensity',
        )
        .maybeSingle()

    if (error) {
        throw new Error('Não foi possível salvar a preferência visual desta conta.')
    }

    if (!data) {
        throw new Error('A personalização visual não está habilitada para esta conta.')
    }

    return normalizeOperatorVisualPreference(data)
}
