import { describe, expect, it } from 'vitest'
import {
    DEFAULT_OPERATOR_VISUAL_PREFERENCE,
    normalizeOperatorVisualPreference,
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
})
