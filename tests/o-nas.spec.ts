import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { odmienRzeczownik } from '../src/lib/liczebniki';
import { FORMY_OPIEKUNKI, FORMY_PERSONELU, KADRA } from '../src/lib/content/kadra';
import { MIEJSCE } from '../src/lib/content/miejsce';

/** The o-nas store, read off disk rather than imported, so the two headcount assertions
 *  below compare against the BYTES that ship. Same reason tests/zastepcze.unit.ts reads
 *  rather than imports. */
const oNas = JSON.parse(
	readFileSync(new URL('../src/lib/content/o-nas.json', import.meta.url), 'utf8')
) as { kadra_opiekunki: number; kadra_personel: number };

/**
 * O nas acceptance test: encodes ABOUT-01 (a parent can open /o-nas and read
 * Misja, Wartości, Plan dnia, Kadra and the gallery of the żłobek) plus the
 * phase decisions
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
		// Section 6 is now the gallery (05-UI-SPEC Contract 1, which supersedes
		// 02-UI-SPEC.md:107 and :109-115). The section KEEPS its position in the order; only
		// its heading and its contents changed, and the full gallery contract lives in
		// tests/galeria.spec.ts.
		await expect(page.getByRole('heading', { name: 'Galeria: nasze miejsce' })).toBeVisible();
	});

	// D-02 AMENDED 2026-08-18. The żłobek sent the names of its four staff in a message
	// about website content, and they are published as a plain list. What D-02 actually
	// protects is unchanged and is now asserted DIRECTLY rather than implied by the
	// absence of names: no staff photographs, and no per-person page to click through to.
	// The old assertion („exactly two stat tiles") was neither of those things; it was a
	// count of what the section happened to contain in August 2026.
	test('kadra lists the team without photographs or per-person profiles (D-02)', async ({
		page
	}) => {
		await page.goto('/o-nas');
		const kadra = page.locator('section[aria-labelledby="kadra-heading"]');

		// The four names the żłobek asked us to publish, read from the module the page
		// renders rather than retyped, so a fifth hire is a one-line change in one file.
		const pozycje = kadra.locator('.kadra li');
		await expect(pozycje).toHaveCount(KADRA.length);
		for (const [i, osoba] of KADRA.entries()) {
			await expect(pozycje.nth(i).locator('.osoba-imie')).toHaveText(osoba.imie);
		}

		// THE TWO PROPERTIES D-02 IS ABOUT. A staff photograph would need a wizerunek
		// consent record that does not exist, and a link out of this section is how a
		// „profile page" would first appear.
		await expect(kadra.locator('img')).toHaveCount(0);
		await expect(kadra.locator('a')).toHaveCount(0);
	});

	test('each kadra headcount that renders declines its label correctly (02-UI-SPEC 2026-08-16)', async ({
		page
	}) => {
		await page.goto('/o-nas');
		const staty = page.locator('section[aria-labelledby="kadra-heading"] .stat');

		// A TILE PER NON-ZERO COUNT, never a fixed number of tiles. Both counts are CMS
		// values and the page hides a zero one, because „0 osób personelu pomocniczego"
		// publishes an absence as though it were a fact. So the expected tiles are derived
		// from the store, which also means an editor filling the second number in on
		// /admin/o-nas does not turn this red.
		const oczekiwane = [
			{ liczba: oNas.kadra_opiekunki, formy: FORMY_OPIEKUNKI },
			{ liczba: oNas.kadra_personel, formy: FORMY_PERSONELU }
		].filter((wpis) => wpis.liczba > 0);
		await expect(staty).toHaveCount(oczekiwane.length);

		// The labels are DERIVED from the counts (02-UI-SPEC amendment 2026-08-16), so this
		// reads the number the page actually rendered and demands the form Polish requires
		// for it. Pinning a literal here would make an ordinary CMS edit („6" to „2") turn
		// the suite red while the page stayed correct, and would equally have accepted the
		// „6 opiekunki" the amendment fixes.
		for (const [i, wpis] of oczekiwane.entries()) {
			const stat = staty.nth(i);
			const liczba = Number((await stat.locator('.stat-value').innerText()).trim());
			expect(Number.isInteger(liczba), 'headcount must render a whole number').toBe(true);
			expect(liczba).toBe(wpis.liczba);
			await expect(stat.locator('.stat-label')).toHaveText(odmienRzeczownik(liczba, wpis.formy));
		}
	});

	// The five facility descriptions the żłobek sent on 2026-08-18. Read from the module,
	// so this case proves that every block reaches the page and none is silently dropped,
	// without becoming a second copy of the copy.
	test('nasze miejsce renders every block the żłobek sent (2026-08-18)', async ({ page }) => {
		await page.goto('/o-nas');
		const sekcja = page.locator('section[aria-labelledby="miejsce-heading"]');
		const karty = sekcja.locator('.miejsce-card');
		await expect(karty).toHaveCount(MIEJSCE.length);
		for (const [i, blok] of MIEJSCE.entries()) {
			await expect(karty.nth(i).locator('h3')).toHaveText(blok.tytul);
			await expect(karty.nth(i).locator('p')).toHaveText(blok.opis);
		}
	});

	test('every facility image carries a non-empty informative alt (D-04)', async ({ page }) => {
		await page.goto('/o-nas');
		// The facility photographs moved into the gallery section (05-UI-SPEC Contract 1), so
		// they are located through that section's OWN labelling. The heading id this section
		// used to carry was retired with the heading it named, and its absence is asserted in
		// tests/galeria.spec.ts rather than named here (repository rule 04-02: a comment must
		// not make the grep enforcing a removal report a permanent false positive).
		const imgs = page.locator('section[aria-labelledby="galeria-heading"] img');
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
