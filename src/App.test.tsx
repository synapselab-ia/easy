import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App Integration Tests', () => {
    it('navigates to the resellers page when the link is clicked', async () => {
        window.history.pushState({}, '', '/easy/')
        render(<App />)

        expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()

        fireEvent.click(screen.getAllByRole('link', { name: 'Revendedores' })[0])
        expect(await screen.findByRole('heading', { name: 'Revendedores' })).toBeInTheDocument()
    })
})
