import * as React from 'react'
import {
    DEFAULT_OPERATOR_VISUAL_PREFERENCE,
    fetchOperatorVisualPreference,
    saveOperatorVisualPreference,
    type OperatorVisualPreference,
    type OperatorVisualPreferenceUpdate,
} from '@/services/operatorVisualPersonalization'

export function useOperatorVisualPersonalization() {
    const [preference, setPreference] = React.useState<OperatorVisualPreference>(
        DEFAULT_OPERATOR_VISUAL_PREFERENCE,
    )
    const [isLoading, setIsLoading] = React.useState(true)
    const [isSaving, setIsSaving] = React.useState(false)
    const [error, setError] = React.useState<string>()

    React.useEffect(() => {
        let active = true

        void fetchOperatorVisualPreference()
            .then(nextPreference => {
                if (!active) return
                setPreference(nextPreference)
                setError(undefined)
            })
            .catch(loadError => {
                if (!active) return
                setPreference(DEFAULT_OPERATOR_VISUAL_PREFERENCE)
                setError(
                    loadError instanceof Error
                        ? loadError.message
                        : 'Não foi possível carregar a preferência visual desta conta.',
                )
            })
            .finally(() => {
                if (active) setIsLoading(false)
            })

        return () => {
            active = false
        }
    }, [])

    const savePreference = React.useCallback(async (next: OperatorVisualPreferenceUpdate) => {
        setIsSaving(true)
        setError(undefined)

        try {
            const saved = await saveOperatorVisualPreference(next)
            setPreference(saved)
        } catch (saveError) {
            const message = saveError instanceof Error
                ? saveError.message
                : 'Não foi possível salvar a preferência visual desta conta.'
            setError(message)
            throw saveError
        } finally {
            setIsSaving(false)
        }
    }, [])

    return {
        preference,
        isLoading,
        isSaving,
        error,
        savePreference,
    }
}
