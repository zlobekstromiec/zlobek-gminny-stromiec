import { readFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { test, expect, tokenSesji, NAZWA_CIASTKA } from './fixtures/admin';
import {
	KOPIA_EKRAN_GALERII,
	KOPIA_LISTY,
	KOPIA_POWLOKA,
	KOPIA_WALIDACJA,
	KOPIA_ZAPIS,
	KOPIA_ZDJECIA,
	POLA_GALERIA,
	legendaZdjecia,
	nazwaPrzeniesieniaWDol,
	nazwaPrzeniesieniaWGore,
	przeniesionoZdjecie,
	zobaczStrone
} from '../src/lib/content/panel';
import { MAKS_ZDJEC_GALERII } from '../src/lib/pola-strony';

/** The committed store, read rather than imported. Playwright's loader refuses a plain JSON
 *  import without an import attribute, and reading the bytes is the more honest thing to do
 *  anyway: these assertions are about what is on the site right now, and a file read cannot be
 *  satisfied by a stale module graph. */
const galeria = JSON.parse(
	readFileSync(new URL('../src/lib/content/galeria.json', import.meta.url), 'utf8')
) as { zdjecia: { plik: string; podpis: string; alt: string }[] };

/**
 * Browser acceptance gate for the gallery editor (GALLERY-02; 05 D-21 to D-26; 05-UI-SPEC
 * Contracts 8, 9 and 12, and 04.1-UI-SPEC Component Contracts 5, 7, 8, 9 and 10).
 *
 * WHAT IT PROVES that the unit suite beside it cannot: that adding, removing and REORDERING a
 * photograph are server round trips that work with SCRIPTING SWITCHED OFF, that the twelve cap
 * is visible on the screen before an editor wastes work on a thirteenth item, that every
 * refusal arrives with a link straight to the control it is about, and that the screen is
 * axe-clean both clean and with `aria-invalid` rendered.
 *
 * EVERY CASE TAKES `zalogowany` EXPLICITLY. Playwright fixtures are LAZY: a case that
 * destructures only `{ page }` never instantiates the authenticated fixture, runs with no
 * session, and silently exercises the login screen instead of the screen under test. Eight
 * cases in tests/admin-nabor.spec.ts passed that way before it was caught, so every case below
 * also asserts something only the real screen can satisfy.
 *
 * WHAT THIS FILE CANNOT PROVE, and does not pretend to. Two things, and both are recorded
 * rather than faked:
 *
 *  • that a save becomes one real commit and that an editor's photograph appears on /o-nas
 *    after a Cloudflare build. `preview:test` binds PANEL_DRY_RUN=1, so no commit exists to
 *    inspect. That is GAL-11 of 05-VALIDATION.md, it is live-only, and it belongs to the UAT;
 *  • that the two hand-placed seed photographs survive a removal (GAL-10). The promotion
 *    05-VALIDATION.md proposes is VACUOUS under that same dry-run flag: no save in this harness
 *    ever deletes a file, so the assertion would pass whatever the ownership rule did. The
 *    property is pinned in tests/admin-walidacja-galeria.unit.ts instead and carried forward as
 *    honestly unproven.
 *
 * Do NOT weaken these assertions to make the suite pass.
 */

const GALERIA = '/admin/galeria';
const LOGOWANIE = '/admin/logowanie';

const ZNACZNIKI = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/** A real, small JPEG that already lives in the repository, used as the file an editor chooses.
 *  Deliberately not a new fixture: an image committed for a test is one more picture in a public
 *  repository that nobody has a consent record for, and no acceptance evidence in this plan may
 *  require real photography (05 D-37). */
const PLIK_ZDJECIA = `src/lib/assets/uploads/${galeria.zdjecia[0].plik}`;

type Strona = import('@playwright/test').Page;

function formularz(page: Strona) {
	return page.locator('main form');
}

function przyciskZapisz(page: Strona) {
	return formularz(page).getByRole('button', { name: KOPIA_ZAPIS.zapisz });
}

function przyciskDodaj(page: Strona) {
	return page.getByRole('button', { name: KOPIA_ZAPIS.dodajZdjecie });
}

/** The two move buttons of ONE item, located by their ACCESSIBLE NAME. Deliberately not by a
 *  class: what is under test is the WCAG 2.4.4 contract that each button says which photograph
 *  it moves, and a class selector would pass on twelve buttons all called „Przenieś wyżej". */
function przyciskWGore(page: Strona, numer: number) {
	return page.getByRole('button', { name: nazwaPrzeniesieniaWGore(legendaZdjecia(numer)) });
}

function przyciskWDol(page: Strona, numer: number) {
	return page.getByRole('button', { name: nazwaPrzeniesieniaWDol(legendaZdjecia(numer)) });
}

/** The order of the list, read from the hidden basename each item carries. An item added on this
 *  visit has an empty one, which is what makes it distinguishable from the committed pictures
 *  without giving it a file first.
 *
 *  ALWAYS READ THROUGH `expect.poll`. This is a plain read and not a web-first assertion, so it
 *  does not retry: called straight after a click it answers with the order the page had BEFORE
 *  the enhanced round trip came back (the trap plan 05-04 recorded). */
function nazwyZdjec(page: Strona) {
	return page
		.locator('main input[name^="galeria["][name$=".plik"]')
		.evaluateAll((pola) => pola.map((pole) => (pole as HTMLInputElement).value));
}

function polaPodpisow(page: Strona) {
	return page.getByLabel(POLA_GALERIA.podpisEtykieta, { exact: false });
}

async function zalogujBezSkryptow(browser: import('@playwright/test').Browser) {
	const kontekst = await browser.newContext({ javaScriptEnabled: false });
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
	return kontekst;
}

/** Add items until the list holds `docelowa` of them, filling in each new one so nothing but the
 *  rule under test can refuse the save. */
async function dopelnijDo(page: Strona, docelowa: number) {
	let ile = await polaPodpisow(page).count();
	while (ile < docelowa) {
		await przyciskDodaj(page).click();
		await expect(polaPodpisow(page)).toHaveCount(ile + 1);
		ile += 1;
	}
}

test.describe('Ekran galerii: ksztalt z kontraktu 5 i 8', () => {
	test('bez sesji ekran odsyla na logowanie, a jego POST tez', async ({ request }) => {
		// By layout inheritance and with no auth code in the route itself (T-05-06-07). The POST
		// leg matters as much as the GET: an action reachable without a session would write to
		// the repository on behalf of nobody.
		const get = await request.get(GALERIA, { maxRedirects: 0 });
		expect(get.status()).toBe(303);
		expect(get.headers()['location']).toContain(LOGOWANIE);

		const post = await request.post(`${GALERIA}?/zapisz`, {
			form: {},
			headers: { origin: 'http://localhost:4173' },
			maxRedirects: 0
		});
		expect(post.status()).not.toBe(200);
		expect(post.status()).toBe(303);
		expect(post.headers()['location']).toContain(LOGOWANIE);
	});

	test('ekran odpowiada 200, ma jeden naglowek i otwiera sie na tym, co jest w store', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		const odpowiedz = await page.goto(GALERIA);
		expect(odpowiedz?.status()).toBe(200);

		await expect(page.locator('main h1')).toHaveCount(1);
		await expect(page.locator('main h1')).toHaveText(KOPIA_EKRAN_GALERII.naglowek);

		await expect.poll(() => nazwyZdjec(page)).toEqual(galeria.zdjecia.map((z) => z.plik));
		await expect(polaPodpisow(page).first()).toHaveValue(galeria.zdjecia[0].podpis);
		await expect(page.getByLabel(POLA_GALERIA.altEtykieta, { exact: false }).first()).toHaveValue(
			galeria.zdjecia[0].alt
		);
	});

	test('ekran renderuje elementy Contract 5 w kolejnosci DOM', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(GALERIA);

		await expect(page.getByRole('link', { name: KOPIA_LISTY.powrotPulpit })).toBeVisible();
		await expect(page.getByText(KOPIA_ZAPIS.wymaganeNota)).toBeVisible();
		await expect(page.getByText(POLA_GALERIA.zdjeciaLegenda).first()).toBeVisible();
		await expect(page.getByText(POLA_GALERIA.zdjeciaPodpowiedz)).toBeVisible();
		await expect(page.getByText(KOPIA_ZAPIS.notaGrupyZdjecZKolejnoscia)).toBeVisible();
		// The standing publish-delay panel is appended by the shell after the screen's content.
		await expect(page.getByText(KOPIA_POWLOKA.opoznieniePublikacji)).toBeVisible();
	});

	test('na ekranie jest dokladnie jeden przycisk zapisu (D-11)', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(GALERIA);
		// One save is one commit and one Cloudflare build for the WHOLE list, which is the whole
		// reason this screen holds the list rather than one photograph.
		await expect(przyciskZapisz(page)).toHaveCount(1);
		await expect(formularz(page).getByRole('button', { name: KOPIA_ZAPIS.zapisz })).toHaveCount(1);
	});

	test('wyspa zdjecia jest zamontowana w proporcji 4:3, a nie 16:9 (D-24)', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(GALERIA);
		const nowe = page.locator('main input[type="file"]').first();
		await nowe.setInputFiles(PLIK_ZDJECIA);
		// The ready sentence names the ratio out loud, so it cannot be shared with the 16:9 one.
		await expect(page.getByText(KOPIA_ZDJECIA.gotowe43).first()).toBeVisible();
		await expect(page.getByText(KOPIA_ZDJECIA.gotowe169)).toHaveCount(0);
	});
});

