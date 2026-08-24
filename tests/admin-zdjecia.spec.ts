import { readFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { test, expect, tokenSesji, NAZWA_CIASTKA } from './fixtures/admin';
import {
	KOPIA_WALIDACJA,
	KOPIA_ZAPIS,
	KOPIA_ZDJECIA,
	POLA_DATA,
	POLA_WPIS
} from '../src/lib/content/panel';
import { PROPORCJA_WPISU } from '../src/lib/zdjecia';

/**
 * Browser acceptance gate for the photo island (CMS-02, CMS-03; D-12, D-13, D-14, D-15;
 * 04.1-UI-SPEC Component Contract 8 and the Accessibility Contract).
 *
 * EVERY CASE TAKES `zalogowany` EXPLICITLY. Playwright fixtures are LAZY: a case that
 * destructures only `{ page }` never instantiates the authenticated fixture, runs with no
 * session, and silently exercises the login screen instead of the screen under test. Eight
 * cases in tests/admin-nabor.spec.ts passed that way before it was caught, so every case
 * below also asserts something only the real screen can satisfy.
 *
 * THIS FILE EXTENDS tests/admin-aktualnosci.spec.ts RATHER THAN REPEATING IT. Everything
 * about titles, dates, slugs, collisions and the save row is proven there; what is proven
 * here is the photo and nothing else.
 *
 * THREE THINGS ARE ASSERTED THAT NOTHING ELSE CAN CATCH:
 *  • the D-15 alt refusal repeated with SCRIPTING SWITCHED OFF, which is the only version
 *    of that assertion that proves the rule lives on the server rather than in the island;
 *  • axe with a preview actually loaded, because the empty form is not the state the
 *    accessibility risk is in;
 *  • a cover rendering as a real picture element on the PUBLIC post page of the built
 *    output, which is the only check that proves a generated basename lands inside the Vite
 *    glob rather than silently falling back to the decorative tint (Pitfall 4).
 *
 * WHAT IT CANNOT PROVE, and does not pretend to: that a save becomes one real commit
 * carrying two files. Under PANEL_DRY_RUN no commit exists to inspect, and a spec that
 * mocked it would assert its own mock. That is the live verification the phase UAT owns.
 */

const LISTA = '/admin/aktualnosci';
const NOWY = '/admin/aktualnosci/nowy';

/** The seed entry that carries a cover.
 *
 *  ITS FILENAME AND ITS ALT ARE READ OFF THE SEED, not retyped, since 2026-08-18. They
 *  were three literals here until the żłobek's own photographs replaced the generated
 *  placeholders, and thirteen cases in this file went red at once: eight because the
 *  fixture image they upload is the seed's own file and it no longer existed, and one
 *  because it compared a hard-coded alt with the alt the store holds. Not one of those
 *  thirteen is ABOUT the cover of one particular post. They are about the island, and an
 *  island test that has an opinion on the żłobek's photo library is a test that fails
 *  every time the żłobek sends new pictures. The slug stays a literal: which post is
 *  being opened is genuinely this file's choice. */
const ZIARNO = JSON.parse(
	readFileSync(
		new URL(
			'../src/lib/content/aktualnosci/2026-08-19-uroczyste-otwarcie-zlobka.json',
			import.meta.url
		),
		'utf8'
	)
) as { obraz: string; obraz_alt: string };

const Z_OKLADKA = {
	slug: '2026-08-19-uroczyste-otwarcie-zlobka',
	obraz: ZIARNO.obraz,
	alt: ZIARNO.obraz_alt
};

/** A real, small JPEG that already lives in the repository, used as the file an editor
 *  chooses. Deliberately not a new fixture: an image committed for a test is one more
 *  picture in a public repository that nobody has a consent record for. */
const PLIK = `src/lib/assets/uploads/${Z_OKLADKA.obraz}`;

const ZNACZNIKI = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

function polePliku(page: import('@playwright/test').Page) {
	return page.locator('main input[type="file"]');
}

function ukrytePoleZdjecia(page: import('@playwright/test').Page) {
	return page.locator('main input[name="zdjecie"]');
}

function status(page: import('@playwright/test').Page) {
	return page.locator('main [role="status"]');
}

function poleAltu(page: import('@playwright/test').Page) {
	return page.getByLabel(POLA_WPIS.altEtykieta, { exact: false });
}

function formularz(page: import('@playwright/test').Page) {
	return page.locator('main form').filter({ has: page.locator('textarea') });
}

/** Choose the file and wait for the island to finish. The ready sentence is the only signal
 *  there is, which is the point: there is no spinner to wait on. */
async function wybierzZdjecie(page: import('@playwright/test').Page) {
	await polePliku(page).setInputFiles(PLIK);
	await expect(status(page)).toHaveText(KOPIA_ZDJECIA.gotowe169);
}

async function wypelnij(
	page: import('@playwright/test').Page,
	dane: { tytul: string; dzien: string; miesiac: string; rok: string; tresc: string }
) {
	await page.getByLabel(POLA_WPIS.tytulEtykieta, { exact: false }).fill(dane.tytul);
	await page.getByLabel(POLA_DATA.dzien, { exact: true }).selectOption(dane.dzien);
	await page.getByLabel(POLA_DATA.miesiac, { exact: true }).selectOption(dane.miesiac);
	await page.getByLabel(POLA_DATA.rok, { exact: true }).selectOption(dane.rok);
	await page.getByLabel(POLA_WPIS.trescEtykieta, { exact: false }).fill(dane.tresc);
}

test.describe('Wyspa zdjecia: przyciecie i podglad w przegladarce (D-12, D-13)', () => {
	test('wybrane zdjecie staje sie podgladem w zarezerwowanej ramce i tymi samymi bajtami w ukrytym polu', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(NOWY);

		// Nothing is announced and nothing is shown before a file is chosen: the live region
		// exists from the first render so its first sentence can be announced at all.
		await expect(status(page)).toHaveText('');
		await expect(page.locator('main fieldset img')).toHaveCount(0);

		await wybierzZdjecie(page);

		const podglad = page.locator('main fieldset img');
		await expect(podglad).toBeVisible();
		await expect(page.getByText(KOPIA_ZDJECIA.podpisPodgladu)).toBeVisible();

		// THE PREVIEW IS THE EXACT BYTES THAT WILL PUBLISH. Not a thumbnail of the original,
		// not a separate render: the same data URL the hidden field carries to the server.
		const zrodlo = await podglad.getAttribute('src');
		const ukryte = await ukrytePoleZdjecia(page).inputValue();
		expect(zrodlo).toBe(ukryte);

		// Re-encoded as JPEG whatever it was given (D-12), and big enough to be a real image
		// rather than an empty canvas.
		expect(ukryte.startsWith('data:image/jpeg;base64,')).toBe(true);
		expect(ukryte.length).toBeGreaterThan(1000);

		// The box holds the target ratio, so the card and the post page frame the photo the
		// same way the editor approved it (D-13).
		const pudelko = await podglad.boundingBox();
		expect(pudelko).not.toBeNull();
		if (pudelko) expect(pudelko.width / pudelko.height).toBeCloseTo(PROPORCJA_WPISU, 1);
	});

	// The island is the phase's only hydrated component, and the notice inside it lives in an
	// element whose contents a browser with scripting ON never builds into a tree. That is
	// exactly the shape of markup a hydration mismatch comes from, so it is checked rather
	// than assumed.
	test('ekran z wyspa nie zglasza ani jednego bledu w konsoli', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		const bledy: string[] = [];
		page.on('console', (wiadomosc) => {
			if (wiadomosc.type() === 'error') bledy.push(wiadomosc.text());
		});
		page.on('pageerror', (blad) => bledy.push(blad.message));

		await page.goto(NOWY);
		await wybierzZdjecie(page);
		expect(bledy).toEqual([]);
	});

	test('wpis, ktory juz ma okladke, otwiera sie z jej podgladem i jej opisem', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(`${LISTA}/${Z_OKLADKA.slug}`);

		await expect(page.locator('main fieldset img')).toBeVisible();
		await expect(poleAltu(page)).toHaveValue(Z_OKLADKA.alt);
		// The basename travels back in a hidden field, so a save that changes only the title
		// keeps the picture (P-20).
		await expect(page.locator('main input[name="obraz"]')).toHaveValue(Z_OKLADKA.obraz);
		// And nothing is pending: the data URL field is only ever filled by a choice made on
		// this visit.
		await expect(ukrytePoleZdjecia(page)).toHaveValue('');
	});

	test('wpis bez okladki nie pokazuje ani podgladu, ani pola opisu, ani przyciskow', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(NOWY);
		await expect(page.locator('main fieldset img')).toHaveCount(0);
		await expect(poleAltu(page)).toHaveCount(0);
		await expect(page.getByRole('button', { name: KOPIA_ZDJECIA.usun })).toHaveCount(0);
		await expect(page.getByRole('button', { name: KOPIA_ZDJECIA.wybierzInne })).toHaveCount(0);
		// A control that accepted a description for a photograph that does not exist would be
		// asking the editor to describe nothing.
	});
});

