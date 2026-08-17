import { readFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { test, expect, tokenSesji, NAZWA_CIASTKA } from './fixtures/admin';
import {
	KOPIA_EKRAN_O_NAS,
	KOPIA_EKRAN_PLANU,
	KOPIA_WALIDACJA,
	KOPIA_ZAPIS,
	KOPIA_ZDJECIA,
	POLA_O_NAS,
	POLA_PLAN_DNIA,
	bladWElemencie,
	dodanoWiersz,
	legendaWartosci,
	legendaWiersza,
	legendaZdjecia,
	nazwaPrzeniesieniaWDol,
	nazwaPrzeniesieniaWGore,
	przeniesionoWiersz,
	usunietoWiersz,
	zobaczStrone
} from '../src/lib/content/panel';

/** The two committed content files, read rather than imported. Playwright's loader refuses
 *  a plain JSON import without an import attribute, and reading the bytes is the more
 *  honest thing to do anyway: these assertions are about what is on the site right now, and
 *  a file read cannot be satisfied by a stale module graph. */
function wczytaj<T>(wzgledna: string): T {
	return JSON.parse(readFileSync(new URL(wzgledna, import.meta.url), 'utf8'));
}

const planDnia = wczytaj<{ rows: { time: string; what: string }[] }>(
	'../src/lib/content/day-plan.json'
);
const oNas = wczytaj<{
	lead: string;
	wartosci: { tytul: string; opis: string }[];
	kadra_opiekunki: number;
	obiekt_zdjecia: { plik: string; alt: string }[];
}>('../src/lib/content/o-nas.json');

/**
 * Browser acceptance gate for the two singleton editors (CMS-02, CMS-03; D-11, D-13, D-15,
 * D-17, P-26; 04.1-UI-SPEC Component Contracts 5, 7, 8, 9 and 10, and the Accessibility
 * Contract).
 *
 * EVERY CASE TAKES `zalogowany` EXPLICITLY. Playwright fixtures are LAZY: a case that
 * destructures only `{ page }` never instantiates the authenticated fixture, runs with no
 * session, and silently exercises the login screen instead of the screen under test. Eight
 * cases in tests/admin-nabor.spec.ts passed that way before it was caught, so every case
 * below also asserts something only the real screen can satisfy.
 *
 * THE CASES THAT NOTHING ELSE CAN CATCH, and the reason this file is long:
 *  • adding and removing a row with SCRIPTING SWITCHED OFF, which is the only version of
 *    that assertion that proves the pattern is a server round trip rather than client state
 *    (D-17, P-26);
 *  • a removal from the MIDDLE of a list, which is where an index-keyed re-render either
 *    keeps every remaining value with its own row or quietly shifts them by one;
 *  • the D-15 alt refusal on a facility photo, repeated with scripting off;
 *  • axe with a repeated group actually populated, because an empty form is not the state
 *    the accessibility risk is in.
 *
 * WHAT IT CANNOT PROVE, and does not pretend to: that a save becomes one real commit. Under
 * PANEL_DRY_RUN no commit exists to inspect, and a spec that mocked it would assert its own
 * mock. That is the live verification the phase UAT owns.
 *
 * Do NOT weaken these assertions to make the suite pass.
 */

const PLAN = '/admin/plan-dnia';
const O_NAS = '/admin/o-nas';

const ZNACZNIKI = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/** A real, small JPEG that already lives in the repository, used as the file an editor
 *  chooses. Deliberately not a new fixture: an image committed for a test is one more
 *  picture in a public repository that nobody has a consent record for. */
const PLIK_ZDJECIA = `src/lib/assets/uploads/${oNas.obiekt_zdjecia[0].plik}`;

type Strona = import('@playwright/test').Page;

function formularz(page: Strona) {
	return page.locator('main form');
}

/** The whole group card, found by its own legend. Item cards carry a numbered legend and
 *  never the group's, so this cannot match one of them. */
function grupa(page: Strona, legenda: string) {
	return page.locator('main fieldset').filter({ hasText: legenda }).first();
}

function poleGodzin(page: Strona) {
	return page.getByLabel(POLA_PLAN_DNIA.godzinyEtykieta, { exact: false });
}

function poleOpisu(page: Strona) {
	return page.getByLabel(POLA_PLAN_DNIA.opisEtykieta, { exact: false });
}

function poleTytuluWartosci(page: Strona) {
	return page.getByLabel(POLA_O_NAS.wartoscTytulEtykieta, { exact: false });
}

/** The group's OWN polite region, not one of the photo islands' own. The group renders its
 *  status after the whole list, so inside the photo group the last one is the group's; the
 *  plan-dnia group has only one and `.last()` is the same element. */
function statusGrupy(page: Strona, legenda: string) {
	return grupa(page, legenda).locator('[role="status"]').last();
}

function przyciskZapisz(page: Strona) {
	return formularz(page).getByRole('button', { name: KOPIA_ZAPIS.zapisz });
}

/** The two move buttons of ONE item, located by their ACCESSIBLE NAME. Deliberately not by
 *  a class: what is under test is the WCAG 2.4.4 contract that each button says which item
 *  it moves, and a class selector would pass on twelve buttons all called „Przenieś wyżej". */
function przyciskWGore(page: Strona, legenda: string) {
	return page.getByRole('button', { name: nazwaPrzeniesieniaWGore(legenda) });
}

function przyciskWDol(page: Strona, legenda: string) {
	return page.getByRole('button', { name: nazwaPrzeniesieniaWDol(legenda) });
}

/** The order of the photo list, read from the hidden basename each item carries. An item
 *  added on this visit has an empty one, which is precisely what makes it distinguishable
 *  from the two committed pictures without giving it a file first.
 *
 *  ALWAYS READ THROUGH `expect.poll`. This is a plain read and not a web-first assertion,
 *  so it does not retry: called straight after a click it answers with the order the page
 *  had BEFORE the enhanced round trip came back and the case passes or fails on timing.
 *  The no-scripting cases hide the problem, because there the click is a real navigation
 *  that Playwright waits for on its own. */
function nazwyZdjec(page: Strona) {
	return page
		.locator('main input[name$=".plik"]')
		.evaluateAll((pola) => pola.map((pole) => (pole as HTMLInputElement).value));
}

/** The order of the day-plan rows, read from the control the editor actually types into.
 *  Read through `expect.poll` for the same reason as the one above. */
function kolejnoscGodzin(page: Strona) {
	return poleGodzin(page).evaluateAll((pola) =>
		pola.map((pole) => (pole as HTMLInputElement).value)
	);
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

// =========================================================================================
// Contract 5: the shape of both screens
// =========================================================================================

test.describe('Ekrany pojedynczych stron maja ksztalt z kontraktu 5', () => {
	for (const [nazwa, adres, naglowek] of [
		['plan dnia', PLAN, KOPIA_EKRAN_PLANU.naglowek],
		['O nas', O_NAS, KOPIA_EKRAN_O_NAS.naglowek]
	] as const) {
		test(`ekran ${nazwa} ma dokladnie jeden naglowek pierwszego stopnia i jeden przycisk zapisu`, async ({
			page,
			zalogowany
		}) => {
			expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
			const odpowiedz = await page.goto(adres);
			expect(odpowiedz?.status()).toBe(200);

			await expect(page.locator('main h1')).toHaveCount(1);
			await expect(page.locator('main h1')).toHaveText(naglowek);
			// One „Zapisz" per page, whatever else is on it (D-11).
			await expect(przyciskZapisz(page)).toHaveCount(1);
			// One form, so every add, every remove and the save carry the same values.
			await expect(formularz(page)).toHaveCount(1);
			// The browser's own validation bubbles are suppressed, because they are not
			// authored Polish (Contract 5).
			await expect(formularz(page)).toHaveAttribute('novalidate', '');
		});

		test(`na ekranie ${nazwa} dodawanie i usuwanie wiersza to przyciski wysylajace formularz`, async ({
			page,
			zalogowany
		}) => {
			expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
			await page.goto(adres);

			const zAkcja = page.locator('main button[formaction]');
			// At least one add and one remove, and on O nas four of each kind of thing.
			expect(await zAkcja.count()).toBeGreaterThanOrEqual(2);
			for (const przycisk of await zAkcja.all()) {
				// A submit button inside the page's one form, never a click handler: this is
				// what makes the pattern work with scripting switched off (D-17).
				await expect(przycisk).toHaveAttribute('type', 'submit');
				const wForm = await przycisk.evaluate((element) => element.closest('form') !== null);
				expect(wForm).toBe(true);
			}
		});
	}

	test('ekran planu dnia otwiera sie na tym, co jest na stronie', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(PLAN);
		await expect(poleGodzin(page)).toHaveCount(planDnia.rows.length);
		await expect(poleGodzin(page).first()).toHaveValue(planDnia.rows[0].time);
		await expect(poleOpisu(page).first()).toHaveValue(planDnia.rows[0].what);
		// The one thing this screen cannot show by itself: the plan is one file rendered in
		// two places, so a save here changes the front page too.
		await expect(page.getByText(KOPIA_EKRAN_PLANU.uwagaWspolna)).toBeVisible();
	});

	test('ekran O nas otwiera sie na tym, co jest na stronie, ze zdjeciami i liczbami kadry', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(O_NAS);
		await expect(page.getByLabel(POLA_O_NAS.leadEtykieta, { exact: false })).toHaveValue(oNas.lead);
		await expect(poleTytuluWartosci(page)).toHaveCount(oNas.wartosci.length);
		await expect(page.getByLabel(POLA_O_NAS.kadraOpiekunkiEtykieta, { exact: false })).toHaveValue(
			String(oNas.kadra_opiekunki)
		);
		// Both committed pictures render as real previews, from the same by-name map the
		// public page uses, so the island really did mount at the second call site.
		await expect(page.locator('main img')).toHaveCount(oNas.obiekt_zdjecia.length);
		await expect(
			page.getByLabel(POLA_O_NAS.zdjecieAltEtykieta, { exact: false }).first()
		).toHaveValue(oNas.obiekt_zdjecia[0].alt);
	});

	test('wyspa zdjecia jest zamontowana w proporcji 4:3, a nie 16:9', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(O_NAS);
		const podglad = page.locator('main img').first();
		await expect(podglad).toBeVisible();
		const pudelko = await podglad.boundingBox();
		expect(pudelko).not.toBeNull();
		if (pudelko) expect(pudelko.width / pudelko.height).toBeCloseTo(4 / 3, 1);
	});
});

