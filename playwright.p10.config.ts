import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.P10_CANDIDATE_URL;

if (!baseURL) {
    throw new Error('P10_CANDIDATE_URL is required for the P10-S1-I2 rehearsal.');
}

export default defineConfig({
    testDir: './tests/p10',
    fullyParallel: false,
    forbidOnly: true,
    retries: 0,
    workers: 1,
    timeout: 120_000,
    expect: {
        timeout: 15_000,
    },
    reporter: 'list',
    use: {
        baseURL,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
