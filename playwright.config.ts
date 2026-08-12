import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E / a11y config — Phase 1 homepage acceptance gate (D-09).
 *
 * The `webServer` block builds the SvelteKit app and serves the production
 * preview so the axe scan runs against the real prerendered output (not the
 * dev server). `reuseExistingServer` keeps local reruns fast but forces a
 * clean build in CI.
 *
 * Source: @axe-core/playwright README pattern + 01-RESEARCH.md §Validation Architecture.
 */
export default defineConfig({
	testDir: 'tests',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	reporter: 'list',
	use: {
		baseURL: 'http://localhost:4173',
		trace: 'on-first-retry'
	},
	webServer: {
		command: 'npm run build && npm run preview',
		url: 'http://localhost:4173',
		reuseExistingServer: !process.env.CI,
		timeout: 120_000
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	]
});
