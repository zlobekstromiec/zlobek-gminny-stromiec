import AxeBuilder from '@axe-core/playwright';
import { test, expect, tokenSesji, NAZWA_CIASTKA } from './fixtures/admin';
import {
	KOPIA_LISTY,
	KOPIA_PLIKU,
	KOPIA_WALIDACJA,
	KOPIA_ZAPIS,
	KOPIA_EKRAN_DOKUMENTU,
	KOPIA_USUWANIE,
	POLA_DATA,
	POLA_DOKUMENT,
	metaDokumentu
} from '../src/lib/content/panel';
import { KATEGORIE } from '../src/lib/kategorie-dokumentow';

/**
 * Browser acceptance gate for the dokumenty screens (CMS-02, CMS-03; D-07, D-13, D-14, P-22,
 * P-23, P-24; 04.1-UI-SPEC Component Contracts 4, 5, 9, 10 and 11).
 *
 * EVERY CASE TAKES `zalogowany` EXPLICITLY. Playwright fixtures are LAZY: a case that
 * destructures only `{ page }` never instantiates the authenticated fixture, runs with no
 * session, and silently exercises the login screen instead of the screen under test. Eight
 * cases in tests/admin-nabor.spec.ts passed that way before it was caught, so every case
 * below also asserts something only the real screen can satisfy.
 *
 * THE TWO CASES THAT NOTHING ELSE CAN CATCH:
 *  • the metadata-only save repeated with SCRIPTING SWITCHED OFF, which is the honest half of
 *    the P-22 deviation and the only version of that assertion that proves it;
 *  • axe with a file actually selected, because the empty form is not the state the
 *    accessibility risk is in.
 *
 * WHAT IT CANNOT PROVE, and does not pretend to: that a save becomes one real commit carrying
 * two files. Under PANEL_DRY_RUN no commit exists to inspect, and a spec that mocked it would
 * assert its own mock. That is the live verification the phase UAT owns.
 */

const LISTA = '/admin/dokumenty';
const NOWY = '/admin/dokumenty/nowy';

/** The seeded document whose entry AND file both exist in this repository. Its slug is the
 *  on-disk filename stem, which is what every panel URL for it uses. */
const SEED = {
	slug: 'statut-zlobka',
	nazwa: 'Statut żłobka (uchwała XXIII.133.2026)',
	typ: 'PDF',
	wersja: '29.01.2026',
	plik: 'statut-zlobka.pdf'
};

/** A real, small PDF that already lives in this repository, used as the file an editor
 *  chooses. Deliberately not a new fixture: a binary committed for a test is one more file in
 *  a public repository that nobody needed. */
const PLIK = `static/dokumenty/${SEED.plik}`;

const ZNACZNIKI = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

type Strona = import('@playwright/test').Page;

function polePliku(page: Strona) {
	return page.locator('main input[type="file"]');
}

function ukrytePolePliku(page: Strona) {
	return page.locator('main input[name="plik"]');
}

function status(page: Strona) {
	return page.locator('main [role="status"]');
}

function formularz(page: Strona) {
	return page.locator('main form');
}

/** Choose the file and wait for the island to finish. The ready sentence is the only signal
 *  there is, which is the point: there is no spinner to wait on. */
async function wybierzPlik(page: Strona) {
	await polePliku(page).setInputFiles(PLIK);
	await expect(status(page)).toHaveText(KOPIA_PLIKU.gotowe);
}

async function wypelnij(
	page: Strona,
	dane: { nazwa: string; kategoria: string; dzien: string; miesiac: string; rok: string }
) {
	await page.getByLabel(POLA_DOKUMENT.nazwaEtykieta, { exact: false }).fill(dane.nazwa);
	await page
		.getByLabel(POLA_DOKUMENT.kategoriaEtykieta, { exact: false })
		.selectOption(dane.kategoria);
	await page.getByLabel(POLA_DATA.dzien, { exact: true }).selectOption(dane.dzien);
	await page.getByLabel(POLA_DATA.miesiac, { exact: true }).selectOption(dane.miesiac);
	await page.getByLabel(POLA_DATA.rok, { exact: true }).selectOption(dane.rok);
}

async function zapisz(page: Strona) {
	await page.getByRole('button', { name: KOPIA_ZAPIS.zapisz, exact: true }).click();
}

// ---------------------------------------------------------------------------------------
// The list.
// ---------------------------------------------------------------------------------------

