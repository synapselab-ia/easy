import * as React from 'react'
import { Image as ImageIcon, Sparkles, Trash2, Upload } from 'lucide-react'
import heroImage from '@/assets/hero.png'
import { Button } from '@/components/ui/button'
import { ResponsiveDialog } from '@/components/ui/ResponsiveDialog'
import { cn } from '@/lib/utils'
import {
    OPERATOR_VISUAL_IMAGE_ACCEPT,
    OPERATOR_VISUAL_OPACITY_MAX,
    OPERATOR_VISUAL_OPACITY_MIN,
    OPERATOR_VISUAL_OPACITY_STEP,
    type OperatorVisualLayer,
    type OperatorVisualPosition,
    type OperatorVisualPreference,
    type OperatorVisualPreferenceUpdate,
    type OperatorVisualSize,
} from '@/services/operatorVisualPersonalization'

interface OperatorVisualPersonalizationControlProps {
    preference: OperatorVisualPreference
    isLoading: boolean
    isSaving: boolean
    isUploadingImage: boolean
    error?: string
    onSave: (preference: OperatorVisualPreferenceUpdate) => Promise<void>
    onUploadImage: (file: File) => Promise<void>
    onRemoveImage: () => Promise<void>
    onPreviewChange?: (preference: OperatorVisualPreference | null) => void
    className?: string
}

const POSITION_OPTIONS: Array<{
    value: OperatorVisualPosition
    label: string
}> = [
    { value: 'top-left', label: 'Superior esquerda' },
    { value: 'top-center', label: 'Superior centro' },
    { value: 'top-right', label: 'Superior direita' },
    { value: 'center-left', label: 'Centro esquerda' },
    { value: 'center', label: 'Centro' },
    { value: 'center-right', label: 'Centro direita' },
    { value: 'bottom-left', label: 'Inferior esquerda' },
    { value: 'bottom-center', label: 'Inferior centro' },
    { value: 'bottom-right', label: 'Inferior direita' },
]

const SIZE_OPTIONS: Array<{
    value: OperatorVisualSize
    label: string
}> = [
    { value: 'small', label: 'Pequeno' },
    { value: 'medium', label: 'Médio' },
    { value: 'large', label: 'Grande' },
]

const LAYER_OPTIONS: Array<{
    value: OperatorVisualLayer
    label: string
    description: string
}> = [
    {
        value: 'behind',
        label: 'Atrás do conteúdo',
        description: 'Mais discreta, sob os componentes do Easy.',
    },
    {
        value: 'over',
        label: 'Sobre o conteúdo',
        description: 'Pode cruzar os componentes, mas nunca bloqueia cliques.',
    },
]

function preferenceToDraft(preference: OperatorVisualPreference): OperatorVisualPreferenceUpdate {
    return {
        enabled: preference.enabled,
        position: preference.position,
        size: preference.size,
        opacity: preference.opacity,
        layer: preference.layer,
    }
}

function buildPreviewPreference(
    preference: OperatorVisualPreference,
    draft: OperatorVisualPreferenceUpdate,
): OperatorVisualPreference {
    return {
        ...preference,
        ...draft,
    }
}

