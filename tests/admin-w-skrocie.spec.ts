import AxeBuilder from '@axe-core/playwright';
import { test, expect, tokenSesji, NAZWA_CIASTKA } from './fixtures/admin';
import {
	KOPIA_LISTY,
	KOPIA_POWLOKA,
	KOPIA_W_SKROCIE,
	KOPIA_WALIDACJA,
	KOPIA_ZAPIS,
	POLA_W_SKROCIE
} from '../src/lib/content/panel';
import { keyFacts } from '../src/lib/content/site';

/**
 * Browser acceptance gate for the W skrócie screen (FEES-01 tail, 05-UI-SPEC Contract 11;
 * 05 D-32, D-33). The screen that finally lets the żłobek change its own opening hours.
 *
 * It runs against the REAL Cloudflare runtime: `playwright.config.ts` builds and serves
 * through `npm run preview:test`, whose bindings include PANEL_DRY_RUN=1.
 *
 * WHAT THIS FILE CANNOT PROVE, and does not pretend to. Under that dry-run flag NO SAVE EVER
 * WRITES A FILE, so any assertion here about what was STORED would pass whatever the
 * underlying rule did. The persistence properties of this screen (the key order, the
 * byte-for-byte serialization, the fixed arity, the reader's fallback) are pinned in
 * tests/admin-walidacja-w-skrocie.unit.ts instead, deliberately and with that note attached.
 * What this file proves is what a browser really can: the screen renders, refuses, links its
 * refusals, and works with scripting switched off.
 *
 * Do NOT weaken these assertions to make the suite pass. Two of them defend properties that
 * are accessibility requirements rather than preferences: the read-only tiles are asserted
 * NOT to be rendered as controls nobody may type into, and both axe scans are AA gates on a
 * public body's system.
 */

const W_SKROCIE = '/admin/w-skrocie';

const ZNACZNIKI = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/** The control name of the hours field, written out rather than imported from the wire
 *  vocabulary: what this suite is about is the name the browser really posts, and a spec
 *  that read it from the same module the page reads it from could not see a rename that only
 *  half landed. */
const POLE_GODZIN_NAZWA = 'godziny';

/** The editing form, scoped so the shell's „Wyloguj" form in the header is never counted as
 *  part of this screen's actions. */
function formularz(page: import('@playwright/test').Page) {
	return page.locator('main form').filter({ has: page.locator(`[name="${POLE_GODZIN_NAZWA}"]`) });
}

