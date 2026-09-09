import { describe, expect, it } from 'vitest'
import {
    DEFAULT_OPERATOR_VISUAL_PREFERENCE,
    OPERATOR_VISUAL_IMAGE_MAX_BYTES,
    getOperatorVisualImagePath,
    normalizeOperatorVisualPreference,
    validateOperatorVisualImage,
} from './operatorVisualPersonalization'

describe('operator visual personalization preference', () => {
    it('fails closed when no operator preference exists', () => {
        expect(normalizeOperatorVisualPreference(null)).toEqual(DEFAULT_OPERATOR_VISUAL_PREFERENCE)
    })

    it('does not enable decoration when the operator is not eligible', () => {
        expect(normalizeOperatorVisualPreference({
            visual_personalization_allowed: false,
            visual_personalization_enabled: true,
            visual_personalization_mode: 'watermark',
            visual_personalization_intensity: 'soft',
        })).toEqual({
            allowed: false,
            enabled: false,
            mode: 'watermark',
            intensity: 'soft',
        })
    })

    it('normalizes unexpected presentation values to safe bounded defaults', () => {
        expect(normalizeOperatorVisualPreference({
            visual_personalization_allowed: true,
            visual_personalization_enabled: true,
            visual_personalization_mode: 'floating',
            visual_personalization_intensity: 'opaque',
        })).toEqual({
            allowed: true,
            enabled: true,
            mode: 'corner',
            intensity: 'subtle',
        })
    })

    it('uses one deterministic storage object per authenticated operator', () => {
        expect(getOperatorVisualImagePath('operator-123')).toBe('operator-123/decoration')
    })

    it('accepts only bounded PNG, JPEG and WebP images up to 5 MB', () => {
        expect(() => validateOperatorVisualImage({
            type: 'image/png',
            size: OPERATOR_VISUAL_IMAGE_MAX_BYTES,
        })).not.toThrow()

        expect(() => validateOperatorVisualImage({
            type: 'image/gif',
            size: 1024,
        })).toThrow('Escolha uma imagem PNG, JPG ou WebP.')

        expect(() => validateOperatorVisualImage({
            type: 'image/jpeg',
            size: OPERATOR_VISUAL_IMAGE_MAX_BYTES + 1,
        })).toThrow('A imagem deve ter no máximo 5 MB.')
    })
})