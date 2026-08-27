import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { ReactNode } from 'react'
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

vi.mock('@/components/ui/command', () => ({
    CommandDialog: ({ open, children }: { open: boolean; children: ReactNode }) =>
        open ? <div data-testid="command-dialog">{children}</div> : null,
    CommandInput: ({
        placeholder,
        value,
        onValueChange,
    }: {
        placeholder?: string;
        value?: string;
        onValueChange?: (value: string) => void;
    }) => (
        <input
            placeholder={placeholder}
            value={value ?? ''}
            onChange={(event) => onValueChange?.(event.target.value)}
        />
    ),
    CommandList: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CommandEmpty: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CommandGroup: ({ heading, children }: { heading?: string; children: ReactNode }) => (
        <section>
            {heading && <h3>{heading}</h3>}
            {children}
        </section>
    ),
    CommandItem: ({ onSelect, children }: { onSelect?: () => void; children: ReactNode }) => (
        <button type="button" onClick={() => onSelect?.()}>
            {children}
        </button>
    ),
    CommandSeparator: () => <hr />,
}))

describe('CommandCenter', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(searchHook.useSearch).mockReturnValue({
            results: [],
            recent: [],
            isLoading: false,
        })
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

    it('should navigate to the catalog with the selected item search applied', () => {
        vi.mocked(searchHook.useSearch).mockReturnValue({
            results: [
                { id: 7, title: 'Placa QR Code MDF', type: 'item', isActive: true }
            ],
            recent: [],
            isLoading: false,
        })

        render(
            <MemoryRouter>
                <CommandCenter open={true} onOpenChange={() => { }} />
            </MemoryRouter>
        )

        fireEvent.click(screen.getByText('Placa QR Code MDF'))

        expect(mockNavigate).toHaveBeenCalledWith('/items?search=Placa%20QR%20Code%20MDF')
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

    it('should keep inactive items visible and identify them as inactive', () => {
        vi.mocked(searchHook.useSearch).mockReturnValue({
            results: [
                { id: 3, title: 'Archived Item', type: 'item', isActive: false }
            ],
            recent: [],
            isLoading: false,
        })

        render(
            <MemoryRouter>
                <CommandCenter open={true} onOpenChange={() => { }} />
            </MemoryRouter>
        )

        expect(screen.getByText('Archived Item')).toBeInTheDocument()
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
        expect(screen.getAllByText(/"New Reseller"/)).toHaveLength(3)
        expect(screen.getByText(/Cadastrar revendedor:/i)).toBeInTheDocument()
        expect(screen.getByText(/Cadastrar produto:/i)).toBeInTheDocument()
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

        const suggestionLabel = screen.getByText(/Cadastrar revendedor:/i)
        const suggestion = suggestionLabel.closest('button')
        expect(suggestion).not.toBeNull()
        fireEvent.click(suggestion!)

        expect(mockNavigate).toHaveBeenCalledWith('/resellers?name=New%20Reseller')
    })

    it('should route payment and signal shortcuts with distinct transaction intent', () => {
        render(
            <MemoryRouter>
                <CommandCenter open={true} onOpenChange={() => { }} />
            </MemoryRouter>
        )

        fireEvent.click(screen.getByText('Novo Lançamento: Pagamento'))
        expect(mockNavigate).toHaveBeenCalledWith('/transactions?type=payment')

        fireEvent.click(screen.getByText('Novo Lançamento: Sinal'))
        expect(mockNavigate).toHaveBeenCalledWith('/transactions?type=signal')
    })
})
