import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * O nas acceptance test: encodes ABOUT-01 (a parent can open /o-nas and read
 * Misja, Wartości, Plan dnia, Kadra, Nasze miejsce) plus the phase decisions
 * D-01 (section order), D-02 (collective kadra, no profiles/photos), D-03
 * (plan dnia shared verbatim with the homepage), D-04 (environment-only
 * facility images with informative alt), D-08 (narrative fields emit no block
 * headings) and the WCAG 2.1 AA baseline (SITE-04).
 *
 * Do NOT weaken these assertions to make the suite pass; they are the
 * executable acceptance criteria and change only in lockstep with an approved
 * UI-SPEC amendment.
 *
 * Authoritative copy: 02-UI-SPEC.md (Copywriting Contract, /o-nas).
 */

// D-03: the plan-dnia rows must be byte-identical on the homepage and /o-nas
// because both read the single migrated source (day-plan.json). Collect the
// rendered rows from the shared DayPlan component on a given page.
async function dayPlanRows(page: Page): Promise<{ time: string; what: string }[]> {
	const items = page.locator('.dayplan .panel li');
	const count = await items.count();
	const rows: { time: string; what: string }[] = [];
	for (let i = 0; i < count; i++) {
		const time = (await items.nth(i).locator('.time').innerText()).trim();
		const what = (await items.nth(i).locator('.what').innerText()).trim();
		rows.push({ time, what });
	}
	return rows;
}

test.describe('O nas: Phase 2 acceptance', () => {
	test('route resolves with a 200 and a single Polish h1 (ABOUT-01)', async ({ page }) => {
		const response = await page.goto('/o-nas');
		expect(response?.status()).toBe(200);
		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('O nas');
	});

	test('renders the five section headings in order (D-01)', async ({ page }) => {
		await page.goto('/o-nas');
		await expect(page.getByRole('heading', { name: 'Nasza misja' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Nasze wartości' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Nasz dzień w żłobku' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Nasza kadra' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Nasze miejsce' })).toBeVisible();
	});

	test('kadra shows a collective headcount by role, no individual profiles (D-02)', async ({
		page
	}) => {
		await page.goto('/o-nas');
		await expect(page.getByText('opiekunki', { exact: false })).toBeVisible();
		await expect(page.getByText('personel pomocniczy', { exact: false })).toBeVisible();
	});

	test('every facility image carries a non-empty informative alt (D-04)', async ({ page }) => {
		await page.goto('/o-nas');
		const imgs = page.locator('section[aria-labelledby="obiekt-heading"] img');
		const count = await imgs.count();
		expect(count).toBeGreaterThan(0);
		for (let i = 0; i < count; i++) {
			const alt = await imgs.nth(i).getAttribute('alt');
			expect((alt ?? '').trim().length).toBeGreaterThan(0);
		}
	});

	test('plan dnia is byte-identical to the homepage (D-03 shared source)', async ({ page }) => {
		await page.goto('/');
		const homeRows = await dayPlanRows(page);
		await page.goto('/o-nas');
		const aboutRows = await dayPlanRows(page);
		expect(aboutRows.length).toBeGreaterThan(0);
		expect(aboutRows).toEqual(homeRows);
	});

	test('narrative fields inject no block headings into the page (D-08)', async ({ page }) => {
		await page.goto('/o-nas');
		await expect(page.locator('main h4, main h5, main h6')).toHaveCount(0);
	});

	test('emits Polish per-route SEO metadata with noindex (D-11)', async ({ page }) => {
		await page.goto('/o-nas');
		await expect(page).toHaveTitle(/O nas/);
		await expect(page.locator('head meta[name="robots"]')).toHaveAttribute('content', 'noindex');
	});

	test('no WCAG 2.1 AA violations (SITE-04 / A11Y baseline)', async ({ page }) => {
		await page.goto('/o-nas');
		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();
		expect(results.violations).toEqual([]);
	});
});
