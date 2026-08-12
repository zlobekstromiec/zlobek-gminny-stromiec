import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Privacy-policy stub acceptance (UI-SPEC Amendment v1.1 §6).
 *
 * The footer's legally-expected „Polityka prywatności (RODO)" link must resolve
 * (never 404) from day one; the full RODO policy is authored in Phase 6. Mirrors
 * the Deklaracja dostępności stub contract: prerendered 200, single h1, noindex,
 * axe-clean.
 */

test.describe('Polityka prywatności — stub', () => {
	test('route resolves with a 200 and a single Polish h1', async ({ page }) => {
		const response = await page.goto('/polityka-prywatnosci');
		expect(response?.status()).toBe(200);
		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.getByRole('heading', { name: 'Polityka prywatności (RODO)' })).toBeVisible();
	});

	test('stub stays noindex while placeholder (D-11)', async ({ page }) => {
		await page.goto('/polityka-prywatnosci');
		await expect(page.locator('head meta[name="robots"]')).toHaveAttribute('content', 'noindex');
	});

	test('no WCAG 2.1 AA violations', async ({ page }) => {
		await page.goto('/polityka-prywatnosci');
		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();
		expect(results.violations).toEqual([]);
	});
});
