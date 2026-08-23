import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { keyFacts, recruitment } from '../src/lib/content/site';
import { CENNIK } from '../src/lib/cennik';

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

	test('TopBar surfaces opening hours on every viewport', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('Czynne:', { exact: false })).toBeVisible();
	});

	// THREE tel links until 2026-08-18, ZERO after. The count was a real contract while
	// the site published a number: it pinned exactly which three surfaces were allowed to
	// linkify it, so a fourth appearing anywhere turned the suite red. The żłobek asked
	// for the number to come off until it has its own line (site.ts), and the contract
	// that replaces it is the strictest version of the same idea. When a number returns,
	// this goes back to a count and names the surfaces again.
	test('nie ma ani jednego odnosnika tel: na stronie glownej (2026-08-18)', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
	});

	// LOCKSTEP CHANGE (D-05, D-09): the placeholder facts are replaced by the
	// [BIP]-confirmed values from .planning/dane-bip-zlobek-stromiec.md (statut age
	// range; uchwała XXIII.134.2026 fee). The VALUES were corrected, the matchers were
	// not relaxed: the count assertion is untouched and the fee assertions are now
	// STRONGER, because they additionally pin the dane-bip §10.1 hard gate that the
	// zero amount may never appear without the ZUS „Aktywnie w żłobku" condition.
	//
	// SECOND LOCKSTEP CHANGE (05-UI-SPEC Contract 7, plan 05-09). Two of these four tiles
	// became EDITOR-OWNED and a third became COMPUTED, so the asymmetry this file used to
	// carry is now decided PER SURFACE rather than for the whole strip:
	//
	//  • the hours, the number of places and the payable amount are INTERPOLATED from the
	//    modules that own them. A retyped assertion would turn a routine „the żłobek changed
	//    its opening hours" save into a red build, which is a test punishing the feature it
	//    was written to protect.
	//  • the fee tile's SUFFIX stays RETYPED. Its exact shape is the safety property: the
	//    zero figure may appear only inside the same string as the ZUS condition
	//    (dane-bip §10, item 1). Interpolating it would assert that the suffix equals
	//    itself, which is no assertion at all.
	test('key-facts strip answers the arrival questions', async ({ page }) => {
		await page.goto('/');
		const facts = page.locator('section[aria-label="Najważniejsze informacje"]');
		await expect(facts.locator('.fact-label')).toHaveCount(4);

		// FIXED ARITY (05-UI-SPEC Contract 11): exactly four tiles, walked BY POSITION,
		// because from plan 05-09 the label is a value the store could in principle disagree
		// about and the position is what the locked desktop grid is built on.
		const kafelki = facts.locator('li.fact');
		await expect(kafelki).toHaveCount(4);
		for (const [indeks, fakt] of keyFacts.entries()) {
			const kafelek = kafelki.nth(indeks);
			await expect(kafelek.locator('.fact-label')).toHaveText(fakt.label);
			await expect(kafelek.locator('.fact-value')).toHaveText(fakt.value);
			if (fakt.suffix !== undefined) {
				await expect(kafelek.locator('.fact-note')).toHaveText(fakt.suffix);
			}
		}

		// Wiek: code-authored, statutory and stated a second time in the recruitment info
		// card, which is why 05-UI-SPEC Contract 7 keeps it out of the editable set.
		await expect(facts.getByText('od 20. tyg. życia do 3 lat')).toBeVisible();
		await expect(facts.getByText('wyjątkowo do 4 lat')).toBeVisible();

		// Quick 260823-pmv: the tile LEADS with the statutory rate, at the client's request.
		// Both figures still come from the cennik store, so the tile, FeeBox and /cennik
		// cannot disagree about either number.
		await expect(kafelki.nth(2).locator('.fact-value')).toHaveText(CENNIK.stawkaTekst);

		// ...and the payable amount is still on the tile, in the note. This assertion is the
		// reason the label may say „Stawka z uchwały" at all: without the payable figure
		// beside it, the homepage would state a rate nobody pays and stop there.
		await expect(kafelki.nth(2).locator('.fact-note')).toContainText(CENNIK.placiTekst);

		// The zero amount is never unconditional: it is rendered only inside the same
		// string as the ZUS condition (dane-bip §10, item 1). The TAIL is RETYPED on purpose
		// and is unchanged by 260823-pmv; only the payable amount ahead of it is now
		// interpolated from the store instead of being absent.
		await expect(
			facts.getByText(
				'+ wyżywienie maks. 20 zł/dzień; możliwe 0 zł ze świadczeniem ZUS „Aktywnie w żłobku"'
			)
		).toBeVisible();
	});

	// The one value plan 05-09 knowingly leaves in two places: the daily food figure is
	// written into the fee tile's code-authored suffix AND into the wyżywienie sentence an
	// editor owns on /admin/cennik. This is the cheap guard against the two drifting apart,
	// and it is the reason the suffix could not simply be interpolated away.
	test('dzienna stawka wyzywienia z kafelka oplaty wystepuje takze w zdaniu ze sklepu cennika', () => {
		const sufiks = keyFacts[2].suffix ?? '';
		const kwota = sufiks.match(/(\d+)\s*zł\/dzień/u);
		expect(kwota, `sufiks kafelka oplaty nie niesie stawki dziennej: ${sufiks}`).not.toBeNull();
		expect(CENNIK.wyzywienie).toContain(`${kwota?.[1]} zł`);
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
	//
	// LOCKSTEP CHANGE (D-06): the nabór state is no longer a constant. Phase 04.1 put
	// `recruitmentOpen` behind src/lib/content/nabor.json, which an editor flips from
	// /admin, so hard-coding either state's strings here made a routine content save
	// turn this suite red. The assertions now read the SAME derived `recruitment`
	// object the module renders, exactly as tests/rekrutacja.spec.ts already does. The
	// matchers were NOT relaxed: still an exact accessible-name match on a heading
	// role, and the four-step and two-document counts are unchanged.
	test('recruitment module: heading, four steps, curated BIP docs panel (HOME-02, D-18)', async ({
		page
	}) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: recruitment.heading })).toBeVisible();
		// Whichever state is live, the enrolment channel it advertises stays visible.
		await expect(page.getByText(recruitment.deadline)).toBeVisible();
		await expect(page.locator('.step')).toHaveCount(4);
		// D-05: the wniosek is filed in person at the Urząd Gminy. The old step 2 offered
		// an e-mail address and an ePUAP route, both factually wrong.
		await expect(
			page.getByText('Nie ma możliwości złożenia wniosku', { exact: false })
		).toBeVisible();
		await expect(page.getByText('pokój 17', { exact: false })).toBeVisible();
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

	// NEW (CONTACT-02, D-17): the „Mapa pojawi się wkrótce" placeholder is replaced by
	// a committed static snapshot rendered through MapPanel.svelte. These two cases lock
	// the contract in: an informative alt (the map carries information, so it is never
	// decorative) and the mandatory, visible, linked OpenStreetMap attribution.
	test('map panel renders a real snapshot with an informative alt (CONTACT-02)', async ({
		page
	}) => {
		await page.goto('/');
		const mapImg = page.locator('figure.map-figure img');
		await expect(mapImg).toHaveCount(1);
		await expect(mapImg).toBeVisible();
		const alt = (await mapImg.getAttribute('alt')) ?? '';
		expect(alt.trim().length).toBeGreaterThan(0);
		// Intrinsic dimensions ship with the image so the panel causes no layout shift.
		await expect(mapImg).toHaveAttribute('width', /\d+/);
		await expect(mapImg).toHaveAttribute('height', /\d+/);
		// Same-origin asset: no third-party tile request fires when a parent loads the
		// page (locked RODO decision). The src is a hashed local build asset.
		await expect(mapImg).toHaveAttribute('src', /^\/_app\/immutable\/assets\//);
	});

	test('OpenStreetMap attribution is visible and links to the copyright page (D-17)', async ({
		page
	}) => {
		await page.goto('/');
		const attribution = page.locator(
			'figure.map-figure figcaption a[href="https://www.openstreetmap.org/copyright"]'
		);
		await expect(attribution).toHaveCount(1);
		// Mandatory under the OSMF tile policy: never hidden, clipped or collapsed.
		await expect(attribution).toBeVisible();
		await expect(attribution).toContainText('OpenStreetMap');
		await expect(attribution).toHaveAttribute('target', '_blank');
		const rel = (await attribution.getAttribute('rel')) ?? '';
		expect(rel).toContain('noopener');
		expect(rel).toContain('noreferrer');
	});

	test('emits Polish per-route SEO metadata with noindex (D-10, D-11)', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveTitle(/Publiczny Żłobek w Stromcu/);
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
