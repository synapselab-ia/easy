import * as React from 'react'
import {
    DEFAULT_OPERATOR_VISUAL_PREFERENCE,
    fetchOperatorVisualPreference,
    removeOperatorVisualImage,
    saveOperatorVisualPreference,
    uploadOperatorVisualImage,
    type OperatorVisualPreference,
    type OperatorVisualPreferenceUpdate,
} from '@/services/operatorVisualPersonalization'

export function useOperatorVisualPersonalization() {
    const [preference, setPreference] = React.useState<OperatorVisualPreference>(
        DEFAULT_OPERATOR_VISUAL_PREFERENCE,
    )
    const [isLoading, setIsLoading] = React.useState(true)
    const [isSaving, setIsSaving] = React.useState(false)
    const [isUploadingImage, setIsUploadingImage] = React.useState(false)
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
            setPreference(current => ({
                ...saved,
                imageUrl: current.imageUrl,
                hasCustomImage: current.hasCustomImage,
            }))
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

    const uploadImage = React.useCallback(async (file: File) => {
        setIsUploadingImage(true)
        setError(undefined)

        try {
            const imageUrl = await uploadOperatorVisualImage(file)
            setPreference(current => ({
                ...current,
                imageUrl,
                hasCustomImage: true,
            }))
        } catch (uploadError) {
            const message = uploadError instanceof Error
                ? uploadError.message
                : 'Não foi possível salvar esta imagem na sua conta.'
            setError(message)
            throw uploadError
        } finally {
            setIsUploadingImage(false)
        }
    }, [])

    const removeImage = React.useCallback(async () => {
        setIsUploadingImage(true)
        setError(undefined)

        try {
            await removeOperatorVisualImage()
            setPreference(current => ({
                ...current,
                imageUrl: undefined,
                hasCustomImage: false,
            }))
        } catch (removeError) {
            const message = removeError instanceof Error
                ? removeError.message
                : 'Não foi possível remover a imagem personalizada desta conta.'
            setError(message)
            throw removeError
        } finally {
            setIsUploadingImage(false)
        }
    }, [])

    return {
        preference,
        isLoading,
        isSaving,
        isUploadingImage,
        error,
        savePreference,
        uploadImage,
        removeImage,
    }
}