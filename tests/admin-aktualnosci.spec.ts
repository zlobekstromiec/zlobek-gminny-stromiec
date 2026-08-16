import AxeBuilder from '@axe-core/playwright';
import { test, expect, tokenSesji, NAZWA_CIASTKA } from './fixtures/admin';
import {
	KOPIA_EKRAN_WPISU,
	KOPIA_LISTY,
	KOPIA_USUWANIE,
	KOPIA_WALIDACJA,
	KOPIA_ZAPIS,
	POLA_DATA,
	POLA_WPIS,
	ukryteWpis
} from '../src/lib/content/panel';
import { MIESIACE_WYBOR } from '../src/lib/content/forms';

/**
 * Browser acceptance gate for the aktualności collection (CMS-02, CMS-03, SC3, SC5;
 * 04.1-UI-SPEC Component Contracts 4, 5, 9, 10 and 11).
 *
 * EVERY CASE TAKES `zalogowany` EXPLICITLY. Playwright fixtures are LAZY: a case that
 * destructures only `{ page }` never instantiates the authenticated fixture, runs with no
 * session, and silently exercises the login screen instead of the screen under test. Eight
 * cases in tests/admin-nabor.spec.ts passed that way before it was caught, which is why
 * every case below also asserts something only the real screen can satisfy rather than
 * merely „a heading exists".
 *
 * It runs against the REAL Cloudflare runtime: playwright.config.ts builds and serves
 * through `npm run preview:test`, whose bindings include PANEL_DRY_RUN=1. That flag is a
 * seam at the very last step: validation, filename generation, the collision check,
 * serialization, the commit-message construction and the whole action branch all execute
 * exactly as in production, and only the GitHub write is short-circuited.
 *
 * WHAT THIS FILE CANNOT PROVE, and does not pretend to: that a save becomes a real commit
 * and a real Cloudflare build. Under the dry-run flag no commit exists to inspect, and a
 * spec that mocked it would assert its own mock. That is a live, one-time verification and
 * it belongs to the phase UAT.
 *
 * A SECOND THING IT CANNOT PROVE, and the reason several assertions are shaped the way
 * they are: the panel reads its content through the same BUILD-TIME reader the public site
 * uses, so a created entry does not appear in the list until Cloudflare has rebuilt. Under
 * the dry-run flag it never appears at all. Every assertion below is therefore about what
 * the SCREEN does, never about the collection growing.
 *
 * Do NOT weaken these assertions to make the suite pass. Three of them defend properties
 * whose failure is irreversible on a public body's website: the collision case is threat
 * T-04.1-25 (a create silently overwriting an existing post), the stable-URL case is D-07
 * (a title edit must not move a page parents have bookmarked), and the no-posting-element
 * case on the list is T-04.1-27 (a destructive action a browser could follow on its own).
 */

const LISTA = '/admin/aktualnosci';
const NOWY = '/admin/aktualnosci/nowy';

const ZNACZNIKI = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/** The two seed entries, newest first, exactly as src/lib/content/aktualnosci holds them.
 *  Restated here rather than imported, deliberately: the reader is what turns files into
 *  this order and these Polish dates, so importing it would let the suite agree with the
 *  implementation instead of checking it. */
const SEEDY = [
	{
		slug: '2026-08-01-wielkie-otwarcie-zlobka',
		tytul: 'Wielkie otwarcie żłobka: 14 sierpnia!',
		data: '1 sierpnia 2026'
	},
	{
		slug: '2026-07-15-witamy-na-nowej-stronie-zlobka',
		tytul: 'Witamy na nowej stronie żłobka',
		data: '15 lipca 2026'
	}
];

/** The editing form, scoped so the shell's „Wyloguj" form in the header is never counted
 *  as part of a screen's own actions. */
function formularz(page: import('@playwright/test').Page) {
	return page.locator('main form').filter({ has: page.locator('textarea') });
}

/** Fill the create form with a complete, valid entry. Written as a helper because four
 *  cases need it and a case that fills it slightly differently would be testing a
 *  different thing without saying so. */
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