test.describe('Wyspa zdjecia: obsluga z klawiatury od poczatku do konca', () => {
	test('do wyboru pliku dochodzi sie tabulatorem, a nie wskaznikiem', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(NOWY);
		await page.getByLabel(POLA_WPIS.trescEtykieta, { exact: false }).focus();

		// The body field, the formatting disclosure beneath it, then the photo control. Read
		// as a bounded walk rather than a fixed number of presses, so the case still means
		// „reachable" if a later plan adds something between them.
		let doszlo = false;
		for (let i = 0; i < 4 && !doszlo; i++) {
			await page.keyboard.press('Tab');
			doszlo = await polePliku(page).evaluate((element) => element === document.activeElement);
		}
		expect(doszlo).toBe(true);
	});

	test('po wybraniu zdjecia tabulator prowadzi przez oba przyciski do pola opisu', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(NOWY);
		await wybierzZdjecie(page);

		await polePliku(page).focus();
		await page.keyboard.press('Tab');
		await expect(page.getByRole('button', { name: KOPIA_ZDJECIA.wybierzInne })).toBeFocused();
		await page.keyboard.press('Tab');
		await expect(page.getByRole('button', { name: KOPIA_ZDJECIA.usun })).toBeFocused();
		await page.keyboard.press('Tab');
		await expect(poleAltu(page)).toBeFocused();
	});

	test('Wybierz inne zdjecie oddaje fokus kontrolce pliku i niczego nie kasuje', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(NOWY);
		await wybierzZdjecie(page);
		const przed = await ukrytePoleZdjecia(page).inputValue();

		await page.getByRole('button', { name: KOPIA_ZDJECIA.wybierzInne }).focus();
		await page.keyboard.press('Space');

		await expect(polePliku(page)).toBeFocused();
		await expect(ukrytePoleZdjecia(page)).toHaveValue(przed);
		await expect(page.locator('main fieldset img')).toBeVisible();
	});

	test('Usun zdjecie czysci podglad, oglasza to i wraca fokusem do kontrolki pliku', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(NOWY);
		await wybierzZdjecie(page);

		// Activated with the KEYBOARD, because the button unmounts itself and focus has to
		// land somewhere deliberate rather than falling back to the top of the document.
		await page.getByRole('button', { name: KOPIA_ZDJECIA.usun }).focus();
		await page.keyboard.press('Space');

		await expect(status(page)).toHaveText(KOPIA_ZDJECIA.usunieto);
		await expect(polePliku(page)).toBeFocused();
		await expect(page.locator('main fieldset img')).toHaveCount(0);
		await expect(ukrytePoleZdjecia(page)).toHaveValue('');
		// Nothing was committed: removing a pending photo from a form is not a destructive
		// action and has no confirmation page of its own.
		await expect(page.locator('[data-panel="sukces"]')).toHaveCount(0);
	});

	test('usuniecie okladki wpisu ustawia flage, ktora zobaczy serwer', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(`${LISTA}/${Z_OKLADKA.slug}`);
		await expect(page.locator('main input[name="zdjecie_usun"]')).toHaveValue('');

		await page.getByRole('button', { name: KOPIA_ZDJECIA.usun }).click();

		await expect(page.locator('main input[name="zdjecie_usun"]')).toHaveValue('1');
		// The basename stays in the form: the SAVE still has to know which file to take out
		// of the repository, and the flag beside it is what says the picture is gone.
		await expect(page.locator('main input[name="obraz"]')).toHaveValue(Z_OKLADKA.obraz);
		await expect(page.locator('main fieldset img')).toHaveCount(0);
	});
});

