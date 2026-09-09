import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
    OperatorDecorativeImage,
    OperatorVisualPersonalizationControl,
} from './OperatorVisualPersonalization'
import type {
    OperatorVisualPosition,
    OperatorVisualPreference,
    OperatorVisualSize,
} from '@/services/operatorVisualPersonalization'

const disabledPreference: OperatorVisualPreference = {
    allowed: false,
    enabled: false,
    position: 'bottom-right',
    size: 'medium',
    opacity: 20,
    layer: 'behind',
}

const allowedPreference: OperatorVisualPreference = {
    allowed: true,
    enabled: false,
    position: 'bottom-right',
    size: 'medium',
    opacity: 20,
    layer: 'behind',
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

    it('exposes exactly the nine fixed position choices', () => {
        renderControl({ ...allowedPreference, enabled: true })
        fireEvent.click(screen.getByRole('button', { name: 'Personalização visual' }))

        const labels = [
            'Superior esquerda',
            'Superior centro',
            'Superior direita',
            'Centro esquerda',
            'Centro',
            'Centro direita',
            'Inferior esquerda',
            'Inferior centro',
            'Inferior direita',
        ]

        for (const label of labels) {
            expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
        }
        expect(document.querySelector('[data-visual-position-grid]')?.children).toHaveLength(9)
    })

    it('saves only the bounded enabled, position, size, opacity and layer preference', async () => {
        const onSave = vi.fn().mockResolvedValue(undefined)

        renderControl(allowedPreference, { onSave })

        fireEvent.click(screen.getByRole('button', { name: 'Personalização visual' }))
        fireEvent.click(screen.getByRole('switch', { name: 'Ativar imagem decorativa' }))
        fireEvent.click(screen.getByRole('button', { name: 'Superior esquerda' }))
        fireEvent.click(screen.getByRole('button', { name: 'Grande' }))
        fireEvent.change(screen.getByRole('slider', { name: 'Opacidade da imagem decorativa' }), {
            target: { value: '45' },
        })
        fireEvent.click(screen.getByRole('button', { name: /Sobre o conteúdo/i }))
        expect(screen.getByText('45%')).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Salvar aparência' }))

        await waitFor(() => {
            expect(onSave).toHaveBeenCalledWith({
                enabled: true,
                position: 'top-left',
                size: 'large',
                opacity: 45,
                layer: 'over',
            })
        })
    })

    it('previews draft layout changes immediately and clears preview when cancelled', async () => {
        const onPreviewChange = vi.fn()

        renderControl({ ...allowedPreference, enabled: true }, { onPreviewChange })
        fireEvent.click(screen.getByRole('button', { name: 'Personalização visual' }))

        await waitFor(() => {
            expect(onPreviewChange).toHaveBeenLastCalledWith(expect.objectContaining({
                position: 'bottom-right',
                size: 'medium',
                opacity: 20,
                layer: 'behind',
            }))
        })

        fireEvent.click(screen.getByRole('button', { name: 'Centro' }))
        fireEvent.change(screen.getByRole('slider', { name: 'Opacidade da imagem decorativa' }), {
            target: { value: '30' },
        })

        await waitFor(() => {
            expect(onPreviewChange).toHaveBeenLastCalledWith(expect.objectContaining({
                position: 'center',
                opacity: 30,
            }))
        })

        fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
        expect(onPreviewChange).toHaveBeenLastCalledWith(null)
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

    it('renders the decoration as assistive-tech-hidden, non-interactive and print-hidden', () => {
        const { container, rerender } = render(
            <OperatorDecorativeImage
                preference={{ ...allowedPreference, enabled: true }}
            />,
        )

        const decoration = container.querySelector('[data-operator-decoration]')
        expect(decoration).toBeInTheDocument()
        expect(decoration).toHaveAttribute('aria-hidden', 'true')
        expect(decoration).toHaveAttribute('alt', '')
        expect(decoration).toHaveClass('pointer-events-none')
        expect(decoration).toHaveClass('print:hidden')
        expect(decoration).toHaveAttribute('data-operator-position', 'bottom-right')
        expect(decoration).toHaveAttribute('data-operator-size', 'medium')
        expect(decoration).toHaveAttribute('data-operator-layer', 'behind')
        expect(decoration).toHaveClass('z-0')
        expect(decoration).toHaveStyle({ opacity: '0.2' })

        rerender(<OperatorDecorativeImage preference={allowedPreference} />)
        expect(container.querySelector('[data-operator-decoration]')).not.toBeInTheDocument()
    })

    it('maps all nine positions to fixed viewport anchors', () => {
        const positionClasses: Array<[OperatorVisualPosition, string[]]> = [
            ['top-left', ['left-4', 'top-4']],
            ['top-center', ['left-1/2', 'top-4', '-translate-x-1/2']],
            ['top-right', ['right-4', 'top-4']],
            ['center-left', ['left-4', 'top-1/2', '-translate-y-1/2']],
            ['center', ['left-1/2', 'top-1/2', '-translate-x-1/2', '-translate-y-1/2']],
            ['center-right', ['right-4', 'top-1/2', '-translate-y-1/2']],
            ['bottom-left', ['bottom-4', 'left-4']],
            ['bottom-center', ['bottom-4', 'left-1/2', '-translate-x-1/2']],
            ['bottom-right', ['bottom-4', 'right-4']],
        ]

        const { container, rerender } = render(
            <OperatorDecorativeImage preference={{ ...allowedPreference, enabled: true }} />,
        )

        for (const [position, classes] of positionClasses) {
            rerender(
                <OperatorDecorativeImage
                    preference={{ ...allowedPreference, enabled: true, position }}
                />,
            )
            const decoration = container.querySelector('[data-operator-decoration]')
            expect(decoration).toHaveAttribute('data-operator-position', position)
            for (const className of classes) {
                expect(decoration).toHaveClass(className)
            }
        }
    })

    it('maps the three bounded size presets and both layer modes', () => {
        const sizes: Array<[OperatorVisualSize, string]> = [
            ['small', 'w-20'],
            ['medium', 'w-28'],
            ['large', 'w-40'],
        ]
        const { container, rerender } = render(
            <OperatorDecorativeImage
                preference={{ ...allowedPreference, enabled: true, opacity: 5 }}
            />,
        )

        for (const [size, expectedClass] of sizes) {
            rerender(
                <OperatorDecorativeImage
                    preference={{ ...allowedPreference, enabled: true, size, opacity: 5 }}
                />,
            )
            const decoration = container.querySelector('[data-operator-decoration]')
            expect(decoration).toHaveClass(expectedClass)
            expect(decoration).toHaveStyle({ opacity: '0.05' })
        }

        rerender(
            <OperatorDecorativeImage
                preference={{ ...allowedPreference, enabled: true, layer: 'over', opacity: 50 }}
            />,
        )
        const overlay = container.querySelector('[data-operator-decoration]')
        expect(overlay).toHaveClass('z-40')
        expect(overlay).toHaveStyle({ opacity: '0.5' })
    })

    it('uses the custom signed image URL without changing decoration semantics', () => {
        const { container } = render(
            <OperatorDecorativeImage
                preference={{
                    allowed: true,
                    enabled: true,
                    position: 'center',
                    size: 'large',
                    opacity: 10,
                    layer: 'behind',
                    imageUrl: 'https://example.test/signed-image',
                    hasCustomImage: true,
                }}
            />,
        )

        const decoration = container.querySelector('[data-operator-decoration]')
        expect(decoration).toBeInTheDocument()
        expect(decoration).toHaveAttribute('src', 'https://example.test/signed-image')
        expect(decoration).toHaveClass('z-0')
        expect(decoration).toHaveStyle({ opacity: '0.1' })
        expect(decoration).toHaveClass('pointer-events-none')
    })
})