test('lista pokazuje wszystkie trzy kategorie w ustalonej kolejnosci', async ({
	page,
	zalogowany
}) => {
	expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
	await page.goto(LISTA);

	await expect(page.getByRole('heading', { level: 1 })).toHaveText(KOPIA_LISTY.dokumentyNaglowek);
	const naglowki = page.locator('main h2');
	await expect(naglowki).toHaveText([...POLA_DOKUMENT.kategorieOpcje]);
	// The order the headings render in is the shared category order, which is also the order
	// the category select offers and the order the public page groups by.
	expect(POLA_DOKUMENT.kategorieOpcje.length).toBe(KATEGORIE.length);
});

test('kategoria bez dokumentow ma naglowek i jednolinijkowa notatke (D-13, P-24)', async ({
	page,
	zalogowany
}) => {
	expect(zalogowany.adres.length).toBeGreaterThan(0);
	await page.goto(LISTA);

	// RODO is dormant: the public page omits the group entirely, and the panel must not,
	// because a drawer with no heading is a drawer an editor cannot see exists.
	const rodo = page.locator('section', { has: page.getByRole('heading', { name: 'RODO' }) });
	await expect(rodo.getByText(KOPIA_LISTY.pustaKategoria)).toBeVisible();
	// Exactly one category is empty in the seeds, so the note appears exactly once.
	await expect(page.getByText(KOPIA_LISTY.pustaKategoria)).toHaveCount(1);
});

test('zasiane dokumenty stoja pod wlasciwymi kategoriami, z meta i odznaka', async ({
	page,
	zalogowany
}) => {
	expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
	await page.goto(LISTA);

	const statut = page.locator('section', {
		has: page.getByRole('heading', { name: POLA_DOKUMENT.kategorieOpcje[1] })
	});
	// THE PRIMARY LINK IS THE FIRST LINK IN THE ROW, which is Contract 4 itself: the document's
	// name is the link, never the word „Edytuj". The two row actions repeat the name in a
	// visually hidden suffix, which is why a name-only locator matches three elements and this
	// one deliberately addresses the row's first link instead.
	const wiersz = statut.locator('li').filter({ hasText: SEED.nazwa }).first();
	const glowny = wiersz.getByRole('link').first();
	await expect(glowny).toHaveAttribute('href', `${LISTA}/${SEED.slug}`);
	// The meta is inside that same link, so a screen reader announces it with the name.
	await expect(glowny).toContainText(metaDokumentu(SEED.typ, SEED.wersja));
	// All three seeds are placeholder content today.
	await expect(statut.getByText(KOPIA_LISTY.odznakaZastepcza).first()).toBeVisible();

	const rekrutacja = page.locator('section', {
		has: page.getByRole('heading', { name: POLA_DOKUMENT.kategorieOpcje[0] })
	});
	await expect(
		rekrutacja.locator('li').filter({ hasText: 'Wniosek o przyjęcie dziecka' })
	).toHaveCount(1);
});

test('lista nie zawiera zadnego elementu wysylajacego formularz (T-04.1-27)', async ({
	page,
	zalogowany
}) => {
	expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
	await page.goto(LISTA);

	await expect(page.locator('main form')).toHaveCount(0);
	await expect(page.locator('main button')).toHaveCount(0);
	// „Usuń" is a LINK to the confirmation page, never a control that deletes.
	const usun = page.getByRole('link', { name: new RegExp(`${KOPIA_LISTY.usun}\\s`) }).first();
	await expect(usun).toHaveAttribute('href', new RegExp('/usun$'));
});

// ---------------------------------------------------------------------------------------
// The create screen.
// ---------------------------------------------------------------------------------------

test('ekran dodawania oferuje dokladnie te kategorie, ktore zna czytnik (P-24)', async ({
	page,
	zalogowany
}) => {
	expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
	await page.goto(NOWY);

	await expect(page.getByRole('heading', { level: 1 })).toHaveText(
		KOPIA_EKRAN_DOKUMENTU.nowyNaglowek
	);
	const wybor = page.getByLabel(POLA_DOKUMENT.kategoriaEtykieta, { exact: false });
	const wartosci = await wybor
		.locator('option')
		.evaluateAll((opcje) => opcje.map((opcja) => (opcja as HTMLOptionElement).value));
	// The explicit empty first option, then the three the union declares, in its order.
	expect(wartosci).toEqual(['', ...KATEGORIE]);
});

