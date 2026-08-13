import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Aktualności list acceptance test: encodes NEWS-01 (a visitor can view a list
 * of news posts, newest first) plus the WCAG 2.1 AA baseline (SITE-04) for the
 * /aktualnosci route.
 *
 * Contract highlights (03-UI-SPEC.md /aktualnosci composition, 03-01-PLAN.md):
 * - exactly one h1 "Aktualności"; cards sit under an h2 section wrapper so no
 *   heading level is skipped (Pitfall 5);
 * - posts render newest-first, sorted by publication date descending (NEWS-01);
 * - the whole card is one link to /aktualnosci/{slug} where slug is the on-disk
 *   JSON filename minus .json (D-06/D-07/D-08).
 *
 * Single-post cases land in Plan 02. Do NOT weaken these assertions to make the
 * suite pass; they are the executable acceptance criteria and change only in
 * lockstep with an approved UI-SPEC amendment.
 */

test.describe('Aktualności: NEWS-01 list acceptance', () => {
	test('strona /aktualnosci odpowiada statusem 200', async ({ page }) => {
		const response = await page.goto('/aktualnosci');
		expect(response?.status()).toBe(200);
	});

	test('dokładnie jeden nagłówek h1 o treści Aktualności', async ({ page }) => {
		await page.goto('/aktualnosci');
		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Aktualności');
	});

	test('wpisy renderują się od najnowszego (NEWS-01)', async ({ page }) => {
		await page.goto('/aktualnosci');
		const titles = await page.locator('a.news-card h3').allTextContents();
		expect(titles.length).toBeGreaterThan(0);
		const newestIndex = titles.indexOf('Wielkie otwarcie żłobka: 14 sierpnia!');
		const olderIndex = titles.indexOf('Witamy na nowej stronie żłobka');
		expect(newestIndex).toBeGreaterThanOrEqual(0);
		expect(olderIndex).toBeGreaterThanOrEqual(0);
		expect(newestIndex).toBeLessThan(olderIndex);
	});

	test('każdy kafelek to link do /aktualnosci/{slug}, najnowszy do wpisu z 2026-08-01 (D-06/D-07/D-08)', async ({
		page
	}) => {
		await page.goto('/aktualnosci');
		const cards = page.locator('a.news-card');
		const count = await cards.count();
		expect(count).toBeGreaterThan(0);
		for (let i = 0; i < count; i++) {
			const href = await cards.nth(i).getAttribute('href');
			expect(href).toMatch(/^\/aktualnosci\//);
		}
		await expect(cards.first()).toHaveAttribute(
			'href',
			'/aktualnosci/2026-08-01-wielkie-otwarcie-zlobka'
		);
	});

	test('brak naruszeń WCAG 2.1 AA (SITE-04 / A11Y baseline)', async ({ page }) => {
		await page.goto('/aktualnosci');
		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();
		expect(results.violations).toEqual([]);
	});
});

/**
 * Single-post acceptance test: encodes NEWS-02 (a visitor can open a post and
 * read its full body) plus the D-08 unknown-slug 404 and the WCAG 2.1 AA
 * baseline for the /aktualnosci/[slug] route. Landed in Plan 02; do NOT weaken
 * these assertions to make the suite pass.
 */

const SEED_SLUG = '2026-08-01-wielkie-otwarcie-zlobka';

test.describe('Aktualności: NEWS-02 single post', () => {
	test('wpis /aktualnosci/{slug} odpowiada statusem 200', async ({ page }) => {
		const response = await page.goto(`/aktualnosci/${SEED_SLUG}`);
		expect(response?.status()).toBe(200);
	});

	test('dokładnie jeden nagłówek h1 z tytułem wpisu', async ({ page }) => {
		await page.goto(`/aktualnosci/${SEED_SLUG}`);
		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Wielkie otwarcie/);
	});

	test('data wpisu jest maszynowo-czytelna w elemencie time (datetime = 2026-08-01)', async ({
		page
	}) => {
		await page.goto(`/aktualnosci/${SEED_SLUG}`);
		await expect(page.locator('time').first()).toHaveAttribute('datetime', '2026-08-01');
	});

	test('pełna treść wpisu jest widoczna (NEWS-02)', async ({ page }) => {
		await page.goto(`/aktualnosci/${SEED_SLUG}`);
		await expect(page.getByText('uroczyste otwarcie Publicznego Żłobka w Stromcu')).toBeVisible();
	});

	test('link powrotny "Wszystkie aktualności" prowadzi do /aktualnosci', async ({ page }) => {
		await page.goto(`/aktualnosci/${SEED_SLUG}`);
		const back = page.getByRole('link', { name: 'Wszystkie aktualności' });
		await expect(back).toHaveAttribute('href', '/aktualnosci');
	});

	test('nieznany slug zwraca 404 (D-08)', async ({ page }) => {
		const response = await page.goto('/aktualnosci/nie-ma-takiego');
		expect(response?.status()).toBe(404);
		// WR-04: the error response must ship a non-empty Polish document title
		// (WCAG 2.4.2, Level A), not the raw URL.
		const documentTitle = await page.title();
		expect(documentTitle).not.toBe('');
		expect(documentTitle).toMatch(/Nie znaleziono strony/);
	});

	test('brak naruszeń WCAG 2.1 AA na stronie wpisu (SITE-04 / A11Y baseline)', async ({ page }) => {
		await page.goto(`/aktualnosci/${SEED_SLUG}`);
		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();
		expect(results.violations).toEqual([]);
	});
});