test.describe('Ekran galerii: dodawanie, usuwanie i kolejnosc (kontrakt 7 i 9)', () => {
	const BAZOWE = galeria.zdjecia.map((zdjecie) => zdjecie.plik);

	test('dodanie pozycji wydluza liste o jeden, zachowuje wpisane wartosci i oglasza zmiane', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(GALERIA);
		await polaPodpisow(page).first().fill('Zmieniony podpis');

		await przyciskDodaj(page).click();

		await expect.poll(() => nazwyZdjec(page)).toEqual([...BAZOWE, '']);
		// Contract 7: the round trip hands back everything that was typed.
		await expect(polaPodpisow(page).first()).toHaveValue('Zmieniony podpis');
		// AND NOTHING WAS SAVED, which is what the standing note above the add button promises.
		await expect(page.locator('[data-panel="sukces"]')).toHaveCount(0);
	});

	test('usuniecie pozycji zostawia pozostale w kolejnosci, bez dziury i bez straty', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(GALERIA);

		await page.getByRole('button', { name: KOPIA_ZAPIS.usunZdjecie }).first().click();

		await expect.poll(() => nazwyZdjec(page)).toEqual(BAZOWE.slice(1));
		await expect(polaPodpisow(page)).toHaveCount(BAZOWE.length - 1);
		await expect(page.locator('[data-panel="sukces"]')).toHaveCount(0);
	});

	test('kazda pozycja ma wlasny przycisk w gore i w dol, a nazwa kazdego wskazuje ta pozycje', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(GALERIA);

		for (let numer = 1; numer <= BAZOWE.length; numer++) {
			await expect(przyciskWGore(page, numer)).toHaveCount(1);
			await expect(przyciskWDol(page, numer)).toHaveCount(1);
		}
		// WCAG 2.4.4: not one of them is called only „Przenieś wyżej".
		await expect(
			page.getByRole('button', { name: KOPIA_ZAPIS.przeniesWGore, exact: true })
		).toHaveCount(0);
		await expect(
			page.getByRole('button', { name: KOPIA_ZAPIS.przeniesWDol, exact: true })
		).toHaveCount(0);

		// RENDERED and disabled at the two ends, never omitted, so the button row keeps a stable
		// geometry and a stable focus order as an editor works down the list.
		await expect(przyciskWGore(page, 1)).toBeDisabled();
		await expect(przyciskWDol(page, BAZOWE.length)).toBeDisabled();
	});

	test('przeniesienie zamienia pozycje miejscami, oglasza to w rodzaju zdjecia i nic nie zapisuje', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(GALERIA);
		await expect.poll(() => nazwyZdjec(page)).toEqual(BAZOWE);

		await przyciskWGore(page, 2).click();

		await expect.poll(() => nazwyZdjec(page)).toEqual([BAZOWE[1], BAZOWE[0]]);
		// The PHOTO noun, not the generic „wiersz" the two older screens use.
		await expect(page.getByText(przeniesionoZdjecie(2, 1))).toBeVisible();
		await expect(page.locator('[data-panel="sukces"]')).toHaveCount(0);
	});

	// THE CASE A WRONG FOCUS TARGET ACTUALLY FAILS: a second move pressed on whatever has focus
	// rather than located again.
	test('dwa przeniesienia pod rzad dzialaja, bo fokus idzie na przycisk w NOWEJ pozycji', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(GALERIA);
		await przyciskDodaj(page).click();
		await expect.poll(() => nazwyZdjec(page)).toEqual([...BAZOWE, '']);

		await przyciskWGore(page, 3).click();

		await expect.poll(() => nazwyZdjec(page)).toEqual([BAZOWE[0], '', BAZOWE[1]]);
		await expect(przyciskWGore(page, 2)).toBeFocused();

		await page.keyboard.press('Enter');

		await expect.poll(() => nazwyZdjec(page)).toEqual(['', BAZOWE[0], BAZOWE[1]]);
		// The item reached the top, so the button that performed the move is now disabled and
		// focus goes to the opposite-direction button of the SAME item rather than being lost.
		await expect(przyciskWGore(page, 1)).toBeDisabled();
		await expect(przyciskWDol(page, 1)).toBeFocused();
	});

	// THE CASE THAT PROVES WHERE ALL THREE LIVE. With scripting off there is no client code at
	// all, so the only thing that can change this list is the server.
	test('dodanie, usuniecie i przeniesienie dzialaja przy WYLACZONYM JavaScripcie (D-17)', async ({
		browser
	}) => {
		const kontekst = await zalogujBezSkryptow(browser);
		try {
			const page = await kontekst.newPage();
			const odpowiedz = await page.goto(GALERIA);
			expect(odpowiedz?.status()).toBe(200);
			await expect.poll(() => nazwyZdjec(page)).toEqual(BAZOWE);

			// The honest notice is served to this browser and says what still works.
			const notka = page.locator('main noscript').first();
			expect(await notka.textContent()).toContain(KOPIA_ZDJECIA.bezSkryptow);

			await przyciskWDol(page, 1).click();
			await expect.poll(() => nazwyZdjec(page)).toEqual([BAZOWE[1], BAZOWE[0]]);
			await expect(page.getByText(przeniesionoZdjecie(1, 2))).toBeVisible();

			await przyciskDodaj(page).click();
			await expect.poll(() => nazwyZdjec(page)).toEqual([BAZOWE[1], BAZOWE[0], '']);

			await page.getByRole('button', { name: KOPIA_ZAPIS.usunZdjecie }).first().click();
			await expect.poll(() => nazwyZdjec(page)).toEqual([BAZOWE[0], '']);

			await expect(page.locator('[data-panel="sukces"]')).toHaveCount(0);
		} finally {
			await kontekst.close();
		}
	});
});