// =========================================================================================
// Contract 7: adding a row, with scripting on and with scripting off
// =========================================================================================

test.describe('Powtarzalna grupa: dodawanie wiersza (kontrakt 7, P-26)', () => {
	test('dodanie wiersza zwieksza liste o jeden, zachowuje kazda wpisana wartosc i oglasza zmiane', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(PLAN);
		const przed = await poleGodzin(page).count();

		// Something typed and NOT saved, which is the value the round trip has to carry.
		await poleGodzin(page).first().fill('5:55–6:55');
		await poleOpisu(page).last().fill('Zmieniony opis ostatniego wiersza');

		await page.getByRole('button', { name: KOPIA_ZAPIS.dodajWiersz }).click();

		await expect(poleGodzin(page)).toHaveCount(przed + 1);
		await expect(poleGodzin(page).first()).toHaveValue('5:55–6:55');
		await expect(poleOpisu(page).nth(przed - 1)).toHaveValue('Zmieniony opis ostatniego wiersza');
		// The new row is empty and it is at the END.
		await expect(poleGodzin(page).last()).toHaveValue('');
		// Announced politely, and by the group's own region rather than by the page.
		await expect(grupa(page, POLA_PLAN_DNIA.grupaLegenda).locator('[role="status"]')).toHaveText(
			dodanoWiersz(przed + 1)
		);
		// Focus is in the new row's first control, so an editor can just start typing.
		await expect(poleGodzin(page).last()).toBeFocused();
		// AND NOTHING WAS SAVED: no success panel, and the note says so permanently. Since
		// this list opted into reordering (05 D-22) the note is the one that names all three
		// actions; a screen that can be reordered but promises only that adding and removing
		// are unsaved would be telling an editor two thirds of the truth.
		await expect(page.locator('[data-panel="sukces"]')).toHaveCount(0);
		await expect(page.getByText(KOPIA_ZAPIS.notaGrupyZKolejnoscia).first()).toBeVisible();
	});

	// REGRESSION GUARD for a defect this plan hit and fixed. Svelte treats `autofocus` as an
	// INIT-ONLY concern: it never adds the attribute to an element that already existed and
	// never removes it from one that got it earlier. A hydrated page that moved focus by
	// looking for that attribute would therefore find the row added a moment ago rather than
	// the one added just now, and would find nothing at all after a removal.
	test('dwa dodania pod rzad zostawiaja fokus w DRUGIM nowym wierszu, nie w pierwszym', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(PLAN);
		const przed = await poleGodzin(page).count();

		await page.getByRole('button', { name: KOPIA_ZAPIS.dodajWiersz }).click();
		await expect(poleGodzin(page)).toHaveCount(przed + 1);
		await poleGodzin(page).last().fill('20:00–21:00');

		await page.getByRole('button', { name: KOPIA_ZAPIS.dodajWiersz }).click();
		await expect(poleGodzin(page)).toHaveCount(przed + 2);

		await expect(poleGodzin(page).last()).toBeFocused();
		await expect(poleGodzin(page).last()).toHaveValue('');
		// And the row added first kept what was typed into it.
		await expect(poleGodzin(page).nth(przed)).toHaveValue('20:00–21:00');
	});

	// THE CASE THAT PROVES WHERE THE PATTERN LIVES. With scripting off there is no client
	// code at all, so the only thing that can add a row is the server.
	test('to samo dziala przy WYLACZONYM JavaScripcie, wiec wiersz dodaje serwer, nie przegladarka', async ({
		browser
	}) => {
		const kontekst = await zalogujBezSkryptow(browser);
		try {
			const page = await kontekst.newPage();
			const odpowiedz = await page.goto(PLAN);
			expect(odpowiedz?.status()).toBe(200);
			const przed = await poleGodzin(page).count();
			expect(przed).toBe(planDnia.rows.length);

			await poleGodzin(page).first().fill('5:55–6:55');
			await page.getByRole('button', { name: KOPIA_ZAPIS.dodajWiersz }).click();

			await expect(poleGodzin(page)).toHaveCount(przed + 1);
			await expect(poleGodzin(page).first()).toHaveValue('5:55–6:55');
			await expect(poleGodzin(page).last()).toHaveValue('');
			await expect(grupa(page, POLA_PLAN_DNIA.grupaLegenda).locator('[role="status"]')).toHaveText(
				dodanoWiersz(przed + 1)
			);
			// Focus is moved by the attribute the SERVER rendered, which is the only mechanism
			// available on a document nothing scripted.
			await expect(poleGodzin(page).last()).toHaveAttribute('autofocus', '');
			await expect(page.locator('[data-panel="sukces"]')).toHaveCount(0);
		} finally {
			await kontekst.close();
		}
	});

	test('dodanie wartosci na ekranie O nas zachowuje sie tak samo i nie rusza listy zdjec', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(O_NAS);
		const przed = await poleTytuluWartosci(page).count();
		const zdjecPrzed = await page.locator('main img').count();

		await poleTytuluWartosci(page).first().fill('Zmieniona pierwsza wartość');
		await page.getByRole('button', { name: KOPIA_ZAPIS.dodajWartosc }).click();

		await expect(poleTytuluWartosci(page)).toHaveCount(przed + 1);
		await expect(poleTytuluWartosci(page).first()).toHaveValue('Zmieniona pierwsza wartość');
		await expect(poleTytuluWartosci(page).last()).toBeFocused();
		await expect(grupa(page, POLA_O_NAS.wartosciLegenda).locator('[role="status"]')).toHaveText(
			dodanoWiersz(przed + 1)
		);
		// The other list is untouched, and so is its own status line: two groups, two
		// independent announcements.
		await expect(page.locator('main img')).toHaveCount(zdjecPrzed);
		await expect(
			grupa(page, POLA_O_NAS.zdjeciaLegenda).locator('[role="status"]').first()
		).toHaveText('');
	});
});

