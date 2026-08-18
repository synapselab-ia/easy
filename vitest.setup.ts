import '@testing-library/jest-dom'
import { beforeEach } from 'vitest'

const RECOVERY_HEALTH_STORAGE_KEY = 'easy.recoveryHealth.v1'

beforeEach(() => {
    const now = new Date().toISOString()
    localStorage.setItem(RECOVERY_HEALTH_STORAGE_KEY, JSON.stringify({
        version: 1,
        setupVerifiedAt: now,
        lastExportedAt: now,
        lastFilename: 'easy-backup-v2-test-fixture.json',
    }))
})

// jsdom doesn't implement matchMedia — mock it globally for all tests
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => { },
        removeListener: () => { },
        addEventListener: () => { },
        removeEventListener: () => { },
        dispatchEvent: () => false,
    }),
});

class ResizeObserverMock {
    observe() { }
    unobserve() { }
    disconnect() { }
}

Object.defineProperty(globalThis, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: ResizeObserverMock,
});

Object.defineProperty(Element.prototype, 'scrollIntoView', {
    writable: true,
    configurable: true,
    value: () => { },
});