test.describe('Lista aktualności: Contract 4', () => {
	test('lista pokazuje oba wpisy zalozycielskie od najnowszego, z polskimi datami i odznaka', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		const odpowiedz = await page.goto(LISTA);
		expect(odpowiedz?.status()).toBe(200);

		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.locator('h1')).toHaveText(KOPIA_LISTY.aktualnosciNaglowek);

		const wiersze = page.locator('main ul li');
		await expect(wiersze).toHaveCount(SEEDY.length);

		for (const [i, seed] of SEEDY.entries()) {
			const wiersz = wiersze.nth(i);
			// The primary link's accessible name STARTS with the entry title and never with
			// the word „Edytuj": a list of identical link names is a WCAG 2.4.4 failure. It is
			// not exactly the title, on purpose, because the meta line sits inside the same
			// anchor so it is announced with it, which is the rule the public document rows
			// already follow. Asserted as „the title then the date" so both halves are pinned.
			const glowny = wiersz.getByRole('link', {
				name: `${seed.tytul} ${seed.data}`,
				exact: true
			});
			await expect(glowny).toBeVisible();
			await expect(glowny).toHaveAttribute('href', `${LISTA}/${seed.slug}`);
			// And no link on the row is named merely „Edytuj" or „Usuń": both carry the hidden
			// suffix naming this entry, which is what the exact match below proves.
			await expect(wiersz.getByRole('link', { name: KOPIA_LISTY.edytuj, exact: true })).toHaveCount(
				0
			);
			await expect(wiersz.getByRole('link', { name: KOPIA_LISTY.usun, exact: true })).toHaveCount(
				0
			);
			// Both seeds are placeholder content today, and the badge carries TEXT, never a
			// bare colour swatch.
			await expect(wiersz).toContainText(KOPIA_LISTY.odznakaZastepcza);
		}

		// Newest first, matching the public list. Asserted as an ORDER, so a stable but wrong
		// sort cannot pass by having both rows present.
		await expect(wiersze.first()).toContainText(SEEDY[0].tytul);
		await expect(wiersze.last()).toContainText(SEEDY[1].tytul);
	});

	test('wiersz niesie dwie akcje jako odnosniki, kazda dopowiedziana nazwa wpisu', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(LISTA);

		for (const seed of SEEDY) {
			const dopowiedzenie = ukryteWpis(seed.tytul);
			const edytuj = page.getByRole('link', { name: `${KOPIA_LISTY.edytuj}${dopowiedzenie}` });
			const usun = page.getByRole('link', { name: `${KOPIA_LISTY.usun}${dopowiedzenie}` });
			await expect(edytuj).toHaveAttribute('href', `${LISTA}/${seed.slug}`);
			await expect(usun).toHaveAttribute('href', `${LISTA}/${seed.slug}/usun`);
		}
	});

	// T-04.1-27. A destructive control on a list is one mis-tap from a lost post, and one a
	// browser could follow on its own is worse. There is no posting element on this screen
	// at all, and the shell's „Wyloguj" is deliberately excluded because it belongs to the
	// header and not to the list.
	test('lista nie zawiera zadnego elementu wysylajacego (T-04.1-27)', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(LISTA);
		await expect(page.locator('main form')).toHaveCount(0);
		await expect(page.locator('main button')).toHaveCount(0);
	});

	// The empty state cannot be reached while the seeds exist, so what is asserted here is
	// the OTHER half of the same either-or: the card of rows is present and the empty panel
	// is absent. Rendering the empty panel beside a populated list would be the defect.
	test('przy istniejacych wpisach widac karte z wierszami, a panelu pustej listy nie ma', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(LISTA);
		await expect(page.locator('main ul li').first()).toBeVisible();
		await expect(page.getByText(KOPIA_LISTY.aktualnosciPustyNaglowek)).toHaveCount(0);
		await expect(page.getByText(KOPIA_LISTY.aktualnosciPustaTresc)).toHaveCount(0);
	});

	test('akcja glowna prowadzi na ekran dodawania i jest dokladnie jedna', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(LISTA);
		const dodaj = page.getByRole('link', { name: KOPIA_LISTY.aktualnosciAkcja });
		await expect(dodaj).toHaveCount(1);
		await expect(dodaj).toHaveAttribute('href', NOWY);
	});
});

