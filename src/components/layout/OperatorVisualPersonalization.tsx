import * as React from 'react'
import { Image as ImageIcon, Sparkles, Trash2, Upload } from 'lucide-react'
import heroImage from '@/assets/hero.png'
import { Button } from '@/components/ui/button'
import { ResponsiveDialog } from '@/components/ui/ResponsiveDialog'
import { cn } from '@/lib/utils'
import {
    OPERATOR_VISUAL_IMAGE_ACCEPT,
    type OperatorVisualPreference,
    type OperatorVisualPreferenceUpdate,
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
    className?: string
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
    className,
}: OperatorVisualPersonalizationControlProps) {
    const [open, setOpen] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const [draft, setDraft] = React.useState<OperatorVisualPreferenceUpdate>({
        enabled: preference.enabled,
        mode: preference.mode,
        intensity: preference.intensity,
    })

    React.useEffect(() => {
        if (!open) {
            setDraft({
                enabled: preference.enabled,
                mode: preference.mode,
                intensity: preference.intensity,
            })
        }
    }, [open, preference])

    if (isLoading || !preference.allowed) return null

    const busy = isSaving || isUploadingImage

    const handleOpenChange = (nextOpen: boolean) => {
        if (nextOpen) {
            setDraft({
                enabled: preference.enabled,
                mode: preference.mode,
                intensity: preference.intensity,
            })
        }
        setOpen(nextOpen)
    }

    const handleSave = async () => {
        try {
            await onSave(draft)
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
                        <div className="grid grid-cols-2 gap-2">
                            {([
                                ['corner', 'Canto', 'Pequena e discreta no canto inferior.'],
                                ['watermark', "Marca d'água", 'Central, suave e atrás do conteúdo.'],
                            ] as const).map(([mode, label, description]) => (
                                <button
                                    key={mode}
                                    type="button"
                                    aria-pressed={draft.mode === mode}
                                    onClick={() => setDraft(current => ({ ...current, mode }))}
                                    className={cn(
                                        'rounded-xl border p-3 text-left transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
                                        draft.mode === mode
                                            ? 'border-primary/40 bg-primary/10 shadow-sm'
                                            : 'border-border bg-background hover:bg-muted/50',
                                    )}
                                >
                                    <span className="flex items-center gap-2 text-sm font-medium">
                                        <ImageIcon className="size-4" />
                                        {label}
                                    </span>
                                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                                        {description}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </fieldset>

                    <fieldset className="space-y-2" disabled={!draft.enabled || busy}>
                        <legend className="text-sm font-medium">Intensidade</legend>
                        <div className="grid grid-cols-2 gap-2">
                            {([
                                ['subtle', 'Bem discreta'],
                                ['soft', 'Suave'],
                            ] as const).map(([intensity, label]) => (
                                <button
                                    key={intensity}
                                    type="button"
                                    aria-pressed={draft.intensity === intensity}
                                    onClick={() => setDraft(current => ({ ...current, intensity }))}
                                    className={cn(
                                        'rounded-lg border px-3 py-2 text-sm transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
                                        draft.intensity === intensity
                                            ? 'border-primary/40 bg-primary/10 font-medium'
                                            : 'border-border bg-background hover:bg-muted/50',
                                    )}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </fieldset>

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

export function OperatorDecorativeImage({
    preference,
}: {
    preference: OperatorVisualPreference
}) {
    if (!preference.allowed || !preference.enabled) return null

    const cornerOpacity = preference.intensity === 'soft'
        ? 'opacity-35 dark:opacity-25'
        : 'opacity-20 dark:opacity-15'
    const watermarkOpacity = preference.intensity === 'soft'
        ? 'opacity-[0.10] dark:opacity-[0.08]'
        : 'opacity-[0.06] dark:opacity-[0.05]'

    return (
        <img
            src={preference.imageUrl ?? heroImage}
            alt=""
            aria-hidden="true"
            data-operator-decoration={preference.mode}
            className={cn(
                'pointer-events-none fixed z-0 select-none object-contain print:hidden',
                preference.mode === 'corner'
                    ? cn(
                        'bottom-4 right-4 w-20 sm:w-24 lg:w-32 xl:w-36',
                        cornerOpacity,
                    )
                    : cn(
                        'left-1/2 top-1/2 max-h-[62vh] w-[min(62vw,34rem)] -translate-x-1/2 -translate-y-1/2',
                        watermarkOpacity,
                    ),
            )}
        />
    )
}