test('wersja to trzy selekty, nigdy natywna kontrolka daty', async ({ page, zalogowany }) => {
	expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
	await page.goto(NOWY);

	const grupa = page.locator('main fieldset', { hasText: POLA_DOKUMENT.wersjaLegenda });
	await expect(grupa.locator('select')).toHaveCount(3);
	// The native date picker draws its chrome in the browser locale and cannot be forced to
	// Polish, which is why this project refuses it everywhere.
	await expect(page.locator('main input[type="date"], main input[type="month"]')).toHaveCount(0);
});

test('odmowa wymienia kazde brakujace pole i prowadzi do jego kontrolki', async ({
	page,
	zalogowany
}) => {
	expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
	await page.goto(NOWY);

	// Nothing filled in: no name, no category, no file.
	await zapisz(page);

	const panel = page.getByRole('alert');
	await expect(panel).toContainText(KOPIA_WALIDACJA.podsumowanieNaglowek);
	await expect(panel).toBeFocused();

	for (const [komunikat, cel] of [
		[KOPIA_WALIDACJA.nazwaBrak, 'dokument-nazwa'],
		[KOPIA_WALIDACJA.kategoriaBrak, 'dokument-kategoria'],
		[KOPIA_WALIDACJA.plikBrak, 'dokument-plik-pole']
	] as const) {
		const odnosnik = panel.getByRole('link', { name: komunikat });
		await expect(odnosnik).toHaveAttribute('href', `#${cel}`);
		await expect(page.locator(`#${cel}`)).toHaveCount(1);
	}
});

test('wybrany plik trafia do ukrytego pola jako data URL i jest nazwany na ekranie', async ({
	page,
	zalogowany
}) => {
	expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
	await page.goto(NOWY);

	await expect(ukrytePolePliku(page)).toHaveValue('');
	await wybierzPlik(page);

	// The payload is produced entirely in the browser (P-22): the server never encodes.
	const wartosc = await ukrytePolePliku(page).inputValue();
	expect(wartosc.startsWith('data:application/pdf;base64,')).toBe(true);
	expect(wartosc.length).toBeGreaterThan(100);

	// The file's own name is what the editor sees, because there is nothing to preview.
	await expect(page.getByText(SEED.plik, { exact: false })).toBeVisible();
	await expect(page.getByRole('button', { name: KOPIA_PLIKU.usun })).toBeVisible();
});

test('usuniecie wybranego pliku czysci pole i wraca fokusem do kontrolki', async ({
	page,
	zalogowany
}) => {
	expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
	await page.goto(NOWY);
	await wybierzPlik(page);

	await page.getByRole('button', { name: KOPIA_PLIKU.usun }).click();
	await expect(ukrytePolePliku(page)).toHaveValue('');
	await expect(status(page)).toHaveText(KOPIA_PLIKU.usunieto);
	await expect(polePliku(page)).toBeFocused();
});

test('poprawne dodanie konczy sie panelem zapisu z odnosnikiem do strony dokumentow', async ({
	page,
	zalogowany
}) => {
	expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
	await page.goto(NOWY);

	await wypelnij(page, {
		nazwa: 'Regulamin opłat 2027',
		kategoria: 'rekrutacja',
		dzien: '2',
		miesiac: '4',
		rok: '2026'
	});
	await wybierzPlik(page);
	await zapisz(page);

	// The create redirects to the LIST and never to the new document's own edit screen: the
	// panel reads content through a build-time glob, so that screen could only answer „nie
	// znaleziono tej treści" for the next two minutes.
	await expect(page).toHaveURL(new RegExp(`${LISTA}\\?zapisano=regulamin-oplat-2027$`));
	const panel = page.getByRole('status').filter({ hasText: KOPIA_ZAPIS.zapisanoNaglowek });
	await expect(panel).toContainText(KOPIA_ZAPIS.zapisanoTresc);
	await expect(panel.getByRole('link')).toHaveAttribute('href', '/dokumenty');
});