test.describe('Dodawanie wpisu: Contracts 5, 9 i 10', () => {
	test('ekran dodawania ma trzy listy wyboru daty i zaden przegladarkowy wybierak daty', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		const odpowiedz = await page.goto(NOWY);
		expect(odpowiedz?.status()).toBe(200);
		await expect(page.locator('h1')).toHaveText(KOPIA_EKRAN_WPISU.nowyNaglowek);

		const selekty = page.locator('main select');
		await expect(selekty).toHaveCount(3);
		// The native control whose picker chrome cannot be forced into Polish must not exist
		// anywhere on the screen.
		await expect(page.locator('main input[type="date"], main input[type="month"]')).toHaveCount(0);

		// The date group is a fieldset with a visible legend, because three controls produce
		// one value and a group without a name is a group nobody can identify.
		const grupa = page.locator('main fieldset');
		await expect(grupa).toHaveCount(1);
		await expect(grupa.locator('legend')).toBeVisible();
		await expect(grupa.locator('legend')).toHaveText(POLA_WPIS.dataLegenda);
	});

	test('opcje miesiaca sa dokladnie wspolna tabela miesiecy, w jej kolejnosci', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(NOWY);
		const miesiac = page.getByLabel(POLA_DATA.miesiac, { exact: true });
		const etykiety = await miesiac.locator('option').allTextContents();
		// The empty first option is explicit and comes first, so „nothing chosen" is a state
		// the editor can see and return to.
		expect(etykiety[0]).toBe(POLA_DATA.pusty);
		expect(etykiety.slice(1)).toEqual(MIESIACE_WYBOR.map((m) => m.nazwa));
	});

	test('pusty tytul i pusta tresc daja podsumowanie bledow, ktore dostaje fokus i linkuje do pol', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(NOWY);
		await formularz(page).getByRole('button', { name: KOPIA_ZAPIS.zapisz }).click();

		const panel = page.locator('[data-panel="blad"]');
		await expect(panel).toBeVisible();
		await expect(panel).toContainText(KOPIA_WALIDACJA.podsumowanieNaglowek);
		await expect(panel).toContainText(KOPIA_WALIDACJA.podsumowanieTresc);
		await expect(panel).toContainText(KOPIA_WALIDACJA.tytulBrak);
		await expect(panel).toContainText(KOPIA_WALIDACJA.trescBrak);
		// Focused, so a screen-reader user is taken to the refusal instead of being left at
		// the top of an apparently unchanged page.
		await expect(panel).toBeFocused();

		// Nothing was saved and the browser stayed on the create screen.
		expect(page.url()).toContain('/nowy');
		await expect(page.locator('[data-panel="sukces"]')).toHaveCount(0);

		// Every summary entry is an in-page link to a control that EXISTS, and following one
		// moves focus to it. A summary that linked to a missing id would announce nothing.
		const linki = panel.getByRole('listitem').getByRole('link');
		const ile = await linki.count();
		expect(ile).toBeGreaterThan(1);
		for (let i = 0; i < ile; i++) {
			const href = await linki.nth(i).getAttribute('href');
			expect(href).toMatch(/^#/);
			await expect(page.locator(`#${href?.slice(1)}`)).toHaveCount(1);
		}

		await linki.first().click();
		await expect(page.locator('#wpis-tytul')).toBeFocused();
	});

	test('poprawne dodanie pokazuje panel Zapisano i odnosnik do nowej strony publicznej', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(NOWY);
		await wypelnij(page, {
			tytul: 'Dzień otwarty w żłobku: zapraszamy!',
			dzien: '20',
			miesiac: '9',
			rok: '2026',
			tresc: 'Zapraszamy wszystkich rodziców na dzień otwarty.'
		});
		await formularz(page).getByRole('button', { name: KOPIA_ZAPIS.zapisz }).click();

		const panel = page.locator('[data-panel="sukces"]');
		await expect(panel).toBeVisible();
		await expect(panel).toContainText(KOPIA_ZAPIS.zapisanoNaglowek);
		// The honest D-18 promise: saved, and visible on the site in about two minutes. No
		// build polling, no progress bar, no auto-refresh.
		await expect(panel).toContainText(KOPIA_ZAPIS.zapisanoTresc);
		await expect(panel).toBeFocused();

		// The link is built from the GENERATED slug: the ISO date, then the title with every
		// Polish diacritic transliterated and the punctuation collapsed. This is SC3 observed
		// end to end through a browser rather than in a unit assertion.
		const odnosnik = panel.getByRole('link');
		await expect(odnosnik).toHaveAttribute(
			'href',
			'/aktualnosci/2026-09-20-dzien-otwarty-w-zlobku-zapraszamy'
		);
		await expect(odnosnik).toHaveAttribute('target', '_blank');
		await expect(odnosnik).toHaveAttribute('rel', /noopener/);
	});

	// T-04.1-25. A create whose generated filename already exists is REFUSED. Overwriting
	// silently would destroy a colleague's post with no trace an editor could see.
	test('dodanie wpisu o zajetej nazwie pliku jest odmowione i nie melduje zapisu (T-04.1-25)', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(NOWY);
		// Title and date chosen so the generator produces exactly the filename the first seed
		// already occupies.
		await wypelnij(page, {
			tytul: 'Wielkie otwarcie żłobka',
			dzien: '1',
			miesiac: '8',
			rok: '2026',
			tresc: 'Druga wersja tego samego ogłoszenia.'
		});
		await formularz(page).getByRole('button', { name: KOPIA_ZAPIS.zapisz }).click();

		const panel = page.locator('[data-panel="blad"]');
		await expect(panel).toBeVisible();
		await expect(panel).toContainText(KOPIA_ZAPIS.kolizjaNaglowek);
		await expect(panel).toContainText(KOPIA_ZAPIS.kolizjaTresc);
		await expect(page.locator('[data-panel="sukces"]')).toHaveCount(0);

		// Contract 10c: every typed value intact, so the editor can change one field and try
		// again instead of retyping the whole entry.
		await expect(page.getByLabel(POLA_WPIS.tytulEtykieta, { exact: false })).toHaveValue(
			'Wielkie otwarcie żłobka'
		);
		await expect(page.getByLabel(POLA_WPIS.trescEtykieta, { exact: false })).toHaveValue(
			'Druga wersja tego samego ogłoszenia.'
		);
	});

	test('na ekranie dodawania jest dokladnie jeden przycisk zapisu (D-11)', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(NOWY);
		await expect(page.locator('main button[type="submit"]')).toHaveCount(1);
	});
});