test.describe('Ekran galerii: limit dwunastu zdjec (D-23, GAL-8)', () => {
	test('ponizej limitu przycisk dodawania jest, a komunikatu o limicie nie ma', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(GALERIA);
		await expect(przyciskDodaj(page)).toHaveCount(1);
		await expect(page.getByText(KOPIA_EKRAN_GALERII.limitOsiagniety)).toHaveCount(0);
	});

	test('na limicie przycisk dodawania znika, a jego miejsce zajmuje polski komunikat', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(GALERIA);
		await dopelnijDo(page, MAKS_ZDJEC_GALERII);

		await expect(polaPodpisow(page)).toHaveCount(MAKS_ZDJEC_GALERII);
		await expect(przyciskDodaj(page)).toHaveCount(0);
		await expect(page.getByText(KOPIA_EKRAN_GALERII.limitOsiagniety)).toBeVisible();
		// Not a greyed-out control either: a button nobody may press with no explanation is the
		// panel looking broken.
		await expect(
			page.locator('main button[disabled]', { hasText: KOPIA_ZAPIS.dodajZdjecie })
		).toHaveCount(0);
	});
});

test.describe('Ekran galerii: odmowy i ich odnosniki', () => {
	test('pusty podpis jest odmawiany po polsku, z odnosnikiem prosto do tego pola', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(GALERIA);
		await polaPodpisow(page).first().fill('');
		await przyciskZapisz(page).click();

		const panel = page.locator('[data-panel="blad"]');
		await expect(panel).toBeVisible();
		await expect(panel).toContainText(KOPIA_WALIDACJA.podpisBrak);
		// Focused, so a screen-reader user is taken to the refusal instead of being left at the
		// top of an apparently unchanged page.
		await expect(panel).toBeFocused();

		// WCAG 2.4.4: the summary entry points at the control it is about, that control exists,
		// and it is marked invalid. A summary linking to a control that is not on the screen
		// would announce nothing at all.
		const odnosnik = panel.getByRole('link').first();
		const cel = await odnosnik.getAttribute('href');
		expect(cel).toBeTruthy();
		const kontrolka = page.locator(`main ${cel}`);
		await expect(kontrolka).toHaveCount(1);
		await expect(kontrolka).toHaveAttribute('aria-invalid', 'true');

		await expect(page.locator('[data-panel="sukces"]')).toHaveCount(0);
		expect(page.url()).not.toContain('zapisano');
	});

	test('pusty opis alternatywny odmawia zapisu przy WYLACZONYM JavaScripcie (D-15)', async ({
		browser
	}) => {
		// With scripting off the island does nothing at all, so the only thing that can refuse
		// this save is the server. That is the only version of the alt rule the Deklaracja
		// dostępności can rest on.
		const kontekst = await zalogujBezSkryptow(browser);
		try {
			const page = await kontekst.newPage();
			const odpowiedz = await page.goto(GALERIA);
			expect(odpowiedz?.status()).toBe(200);

			const alt = page.getByLabel(POLA_GALERIA.altEtykieta, { exact: false }).first();
			await expect(alt).toHaveValue(galeria.zdjecia[0].alt);
			await alt.fill('');
			await page.getByRole('button', { name: KOPIA_ZAPIS.zapisz }).click();

			const panel = page.locator('[data-panel="blad"]');
			await expect(panel).toBeVisible();
			await expect(panel).toContainText(KOPIA_WALIDACJA.altBrak);
			await expect(page.locator('[data-panel="sukces"]')).toHaveCount(0);
		} finally {
			await kontekst.close();
		}
	});

	test('pozycja bez zdjecia jest odmawiana instrukcja nazywajaca oba wyjscia', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(GALERIA);
		await przyciskDodaj(page).click();
		await polaPodpisow(page).last().fill('Nowa sala');

		await przyciskZapisz(page).click();

		const panel = page.locator('[data-panel="blad"]');
		await expect(panel).toContainText(KOPIA_WALIDACJA.zdjecieGaleriiBrak);
		await expect(page.locator('[data-panel="sukces"]')).toHaveCount(0);
	});

	test('odmowa oddaje kazda wpisana wartosc, takze przygotowane zdjecie (Contract 10c)', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(GALERIA);
		await polaPodpisow(page).first().fill('Zupełnie nowy podpis');
		await page.getByLabel(POLA_GALERIA.altEtykieta, { exact: false }).last().fill('');

		await przyciskZapisz(page).click();
		await expect(page.locator('[data-panel="blad"]')).toBeVisible();

		// A refused save that lost the caption would send an editor back to retype work the
		// server never had a quarrel with.
		await expect(polaPodpisow(page).first()).toHaveValue('Zupełnie nowy podpis');
	});
});