test.describe('Ekran W skrócie: kafelki strony glownej (Kontrakt 11)', () => {
	test('ekran odpowiada 200, ma jeden naglowek i cztery grupy pol z widocznymi legendami', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		const odpowiedz = await page.goto(W_SKROCIE);
		expect(odpowiedz?.status()).toBe(200);

		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.locator('h1')).toHaveText(KOPIA_W_SKROCIE.naglowek);
		await expect(page.getByText(KOPIA_W_SKROCIE.lead)).toBeVisible();

		// FIXED ARITY: exactly four groups, one per tile, IN THE ORDER THE TILES RENDER on the
		// front page. The order is asserted rather than the count alone, because four groups
		// in the wrong order is still four groups and would teach an editor the wrong map of
		// their own homepage.
		const grupy = page.locator('main fieldset');
		await expect(grupy).toHaveCount(4);
		const legendy = [
			KOPIA_W_SKROCIE.wiekLegenda,
			KOPIA_W_SKROCIE.godzinyLegenda,
			KOPIA_W_SKROCIE.oplataLegenda,
			KOPIA_W_SKROCIE.miejscaLegenda
		];
		for (const [indeks, legenda] of legendy.entries()) {
			const wlasna = grupy.nth(indeks).locator('legend');
			// Visible, not merely present: a legend hidden for looks is a group with no name
			// for everybody who can see the screen.
			await expect(wlasna).toBeVisible();
			await expect(wlasna).toHaveText(legenda);
		}

		// The back link of Contract 5, and the only way back: this screen has no list.
		await expect(page.getByRole('link', { name: KOPIA_LISTY.powrotPulpit })).toBeVisible();
	});

	test('dwa kafelki sa tylko do wgladu i renderuja sie jako TEKST z podpowiedzia', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(W_SKROCIE);
		const grupy = page.locator('main fieldset');

		// Wiek dzieci: the value the homepage really renders, read from the same module.
		const wiek = grupy.nth(0);
		await expect(wiek.getByText(keyFacts[0].value)).toBeVisible();
		await expect(wiek.getByText(KOPIA_W_SKROCIE.wiekPodpowiedz)).toBeVisible();
		await expect(wiek.locator('input, textarea, select')).toHaveCount(0);

		// Opłata: the computed amount, its hint, and a link to the screen that DOES own it.
		// „You cannot change this here" without „and here is where you can" is a dead end.
		const oplata = grupy.nth(2);
		await expect(oplata.getByText(keyFacts[2].value)).toBeVisible();
		await expect(oplata.getByText(KOPIA_W_SKROCIE.oplataPodpowiedz)).toBeVisible();
		await expect(oplata.locator('input, textarea, select')).toHaveCount(0);
		const odnosnik = oplata.getByRole('link', { name: KOPIA_W_SKROCIE.oplataLink });
		await expect(odnosnik).toBeVisible();
		await expect(odnosnik).toHaveAttribute('href', '/admin/cennik');
	});

	test('na ekranie nie ma ani jednej kontrolki wylaczonej, ani dodawania, ani usuwania', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(W_SKROCIE);

		// A control nobody may type into looks like a control somebody forgot to switch on,
		// and it is skipped by keyboard navigation with no explanation at all. The read-only
		// tiles above are TEXT for exactly that reason, which is asserted here as an absence.
		await expect(page.locator('main [disabled]')).toHaveCount(0);
		await expect(page.locator('main [aria-disabled="true"]')).toHaveCount(0);

		// FIXED ARITY, the affordance half: no control on this screen can add or remove a
		// tile, because the four `.fact-label` nodes and the `repeat(4, 1fr)` desktop grid
		// are locked by 01-UI-SPEC Amendment v1.6 paragraf 3.
		await expect(page.locator('main button[formaction]')).toHaveCount(0);
		await expect(page.locator('main button[type="submit"]')).toHaveCount(1);
		for (const zakazana of [
			KOPIA_ZAPIS.dodajWiersz,
			KOPIA_ZAPIS.usunWiersz,
			KOPIA_ZAPIS.dodajWartosc,
			KOPIA_ZAPIS.usunWartosc
		]) {
			await expect(page.getByRole('button', { name: zakazana })).toHaveCount(0);
		}
	});

	test('ekran otwiera sie na tym, co jest na stronie, i mowi gdzie jeszcze widac godziny', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(W_SKROCIE);

		// The hours field opens on the value the homepage tile shows, which is the property
		// the whole unification exists for: one source, and the panel cannot promise a value
		// the site does not render.
		await expect(page.getByLabel(POLA_W_SKROCIE.godzinyEtykieta)).toHaveValue(keyFacts[1].value);
		await expect(page.getByLabel(POLA_W_SKROCIE.miejscaEtykieta)).toHaveValue(keyFacts[3].value);

		// THE ONE THING AN EDITOR CANNOT SEE FROM THIS SCREEN: these four fields also feed the
		// footer of every page and the bar at the top of the site.
		await expect(page.getByText(KOPIA_W_SKROCIE.godzinyUwaga)).toBeVisible();
	});

	test('kazdy z czterech atomow godzin ma wlasna odmowe, podlinkowana z podsumowania', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(W_SKROCIE);

		for (const etykieta of [
			POLA_W_SKROCIE.godzinyEtykieta,
			POLA_W_SKROCIE.dniPelneEtykieta,
			POLA_W_SKROCIE.dniSkrotEtykieta,
			POLA_W_SKROCIE.weekendEtykieta,
			POLA_W_SKROCIE.miejscaEtykieta
		]) {
			await page.getByLabel(etykieta).fill('');
		}
		await formularz(page).getByRole('button', { name: KOPIA_ZAPIS.zapisz }).click();

		const panel = page.locator('[data-panel="blad"]');
		await expect(panel).toBeVisible();
		await expect(panel).toContainText(KOPIA_WALIDACJA.podsumowanieNaglowek);
		// Five refusals, five sentences, each quoting its own field's example (WCAG 3.3.3).
		for (const zdanie of [
			KOPIA_WALIDACJA.godzinyOtwarciaBrak,
			KOPIA_WALIDACJA.dniBrak,
			KOPIA_WALIDACJA.skrotDniBrak,
			KOPIA_WALIDACJA.weekendBrak,
			KOPIA_WALIDACJA.liczbaMiejscBrak
		]) {
			await expect(panel).toContainText(zdanie);
		}
		// Focused, so a screen-reader user is taken to the refusal instead of being left at
		// the top of an apparently unchanged page.
		await expect(panel).toBeFocused();

		// Every summary entry LINKS to the control it is about (WCAG 2.4.4), and every one of
		// those fragments resolves to a control that really exists on this page.
		const odnosniki = panel.locator('a[href^="#"]');
		await expect(odnosniki).toHaveCount(5);
		const ile = await odnosniki.count();
		for (let i = 0; i < ile; i += 1) {
			const cel = (await odnosniki.nth(i).getAttribute('href')) ?? '';
			await expect(page.locator(`main ${cel}`)).toHaveCount(1);
		}

		// Nothing was saved: no success panel, and no saved marker in the URL.
		await expect(page.locator('[data-panel="sukces"]')).toHaveCount(0);
		expect(page.url()).not.toContain('zapisano');
	});

	test('cztery pola z tym samym komunikatem daja CZTERY ROZNE odnosniki (WCAG 2.4.4)', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(W_SKROCIE);

		// Over the shared cap, which is what makes all four answer with the SAME sentence. The
		// four „brak" messages differ from one another, so a length refusal is the shape in
		// which the collision is ordinary rather than contrived.
		const zaDlugi = 'a'.repeat(200);
		for (const etykieta of [
			POLA_W_SKROCIE.godzinyEtykieta,
			POLA_W_SKROCIE.dniPelneEtykieta,
			POLA_W_SKROCIE.dniSkrotEtykieta,
			POLA_W_SKROCIE.weekendEtykieta
		]) {
			await page.getByLabel(etykieta).fill(zaDlugi);
		}
		await formularz(page).getByRole('button', { name: KOPIA_ZAPIS.zapisz }).click();

		const panel = page.locator('[data-panel="blad"]');
		await expect(panel).toBeVisible();

		const odnosniki = panel.locator('a[href^="#"]');
		await expect(odnosniki).toHaveCount(4);

		// The link text IS the whole accessible name of the link. Four entries reading the same
		// sentence and pointing at four different controls are one link four times: a
		// screen-reader user listing the links hears no difference between them.
		const teksty = await odnosniki.evaluateAll((lista) =>
			lista.map((odnosnik) => odnosnik.textContent?.trim() ?? '')
		);
		expect(new Set(teksty).size, `odnosniki podsumowania nie sa rozroznialne: ${teksty}`).toBe(
			teksty.length
		);

		// Distinctness alone would be satisfiable by a counter. Each entry has to name the
		// field it will take the editor to, and the name has to be the field's OWN label.
		for (const etykieta of [
			POLA_W_SKROCIE.godzinyEtykieta,
			POLA_W_SKROCIE.dniPelneEtykieta,
			POLA_W_SKROCIE.dniSkrotEtykieta,
			POLA_W_SKROCIE.weekendEtykieta
		]) {
			expect(
				teksty.some((tekst) => tekst.includes(etykieta)),
				`podsumowanie nie nazywa pola „${etykieta}"`
			).toBe(true);
		}
	});

	test('poprawny zapis pokazuje panel Zapisano z odnosnikiem do strony glownej', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(W_SKROCIE);
		await formularz(page).getByRole('button', { name: KOPIA_ZAPIS.zapisz }).click();

		const panel = page.locator('[data-panel="sukces"]');
		await expect(panel).toBeVisible();
		await expect(panel).toContainText(KOPIA_ZAPIS.zapisanoNaglowek);
		// The honest D-18 promise: saved, and visible on the site in about two minutes.
		await expect(panel).toContainText(KOPIA_ZAPIS.zapisanoTresc);
		await expect(panel).toBeFocused();

		const odnosnik = panel.getByRole('link');
		await expect(odnosnik).toHaveAttribute('href', '/');
		await expect(odnosnik).toHaveAttribute('target', '_blank');
		await expect(odnosnik).toHaveAttribute('rel', /noopener/);
		// The new-tab treatment is announced, not merely visual.
		await expect(odnosnik).toContainText(KOPIA_POWLOKA.nowaKarta.trim());
	});

	test('odswiezenie po zapisie nie zapisuje ponownie (POST, przekierowanie, GET)', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(W_SKROCIE);
		await formularz(page).getByRole('button', { name: KOPIA_ZAPIS.zapisz }).click();
		await expect(page.locator('[data-panel="sukces"]')).toBeVisible();

		// The browser is sitting on a GET, so a reload re-runs a read. If the action had
		// returned the panel directly instead of redirecting, this reload would resubmit the
		// POST, and on this screen that means a second commit and a second Cloudflare build.
		const odpowiedz = await page.reload();
		expect(odpowiedz?.request().method()).toBe('GET');
		expect(odpowiedz?.status()).toBe(200);
		await expect(page.locator('[data-panel="sukces"]')).toBeVisible();
	});

	test('ekran w stanie czystym nie narusza WCAG 2.1 AA', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(W_SKROCIE);
		await expect(page.locator('main fieldset')).toHaveCount(4);
		const wynik = await new AxeBuilder({ page }).withTags(ZNACZNIKI).analyze();
		expect(wynik.violations).toEqual([]);
	});

	test('ekran z podsumowaniem bledow i aria-invalid nie narusza WCAG 2.1 AA', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(W_SKROCIE);
		await page.getByLabel(POLA_W_SKROCIE.godzinyEtykieta).fill('');
		await formularz(page).getByRole('button', { name: KOPIA_ZAPIS.zapisz }).click();
		await expect(page.locator('[data-panel="blad"]')).toBeVisible();
		// The refused control really is marked, so this scan covers the invalid state rather
		// than a page that merely showed a red panel.
		await expect(page.locator('main [aria-invalid="true"]')).toHaveCount(1);

		const wynik = await new AxeBuilder({ page }).withTags(ZNACZNIKI).analyze();
		expect(wynik.violations).toEqual([]);
	});
});