test.describe('Wyspa zdjecia: odmowy (D-15, T-04.1-29)', () => {
	test('zapis ze zdjeciem i pustym opisem jest odmowiony, a zdjecie zostaje w formularzu', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(NOWY);
		await wypelnij(page, {
			tytul: 'Piknik rodzinny w ogrodzie żłobka',
			dzien: '12',
			miesiac: '6',
			rok: '2026',
			tresc: 'Zapraszamy na piknik rodzinny.'
		});
		await wybierzZdjecie(page);
		const zdjecie = await ukrytePoleZdjecia(page).inputValue();

		await formularz(page).getByRole('button', { name: KOPIA_ZAPIS.zapisz }).click();

		const panel = page.locator('[data-panel="blad"]');
		await expect(panel).toBeVisible();
		await expect(panel).toContainText(KOPIA_WALIDACJA.altBrak);
		await expect(page.locator('[data-panel="sukces"]')).toHaveCount(0);
		expect(page.url()).toContain('/nowy');

		// The message is also attached to the control it is about, not only to the summary.
		await expect(poleAltu(page)).toHaveAttribute('aria-invalid', 'true');

		// Contract 10c, and it matters more here than anywhere else: an editor who lost the
		// photo on a refusal would fix the description and publish an entry with no picture
		// without ever noticing.
		await expect(ukrytePoleZdjecia(page)).toHaveValue(zdjecie);
		await expect(page.locator('main fieldset img')).toBeVisible();
	});

	// THE CASE THAT PROVES WHERE THE RULE LIVES. With scripting off the island does nothing
	// at all, so the only thing that can refuse this save is the server.
	test('ta sama odmowa dziala przy WYLACZONYM JavaScripcie, wiec regula jest na serwerze', async ({
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
			const odpowiedz = await page.goto(`${LISTA}/${Z_OKLADKA.slug}`);
			expect(odpowiedz?.status()).toBe(200);

			// The honest notice is served to this browser, and it says the rest of the form
			// still works. Asserted on the element's TEXT rather than on its visibility, and
			// the reason is worth recording because it looks like a weaker assertion and is
			// not: Playwright switches scripting off by disabling script EXECUTION, which does
			// not flip the flag the HTML parser consults when it decides whether to build the
			// contents of this element into a tree. A real browser with scripting turned off
			// in its settings renders it; this one may keep it as text. Either way the
			// sentence is in the document that was served, which is the property that matters.
			const notka = page.locator('main noscript');
			await expect(notka).toHaveCount(1);
			expect(await notka.textContent()).toContain(KOPIA_ZDJECIA.bezSkryptow);

			// The entry has a cover, so its description field is server rendered and editable
			// with no client code involved at any point.
			await expect(poleAltu(page)).toHaveValue(Z_OKLADKA.alt);
			await poleAltu(page).fill('');
			await page.getByRole('button', { name: KOPIA_ZAPIS.zapisz }).click();

			const panel = page.locator('[data-panel="blad"]');
			await expect(panel).toBeVisible();
			await expect(panel).toContainText(KOPIA_WALIDACJA.altBrak);
			await expect(page.locator('[data-panel="sukces"]')).toHaveCount(0);
		} finally {
			await kontekst.close();
		}
	});

	test('przy wlaczonym JavaScripcie notka o braku skryptow nie jest pokazywana', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(NOWY);
		// The element is there and the browser does not paint it, which is the whole contract
		// of a notice for people who have no scripting: present in the document, invisible to
		// everybody who does not need it.
		const notka = page.locator('main noscript');
		await expect(notka).toHaveCount(1);
		await expect(notka).toBeHidden();
		// And the control it apologises for is right there working.
		await expect(polePliku(page)).toBeVisible();
	});
});