// =========================================================================================
// Contract 7: removing a row, including from the MIDDLE
// =========================================================================================

test.describe('Powtarzalna grupa: usuwanie wiersza (kontrakt 7, T-04.1-34)', () => {
	test('usuniecie srodkowego wiersza zostawia pozostale w kolejnosci, bez dziury i bez straty', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(PLAN);
		const przed = await poleGodzin(page).count();
		expect(przed).toBeGreaterThan(3);

		// An unsaved edit in a row AFTER the one being removed: if the re-render shifted
		// values by one instead of shifting rows, this is where it would show.
		await poleOpisu(page).nth(3).fill('Opis, ktory ma przezyc usuniecie');
		const oczekiwane = [
			planDnia.rows[0].time,
			planDnia.rows[2].time,
			planDnia.rows[3].time,
			planDnia.rows[4].time
		];

		await page.getByRole('button', { name: KOPIA_ZAPIS.usunWiersz }).nth(1).click();

		await expect(poleGodzin(page)).toHaveCount(przed - 1);
		for (let i = 0; i < oczekiwane.length; i++) {
			await expect(poleGodzin(page).nth(i)).toHaveValue(oczekiwane[i]);
		}
		await expect(poleOpisu(page).nth(2)).toHaveValue('Opis, ktory ma przezyc usuniecie');
		await expect(grupa(page, POLA_PLAN_DNIA.grupaLegenda).locator('[role="status"]')).toHaveText(
			usunietoWiersz(2)
		);
		// The control the editor was in has stopped existing, so focus lands on the add
		// button rather than falling to the top of the document.
		await expect(page.getByRole('button', { name: KOPIA_ZAPIS.dodajWiersz })).toBeFocused();
		await expect(page.locator('[data-panel="sukces"]')).toHaveCount(0);
	});

	test('usuwanie tez dziala przy WYLACZONYM JavaScripcie', async ({ browser }) => {
		const kontekst = await zalogujBezSkryptow(browser);
		try {
			const page = await kontekst.newPage();
			await page.goto(PLAN);
			const przed = await poleGodzin(page).count();

			await page.getByRole('button', { name: KOPIA_ZAPIS.usunWiersz }).nth(1).click();

			await expect(poleGodzin(page)).toHaveCount(przed - 1);
			await expect(poleGodzin(page).nth(1)).toHaveValue(planDnia.rows[2].time);
			await expect(grupa(page, POLA_PLAN_DNIA.grupaLegenda).locator('[role="status"]')).toHaveText(
				usunietoWiersz(2)
			);
			await expect(page.getByRole('button', { name: KOPIA_ZAPIS.dodajWiersz })).toHaveAttribute(
				'autofocus',
				''
			);
		} finally {
			await kontekst.close();
		}
	});

	test('usuniecie wartosci na ekranie O nas zostawia pozostale w kolejnosci', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(O_NAS);
		const przed = await poleTytuluWartosci(page).count();

		await page.getByRole('button', { name: KOPIA_ZAPIS.usunWartosc }).first().click();

		await expect(poleTytuluWartosci(page)).toHaveCount(przed - 1);
		await expect(poleTytuluWartosci(page).first()).toHaveValue(oNas.wartosci[1].tytul);
		await expect(grupa(page, POLA_O_NAS.wartosciLegenda).locator('[role="status"]')).toHaveText(
			usunietoWiersz(1)
		);
	});
});