test('dodanie dokumentu o zajetej nazwie jest odmowione i nic nie zapisuje (P-23)', async ({
	page,
	zalogowany
}) => {
	expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
	await page.goto(NOWY);

	// „Statut żłobka" slugs to exactly the filename stem the seeded entry already occupies.
	await wypelnij(page, {
		nazwa: 'Statut żłobka',
		kategoria: 'statut',
		dzien: '2',
		miesiac: '4',
		rok: '2026'
	});
	await wybierzPlik(page);
	await zapisz(page);

	const panel = page.getByRole('alert');
	await expect(panel).toContainText(KOPIA_ZAPIS.kolizjaDokumentNaglowek);
	await expect(panel).toContainText(KOPIA_ZAPIS.kolizjaDokumentTresc);
	// Still on the create screen, and nothing reports a save.
	await expect(page).toHaveURL(new RegExp(`${NOWY}$`));
	await expect(page.getByText(KOPIA_ZAPIS.zapisanoNaglowek)).toHaveCount(0);
	// Contract 10c: the typed values, INCLUDING the chosen file, survived the refusal.
	await expect(page.getByLabel(POLA_DOKUMENT.nazwaEtykieta, { exact: false })).toHaveValue(
		'Statut żłobka'
	);
	expect((await ukrytePolePliku(page).inputValue()).length).toBeGreaterThan(100);
});

// ---------------------------------------------------------------------------------------
// The edit screen.
// ---------------------------------------------------------------------------------------

test('ekran edycji otwiera zapisane wartosci i nazywa plik, ktory dokument juz ma', async ({
	page,
	zalogowany
}) => {
	expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
	await page.goto(`${LISTA}/${SEED.slug}`);

	await expect(page.getByRole('heading', { level: 1 })).toHaveText(
		KOPIA_EKRAN_DOKUMENTU.edycjaNaglowek
	);
	await expect(page.getByLabel(POLA_DOKUMENT.nazwaEtykieta, { exact: false })).toHaveValue(
		SEED.nazwa
	);
	await expect(page.getByLabel(POLA_DOKUMENT.kategoriaEtykieta, { exact: false })).toHaveValue(
		'statut'
	);
	await expect(page.getByLabel(POLA_DATA.dzien, { exact: true })).toHaveValue('29');
	await expect(page.getByLabel(POLA_DATA.miesiac, { exact: true })).toHaveValue('1');
	await expect(page.getByLabel(POLA_DATA.rok, { exact: true })).toHaveValue('2026');
	// The file is named as text, so the editor knows what is attached before replacing it.
	await expect(page.getByText(SEED.plik, { exact: false })).toBeVisible();
	// Nothing is pending on a fresh load.
	await expect(ukrytePolePliku(page)).toHaveValue('');
});

test('nieistniejacy dokument odpowiada panelem braku tresci, a nie formularzem', async ({
	page,
	zalogowany
}) => {
	expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
	await page.goto(`${LISTA}/nie-ma-takiego-dokumentu`);

	await expect(page.getByRole('heading', { level: 1 })).toHaveText(KOPIA_ZAPIS.brakTresciNaglowek);
	await expect(formularz(page)).toHaveCount(0);
});

// THE CASE THAT PROVES THE HONEST HALF OF P-22. With scripting off the island does nothing at
// all, so a save that goes through here is a save that needed no client code: the document
// keeps the file it has and only its metadata changes.
test('edycja metadanych zapisuje sie przy WYLACZONYM JavaScripcie i zachowuje plik (P-22)', async ({
	browser
}) => {
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
		const odpowiedz = await page.goto(`${LISTA}/${SEED.slug}`);
		expect(odpowiedz?.status()).toBe(200);

		// The honest notice is served to this browser, and it says the rest of the form still
		// works. Asserted on the element's TEXT rather than on its visibility, and the reason is
		// worth recording because it looks like a weaker assertion and is not: Playwright
		// switches scripting off by disabling script EXECUTION, which does not flip the flag the
		// HTML parser consults when it decides whether to build the contents of this element
		// into a tree. A real browser with scripting turned off in its settings renders it.
		// Either way the sentence is in the document that was served.
		const notka = page.locator('main noscript');
		await expect(notka).toHaveCount(1);
		expect(await notka.textContent()).toContain(KOPIA_PLIKU.bezSkryptow);

		// NO FILE IS IN THE SUBMISSION. The hidden field is server rendered empty and nothing
		// runs to fill it, which is exactly the case the edit action treats as „keep the file
		// this document already has".
		await expect(ukrytePolePliku(page)).toHaveValue('');

		await page.getByLabel(POLA_DOKUMENT.nazwaEtykieta, { exact: false }).fill(SEED.nazwa);
		await page.getByRole('button', { name: KOPIA_ZAPIS.zapisz, exact: true }).click();

		await expect(page).toHaveURL(new RegExp(`${LISTA}/${SEED.slug}\\?zapisano=1$`));
		await expect(page.getByText(KOPIA_ZAPIS.zapisanoNaglowek)).toBeVisible();
	} finally {
		await kontekst.close();
	}
});

