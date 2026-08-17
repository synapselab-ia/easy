import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { MainLayout } from './MainLayout'

describe('MainLayout Component', () => {
    it('renders the Easy shell', () => {
        render(
            <MemoryRouter>
                <MainLayout />
            </MemoryRouter>
        )

        expect(screen.getByRole('heading', { name: 'Easy' })).toBeInTheDocument()
    })

    it('toggles command center on Ctrl+K', () => {
        render(
            <MemoryRouter>
                <MainLayout />
            </MemoryRouter>
        )

        const event = new KeyboardEvent('keydown', {
            key: 'k',
            ctrlKey: true,
            bubbles: true,
            cancelable: true
        })

        const preventDefault = vi.spyOn(event, 'preventDefault')

        fireEvent(document, event)

        expect(preventDefault).toHaveBeenCalled()
        expect(screen.getByPlaceholderText(/Digite um comando/i)).toBeInTheDocument()
    })
})
