import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResponsiveDialog } from './ResponsiveDialog'
import React from 'react'

describe('ResponsiveDialog', () => {
    beforeEach(() => {
        // Reset matchMedia mock
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation(query => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(), // deprecated
                removeListener: vi.fn(), // deprecated
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        })
    })

    it('should render Dialog on desktop (> 1024px) with a bounded scroll region and footer outside it', () => {
        // Mock desktop
        window.matchMedia = vi.fn().mockImplementation(query => ({
            matches: query === '(min-width: 1024px)',
            media: query,
            onchange: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        }))

        render(
            <ResponsiveDialog
                open={true}
                onOpenChange={() => { }}
                title="Test Title"
                description="Test Description"
                footer={<button type="button">Save action</button>}
            >
                <div>Content</div>
            </ResponsiveDialog>
        )

        expect(screen.getByText('Test Title')).toBeInTheDocument()
        expect(screen.getByText('Test Description')).toBeInTheDocument()
        const scrollRegion = screen.getByText('Content').parentElement
        expect(scrollRegion).toHaveClass('min-h-0', 'overflow-y-auto')
        expect(screen.getByRole('dialog')).toHaveClass('max-h-[calc(100dvh-2rem)]', 'overflow-hidden')
        expect(screen.getByRole('button', { name: 'Save action' })).toBeInTheDocument()
        expect(scrollRegion).not.toContainElement(screen.getByRole('button', { name: 'Save action' }))
    })

    it('should render Drawer on mobile (< 1024px) with a bounded scroll region and footer outside it', () => {
        // Mock mobile
        window.matchMedia = vi.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        }))

        render(
            <ResponsiveDialog
                open={true}
                onOpenChange={() => { }}
                title="Test Title Mobile"
                description="Test Description Mobile"
                footer={<button type="button">Save mobile</button>}
            >
                <div>Mobile Content</div>
            </ResponsiveDialog>
        )

        expect(screen.getByText('Test Title Mobile')).toBeInTheDocument()
        expect(screen.getByText('Test Description Mobile')).toBeInTheDocument()
        const scrollRegion = screen.getByText('Mobile Content').parentElement
        expect(scrollRegion).toHaveClass('min-h-0', 'flex-1', 'overflow-y-auto')
        expect(screen.getByRole('button', { name: 'Save mobile' })).toBeInTheDocument()
        expect(scrollRegion).not.toContainElement(screen.getByRole('button', { name: 'Save mobile' }))
    })
})