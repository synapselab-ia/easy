import { getEasySupabaseClient, isEasySupabaseConfigured } from '@/lib/supabase'

export type OperatorVisualMode = 'corner' | 'watermark'
export type OperatorVisualIntensity = 'subtle' | 'soft'

export interface OperatorVisualPreference {
    allowed: boolean
    enabled: boolean
    mode: OperatorVisualMode
    intensity: OperatorVisualIntensity
    imageUrl?: string
    hasCustomImage?: boolean
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

export const OPERATOR_VISUAL_IMAGE_BUCKET = 'operator-visual-personalization'
export const OPERATOR_VISUAL_IMAGE_MAX_BYTES = 5 * 1024 * 1024
export const OPERATOR_VISUAL_IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp'

const OPERATOR_VISUAL_IMAGE_NAME = 'decoration'
const OPERATOR_VISUAL_IMAGE_SIGNED_URL_SECONDS = 7 * 24 * 60 * 60
const OPERATOR_VISUAL_IMAGE_TYPES = new Set([
    'image/png',
    'image/jpeg',
    'image/webp',
])

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

export function getOperatorVisualImagePath(userId: string) {
    return `${userId}/${OPERATOR_VISUAL_IMAGE_NAME}`
}

export function validateOperatorVisualImage(file: Pick<File, 'type' | 'size'>) {
    if (!OPERATOR_VISUAL_IMAGE_TYPES.has(file.type)) {
        throw new Error('Escolha uma imagem PNG, JPG ou WebP.')
    }

    if (file.size <= 0 || file.size > OPERATOR_VISUAL_IMAGE_MAX_BYTES) {
        throw new Error('A imagem deve ter no máximo 5 MB.')
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

async function createOperatorVisualImageSignedUrl(userId: string) {
    const client = getEasySupabaseClient()
    const { data, error } = await client.storage
        .from(OPERATOR_VISUAL_IMAGE_BUCKET)
        .createSignedUrl(
            getOperatorVisualImagePath(userId),
            OPERATOR_VISUAL_IMAGE_SIGNED_URL_SECONDS,
        )

    if (error || !data?.signedUrl) {
        throw new Error('Não foi possível carregar a imagem personalizada desta conta.')
    }

    return data.signedUrl
}

async function fetchOperatorVisualImageUrl(userId: string) {
    const client = getEasySupabaseClient()
    const { data, error } = await client.storage
        .from(OPERATOR_VISUAL_IMAGE_BUCKET)
        .list(userId, {
            limit: 10,
            search: OPERATOR_VISUAL_IMAGE_NAME,
        })

    if (error) {
        throw new Error('Não foi possível verificar a imagem personalizada desta conta.')
    }

    const exists = data?.some(object => object.name === OPERATOR_VISUAL_IMAGE_NAME) === true
    if (!exists) return undefined

    return createOperatorVisualImageSignedUrl(userId)
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

    const preference = normalizeOperatorVisualPreference(data)
    if (!preference.allowed) return preference

    try {
        const imageUrl = await fetchOperatorVisualImageUrl(userId)
        return {
            ...preference,
            imageUrl,
            hasCustomImage: Boolean(imageUrl),
        }
    } catch {
        return {
            ...preference,
            hasCustomImage: false,
        }
    }
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

export async function uploadOperatorVisualImage(file: File): Promise<string> {
    if (!isEasySupabaseConfigured()) {
        throw new Error('A imagem personalizada só está disponível no Easy conectado.')
    }

    validateOperatorVisualImage(file)

    const userId = await getAuthenticatedOperatorId()
    const client = getEasySupabaseClient()
    const { error } = await client.storage
        .from(OPERATOR_VISUAL_IMAGE_BUCKET)
        .upload(getOperatorVisualImagePath(userId), file, {
            upsert: true,
            contentType: file.type,
            cacheControl: '3600',
        })

    if (error) {
        throw new Error('Não foi possível salvar esta imagem na sua conta.')
    }

    return createOperatorVisualImageSignedUrl(userId)
}

export async function removeOperatorVisualImage(): Promise<void> {
    if (!isEasySupabaseConfigured()) return

    const userId = await getAuthenticatedOperatorId()
    const client = getEasySupabaseClient()
    const { error } = await client.storage
        .from(OPERATOR_VISUAL_IMAGE_BUCKET)
        .remove([getOperatorVisualImagePath(userId)])

    if (error) {
        throw new Error('Não foi possível remover a imagem personalizada desta conta.')
    }
}