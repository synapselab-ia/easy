import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect } from 'vitest'
import App from './App'

function renderApp() {
    window.history.pushState({}, '', import.meta.env.BASE_URL)
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    )
}

describe('App Integration Tests', () => {
    it('navigates to the resellers page when the link is clicked', async () => {
        renderApp()

        expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()

        fireEvent.click(screen.getAllByRole('link', { name: 'Revendedores' })[0])
        expect(await screen.findByRole('heading', { name: 'Revendedores' })).toBeInTheDocument()
    })

    it('navigates to the financial reports workspace', async () => {
        renderApp()

        expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()

        fireEvent.click(screen.getAllByRole('link', { name: 'Relatórios' })[0])
        expect(await screen.findByRole('heading', { name: 'Relatórios' })).toBeInTheDocument()
        expect(screen.getByRole('combobox')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Gerar relatório PDF/i })).toBeInTheDocument()
    })
})
