import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Homepage acceptance test — encodes HOME-01, HOME-02 and the WCAG 2.1 AA
 * baseline (SITE-04) for Phase 1.
 *
 * This is authored RED in Plan 01: the homepage is only composed in Plan 03,
 * so the content assertions fail until then. Do NOT weaken these assertions to
 * make the suite pass early — they are the executable acceptance criteria.
 *
 * Authoritative copy: 01-UI-SPEC.md §Copywriting Contract + PROJECT.md line 47
 * (verbatim core message, treated as final client copy per CONTEXT D-02).
 */

test.describe('Homepage — Phase 1 acceptance', () => {
	test('served document declares Polish language (SITE-06, D-10)', async ({ page }) => {
		await page.goto('/');
		const lang = await page.locator('html').getAttribute('lang');
		expect(lang).toBe('pl');
	});

	test('hero contains the verbatim core message (HOME-01)', async ({ page }) => {
		await page.goto('/');
		// Verbatim substring from the żłobek's 4-sentence core message (PROJECT.md line 47).
		await expect(
			page.getByText('będziemy czuwać nad każdym krokiem', { exact: false })
		).toBeVisible();
	});

	test('primary CTA "Zapisz dziecko" links to /rekrutacja (HOME-02)', async ({ page }) => {
		await page.goto('/');
		const cta = page.getByRole('link', { name: 'Zapisz dziecko' });
		await expect(cta).toBeVisible();
		await expect(cta).toHaveAttribute('href', '/rekrutacja');
	});

	test('Aktualności empty-state heading is present (HOME-02)', async ({ page }) => {
		await page.goto('/');
		await expect(
			page.getByRole('heading', { name: 'Wkrótce pojawią się aktualności' })
		).toBeVisible();
	});

	test('quick-contact exposes a mailto link to the żłobek inbox (HOME-02)', async ({ page }) => {
		await page.goto('/');
		await expect(
			page.locator('a[href="mailto:zlobek@ugstromiec.pl"]')
		).toBeVisible();
	});

	test('no WCAG 2.1 AA violations (SITE-04 / A11Y baseline)', async ({ page }) => {
		await page.goto('/');
		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();
		expect(results.violations).toEqual([]);
	});
});