export function OperatorVisualPersonalizationControl({
    preference,
    isLoading,
    isSaving,
    isUploadingImage,
    error,
    onSave,
    onUploadImage,
    onRemoveImage,
    onPreviewChange,
    className,
}: OperatorVisualPersonalizationControlProps) {
    const [open, setOpen] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const [draft, setDraft] = React.useState<OperatorVisualPreferenceUpdate>(
        preferenceToDraft(preference),
    )

    React.useEffect(() => {
        if (!open) return
        onPreviewChange?.(buildPreviewPreference(preference, draft))
    }, [draft, onPreviewChange, open, preference])

    if (isLoading || !preference.allowed) return null

    const busy = isSaving || isUploadingImage

    const handleOpenChange = (nextOpen: boolean) => {
        if (nextOpen) {
            setDraft(preferenceToDraft(preference))
        } else {
            onPreviewChange?.(null)
        }
        setOpen(nextOpen)
    }

    const handleSave = async () => {
        try {
            await onSave(draft)
            onPreviewChange?.(null)
            setOpen(false)
        } catch {
            // The hook exposes the persisted error inside the dialog.
        }
    }

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file) return

        try {
            await onUploadImage(file)
        } catch {
            // The hook exposes the persisted error inside the dialog.
        }
    }

    const handleRemoveImage = async () => {
        try {
            await onRemoveImage()
        } catch {
            // The hook exposes the persisted error inside the dialog.
        }
    }

    const previewImage = preference.imageUrl ?? heroImage

    return (
        <>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className={className}
                aria-label="Personalização visual"
                title="Personalização visual"
                onClick={() => handleOpenChange(true)}
            >
                <Sparkles />
            </Button>

            <ResponsiveDialog
                open={open}
                onOpenChange={handleOpenChange}
                title="Personalização visual"
                description="Um detalhe decorativo ligado somente à sua conta."
                footer={(
                    <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={busy}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={() => void handleSave()}
                            disabled={busy}
                        >
                            {isSaving ? 'Salvando...' : 'Salvar aparência'}
                        </Button>
                    </div>
                )}
            >
                <div className="space-y-5">
                    <div className="rounded-xl border bg-muted/25 p-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Imagem decorativa</p>
                                <p className="text-xs leading-relaxed text-muted-foreground">
                                    Ative ou desative sem alterar dados, relatórios ou PDFs.
                                </p>
                            </div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={draft.enabled}
                                aria-label="Ativar imagem decorativa"
                                onClick={() => setDraft(current => ({
                                    ...current,
                                    enabled: !current.enabled,
                                }))}
                                disabled={busy}
                                className={cn(
                                    'relative h-6 w-11 shrink-0 rounded-full border transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
                                    draft.enabled
                                        ? 'border-primary bg-primary'
                                        : 'border-border bg-muted',
                                )}
                            >
                                <span
                                    className={cn(
                                        'absolute top-0.5 size-4.5 rounded-full bg-background shadow-sm transition-transform',
                                        draft.enabled ? 'translate-x-5.5' : 'translate-x-0.5',
                                    )}
                                />
                            </button>
                        </div>
                    </div>

                    <section className="space-y-3" aria-labelledby="visual-image-title">
                        <div className="space-y-1">
                            <h3 id="visual-image-title" className="text-sm font-medium">Sua imagem</h3>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                PNG, JPG ou WebP, até 5 MB. A imagem fica salva somente na sua conta.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 rounded-xl border bg-background p-3 sm:flex-row sm:items-center">
                            <div className="flex h-24 w-full items-center justify-center overflow-hidden rounded-lg border bg-muted/20 sm:w-32">
                                <img
                                    src={previewImage}
                                    alt="Prévia da imagem decorativa"
                                    className="max-h-full max-w-full object-contain"
                                />
                            </div>

                            <div className="min-w-0 flex-1 space-y-2">
                                <div>
                                    <p className="text-sm font-medium">
                                        {preference.hasCustomImage ? 'Imagem personalizada' : 'Imagem padrão do Easy'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {preference.hasCustomImage
                                            ? 'Esta imagem acompanha sua conta em outros dispositivos.'
                                            : 'Escolha outra imagem se quiser personalizar.'}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept={OPERATOR_VISUAL_IMAGE_ACCEPT}
                                        className="sr-only"
                                        aria-label="Escolher imagem personalizada"
                                        onChange={event => void handleImageChange(event)}
                                        disabled={busy}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={busy}
                                    >
                                        <Upload className="size-4" />
                                        {isUploadingImage ? 'Enviando...' : 'Escolher imagem'}
                                    </Button>

                                    {preference.hasCustomImage && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => void handleRemoveImage()}
                                            disabled={busy}
                                        >
                                            <Trash2 className="size-4" />
                                            Usar imagem padrão
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    <fieldset className="space-y-2" disabled={!draft.enabled || busy}>
                        <legend className="text-sm font-medium">Posição</legend>
                        <div className="grid grid-cols-3 gap-2" data-visual-position-grid>
                            {POSITION_OPTIONS.map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    aria-pressed={draft.position === option.value}
                                    aria-label={option.label}
                                    onClick={() => setDraft(current => ({
                                        ...current,
                                        position: option.value,
                                    }))}
                                    className={cn(
                                        'min-h-14 rounded-lg border px-2 py-2 text-center text-xs leading-tight transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
                                        draft.position === option.value
                                            ? 'border-primary/40 bg-primary/10 font-medium'
                                            : 'border-border bg-background hover:bg-muted/50',
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </fieldset>

                    <fieldset className="space-y-2" disabled={!draft.enabled || busy}>
                        <legend className="text-sm font-medium">Tamanho</legend>
                        <div className="grid grid-cols-3 gap-2">
                            {SIZE_OPTIONS.map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    aria-pressed={draft.size === option.value}
                                    onClick={() => setDraft(current => ({
                                        ...current,
                                        size: option.value,
                                    }))}
                                    className={cn(
                                        'rounded-lg border px-3 py-2 text-sm transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
                                        draft.size === option.value
                                            ? 'border-primary/40 bg-primary/10 font-medium'
                                            : 'border-border bg-background hover:bg-muted/50',
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </fieldset>

                    <fieldset className="space-y-2" disabled={!draft.enabled || busy}>
                        <div className="flex items-center justify-between gap-3">
                            <legend className="text-sm font-medium">Opacidade</legend>
                            <output
                                htmlFor="operator-visual-opacity"
                                className="min-w-12 text-right text-sm font-medium tabular-nums"
                                aria-live="polite"
                            >
                                {draft.opacity}%
                            </output>
                        </div>
                        <input
                            id="operator-visual-opacity"
                            type="range"
                            min={OPERATOR_VISUAL_OPACITY_MIN}
                            max={OPERATOR_VISUAL_OPACITY_MAX}
                            step={OPERATOR_VISUAL_OPACITY_STEP}
                            value={draft.opacity}
                            aria-label="Opacidade da imagem decorativa"
                            onChange={event => setDraft(current => ({
                                ...current,
                                opacity: Number(event.target.value),
                            }))}
                            className="w-full accent-primary"
                        />
                        <div className="flex justify-between text-[11px] text-muted-foreground" aria-hidden="true">
                            <span>{OPERATOR_VISUAL_OPACITY_MIN}%</span>
                            <span>{OPERATOR_VISUAL_OPACITY_MAX}%</span>
                        </div>
                    </fieldset>

                    <fieldset className="space-y-2" disabled={!draft.enabled || busy}>
                        <legend className="text-sm font-medium">Camada</legend>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {LAYER_OPTIONS.map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    aria-pressed={draft.layer === option.value}
                                    onClick={() => setDraft(current => ({
                                        ...current,
                                        layer: option.value,
                                    }))}
                                    className={cn(
                                        'rounded-xl border p-3 text-left transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
                                        draft.layer === option.value
                                            ? 'border-primary/40 bg-primary/10 shadow-sm'
                                            : 'border-border bg-background hover:bg-muted/50',
                                    )}
                                >
                                    <span className="flex items-center gap-2 text-sm font-medium">
                                        <ImageIcon className="size-4" />
                                        {option.label}
                                    </span>
                                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                                        {option.description}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </fieldset>

                    <p className="text-xs leading-relaxed text-muted-foreground">
                        As mudanças aparecem na tela enquanto esta janela estiver aberta; só ficam salvas ao confirmar.
                    </p>

                    {error && (
                        <p role="alert" className="text-sm text-destructive">
                            {error}
                        </p>
                    )}
                </div>
            </ResponsiveDialog>
        </>
    )
}

const POSITION_CLASSES: Record<OperatorVisualPosition, string> = {
    'top-left': 'left-4 top-4',
    'top-center': 'left-1/2 top-4 -translate-x-1/2',
    'top-right': 'right-4 top-4',
    'center-left': 'left-4 top-1/2 -translate-y-1/2',
    center: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
    'center-right': 'right-4 top-1/2 -translate-y-1/2',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
}

const SIZE_CLASSES: Record<OperatorVisualSize, string> = {
    small: 'w-20 sm:w-24 lg:w-28',
    medium: 'w-28 sm:w-36 lg:w-44',
    large: 'w-40 sm:w-52 lg:w-64 xl:w-72',
}

export function OperatorDecorativeImage({
    preference,
}: {
    preference: OperatorVisualPreference
}) {
    if (!preference.allowed || !preference.enabled) return null

    return (
        <img
            src={preference.imageUrl ?? heroImage}
            alt=""
            aria-hidden="true"
            data-operator-decoration={preference.position}
            data-operator-position={preference.position}
            data-operator-size={preference.size}
            data-operator-layer={preference.layer}
            className={cn(
                'pointer-events-none fixed max-h-[70vh] select-none object-contain print:hidden',
                preference.layer === 'over' ? 'z-40' : 'z-0',
                POSITION_CLASSES[preference.position],
                SIZE_CLASSES[preference.size],
            )}
            style={{ opacity: preference.opacity / 100 }}
        />
    )
}
