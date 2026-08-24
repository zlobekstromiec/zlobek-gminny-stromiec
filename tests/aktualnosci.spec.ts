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

	// Asserted as a PROPERTY of the rendered dates, never by naming two posts. The previous
	// version looked up two literal titles and their positions, so it went red whenever the
	// żłobek edited a headline and it proved nothing about a third post. This reads the
	// machine-readable `datetime` off every card in DOM order and asserts the sequence never
	// ascends, which IS requirement NEWS-01 and stays true for any content.
	test('wpisy renderują się od najnowszego (NEWS-01)', async ({ page }) => {
		await page.goto('/aktualnosci');
		const daty = await page
			.locator('a.news-card time')
			.evaluateAll((czasy) => czasy.map((czas) => czas.getAttribute('datetime') ?? ''));
		expect(daty.length).toBeGreaterThan(0);
		expect(daty.every((data) => /^\d{4}-\d{2}-\d{2}$/.test(data))).toBe(true);
		// ISO dates sort lexicographically, so a plain copy-and-sort is the whole check.
		expect(daty).toEqual([...daty].sort().reverse());
	});

	test('każdy kafelek to link do /aktualnosci/{slug}, a pierwszy prowadzi do najnowszego wpisu (D-06/D-07/D-08)', async ({
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
		// The slug is the on-disk filename, which is date prefixed, so the newest card's own
		// date must be the one its href carries. Ties the link to the ordering above without
		// either test knowing which post is newest today.
		const pierwszaData = await cards.first().locator('time').getAttribute('datetime');
		const pierwszyHref = await cards.first().getAttribute('href');
		expect(pierwszyHref).toContain(pierwszaData ?? 'brak-daty');
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

/** The newest post's slug and date, READ OFF THE LIST PAGE rather than written down here.
 *
 *  A literal seed slug pinned this suite to whichever post happened to be first on the day
 *  it was written, so renaming or replacing that post turned five tests red for a reason
 *  that had nothing to do with the requirement under test. What NEWS-02 actually claims is
 *  „a visitor can open a post from the list and read it", and that is what this derives. */
async function najnowszyWpis(page: import('@playwright/test').Page) {
	await page.goto('/aktualnosci');
	const karta = page.locator('a.news-card').first();
	const href = await karta.getAttribute('href');
	const tytul = await karta.locator('h3').textContent();
	const data = await karta.locator('time').getAttribute('datetime');
	expect(href).toMatch(/^\/aktualnosci\/.+/);
	return { href: href ?? '', tytul: (tytul ?? '').trim(), data: data ?? '' };
}

test.describe('Aktualności: NEWS-02 single post', () => {
	test('wpis /aktualnosci/{slug} odpowiada statusem 200', async ({ page }) => {
		const { href } = await najnowszyWpis(page);
		const response = await page.goto(href);
		expect(response?.status()).toBe(200);
	});

	// The h1 must be the title the LIST promised, which is the real contract between the two
	// pages. Pinning a literal only proved that one post still existed.
	test('dokładnie jeden nagłówek h1 z tytułem wpisu', async ({ page }) => {
		const { href, tytul } = await najnowszyWpis(page);
		await page.goto(href);
		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(tytul);
	});

	test('data wpisu jest maszynowo-czytelna w elemencie time i zgodna z listą', async ({ page }) => {
		const { href, data } = await najnowszyWpis(page);
		await page.goto(href);
		await expect(page.locator('time').first()).toHaveAttribute('datetime', data);
	});

	test('pełna treść wpisu jest widoczna (NEWS-02)', async ({ page }) => {
		const { href } = await najnowszyWpis(page);
		await page.goto(href);
		// „There is a rendered body", not „the body says this sentence": the second is a copy
		// assertion wearing a rendering assertion's clothes.
		const tresc = page.locator('.prose').first();
		await expect(tresc).toBeVisible();
		expect(((await tresc.textContent()) ?? '').trim().length).toBeGreaterThan(80);
	});

	test('link powrotny "Wszystkie aktualności" prowadzi do /aktualnosci', async ({ page }) => {
		const { href } = await najnowszyWpis(page);
		await page.goto(href);
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
		const { href } = await najnowszyWpis(page);
		await page.goto(href);
		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();
		expect(results.violations).toEqual([]);
	});
});