test.describe('Dostepnosc wyspy zdjecia (WCAG 2.1 AA)', () => {
	test('ekran dodawania Z ZALADOWANYM PODGLADEM nie narusza WCAG 2.1 AA', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(NOWY);
		await wybierzZdjecie(page);
		await expect(page.locator('main fieldset img')).toBeVisible();
		const wynik = await new AxeBuilder({ page }).withTags(ZNACZNIKI).analyze();
		expect(wynik.violations).toEqual([]);
	});

	test('ekran edycji wpisu z okladka nie narusza WCAG 2.1 AA', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(`${LISTA}/${Z_OKLADKA.slug}`);
		await expect(page.locator('main fieldset img')).toBeVisible();
		const wynik = await new AxeBuilder({ page }).withTags(ZNACZNIKI).analyze();
		expect(wynik.violations).toEqual([]);
	});

	test('ekran dodawania z odmowa opisu alternatywnego nie narusza WCAG 2.1 AA', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(NOWY);
		await wypelnij(page, {
			tytul: 'Piknik rodzinny w ogrodzie żłobka',
			dzien: '12',
			miesiac: '6',
			rok: '2026',
			tresc: 'Zapraszamy na piknik rodzinny.'
		});
		await wybierzZdjecie(page);
		await formularz(page).getByRole('button', { name: KOPIA_ZAPIS.zapisz }).click();
		await expect(page.locator('[data-panel="blad"]')).toBeVisible();
		const wynik = await new AxeBuilder({ page }).withTags(ZNACZNIKI).analyze();
		expect(wynik.violations).toEqual([]);
	});
});