// =========================================================================================
// 05-UI-SPEC Contract 9: changing the ORDER of a repeated group (05 D-22)
//
// The two screens below are the two that mount PowtarzalnaGrupa, and between them they
// cover BOTH branches of its `wlasnaRamka` split: the O nas photo group is the
// `<div class="element">` branch (the one the gallery of plan 05-06 will use) and the
// plan-dnia rows are the `<fieldset class="element">` branch. The O nas wartości group is
// the live OPT-OUT subject and has a case of its own.
// =========================================================================================

test.describe('Zmiana kolejnosci zdjec na ekranie O nas (kontrakt 9, D-22)', () => {
	const BAZOWE = oNas.obiekt_zdjecia.map((zdjecie) => zdjecie.plik);

	test('kazda pozycja ma wlasny przycisk w gore i w dol, a nazwa kazdego z nich wskazuje ta pozycje', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(O_NAS);

		for (let numer = 1; numer <= BAZOWE.length; numer++) {
			await expect(przyciskWGore(page, legendaZdjecia(numer))).toHaveCount(1);
			await expect(przyciskWDol(page, legendaZdjecia(numer))).toHaveCount(1);
		}
		// WCAG 2.4.4: not one of them is called only „Przenieś wyżej". A list of identical
		// names is one name repeated, which is the whole reason the suffix exists.
		await expect(
			page.getByRole('button', { name: KOPIA_ZAPIS.przeniesWGore, exact: true })
		).toHaveCount(0);
		await expect(
			page.getByRole('button', { name: KOPIA_ZAPIS.przeniesWDol, exact: true })
		).toHaveCount(0);
	});

	test('pierwsza pozycja ma wylaczone przeniesienie w gore, ostatnia w dol, i oba sa wyrenderowane', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(O_NAS);
		const ostatnia = BAZOWE.length;

		// RENDERED and disabled, never omitted, so the button row keeps a stable geometry and
		// a stable focus order as an editor works down the list.
		await expect(przyciskWGore(page, legendaZdjecia(1))).toBeDisabled();
		await expect(przyciskWDol(page, legendaZdjecia(ostatnia))).toBeDisabled();
		await expect(przyciskWDol(page, legendaZdjecia(1))).toBeEnabled();
		await expect(przyciskWGore(page, legendaZdjecia(ostatnia))).toBeEnabled();
	});

	test('przeniesienie zamienia pozycje miejscami, oglasza zmiane i niczego nie zapisuje', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(O_NAS);
		await expect.poll(() => nazwyZdjec(page)).toEqual(BAZOWE);

		await przyciskWGore(page, legendaZdjecia(2)).click();

		await expect.poll(() => nazwyZdjec(page)).toEqual([BAZOWE[1], BAZOWE[0]]);
		await expect(statusGrupy(page, POLA_O_NAS.zdjeciaLegenda)).toHaveText(przeniesionoWiersz(2, 1));
		// AND NOTHING WAS SAVED, which is the property the note above the add button promises
		// permanently and which this action shares with the add and the remove.
		await expect(page.locator('[data-panel="sukces"]')).toHaveCount(0);
		await expect(page.getByText(KOPIA_ZAPIS.notaGrupyZKolejnoscia).first()).toBeVisible();
	});

	// THE CASE A WRONG FOCUS TARGET ACTUALLY FAILS. One move followed by a second one on the
	// SAME item, with the second one pressed on whatever has focus rather than located again:
	// if focus went to the caption field, or to the button at the OLD position, the second
	// press moves something else or nothing at all.
	test('dwa przeniesienia pod rzad dzialaja, bo fokus idzie na przycisk w NOWEJ pozycji', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(O_NAS);
		await page.getByRole('button', { name: KOPIA_ZAPIS.dodajZdjecie }).click();
		await expect(przyciskWGore(page, legendaZdjecia(3))).toHaveCount(1);
		await expect.poll(() => nazwyZdjec(page)).toEqual([...BAZOWE, '']);

		await przyciskWGore(page, legendaZdjecia(3)).click();

		await expect.poll(() => nazwyZdjec(page)).toEqual([BAZOWE[0], '', BAZOWE[1]]);
		await expect(przyciskWGore(page, legendaZdjecia(2))).toBeFocused();

		await page.keyboard.press('Enter');

		await expect.poll(() => nazwyZdjec(page)).toEqual(['', BAZOWE[0], BAZOWE[1]]);
		// The item reached the top, so the button that performed the move is now disabled.
		// Focus goes to the opposite-direction button of the SAME item and is never lost.
		await expect(przyciskWGore(page, legendaZdjecia(1))).toBeDisabled();
		await expect(przyciskWDol(page, legendaZdjecia(1))).toBeFocused();
	});

	// REG-1 of 05-VALIDATION.md, with a LIVE subject rather than a claim: the wartości group
	// deliberately passes none of the new props, so it must render exactly what it rendered
	// before. Every prop this plan adds is opt-in precisely so this stays true.
	test('grupa wartosci nie ma zadnego przycisku przenoszenia, bo nie wlaczyla tych propsow (REG-1)', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(O_NAS);
		const wartosci = grupa(page, POLA_O_NAS.wartosciLegenda);

		await expect(wartosci.getByRole('button', { name: KOPIA_ZAPIS.przeniesWGore })).toHaveCount(0);
		await expect(wartosci.getByRole('button', { name: KOPIA_ZAPIS.przeniesWDol })).toHaveCount(0);
		// And what it DID have is untouched: one remove button per wartość, and the add.
		await expect(wartosci.getByRole('button', { name: KOPIA_ZAPIS.usunWartosc })).toHaveCount(
			oNas.wartosci.length
		);
		await expect(wartosci.getByRole('button', { name: KOPIA_ZAPIS.dodajWartosc })).toHaveCount(1);
	});

	// THE CASE THAT PROVES WHERE THE REORDER LIVES. With scripting off there is no client code
	// at all, so the only thing that can change the order is the server. The assertion here is
	// the re-rendered ORDER and not the focus: focus after a full page load is a different
	// contract, served by the attribute rather than by the effect.
	test('zmiana kolejnosci dziala przy WYLACZONYM JavaScripcie, wiec przenosi serwer', async ({
		browser
	}) => {
		const kontekst = await zalogujBezSkryptow(browser);
		try {
			const page = await kontekst.newPage();
			const odpowiedz = await page.goto(O_NAS);
			expect(odpowiedz?.status()).toBe(200);
			await expect.poll(() => nazwyZdjec(page)).toEqual(BAZOWE);

			await przyciskWDol(page, legendaZdjecia(1)).click();

			await expect.poll(() => nazwyZdjec(page)).toEqual([BAZOWE[1], BAZOWE[0]]);
			await expect(statusGrupy(page, POLA_O_NAS.zdjeciaLegenda)).toHaveText(
				przeniesionoWiersz(1, 2)
			);
			await expect(page.locator('[data-panel="sukces"]')).toHaveCount(0);
		} finally {
			await kontekst.close();
		}
	});
});

