import { getEasySupabaseClient, isEasySupabaseConfigured } from '@/lib/supabase'

export type OperatorVisualPosition =
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'center-left'
    | 'center'
    | 'center-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
export type OperatorVisualSize = 'small' | 'medium' | 'large'
export type OperatorVisualLayer = 'behind' | 'over'

export interface OperatorVisualPreference {
    allowed: boolean
    enabled: boolean
    position: OperatorVisualPosition
    size: OperatorVisualSize
    opacity: number
    layer: OperatorVisualLayer
    imageUrl?: string
    hasCustomImage?: boolean
}

export interface OperatorVisualPreferenceUpdate {
    enabled: boolean
    position: OperatorVisualPosition
    size: OperatorVisualSize
    opacity: number
    layer: OperatorVisualLayer
}

export const DEFAULT_OPERATOR_VISUAL_PREFERENCE: OperatorVisualPreference = {
    allowed: false,
    enabled: false,
    position: 'bottom-right',
    size: 'medium',
    opacity: 20,
    layer: 'behind',
}

export const OPERATOR_VISUAL_IMAGE_BUCKET = 'operator-visual-personalization'
export const OPERATOR_VISUAL_IMAGE_MAX_BYTES = 5 * 1024 * 1024
export const OPERATOR_VISUAL_IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp'
export const OPERATOR_VISUAL_OPACITY_MIN = 5
export const OPERATOR_VISUAL_OPACITY_MAX = 50
export const OPERATOR_VISUAL_OPACITY_STEP = 5

const OPERATOR_VISUAL_IMAGE_NAME = 'decoration'
const OPERATOR_VISUAL_IMAGE_SIGNED_URL_SECONDS = 7 * 24 * 60 * 60
const OPERATOR_VISUAL_IMAGE_TYPES = new Set([
    'image/png',
    'image/jpeg',
    'image/webp',
])
const OPERATOR_VISUAL_POSITIONS = new Set<OperatorVisualPosition>([
    'top-left',
    'top-center',
    'top-right',
    'center-left',
    'center',
    'center-right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
])
const OPERATOR_VISUAL_SIZES = new Set<OperatorVisualSize>(['small', 'medium', 'large'])

interface OperatorVisualPreferenceRow {
    visual_personalization_allowed: boolean
    visual_personalization_enabled: boolean
    visual_personalization_position: string
    visual_personalization_size: string
    visual_personalization_opacity: number
    visual_personalization_layer: string
}

function normalizePosition(value: string): OperatorVisualPosition {
    return OPERATOR_VISUAL_POSITIONS.has(value as OperatorVisualPosition)
        ? value as OperatorVisualPosition
        : 'bottom-right'
}

function normalizeSize(value: string): OperatorVisualSize {
    return OPERATOR_VISUAL_SIZES.has(value as OperatorVisualSize)
        ? value as OperatorVisualSize
        : 'medium'
}

function normalizeOpacity(value: number): number {
    if (!Number.isFinite(value)) return DEFAULT_OPERATOR_VISUAL_PREFERENCE.opacity

    const stepped = Math.round(value / OPERATOR_VISUAL_OPACITY_STEP)
        * OPERATOR_VISUAL_OPACITY_STEP
    return Math.min(
        OPERATOR_VISUAL_OPACITY_MAX,
        Math.max(OPERATOR_VISUAL_OPACITY_MIN, stepped),
    )
}

function normalizeLayer(value: string): OperatorVisualLayer {
    return value === 'over' ? 'over' : 'behind'
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
        position: normalizePosition(row.visual_personalization_position),
        size: normalizeSize(row.visual_personalization_size),
        opacity: normalizeOpacity(row.visual_personalization_opacity),
        layer: normalizeLayer(row.visual_personalization_layer),
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

const OPERATOR_VISUAL_PREFERENCE_COLUMNS = [
    'visual_personalization_allowed',
    'visual_personalization_enabled',
    'visual_personalization_position',
    'visual_personalization_size',
    'visual_personalization_opacity',
    'visual_personalization_layer',
].join(', ')

export async function fetchOperatorVisualPreference(): Promise<OperatorVisualPreference> {
    if (!isEasySupabaseConfigured()) {
        return DEFAULT_OPERATOR_VISUAL_PREFERENCE
    }

    const userId = await getAuthenticatedOperatorId()
    const client = getEasySupabaseClient()
    const { data, error } = await client
        .from('easy_operators')
        .select(OPERATOR_VISUAL_PREFERENCE_COLUMNS)
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
            visual_personalization_position: normalizePosition(preference.position),
            visual_personalization_size: normalizeSize(preference.size),
            visual_personalization_opacity: normalizeOpacity(preference.opacity),
            visual_personalization_layer: normalizeLayer(preference.layer),
        })
        .eq('user_id', userId)
        .eq('visual_personalization_allowed', true)
        .select(OPERATOR_VISUAL_PREFERENCE_COLUMNS)
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
