import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Homepage acceptance test: encodes HOME-01, HOME-02 and the WCAG 2.1 AA
 * baseline (SITE-04) for Phase 1 plus the 01.1 merged design (UI-SPEC
 * Amendments v1.1/v1.2).
 *
 * Do NOT weaken these assertions to make the suite pass; they are the
 * executable acceptance criteria and change only in lockstep with an
 * approved UI-SPEC amendment.
 *
 * Authoritative copy: 01-UI-SPEC.md (incl. amendments) + PROJECT.md line 47
 * (verbatim core message, final client copy per CONTEXT D-02).
 */

// VERBATIM core message: exact-equality guards character-for-character fidelity,
// including its typographic quotes and em dash (byte-exempt from the copy rules).
const FULL_CORE_MESSAGE =
	'„Drogi Rodzicu, Kiedy Ty będziesz realizować swoje obowiązki, my będziemy czuwać nad każdym krokiem Twojej pociechy. Będziemy cierpliwie ocierać łzy, kołysać do snu i z autentycznym zachwytem świętować każde małe zwycięstwo — od samodzielnie zjedzonej zupki po pierwszy, odważny krok."';

test.describe('Homepage: Phase 1 + 01.1 acceptance', () => {
	test('served document declares Polish language (SITE-06, D-10)', async ({ page }) => {
		await page.goto('/');
		const lang = await page.locator('html').getAttribute('lang');
		expect(lang).toBe('pl');
	});

	test('hero leads with sentence 2 of the core message (HOME-01)', async ({ page }) => {
		await page.goto('/');
		// The sentence renders twice (hero lead + full blockquote): scope to the hero.
		await expect(
			page.locator('section.hero').getByText('będziemy czuwać nad każdym krokiem', { exact: false })
		).toBeVisible();
	});

	test('full verbatim core message renders in the O-nas blockquote (HOME-01)', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('blockquote.core-message')).toHaveText(FULL_CORE_MESSAGE);
	});

	test('two-tone hook headline is the single h1 (SITE-02)', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(
			'Radosny start dla najmłodszych'
		);
	});

	test('primary CTA "Zapisz dziecko" links to /rekrutacja (HOME-02)', async ({ page }) => {
		await page.goto('/');
		const cta = page.getByRole('link', { name: 'Zapisz dziecko' });
		await expect(cta).toBeVisible();
		await expect(cta).toHaveAttribute('href', '/rekrutacja');
	});

	// LOCKSTEP CHANGE (Amendment v1.1 §1): the homepage NewsPreview is realigned to
	// surface the three newest posts from the shared `aktualnosci` reader (03-UI-SPEC.md
	// „Homepage NewsPreview realignment"). This UI-SPEC amendment is the approved change
	// that authorizes editing these assertions: the old absence assertions (no news
	// section while the stub was empty) are replaced by presence assertions now that a
	// seeded collection reaches the homepage. Same lockstep discipline as the D-18 note.
	test('Aktualności section surfaces the newest posts on the homepage (HOME-02, NEWS-01)', async ({
		page
	}) => {
		await page.goto('/');
		const news = page.locator('section.news');
		// The NewsPreview section heading now renders (the empty stub is gone).
		await expect(news.getByRole('heading', { name: 'Aktualności' })).toBeVisible();
		// exact: true so this targets ONLY the news CTA („Zobacz wszystkie"); the
		// recruitment docs panel owns a distinct „Zobacz wszystkie dokumenty" see-all
		// link (D-18) that must not be matched here. It takes the parent to /aktualnosci.
		await expect(page.getByRole('link', { name: 'Zobacz wszystkie', exact: true })).toHaveAttribute(
			'href',
			'/aktualnosci'
		);
		// The newest seeded post surfaces on the homepage.
		await expect(news.getByText('Wielkie otwarcie żłobka: 14 sierpnia!')).toBeVisible();
		// Its card is a whole-card link into the single-post page (Plan 02).
		await expect(
			news.locator('a[href="/aktualnosci/2026-08-01-wielkie-otwarcie-zlobka"]')
		).toBeVisible();
		// Curated homepage subset: at most the three newest posts (3-column grid).
		const cardCount = await news.locator('a.news-card').count();
		expect(cardCount).toBeGreaterThan(0);
		expect(cardCount).toBeLessThanOrEqual(3);
	});

	test('TopBar surfaces phone and opening hours on every viewport', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('Czynne:', { exact: false })).toBeVisible();
	});

	test('exactly three tel links: TopBar, hero phone line, contact card', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('a[href^="tel:"]')).toHaveCount(3);
	});

	test('key-facts strip answers the arrival questions', async ({ page }) => {
		await page.goto('/');
		const facts = page.locator('section[aria-label="Najważniejsze informacje"]');
		await expect(facts.locator('.fact-label')).toHaveCount(4);
		await expect(facts.getByText('10 mies. – 3 lata')).toBeVisible();
		await expect(facts.getByText('wyżywienie 14 zł/dzień', { exact: false })).toBeVisible();
	});

	test('perks band renders four value cards', async ({ page }) => {
		await page.goto('/');
		await expect(
			page.getByRole('heading', { name: 'Dlaczego rodzice nas wybierają?' })
		).toBeVisible();
		await expect(page.locator('.perk-card')).toHaveCount(4);
	});

	// LOCKSTEP CHANGE (D-18): the homepage docs panel is realigned to the real BIP
	// set and re-sourced from the shared `dokumenty` collection (02-UI-SPEC.md
	// „Homepage Recruitment docs-panel realignment"). This UI-SPEC amendment is the
	// approved copy change that authorizes editing these assertions: the old count
	// (6) and the „Karta zgłoszenia dziecka" name are replaced by the curated
	// two-row subset and the real name „Wniosek o przyjęcie dziecka". The
	// meta-inside-the-link (WCAG) assertion is preserved, only its shape changes.
	test('recruitment module: heading, four steps, curated BIP docs panel (HOME-02, D-18)', async ({
		page
	}) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Nabór na rok 2026/2027 trwa' })).toBeVisible();
		await expect(page.locator('.step')).toHaveCount(4);
		// Curated subset: exactly the two real rekrutacja documents from the shared
		// collection (Wniosek o przyjęcie dziecka, Regulamin rekrutacji). The three
		// non-BIP docs (Regulamin organizacyjny, Upoważnienie do odbioru dziecka,
		// Oświadczenia RODO) are dropped (D-18).
		await expect(page.locator('.doc-row')).toHaveCount(2);
		// File meta must live INSIDE the link so it is announced with the name; the
		// row carries the real BIP name plus its computed „... wersja z ..." meta.
		await expect(
			page.getByRole('link', { name: /Wniosek o przyjęcie dziecka[\s\S]*wersja z/ })
		).toBeVisible();
		// A see-all link takes the parent to the full documents page.
		await expect(page.getByRole('link', { name: 'Zobacz wszystkie dokumenty' })).toHaveAttribute(
			'href',
			'/dokumenty'
		);
	});

	test('day plan panel renders the daily schedule', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Nasz dzień w żłobku' })).toBeVisible();
	});

	test('contact section owns the single mailto and the safe directions link (HOME-02)', async ({
		page
	}) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Kontakt i dojazd' })).toBeVisible();
		await expect(page.locator('a[href="mailto:zlobek@ugstromiec.pl"]')).toHaveCount(1);
		const directions = page.getByRole('link', { name: /Wyznacz trasę/ });
		await expect(directions).toHaveAttribute('href', /openstreetmap\.org\/directions/);
		await expect(directions).toHaveAttribute('target', '_blank');
		const rel = (await directions.getAttribute('rel')) ?? '';
		expect(rel).toContain('noopener');
		expect(rel).toContain('noreferrer');
	});

	test('emits Polish per-route SEO metadata with noindex (D-10, D-11)', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveTitle(/Żłobek Gminny w Stromcu/);
		await expect(page.locator('head meta[name="description"]')).toHaveAttribute('content', /.+/);
		await expect(page.locator('head link[rel="canonical"]')).toHaveCount(1);
		await expect(page.locator('head meta[property="og:image"]')).toHaveCount(1);
		await expect(page.locator('head meta[name="robots"]')).toHaveAttribute('content', 'noindex');
	});

	test('no WCAG 2.1 AA violations (SITE-04 / A11Y baseline)', async ({ page }) => {
		await page.goto('/');
		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();
		expect(results.violations).toEqual([]);
	});
});
