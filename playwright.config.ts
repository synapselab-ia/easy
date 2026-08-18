import { defineConfig, devices } from '@playwright/test';

const recoveryNow = new Date().toISOString();

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:5173/easy/',
        trace: 'on-first-retry',
        storageState: {
            cookies: [],
            origins: [
                {
                    origin: 'http://localhost:5173',
                    localStorage: [
                        {
                            name: 'easy.recoveryHealth.v1',
                            value: JSON.stringify({
                                version: 1,
                                setupVerifiedAt: recoveryNow,
                                lastExportedAt: recoveryNow,
                                lastFilename: 'easy-backup-v2-e2e-fixture.json',
                            }),
                        },
                    ],
                },
            ],
        },
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:5173/easy/',
        reuseExistingServer: !process.env.CI,
    },
});
