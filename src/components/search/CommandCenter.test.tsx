import { describe, it, expect, vi, beforeEach, beforeAll, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { CommandCenter } from './CommandCenter'
import { MemoryRouter } from 'react-router-dom'
import * as searchHook from '@/hooks/useSearch'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

vi.mock('@/hooks/useSearch', () => ({
    useSearch: vi.fn(),
}))

describe('CommandCenter', () => {
    beforeAll(() => {
        global.ResizeObserver = class ResizeObserver {
            observe() { }
            unobserve() { }
            disconnect() { }
        }
        HTMLElement.prototype.scrollIntoView = vi.fn()
    })

    beforeEach(() => {
        vi.clearAllMocks()
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation(query => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        })

        vi.mocked(searchHook.useSearch).mockReturnValue({
            results: [],
            recent: [],
            isLoading: false,
        })
    })

    afterEach(() => {
        cleanup()
        document.body.innerHTML = ''
    })

    it('should render basic structure when open', () => {
        render(
            <MemoryRouter>
                <CommandCenter open={true} onOpenChange={() => { }} />
            </MemoryRouter>
        )

        expect(screen.getByPlaceholderText(/Digite um comando/i)).toBeInTheDocument()
    })

    it('should navigate when a result is selected', () => {
        vi.mocked(searchHook.useSearch).mockReturnValue({
            results: [
                { id: 1, title: 'Test Reseller', type: 'reseller', isActive: true }
            ],
            recent: [],
            isLoading: false,
        })

        render(
            <MemoryRouter>
                <CommandCenter open={true} onOpenChange={() => { }} />
            </MemoryRouter>
        )

        const item = screen.getByText('Test Reseller')
        fireEvent.click(item)

        expect(mockNavigate).toHaveBeenCalledWith('/resellers/1')
    })

    it('should keep inactive resellers visible and identify them as inactive', () => {
        vi.mocked(searchHook.useSearch).mockReturnValue({
            results: [
                { id: 2, title: 'Archived Reseller', type: 'reseller', isActive: false }
            ],
            recent: [],
            isLoading: false,
        })

        render(
            <MemoryRouter>
                <CommandCenter open={true} onOpenChange={() => { }} />
            </MemoryRouter>
        )

        expect(screen.getByText('Archived Reseller')).toBeInTheDocument()
        expect(screen.getByText('Inativo')).toBeInTheDocument()
    })

    it('should show suggestions when no results are found for a query', () => {
        vi.mocked(searchHook.useSearch).mockReturnValue({
            results: [],
            recent: [],
            isLoading: false,
        })

        render(
            <MemoryRouter>
                <CommandCenter open={true} onOpenChange={() => { }} />
            </MemoryRouter>
        )

        const input = screen.getByPlaceholderText(/Digite um comando/i)
        fireEvent.change(input, { target: { value: 'New Reseller' } })

        expect(screen.getByText(/Nenhum resultado encontrado para/i)).toBeInTheDocument()
        expect(screen.getByText(/"New Reseller"/)).toBeInTheDocument()
        expect(screen.getByText(/Cadastrar revendedor: "New Reseller"/i)).toBeInTheDocument()
        expect(screen.getByText(/Cadastrar produto: "New Reseller"/i)).toBeInTheDocument()
    })

    it('should navigate with pre-filled name when clicking a suggestion', () => {
        vi.mocked(searchHook.useSearch).mockReturnValue({
            results: [],
            recent: [],
            isLoading: false,
        })

        render(
            <MemoryRouter>
                <CommandCenter open={true} onOpenChange={() => { }} />
            </MemoryRouter>
        )

        const input = screen.getByPlaceholderText(/Digite um comando/i)
        fireEvent.change(input, { target: { value: 'New Reseller' } })

        const suggestion = screen.getByText(/Cadastrar revendedor: "New Reseller"/i)
        fireEvent.click(suggestion)

        expect(mockNavigate).toHaveBeenCalledWith('/resellers?name=New%20Reseller')
    })
})