test.describe('Zmiana kolejnosci wierszy na ekranie planu dnia (kontrakt 9, D-22)', () => {
	const BAZOWE = planDnia.rows.map((wiersz) => wiersz.time);

	test('kazdy wiersz ma wlasny przycisk w gore i w dol, a nazwa kazdego z nich wskazuje ten wiersz', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(PLAN);

		for (let numer = 1; numer <= BAZOWE.length; numer++) {
			await expect(przyciskWGore(page, legendaWiersza(numer))).toHaveCount(1);
			await expect(przyciskWDol(page, legendaWiersza(numer))).toHaveCount(1);
		}
		await expect(
			page.getByRole('button', { name: KOPIA_ZAPIS.przeniesWGore, exact: true })
		).toHaveCount(0);
	});

	test('pierwszy wiersz ma wylaczone przeniesienie w gore, ostatni w dol', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(PLAN);
		const ostatni = BAZOWE.length;

		await expect(przyciskWGore(page, legendaWiersza(1))).toBeDisabled();
		await expect(przyciskWDol(page, legendaWiersza(ostatni))).toBeDisabled();
		await expect(przyciskWDol(page, legendaWiersza(1))).toBeEnabled();
		await expect(przyciskWGore(page, legendaWiersza(ostatni))).toBeEnabled();
	});

	test('przeniesienie srodkowego wiersza w dol zachowuje kazda niezapisana wartosc i oglasza zmiane', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(PLAN);
		// Something typed and NOT saved, in the row that is about to travel.
		await poleOpisu(page).nth(2).fill('Opis, ktory ma pojechac razem z wierszem');

		await przyciskWDol(page, legendaWiersza(3)).click();

		const oczekiwane = [...BAZOWE];
		const [przeniesiony] = oczekiwane.splice(2, 1);
		oczekiwane.splice(3, 0, przeniesiony);
		await expect.poll(() => kolejnoscGodzin(page)).toEqual(oczekiwane);
		// The description travelled WITH its row rather than staying at the old position.
		await expect(poleOpisu(page).nth(3)).toHaveValue('Opis, ktory ma pojechac razem z wierszem');
		await expect(statusGrupy(page, POLA_PLAN_DNIA.grupaLegenda)).toHaveText(
			przeniesionoWiersz(3, 4)
		);
		await expect(page.locator('[data-panel="sukces"]')).toHaveCount(0);
	});

	test('dwa przeniesienia pod rzad dzialaja tez tutaj, na drugiej galezi komponentu', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(PLAN);

		await przyciskWGore(page, legendaWiersza(3)).click();

		const poPierwszym = [BAZOWE[0], BAZOWE[2], BAZOWE[1], ...BAZOWE.slice(3)];
		await expect.poll(() => kolejnoscGodzin(page)).toEqual(poPierwszym);
		await expect(przyciskWGore(page, legendaWiersza(2))).toBeFocused();

		await page.keyboard.press('Enter');

		await expect
			.poll(() => kolejnoscGodzin(page))
			.toEqual([BAZOWE[2], BAZOWE[0], BAZOWE[1], ...BAZOWE.slice(3)]);
		await expect(przyciskWGore(page, legendaWiersza(1))).toBeDisabled();
		await expect(przyciskWDol(page, legendaWiersza(1))).toBeFocused();
	});

	test('zmiana kolejnosci wierszy dziala przy WYLACZONYM JavaScripcie', async ({ browser }) => {
		const kontekst = await zalogujBezSkryptow(browser);
		try {
			const page = await kontekst.newPage();
			const odpowiedz = await page.goto(PLAN);
			expect(odpowiedz?.status()).toBe(200);
			await expect.poll(() => kolejnoscGodzin(page)).toEqual(BAZOWE);

			await przyciskWDol(page, legendaWiersza(1)).click();

			await expect
				.poll(() => kolejnoscGodzin(page))
				.toEqual([BAZOWE[1], BAZOWE[0], ...BAZOWE.slice(2)]);
			await expect(statusGrupy(page, POLA_PLAN_DNIA.grupaLegenda)).toHaveText(
				przeniesionoWiersz(1, 2)
			);
			await expect(page.locator('[data-panel="sukces"]')).toHaveCount(0);
		} finally {
			await kontekst.close();
		}
	});
});

