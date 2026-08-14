import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E / a11y config. Phase 1 homepage acceptance gate (D-09).
 *
 * The `webServer` block builds the SvelteKit app and serves the production
 * preview so the axe scan runs against the real prerendered output (not the
 * dev server). `reuseExistingServer` keeps local reruns fast but forces a
 * clean build in CI.
 *
 * Phase 4 switches the command from `preview` to `preview:test`. That script is
 * plain `wrangler pages dev` plus `--binding` flags carrying Cloudflare's
 * always-pass dummy Turnstile secret and FORM_DRY_RUN=1, so the form endpoints
 * run their full real pipeline on the real Cloudflare runtime without ever
 * sending mail. The flags deliberately replace a root `.dev.vars` file: wrangler
 * writes every `.dev.vars` key into the committed worker-configuration.d.ts, and
 * Cloudflare Pages CI has no such file, so `wrangler types --check` would fail
 * the deploy (see .dev.vars.example).
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
		command: 'npm run build && npm run preview:test',
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
