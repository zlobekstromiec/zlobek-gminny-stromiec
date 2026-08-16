import AxeBuilder from '@axe-core/playwright';
import { test, expect } from './fixtures/admin';
import {
	KOPIA_POMOC,
	KOPIA_PULPIT,
	liczbaDokumentow,
	liczbaWpisow,
	obecnieNabor
} from '../src/lib/content/panel';
import { STAN_OTWARTY } from '../src/lib/stan-naboru';

/**
 * Browser acceptance gate for the pulpit and the Pomoc screen (CMS-03; 04.1-UI-SPEC
 * Component Contract 3 and the Accessibility Contract; 04.1-10 P-27).
 *
 * EVERY CASE TAKES `zalogowany` EXPLICITLY. Playwright fixtures are LAZY: a case that
 * destructures only `{ page }` never instantiates the authenticated fixture, runs with no
 * session, and silently exercises the login screen instead of the screen under test.
 * Eight cases in tests/admin-nabor.spec.ts passed that way before it was caught, so every
 * case below also asserts something only the real screen can satisfy.
 *
 * THE CASE THAT NOTHING ELSE CAN CATCH is the counting one. A pulpit card claiming
 * „Liczba wpisów: 3" beside a list showing two rows is the first thing an editor sees and
 * the fastest way to teach them not to trust the panel. The count is therefore never
 * compared against a number written in this file: it is compared against the number of
 * rows the matching LIST SCREEN renders, in the same session, so the two can only agree
 * by actually agreeing. The same for the nabór card, which is compared against the option
 * the nabór screen shows selected.
 *
 * Do NOT weaken these assertions to make the suite pass; they are the executable
 * acceptance criteria and change only in lockstep with an approved amendment.
 */

const PULPIT = '/admin';
const POMOC = '/admin/pomoc';

/** The six sections of Component Contract 3, in the contract's own order, each paired
 *  with the path its card must point at. Titles come from the copy module, so a renamed
 *  card renames the assertion with it. */
const KAFLE = [
	{ tytul: KOPIA_PULPIT.aktualnosciTytul, cel: '/admin/aktualnosci' },
	{ tytul: KOPIA_PULPIT.oNasTytul, cel: '/admin/o-nas' },
	{ tytul: KOPIA_PULPIT.planDniaTytul, cel: '/admin/plan-dnia' },
	{ tytul: KOPIA_PULPIT.dokumentyTytul, cel: '/admin/dokumenty' },
	{ tytul: KOPIA_PULPIT.naborTytul, cel: '/admin/nabor' },
	{ tytul: KOPIA_PULPIT.pomocTytul, cel: POMOC }
] as const;

/** Rows on a collection list screen, counted by the one control every row has exactly
 *  once: its link to its own confirmation page. Counting `li` would also count anything a
 *  later plan puts in a list on that screen. */
async function policzWiersze(
	page: import('@playwright/test').Page,
	kolekcja: string
): Promise<number> {
	await page.goto(`/admin/${kolekcja}`);
	return page.locator(`main a[href^="/admin/${kolekcja}/"][href$="/usun"]`).count();
}

test.describe('Pulpit: kafle, liczniki i stan naboru (Contract 3)', () => {
	test('pulpit ma jeden naglowek pierwszego poziomu i szesc kafli', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt).not.toContain('@');
		await page.goto(PULPIT);
		await expect(page.locator('main h1')).toHaveText(KOPIA_PULPIT.naglowek);
		await expect(page.locator('main h1')).toHaveCount(1);
		await expect(page.getByText(KOPIA_PULPIT.lead)).toBeVisible();
		await expect(page.locator('main li')).toHaveCount(KAFLE.length);
	});

	test('kazdy kafel jest jednym linkiem, ktorego nazwa dostepna to jego naglowek', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(PULPIT);

		for (const [indeks, kafel] of KAFLE.entries()) {
			const pozycja = page.locator('main li').nth(indeks);
			const linki = pozycja.getByRole('link');
			// ONE link per card, not one per line of text inside it. Three links inside a
			// card would be three tab stops for one destination.
			await expect(linki).toHaveCount(1);
			await expect(pozycja.locator('h2')).toHaveText(kafel.tytul);
			// The description and the count live INSIDE the same anchor so they are read
			// with the card, and `aria-labelledby` narrows the NAME back down to the
			// heading so a list of six cards is six words rather than six sentences.
			await expect(linki).toHaveAccessibleName(kafel.tytul);
			await expect(linki).toHaveAttribute('href', kafel.cel);
		}
	});

	test('kazdy opis kafla jest wewnatrz tego samego linku, co jego naglowek', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(PULPIT);
		for (const opis of [
			KOPIA_PULPIT.aktualnosciOpis,
			KOPIA_PULPIT.oNasOpis,
			KOPIA_PULPIT.planDniaOpis,
			KOPIA_PULPIT.dokumentyOpis,
			KOPIA_PULPIT.naborOpis,
			KOPIA_PULPIT.pomocOpis
		]) {
			await expect(page.locator('main li a', { hasText: opis })).toHaveCount(1);
		}
	});

	test('licznik wpisow zgadza sie z liczba wierszy, ktore renderuje lista wpisow', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		const wiersze = await policzWiersze(page, 'aktualnosci');
		expect(wiersze).toBeGreaterThan(0);
		await page.goto(PULPIT);
		await expect(page.getByText(liczbaWpisow(wiersze))).toBeVisible();
	});

	test('licznik dokumentow zgadza sie z liczba wierszy, ktore renderuje lista dokumentow', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		const wiersze = await policzWiersze(page, 'dokumenty');
		expect(wiersze).toBeGreaterThan(0);
		await page.goto(PULPIT);
		await expect(page.getByText(liczbaDokumentow(wiersze))).toBeVisible();
	});

	test('zdanie o stanie naboru zgadza sie z opcja zaznaczona na ekranie naboru', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto('/admin/nabor');
		const zaznaczony = page.locator('main input[type="radio"]:checked');
		await expect(zaznaczony).toHaveCount(1);
		const wartosc = await zaznaczony.inputValue();

		await page.goto(PULPIT);
		await expect(page.getByText(obecnieNabor(wartosc === STAN_OTWARTY))).toBeVisible();
	});

	test('kazdy link kafla odpowiada kodem 200 w sesji zalogowanego redaktora', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(PULPIT);
		for (const kafel of KAFLE) {
			// Through the browser context, so the request carries the same session cookie
			// the screen was rendered with. A card pointing at a route that redirects to
			// the login screen would answer 200 on the redirect target, so the redirect
			// itself is refused rather than followed.
			const odpowiedz = await page.context().request.get(kafel.cel, { maxRedirects: 0 });
			expect(odpowiedz.status(), `kafel ${kafel.tytul} prowadzi donikad`).toBe(200);
		}
	});

	test('kafle nie unosza sie pod kursorem (D-19: narzedzie nie skacze)', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(PULPIT);
		const link = page.locator('main li a').first();
		const przed = await link.boundingBox();
		await link.hover();
		const po = await link.boundingBox();
		expect(po?.y).toBeCloseTo(przed?.y ?? 0, 1);
	});

	test('brak naruszen WCAG 2.1 AA na pulpicie', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(PULPIT);
		await expect(page.locator('main li')).toHaveCount(KAFLE.length);
		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();
		expect(results.violations).toEqual([]);
	});
});