// The only check that proves a stored basename really resolves inside the build glob
// (Pitfall 4). Everything else about a cover can be right while the picture silently
// renders as the decorative tint, the build succeeds and nothing warns.
test.describe('Okladka renderuje sie naprawde, a nie jako tint zastepczy', () => {
	test('publiczna strona wpisu pokazuje prawdziwy element obrazu z opisem z pliku', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		const odpowiedz = await page.goto(`/aktualnosci/${Z_OKLADKA.slug}`);
		expect(odpowiedz?.status()).toBe(200);

		// Scoped to the COVER BAND, not to the whole main. A bare `main picture` count of one
		// silently doubled as „this post has exactly one photograph", which stopped being true
		// the moment a post could carry its own gallery. What this test is about is the cover
		// rendering as a real <picture> rather than degrading to the decorative tint, and that
		// claim belongs to the cover band alone.
		const obrazek = page.locator('.cover-band picture');
		await expect(obrazek).toHaveCount(1);
		// The optimizer really ran: the modern formats are offered before the fallback.
		await expect(obrazek.locator('source').first()).toHaveAttribute('srcset', /\.(avif|webp)/);
		// And the description travelled from the JSON to the page, which is the whole point of
		// making it required.
		await expect(obrazek.locator('img')).toHaveAttribute('alt', Z_OKLADKA.alt);
		await expect(obrazek.locator('img')).toBeVisible();
	});

	test('kafelek tego wpisu na publicznej liscie tez niesie obraz, a nie tint', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto('/aktualnosci');
		const kafelek = page.locator(`a[href="/aktualnosci/${Z_OKLADKA.slug}"]`);
		await expect(kafelek.locator('picture')).toHaveCount(1);
		await expect(kafelek.locator('picture img')).toHaveAttribute('alt', Z_OKLADKA.alt);
	});
});