test.describe('Ekran W skrócie bez JavaScriptu', () => {
	test('caly zapis dziala przy wylaczonym JavaScripcie', async ({ browser }) => {
		// A fresh context with scripting off, so this is the real no-JS path and not a page
		// that merely avoided calling anything. The session cookie is seeded exactly as
		// tests/fixtures/admin.ts does it, including the `__Host-` prefix constraints that
		// file records: explicit domain and path, secure true, and no `url` at all.
		const kontekst = await browser.newContext({ javaScriptEnabled: false });
		try {
			await kontekst.addCookies([
				{
					name: NAZWA_CIASTKA,
					value: await tokenSesji(),
					domain: 'localhost',
					path: '/',
					httpOnly: true,
					secure: true,
					sameSite: 'Lax'
				}
			]);
			const page = await kontekst.newPage();

			const odpowiedz = await page.goto(W_SKROCIE);
			expect(odpowiedz?.status()).toBe(200);

			// The server-rendered form is complete on its own: four groups, the committed
			// values in their controls, and a working submit button.
			await expect(page.locator('main fieldset')).toHaveCount(4);
			await expect(page.getByLabel(POLA_W_SKROCIE.godzinyEtykieta)).toHaveValue(keyFacts[1].value);

			await page.getByRole('button', { name: KOPIA_ZAPIS.zapisz }).click();

			// Same panel, same copy, reached by the browser's own navigation with no client
			// code involved at any point.
			const panel = page.locator('[data-panel="sukces"]');
			await expect(panel).toBeVisible();
			await expect(panel).toContainText(KOPIA_ZAPIS.zapisanoNaglowek);
			expect(page.url()).toContain('zapisano');
		} finally {
			await kontekst.close();
		}
	});
});
