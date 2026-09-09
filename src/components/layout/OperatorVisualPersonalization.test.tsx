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

describe('OperatorVisualPersonalization', () => {
    it('does not expose controls to an ineligible operator', () => {
        render(
            <OperatorVisualPersonalizationControl
                preference={disabledPreference}
                isLoading={false}
                isSaving={false}
                onSave={vi.fn()}
            />,
        )

        expect(screen.queryByRole('button', { name: 'Personalização visual' })).not.toBeInTheDocument()
    })

    it('saves only the bounded enabled, mode and intensity preference', async () => {
        const onSave = vi.fn().mockResolvedValue(undefined)

        render(
            <OperatorVisualPersonalizationControl
                preference={allowedPreference}
                isLoading={false}
                isSaving={false}
                onSave={onSave}
            />,
        )

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

    it('keeps watermark intensity bounded and behind the application content', () => {
        const { container } = render(
            <OperatorDecorativeImage
                preference={{
                    allowed: true,
                    enabled: true,
                    mode: 'watermark',
                    intensity: 'soft',
                }}
            />,
        )

        const decoration = container.querySelector('[data-operator-decoration="watermark"]')
        expect(decoration).toBeInTheDocument()
        expect(decoration).toHaveClass('z-0')
        expect(decoration).toHaveClass('opacity-[0.10]')
        expect(decoration).toHaveClass('pointer-events-none')
    })
})