test.describe('Edycja wpisu: D-07 i Contract 5', () => {
	const SEED = SEEDY[0];

	test('ekran edycji wypelnia kazde pole wartosciami z pliku, w tym autorska zajawke', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		const odpowiedz = await page.goto(`${LISTA}/${SEED.slug}`);
		expect(odpowiedz?.status()).toBe(200);
		await expect(page.locator('h1')).toHaveText(KOPIA_EKRAN_WPISU.edycjaNaglowek);

		await expect(page.getByLabel(POLA_WPIS.tytulEtykieta, { exact: false })).toHaveValue(
			SEED.tytul
		);
		await expect(page.getByLabel(POLA_DATA.dzien, { exact: true })).toHaveValue('1');
		await expect(page.getByLabel(POLA_DATA.miesiac, { exact: true })).toHaveValue('8');
		await expect(page.getByLabel(POLA_DATA.rok, { exact: true })).toHaveValue('2026');

		// The AUTHORED zajawka, and specifically NOT the excerpt the reader derives from the
		// body when there is none. Pre-filling the derived value would duplicate the opening
		// paragraph into the field on the very next save.
		const zajawka = page.getByLabel(POLA_WPIS.zajawkaEtykieta, { exact: false });
		await expect(zajawka).toHaveValue(
			'Zapraszamy na uroczyste otwarcie Publicznego Żłobka w Stromcu 14 sierpnia 2026 r.'
		);
		const tresc = await page.getByLabel(POLA_WPIS.trescEtykieta, { exact: false }).inputValue();
		expect(tresc.startsWith('Z ogromną radością informujemy')).toBe(true);
		expect(zajawka).not.toBe(tresc);

		// The placeholder flag is stored true on both seeds, so the checkbox arrives ticked.
		await expect(page.getByLabel(POLA_WPIS.zastepczaEtykieta, { exact: false })).toBeChecked();
	});

	// D-07, and the reason slug.ts runs at create time only. The filename IS the public URL.
	test('zapis ze zmienionym tytulem nie rusza adresu wpisu (D-07)', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(`${LISTA}/${SEED.slug}`);
		await page
			.getByLabel(POLA_WPIS.tytulEtykieta, { exact: false })
			.fill('Zupełnie inny tytuł tego samego wpisu');
		await formularz(page).getByRole('button', { name: KOPIA_ZAPIS.zapisz }).click();

		await expect(page.locator('[data-panel="sukces"]')).toBeVisible();
		// The redirect target still carries the ORIGINAL slug. A screen that regenerated the
		// filename would land somewhere else, and the old address would 404 for everybody who
		// had it.
		expect(page.url()).toContain(`${LISTA}/${SEED.slug}`);
		expect(page.url()).not.toContain('zupelnie-inny');

		const odnosnik = page.locator('[data-panel="sukces"]').getByRole('link');
		await expect(odnosnik).toHaveAttribute('href', `/aktualnosci/${SEED.slug}`);
	});

	test('odswiezenie po zapisie nie zapisuje ponownie (POST, przekierowanie, GET)', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(`${LISTA}/${SEED.slug}`);
		await formularz(page).getByRole('button', { name: KOPIA_ZAPIS.zapisz }).click();
		await expect(page.locator('[data-panel="sukces"]')).toBeVisible();

		const odpowiedz = await page.reload();
		expect(odpowiedz?.request().method()).toBe('GET');
		expect(odpowiedz?.status()).toBe(200);
		await expect(page.locator('[data-panel="sukces"]')).toBeVisible();
	});

	test('nieistniejacy wpis daje panel Nie znaleziono, a nie formularz', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		// A fabricated slug resolves to no entry, which is also why a path cannot be smuggled
		// through this parameter (T-04.1-24): the written path comes from the entry, and there
		// is no entry.
		await page.goto(`${LISTA}/nie-ma-takiego-wpisu-2026`);
		await expect(page.locator('h1')).toHaveText(KOPIA_ZAPIS.brakTresciNaglowek);
		await expect(page.locator('main form')).toHaveCount(0);
	});
});