// =========================================================================================
// Contract 10a and 10b: refusals and the save
// =========================================================================================

test.describe('Zapis planu dnia i jego odmowy', () => {
	test('zapis planu z wierszem bez godzin renderuje podsumowanie, dostaje fokus i linkuje do wiersza', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(PLAN);
		await poleGodzin(page).nth(1).fill('');

		await przyciskZapisz(page).click();

		const panel = page.locator('[data-panel="blad"]');
		await expect(panel).toBeVisible();
		await expect(panel).toBeFocused();
		await expect(panel).toContainText(KOPIA_WALIDACJA.podsumowanieNaglowek);
		// The entry NAMES the row it leads to, so a list of identical messages cannot happen
		// (WCAG 2.4.4).
		const odnosnik = panel.getByRole('link', {
			name: bladWElemencie(legendaWiersza(2), KOPIA_WALIDACJA.godzinyBrak)
		});
		await expect(odnosnik).toHaveAttribute('href', '#wiersz-1-godziny');
		// And the message is attached to the control itself, not only to the summary.
		await expect(poleGodzin(page).nth(1)).toHaveAttribute('aria-invalid', 'true');
		await expect(page.locator('[data-panel="sukces"]')).toHaveCount(0);
		// Contract 10c: nothing typed was lost.
		await expect(poleGodzin(page).first()).toHaveValue(planDnia.rows[0].time);
	});

	test('poprawny zapis planu dnia renderuje panel Zapisano z odnosnikiem do strony publicznej', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(PLAN);
		await poleOpisu(page).first().fill('Przyjmowanie dzieci i swobodna zabawa');

		await przyciskZapisz(page).click();

		const panel = page.locator('[data-panel="sukces"]');
		await expect(panel).toBeVisible();
		await expect(panel).toContainText(KOPIA_ZAPIS.zapisanoTresc);
		await expect(panel.getByRole('link')).toHaveAttribute('href', '/o-nas');
		await expect(panel).toContainText(zobaczStrone(KOPIA_EKRAN_PLANU.stronaNazwa));
		// POST then redirect then GET, so a refresh cannot save a second time (D-11).
		expect(page.url()).toContain('zapisano=1');
		await expect(page.locator('[data-panel="blad"]')).toHaveCount(0);
	});
});