// ---------------------------------------------------------------------------------------
// Deletion.
// ---------------------------------------------------------------------------------------

test('usuniecie prowadzi przez strone potwierdzenia i wraca na liste z panelem', async ({
	page,
	zalogowany
}) => {
	expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
	await page.goto(LISTA);

	await page.getByRole('link', { name: `${KOPIA_LISTY.usun} dokument: ${SEED.nazwa}` }).click();
	await expect(page).toHaveURL(new RegExp(`${LISTA}/${SEED.slug}/usun$`));

	// The question is the h1, it holds focus, and the danger control is never the first
	// focusable element on the page.
	const pytanie = page.getByRole('heading', { level: 1 });
	await expect(pytanie).toHaveText(KOPIA_USUWANIE.dokumentNaglowek);
	await expect(pytanie).toBeFocused();
	// What disappears is quoted by name, with the consequence specific to a document.
	await expect(page.getByText(SEED.nazwa, { exact: false }).first()).toBeVisible();
	await expect(
		page.getByText('Przestanie być dostępny do pobrania', { exact: false })
	).toBeVisible();

	await page.getByRole('button', { name: KOPIA_USUWANIE.dokumentPrzycisk }).click();
	await expect(page).toHaveURL(new RegExp(`${LISTA}\\?usunieto=1$`));
	const panel = page.getByRole('status').filter({ hasText: KOPIA_ZAPIS.usunietoNaglowek });
	await expect(panel).toContainText(KOPIA_ZAPIS.usunietoDokumentTresc);
});

test('strona potwierdzenia nieistniejacego dokumentu nie oferuje przycisku usuwania', async ({
	page,
	zalogowany
}) => {
	expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
	await page.goto(`${LISTA}/nie-ma-takiego-dokumentu/usun`);

	await expect(page.getByRole('heading', { level: 1 })).toHaveText(KOPIA_ZAPIS.brakTresciNaglowek);
	await expect(page.getByRole('button', { name: KOPIA_USUWANIE.dokumentPrzycisk })).toHaveCount(0);
});

// ---------------------------------------------------------------------------------------
// Accessibility. Six states, including the two the empty form cannot reach.
// ---------------------------------------------------------------------------------------

async function skanuj(page: Strona) {
	return await new AxeBuilder({ page }).withTags(ZNACZNIKI).analyze();
}

test('axe nie zglasza naruszen na liscie dokumentow', async ({ page, zalogowany }) => {
	expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
	await page.goto(LISTA);
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	expect((await skanuj(page)).violations).toEqual([]);
});

test('axe nie zglasza naruszen na czystym ekranie dodawania', async ({ page, zalogowany }) => {
	expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
	await page.goto(NOWY);
	await expect(polePliku(page)).toBeVisible();
	expect((await skanuj(page)).violations).toEqual([]);
});

test('axe nie zglasza naruszen przy widocznym podsumowaniu bledow', async ({
	page,
	zalogowany
}) => {
	expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
	await page.goto(NOWY);
	await zapisz(page);
	await expect(page.getByRole('alert')).toBeVisible();
	expect((await skanuj(page)).violations).toEqual([]);
});

test('axe nie zglasza naruszen przy wybranym pliku', async ({ page, zalogowany }) => {
	expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
	await page.goto(NOWY);
	await wybierzPlik(page);
	expect((await skanuj(page)).violations).toEqual([]);
});

test('axe nie zglasza naruszen na ekranie edycji', async ({ page, zalogowany }) => {
	expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
	await page.goto(`${LISTA}/${SEED.slug}`);
	await expect(polePliku(page)).toBeVisible();
	expect((await skanuj(page)).violations).toEqual([]);
});

test('axe nie zglasza naruszen na stronie potwierdzenia usuniecia', async ({
	page,
	zalogowany
}) => {
	expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
	await page.goto(`${LISTA}/${SEED.slug}/usun`);
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	expect((await skanuj(page)).violations).toEqual([]);
});