test.describe('Usuwanie wpisu: Contract 11', () => {
	const SEED = SEEDY[1];

	test('odnosnik Usun z wiersza prowadzi na strone potwierdzenia, ktora oddaje fokus pytaniu', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(LISTA);
		await page.getByRole('link', { name: `${KOPIA_LISTY.usun}${ukryteWpis(SEED.tytul)}` }).click();

		await expect(page).toHaveURL(new RegExp(`${SEED.slug}/usun$`));
		const pytanie = page.locator('h1');
		await expect(pytanie).toHaveText(KOPIA_USUWANIE.wpisNaglowek);
		await expect(pytanie).toBeFocused();

		// The card restates exactly what disappears, quoting the title and the Polish date.
		await expect(page.locator('main')).toContainText(SEED.tytul);
		await expect(page.locator('main')).toContainText(SEED.data);
		// And it never promises recovery.
		await expect(page.locator('main')).toContainText('nie można cofnąć w panelu');
	});

	test('przycisk usuwania nie jest pierwszym elementem fokusowalnym na stronie', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(`${LISTA}/${SEED.slug}/usun`);

		// Read the real focus order inside main rather than trusting the source order: the
		// property Contract 11 states is about what a keyboard reaches first.
		const kolejnosc = await page.evaluate(() => {
			const glowna = document.querySelector('main');
			if (!glowna) return [];
			return [...glowna.querySelectorAll('a[href], button, select, input, textarea')].map(
				(element) => `${element.tagName.toLowerCase()}:${element.textContent?.trim() ?? ''}`
			);
		});
		const indeks = kolejnosc.findIndex((wpis) => wpis.startsWith('button:'));
		expect(indeks).toBeGreaterThan(0);
		expect(kolejnosc[0].startsWith('a:')).toBe(true);
	});

	test('potwierdzenie usuwa i wraca na liste z panelem Usunieto', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(`${LISTA}/${SEED.slug}/usun`);
		await page.getByRole('button', { name: KOPIA_USUWANIE.wpisPrzycisk }).click();

		await expect(page).toHaveURL(new RegExp('/admin/aktualnosci\\?usunieto=1$'));
		const panel = page.locator('[data-panel="sukces"]');
		await expect(panel).toBeVisible();
		await expect(panel).toContainText(KOPIA_ZAPIS.usunietoNaglowek);
		await expect(panel).toContainText(KOPIA_ZAPIS.usunietoTresc);
		await expect(panel).toBeFocused();
	});

	test('strona potwierdzenia ma dokladnie jeden przycisk i nie prosi o wpisanie slowa', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(`${LISTA}/${SEED.slug}/usun`);
		await expect(page.locator('main button')).toHaveCount(1);
		// No typed confirmation: for this user group that is friction which teaches people to
		// click through warnings.
		await expect(page.locator('main input[type="text"]')).toHaveCount(0);
	});
});