test.describe('Zapis strony O nas i jego odmowy', () => {
	test('liczba kadry przyjmuje liczbe i odmawia wartosci spoza zakresu polskim komunikatem', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(O_NAS);
		const pole = page.getByLabel(POLA_O_NAS.kadraOpiekunkiEtykieta, { exact: false });

		await pole.fill('8');
		await przyciskZapisz(page).click();
		await expect(page.locator('[data-panel="sukces"]')).toBeVisible();

		await page.goto(O_NAS);
		await pole.fill('150');
		await przyciskZapisz(page).click();
		const panel = page.locator('[data-panel="blad"]');
		await expect(panel).toBeVisible();
		await expect(panel).toContainText(KOPIA_WALIDACJA.liczbaNiepoprawna);
		await expect(pole).toHaveAttribute('aria-invalid', 'true');
	});

	test('serwer odmawia takze wartosci, ktorej sama kontrolka nie potrafi wyprodukowac', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(O_NAS);
		const pole = page.getByLabel(POLA_O_NAS.kadraOpiekunkiEtykieta, { exact: false });
		// A number control refuses to hold „sześć" at all, so the only way to prove the
		// SERVER refuses it is to post it the way a hand-built request would.
		await pole.evaluate((element) => ((element as HTMLInputElement).type = 'text'));
		await pole.fill('sześć');

		await przyciskZapisz(page).click();

		await expect(page.locator('[data-panel="blad"]')).toContainText(
			KOPIA_WALIDACJA.liczbaNiepoprawna
		);
		await expect(page.locator('[data-panel="sukces"]')).toHaveCount(0);
	});

	test('niepelna wartosc jest odmowiona komunikatem nazywajacym te wartosc', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(O_NAS);
		await poleTytuluWartosci(page).nth(1).fill('');

		await przyciskZapisz(page).click();

		const panel = page.locator('[data-panel="blad"]');
		await expect(panel).toBeVisible();
		await expect(
			panel.getByRole('link', {
				name: bladWElemencie(legendaWartosci(2), KOPIA_WALIDACJA.wartoscNiepelna)
			})
		).toHaveAttribute('href', '#wartosc-1-tytul');
	});

	// THE D-15 CASE. With scripting off the island does nothing at all, so the only thing
	// that can refuse this save is the server.
	test('zdjecie obiektu z pustym opisem odmawia zapisu przy WYLACZONYM JavaScripcie (D-15)', async ({
		browser
	}) => {
		const kontekst = await zalogujBezSkryptow(browser);
		try {
			const page = await kontekst.newPage();
			const odpowiedz = await page.goto(O_NAS);
			expect(odpowiedz?.status()).toBe(200);

			// The honest notice is served to this browser and says what still works.
			const notka = page.locator('main noscript').first();
			expect(await notka.textContent()).toContain(KOPIA_ZDJECIA.bezSkryptow);

			const alt = page.getByLabel(POLA_O_NAS.zdjecieAltEtykieta, { exact: false }).first();
			await expect(alt).toHaveValue(oNas.obiekt_zdjecia[0].alt);
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

	test('nowe zdjecie przygotowane w przegladarce trafia do ukrytego pola tej pozycji', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(O_NAS);
		await page.getByRole('button', { name: KOPIA_ZAPIS.dodajZdjecie }).click();

		const nowe = page.locator('main input[type="file"]').last();
		// The new item's own control has focus, which is what the server's attribute asked
		// for and what an editor who just pressed „Dodaj zdjęcie" expects.
		await expect(nowe).toBeFocused();
		await nowe.setInputFiles(PLIK_ZDJECIA);

		const ukryte = page.locator('main input[name="zdjecie[2].dane"]');
		await expect(ukryte).not.toHaveValue('');
		expect((await ukryte.inputValue()).startsWith('data:image/jpeg;base64,')).toBe(true);
		// The ready sentence names the 4:3 ratio, which is the o nas one and not the
		// aktualność one.
		await expect(page.getByText(KOPIA_ZDJECIA.gotowe43)).toBeVisible();
	});

	test('pozycja zdjecia bez zdjecia jest odmowiona instrukcja nazywajaca oba wyjscia', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(O_NAS);
		await page.getByRole('button', { name: KOPIA_ZAPIS.dodajZdjecie }).click();

		await przyciskZapisz(page).click();

		await expect(page.locator('[data-panel="blad"]')).toContainText(KOPIA_WALIDACJA.zdjecieBrak);
		await expect(page.locator('[data-panel="sukces"]')).toHaveCount(0);
	});

	test('poprawny zapis strony O nas renderuje panel Zapisano z odnosnikiem do strony publicznej', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(O_NAS);
		await page
			.getByLabel(POLA_O_NAS.misjaEtykieta, { exact: false })
			.fill('Nowa misja żłobka, **wytłuszczona** i krótka.');

		await przyciskZapisz(page).click();

		const panel = page.locator('[data-panel="sukces"]');
		await expect(panel).toBeVisible();
		await expect(panel.getByRole('link')).toHaveAttribute('href', '/o-nas');
		await expect(panel).toContainText(zobaczStrone(KOPIA_EKRAN_O_NAS.stronaNazwa));
		expect(page.url()).toContain('zapisano=1');
	});
});

