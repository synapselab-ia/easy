import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
    OperatorDecorativeImage,
    OperatorVisualPersonalizationControl,
} from './OperatorVisualPersonalization'
import type { OperatorVisualPreference } from '@/services/operatorVisualPersonalization'

const disabledPreference: OperatorVisualPreference = {
    allowed: false,
    enabled: false,
    mode: 'corner',
    intensity: 'subtle',
}

const allowedPreference: OperatorVisualPreference = {
    allowed: true,
    enabled: false,
    mode: 'corner',
    intensity: 'subtle',
}

function renderControl(
    preference: OperatorVisualPreference,
    overrides: Partial<React.ComponentProps<typeof OperatorVisualPersonalizationControl>> = {},
) {
    return render(
        <OperatorVisualPersonalizationControl
            preference={preference}
            isLoading={false}
            isSaving={false}
            isUploadingImage={false}
            onSave={vi.fn().mockResolvedValue(undefined)}
            onUploadImage={vi.fn().mockResolvedValue(undefined)}
            onRemoveImage={vi.fn().mockResolvedValue(undefined)}
            {...overrides}
        />,
    )
}

describe('OperatorVisualPersonalization', () => {
    it('does not expose controls to an ineligible operator', () => {
        renderControl(disabledPreference)

        expect(screen.queryByRole('button', { name: 'Personalização visual' })).not.toBeInTheDocument()
    })

    it('saves only the bounded enabled, mode and intensity preference', async () => {
        const onSave = vi.fn().mockResolvedValue(undefined)

        renderControl(allowedPreference, { onSave })

        fireEvent.click(screen.getByRole('button', { name: 'Personalização visual' }))
        fireEvent.click(screen.getByRole('switch', { name: 'Ativar imagem decorativa' }))
        fireEvent.click(screen.getByRole('button', { name: /Marca d'água/i }))
        fireEvent.click(screen.getByRole('button', { name: 'Suave' }))
        fireEvent.click(screen.getByRole('button', { name: 'Salvar aparência' }))

        await waitFor(() => {
            expect(onSave).toHaveBeenCalledWith({
                enabled: true,
                mode: 'watermark',
                intensity: 'soft',
            })
        })
    })

    it('lets the eligible operator choose one local image from the personalization dialog', async () => {
        const onUploadImage = vi.fn().mockResolvedValue(undefined)
        const file = new File(['image'], 'decoracao.png', { type: 'image/png' })

        renderControl(allowedPreference, { onUploadImage })

        fireEvent.click(screen.getByRole('button', { name: 'Personalização visual' }))
        fireEvent.change(screen.getByLabelText('Escolher imagem personalizada'), {
            target: { files: [file] },
        })

        await waitFor(() => {
            expect(onUploadImage).toHaveBeenCalledWith(file)
        })
    })

    it('offers the bundled fallback when a custom image exists', async () => {
        const onRemoveImage = vi.fn().mockResolvedValue(undefined)

        renderControl({
            ...allowedPreference,
            imageUrl: 'https://example.test/custom.png',
            hasCustomImage: true,
        }, { onRemoveImage })

        fireEvent.click(screen.getByRole('button', { name: 'Personalização visual' }))
        expect(screen.getByRole('img', { name: 'Prévia da imagem decorativa' }))
            .toHaveAttribute('src', 'https://example.test/custom.png')

        fireEvent.click(screen.getByRole('button', { name: 'Usar imagem padrão' }))
        await waitFor(() => expect(onRemoveImage).toHaveBeenCalledTimes(1))
    })

    it('renders a non-interactive print-hidden corner decoration only when enabled', () => {
        const { container, rerender } = render(
            <OperatorDecorativeImage
                preference={{ ...allowedPreference, enabled: true }}
            />,
        )

        const decoration = container.querySelector('[data-operator-decoration="corner"]')
        expect(decoration).toBeInTheDocument()
        expect(decoration).toHaveAttribute('aria-hidden', 'true')
        expect(decoration).toHaveAttribute('alt', '')
        expect(decoration).toHaveClass('pointer-events-none')
        expect(decoration).toHaveClass('print:hidden')
        expect(decoration).toHaveClass('opacity-20')

        rerender(<OperatorDecorativeImage preference={allowedPreference} />)
        expect(container.querySelector('[data-operator-decoration]')).not.toBeInTheDocument()
    })

    it('uses the custom signed image URL without changing decoration semantics', () => {
        const { container } = render(
            <OperatorDecorativeImage
                preference={{
                    allowed: true,
                    enabled: true,
                    mode: 'watermark',
                    intensity: 'soft',
                    imageUrl: 'https://example.test/signed-image',
                    hasCustomImage: true,
                }}
            />,
        )

        const decoration = container.querySelector('[data-operator-decoration="watermark"]')
        expect(decoration).toBeInTheDocument()
        expect(decoration).toHaveAttribute('src', 'https://example.test/signed-image')
        expect(decoration).toHaveClass('z-0')
        expect(decoration).toHaveClass('opacity-[0.10]')
        expect(decoration).toHaveClass('pointer-events-none')
    })
})