test.describe('Pomoc: jedna instrukcja, dwa wejscia (P-27)', () => {
	test('Pomoc renderuje instrukcje z jednym h1 i porzadkiem naglowkow bez przeskokow', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(POMOC);
		await expect(page.locator('main h1')).toHaveCount(1);

		const poziomy = await page.evaluate(() =>
			[...document.querySelectorAll('main h1, main h2, main h3, main h4, main h5, main h6')].map(
				(naglowek) => Number(naglowek.tagName.slice(1))
			)
		);
		expect(poziomy[0]).toBe(1);
		expect(poziomy.filter((poziom) => poziom === 1)).toHaveLength(1);
		expect(poziomy.filter((poziom) => poziom === 2).length).toBeGreaterThanOrEqual(10);
		for (const [indeks, poziom] of poziomy.entries()) {
			if (indeks === 0) continue;
			expect(poziom, `przeskok poziomu naglowka na pozycji ${indeks}`).toBeLessThanOrEqual(
				poziomy[indeks - 1] + 1
			);
		}
	});

	// D-21, and the whole reason the instrukcja was rewritten rather than edited: the
	// previous one documented a login that no longer exists. This is the ENFORCED half of
	// the grep in tests/instrukcja.unit.ts, because it reads what the screen really
	// renders rather than what a file on disk contains.
	test('Pomoc nie wysyla nikogo do usunietego edytora ani do zewnetrznego konta', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(POMOC);
		const tekst = (await page.locator('main').innerText()).toLowerCase();
		for (const zakazane of ['sveltia', 'github', 'oauth']) {
			expect(tekst, `ekran Pomoc wciaz wspomina "${zakazane}"`).not.toContain(zakazane);
		}
		// The absence assertions above would pass on an empty screen, so the screen is
		// asserted to be the instrukcja.
		expect(tekst.length).toBeGreaterThan(5000);
	});

	test('Pomoc oddaje ten sam dokument, ktory renderuje, do pobrania', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(POMOC);
		const link = page.getByRole('link', { name: KOPIA_POMOC.plikLink });
		await expect(link).toBeVisible();

		const cel = await link.getAttribute('href');
		const odpowiedz = await page.context().request.get(cel ?? '', { maxRedirects: 0 });
		expect(odpowiedz.status()).toBe(200);
		expect(odpowiedz.headers()['content-type']).toContain('text/markdown');

		// The served document and the rendered screen are the same document: its title is
		// the screen's h1, which is the property P-27 exists to guarantee.
		const dokument = await odpowiedz.text();
		const tytul = await page.locator('main h1').innerText();
		expect(dokument.startsWith(`# ${tytul}`)).toBe(true);
	});

	test('do Pomocy da sie dojsc ze stopki kazdego ekranu panelu', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto('/admin/nabor');
		// One instrukcja, two entry points: the footer link and the nav item point at the
		// same URL, so there can never be a second document behind one of them.
		const stopka = page.locator('footer a');
		await expect(stopka).toHaveAttribute('href', POMOC);
		await stopka.click();
		await expect(page).toHaveURL(new RegExp(`${POMOC}$`));
		await expect(page.locator('main h1')).toHaveCount(1);
	});

	test('brak naruszen WCAG 2.1 AA na ekranie Pomoc', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(POMOC);
		await expect(page.locator('main h1')).toHaveCount(1);
		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();
		expect(results.violations).toEqual([]);
	});
});