// =========================================================================================
// Accessibility (WCAG 2.1 AA)
// =========================================================================================

test.describe('Dostepnosc obu ekranow (WCAG 2.1 AA)', () => {
	test('plan dnia bez zmian nie narusza WCAG 2.1 AA', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(PLAN);
		await expect(poleGodzin(page).first()).toBeVisible();
		const wynik = await new AxeBuilder({ page }).withTags(ZNACZNIKI).analyze();
		expect(wynik.violations).toEqual([]);
	});

	test('plan dnia po dodaniu wiersza nie narusza WCAG 2.1 AA', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(PLAN);
		const przed = await poleGodzin(page).count();
		await page.getByRole('button', { name: KOPIA_ZAPIS.dodajWiersz }).click();
		await expect(poleGodzin(page)).toHaveCount(przed + 1);
		const wynik = await new AxeBuilder({ page }).withTags(ZNACZNIKI).analyze();
		expect(wynik.violations).toEqual([]);
	});

	test('plan dnia z podsumowaniem bledow nie narusza WCAG 2.1 AA', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(PLAN);
		await poleGodzin(page).nth(1).fill('');
		await przyciskZapisz(page).click();
		await expect(page.locator('[data-panel="blad"]')).toBeVisible();
		const wynik = await new AxeBuilder({ page }).withTags(ZNACZNIKI).analyze();
		expect(wynik.violations).toEqual([]);
	});

	test('O nas bez zmian nie narusza WCAG 2.1 AA', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(O_NAS);
		await expect(poleTytuluWartosci(page).first()).toBeVisible();
		const wynik = await new AxeBuilder({ page }).withTags(ZNACZNIKI).analyze();
		expect(wynik.violations).toEqual([]);
	});

	test('O nas ze swiezo wczytanym podgladem zdjecia nie narusza WCAG 2.1 AA', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(O_NAS);
		await page.getByRole('button', { name: KOPIA_ZAPIS.dodajZdjecie }).click();
		await page.locator('main input[type="file"]').last().setInputFiles(PLIK_ZDJECIA);
		await expect(page.getByText(KOPIA_ZDJECIA.gotowe43)).toBeVisible();
		const wynik = await new AxeBuilder({ page }).withTags(ZNACZNIKI).analyze();
		expect(wynik.violations).toEqual([]);
	});

	test('O nas z podsumowaniem bledow nie narusza WCAG 2.1 AA', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(O_NAS);
		await poleTytuluWartosci(page).nth(1).fill('');
		await przyciskZapisz(page).click();
		await expect(page.locator('[data-panel="blad"]')).toBeVisible();
		const wynik = await new AxeBuilder({ page }).withTags(ZNACZNIKI).analyze();
		expect(wynik.violations).toEqual([]);
	});
});