test.describe('Dostepnosc ekranow aktualnosci (WCAG 2.1 AA)', () => {
	test('lista nie narusza WCAG 2.1 AA', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(LISTA);
		await expect(page.locator('main ul li').first()).toBeVisible();
		const wynik = await new AxeBuilder({ page }).withTags(ZNACZNIKI).analyze();
		expect(wynik.violations).toEqual([]);
	});

	test('ekran dodawania w stanie czystym nie narusza WCAG 2.1 AA', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(NOWY);
		await expect(page.locator('main fieldset')).toBeVisible();
		const wynik = await new AxeBuilder({ page }).withTags(ZNACZNIKI).analyze();
		expect(wynik.violations).toEqual([]);
	});

	test('ekran dodawania z podsumowaniem bledow nie narusza WCAG 2.1 AA', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(NOWY);
		await formularz(page).getByRole('button', { name: KOPIA_ZAPIS.zapisz }).click();
		await expect(page.locator('[data-panel="blad"]')).toBeVisible();
		const wynik = await new AxeBuilder({ page }).withTags(ZNACZNIKI).analyze();
		expect(wynik.violations).toEqual([]);
	});

	test('ekran dodawania z otwarta pomoca formatowania nie narusza WCAG 2.1 AA', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(NOWY);
		await page.getByRole('group').first().waitFor();
		await page.locator('main details summary').click();
		await expect(page.locator('main details[open]')).toBeVisible();
		const wynik = await new AxeBuilder({ page }).withTags(ZNACZNIKI).analyze();
		expect(wynik.violations).toEqual([]);
	});

	test('ekran edycji nie narusza WCAG 2.1 AA', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(`${LISTA}/${SEEDY[0].slug}`);
		await expect(page.locator('main fieldset')).toBeVisible();
		const wynik = await new AxeBuilder({ page }).withTags(ZNACZNIKI).analyze();
		expect(wynik.violations).toEqual([]);
	});

	test('strona potwierdzenia usuniecia nie narusza WCAG 2.1 AA', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(`${LISTA}/${SEEDY[0].slug}/usun`);
		await expect(page.locator('main button')).toBeVisible();
		const wynik = await new AxeBuilder({ page }).withTags(ZNACZNIKI).analyze();
		expect(wynik.violations).toEqual([]);
	});
});

test.describe('Aktualnosci bez JavaScriptu (D-17)', () => {
	test('caly obieg dodawania dziala przy wylaczonym JavaScripcie', async ({ browser }) => {
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

			// The list is complete on its own.
			const odpowiedz = await page.goto(LISTA);
			expect(odpowiedz?.status()).toBe(200);
			await expect(page.locator('main ul li')).toHaveCount(SEEDY.length);

			// A refusal first, because a form that only works when everything is right is not
			// a form that works.
			await page.goto(NOWY);
			await page.getByRole('button', { name: KOPIA_ZAPIS.zapisz }).click();
			await expect(page.locator('[data-panel="blad"]')).toContainText(
				KOPIA_WALIDACJA.podsumowanieNaglowek
			);

			// Then the whole create, reached by the browser's own navigation with no client
			// code involved at any point.
			await wypelnij(page, {
				tytul: 'Piknik rodzinny w ogrodzie żłobka',
				dzien: '12',
				miesiac: '6',
				rok: '2026',
				tresc: 'Zapraszamy na piknik rodzinny.'
			});
			await page.getByRole('button', { name: KOPIA_ZAPIS.zapisz }).click();

			const panel = page.locator('[data-panel="sukces"]');
			await expect(panel).toBeVisible();
			await expect(panel).toContainText(KOPIA_ZAPIS.zapisanoNaglowek);
			expect(page.url()).toContain('zapisano=2026-06-12-piknik-rodzinny-w-ogrodzie-zlobka');

			// And a deletion, which is the other operation that must never need scripting.
			await page.goto(`${LISTA}/${SEEDY[1].slug}/usun`);
			await page.getByRole('button', { name: KOPIA_USUWANIE.wpisPrzycisk }).click();
			await expect(page.locator('[data-panel="sukces"]')).toContainText(
				KOPIA_ZAPIS.usunietoNaglowek
			);
		} finally {
			await kontekst.close();
		}
	});
});