test.describe('Ekran galerii: poprawny zapis', () => {
	test('poprawny zapis pokazuje panel Zapisano z odnosnikiem do strony O nas', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(GALERIA);
		await polaPodpisow(page).first().fill('Sala zabaw dla maluchów');

		await przyciskZapisz(page).click();

		const panel = page.locator('[data-panel="sukces"]');
		await expect(panel).toBeVisible();
		await expect(panel).toContainText(KOPIA_ZAPIS.zapisanoNaglowek);
		// The honest D-18 promise: saved, and visible on the site in about two minutes.
		await expect(panel).toContainText(KOPIA_ZAPIS.zapisanoTresc);
		await expect(panel).toBeFocused();

		// The gallery is a SECTION of /o-nas (05 D-19), so that is where the editor is sent.
		const odnosnik = panel.getByRole('link', {
			name: zobaczStrone(KOPIA_EKRAN_GALERII.stronaNazwa)
		});
		await expect(odnosnik).toHaveAttribute('href', '/o-nas');
		await expect(odnosnik).toHaveAttribute('target', '_blank');
		await expect(odnosnik).toHaveAttribute('rel', /noopener/);
		await expect(odnosnik).toContainText(KOPIA_POWLOKA.nowaKarta.trim());
		expect(page.url()).toContain('zapisano=1');
	});

	test('odswiezenie po zapisie nie zapisuje ponownie (POST, przekierowanie, GET)', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(GALERIA);
		await przyciskZapisz(page).click();
		await expect(page.locator('[data-panel="sukces"]')).toBeVisible();

		// If the action had returned the panel directly instead of redirecting, this reload would
		// resubmit the POST, and on this screen that means a second commit and a second
		// Cloudflare build of the żłobek's website.
		const odpowiedz = await page.reload();
		expect(odpowiedz?.request().method()).toBe('GET');
		expect(odpowiedz?.status()).toBe(200);
		await expect(page.locator('[data-panel="sukces"]')).toBeVisible();
	});
});

test.describe('Ekran galerii: dostepnosc', () => {
	test('ekran w stanie czystym nie narusza WCAG 2.1 AA', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(GALERIA);
		await expect(polaPodpisow(page).first()).toBeVisible();
		const wynik = await new AxeBuilder({ page }).withTags(ZNACZNIKI).analyze();
		expect(wynik.violations).toEqual([]);
	});

	test('ekran z podsumowaniem bledow i aria-invalid nie narusza WCAG 2.1 AA', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(GALERIA);
		await polaPodpisow(page).first().fill('');
		await przyciskZapisz(page).click();
		await expect(page.locator('[data-panel="blad"]')).toBeVisible();
		// The invalid state is genuinely rendered, so this is not the clean scan again.
		await expect(page.locator('main [aria-invalid="true"]')).not.toHaveCount(0);

		const wynik = await new AxeBuilder({ page }).withTags(ZNACZNIKI).analyze();
		expect(wynik.violations).toEqual([]);
	});
});
