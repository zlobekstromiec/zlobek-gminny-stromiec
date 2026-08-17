import { readFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { test, expect, tokenSesji, NAZWA_CIASTKA } from './fixtures/admin';
import {
	KOPIA_CENNIK,
	KOPIA_LISTY,
	KOPIA_POWLOKA,
	KOPIA_WALIDACJA,
	KOPIA_ZAPIS,
	POLA_CENNIK,
	zobaczStrone
} from '../src/lib/content/panel';
import { zlote } from '../src/lib/kwoty';

/** The committed store, read rather than imported. Playwright's loader refuses a plain JSON
 *  import without an import attribute, and reading the bytes is the more honest thing to do
 *  anyway: these assertions are about what is on the site right now, and a file read cannot
 *  be satisfied by a stale module graph. */
const cennik = JSON.parse(
	readFileSync(new URL('../src/lib/content/cennik.json', import.meta.url), 'utf8')
) as {
	stawka: number;
	obnizka: number;
	naglowek: string;
	kwotaOpis: string;
	zus: string;
	wyzywienie: string;
	nieobecnosc: string;
};

/**
 * Browser acceptance gate for the fee editor (FEES-01; 05 D-27, D-28, D-31; 05-UI-SPEC
 * Contract 10, and 04.1-UI-SPEC Component Contracts 5, 9 and 10).
 *
 * WHAT IT PROVES that the unit suite beside it cannot: that the chain from a typed number
 * to a refusal or to a commit holds through the real Cloudflare runtime, that every refusal
 * arrives with a link straight to the control it is about, and that the whole screen works
 * with SCRIPTING SWITCHED OFF, which is the only version of the assertion that proves the
 * form is a server round trip rather than client state.
 *
 * EVERY CASE TAKES `zalogowany` EXPLICITLY. Playwright fixtures are LAZY: a case that
 * destructures only `{ page }` never instantiates the authenticated fixture, runs with no
 * session, and silently exercises the login screen instead of the screen under test. Eight
 * cases in tests/admin-nabor.spec.ts passed that way before it was caught, so every case
 * below also asserts something only the real screen can satisfy.
 *
 * It runs against the REAL runtime: playwright.config.ts builds and serves through
 * `npm run preview:test`, whose bindings include PANEL_DRY_RUN=1. That flag is a seam at
 * the very last step: validation, serialization, the commit-message construction and the
 * whole action branch all execute exactly as in production, and only the GitHub write is
 * short-circuited.
 *
 * WHAT THIS FILE CANNOT PROVE, and does not pretend to: that a save becomes a real commit
 * and that an editor's change appears on /cennik after a Cloudflare build. Under the
 * dry-run flag no commit exists to inspect. That is FEE-9 of 05-VALIDATION.md, it is
 * live-only, and a spec that mocked it would be a spec asserting its own mock.
 *
 * Do NOT weaken these assertions to make the suite pass.
 */

const CENNIK = '/admin/cennik';
const LOGOWANIE = '/admin/logowanie';

const ZNACZNIKI = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

type Strona = import('@playwright/test').Page;

/** The editing form, scoped so the shell's „Wyloguj" form in the header is never counted as
 *  part of this screen's actions. */
function formularz(page: Strona) {
	return page.locator('main form').filter({ has: page.locator('fieldset') });
}

function pole(page: Strona, etykieta: string) {
	return page.getByLabel(etykieta, { exact: false });
}

function przyciskZapisz(page: Strona) {
	return formularz(page).getByRole('button', { name: KOPIA_ZAPIS.zapisz });
}

/** Fill the whole form from a partial override of the committed values, so a case that is
 *  about ONE rule never fails because of a different one. */
async function wypelnij(page: Strona, nadpisania: Partial<Record<string, string>> = {}) {
	const wartosci: Record<string, string> = {
		[POLA_CENNIK.stawkaEtykieta]: String(cennik.stawka),
		[POLA_CENNIK.obnizkaEtykieta]: String(cennik.obnizka),
		[POLA_CENNIK.naglowekEtykieta]: cennik.naglowek,
		[POLA_CENNIK.kwotaOpisEtykieta]: cennik.kwotaOpis,
		[POLA_CENNIK.zusEtykieta]: cennik.zus,
		[POLA_CENNIK.wyzywienieEtykieta]: cennik.wyzywienie,
		[POLA_CENNIK.nieobecnoscEtykieta]: cennik.nieobecnosc,
		...nadpisania
	};
	for (const [etykieta, wartosc] of Object.entries(wartosci)) {
		await pole(page, etykieta).fill(wartosc);
	}
}

test.describe('Ekran cennika: FEES-01, Contract 10', () => {
	test('bez sesji ekran odsyla na logowanie, a jego POST tez', async ({ request }) => {
		// By layout inheritance and with no auth code in the route itself (T-05-05-06). The
		// POST leg matters as much as the GET: an action reachable without a session would
		// write to the repository on behalf of nobody.
		const get = await request.get(CENNIK, { maxRedirects: 0 });
		expect(get.status()).toBe(303);
		expect(get.headers()['location']).toContain(LOGOWANIE);

		const post = await request.post(`${CENNIK}?/zapisz`, {
			form: {},
			headers: { origin: 'http://localhost:4173' },
			maxRedirects: 0
		});
		expect(post.status()).not.toBe(200);
		expect(post.status()).toBe(303);
		expect(post.headers()['location']).toContain(LOGOWANIE);
	});

	test('ekran odpowiada 200, ma jeden naglowek i dwie grupy pol z widocznymi legendami', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		const odpowiedz = await page.goto(CENNIK);
		expect(odpowiedz?.status()).toBe(200);

		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.locator('h1')).toHaveText(KOPIA_CENNIK.naglowek);

		const grupy = page.locator('main fieldset');
		await expect(grupy).toHaveCount(2);
		// Visible, not merely present: a legend hidden for looks is a group with no name for
		// everybody who can see the screen.
		await expect(grupy.nth(0).locator('legend')).toBeVisible();
		await expect(grupy.nth(0).locator('legend')).toHaveText(KOPIA_CENNIK.kwotyLegenda);
		await expect(grupy.nth(1).locator('legend')).toBeVisible();
		await expect(grupy.nth(1).locator('legend')).toHaveText(KOPIA_CENNIK.opisLegenda);
	});

	test('ekran renderuje elementy Contract 5 w kolejnosci DOM', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(CENNIK);

		// The back link, the h1, the required-fields note, the two groups, the save row and
		// the standing publish-delay panel, read in document order. Asserted as an ORDER
		// rather than as a set: every one of these is present on a screen whose elements are
		// shuffled, and the reading order is the whole contract.
		const kolejnosc = await page.evaluate(() => {
			const wezly = Array.from(
				document.querySelectorAll(
					'main a[href="/admin"], main h1, main form p, main fieldset, main button[type="submit"], main [data-panel="info"]'
				)
			);
			return wezly.map((wezel) => wezel.tagName.toLowerCase() + (wezel.id ? `#${wezel.id}` : ''));
		});
		expect(kolejnosc[0]).toBe('a');
		expect(kolejnosc[1]).toBe('h1');
		expect(kolejnosc.indexOf('fieldset')).toBeGreaterThan(kolejnosc.indexOf('h1'));
		expect(kolejnosc.lastIndexOf('button')).toBeGreaterThan(kolejnosc.lastIndexOf('fieldset'));
		expect(kolejnosc.at(-1)).toBe('div');

		await expect(page.getByRole('link', { name: KOPIA_LISTY.powrotPulpit })).toBeVisible();
		await expect(page.getByText(KOPIA_ZAPIS.wymaganeNota)).toBeVisible();
		await expect(page.getByText(KOPIA_POWLOKA.opoznieniePublikacji)).toBeVisible();
	});

	test('formularz otwiera sie na wartosciach, ktore sa dzis na stronie', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(CENNIK);

		await expect(pole(page, POLA_CENNIK.stawkaEtykieta)).toHaveValue(String(cennik.stawka));
		await expect(pole(page, POLA_CENNIK.obnizkaEtykieta)).toHaveValue(String(cennik.obnizka));
		await expect(pole(page, POLA_CENNIK.naglowekEtykieta)).toHaveValue(cennik.naglowek);
		await expect(pole(page, POLA_CENNIK.zusEtykieta)).toHaveValue(cennik.zus);
	});

	test('kwota do zaplaty jest tekstem, mowi ze pochodzi z zapisanych wartosci i sie zgadza', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(CENNIK);

		// The ARITHMETIC is pinned and never a particular amount, which is what lets an editor
		// change the fee in the panel without turning this suite red. The formatter is the
		// project's own `zlote`, so the thousands separator is not retyped here either.
		const linia = page.getByText(KOPIA_CENNIK.obliczonaPodpowiedz).locator('..');
		await expect(linia).toBeVisible();
		await expect(linia).toContainText(zlote(cennik.stawka - cennik.obnizka));
		// It says out loud that it follows the SAVED values, which is the whole reason it is
		// allowed to disagree with the two controls above it.
		await expect(linia).toContainText(KOPIA_CENNIK.obliczonaPodpowiedz);
	});

	test('zadna wartosc tylko do odczytu nie jest wygaszona kontrolka', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(CENNIK);
		// A disabled control looks like something somebody forgot to enable and is skipped by
		// keyboard navigation with no explanation. The read-only line is text plus a hint.
		await expect(
			page.locator('main input[disabled], main textarea[disabled], main select[disabled]')
		).toHaveCount(0);
		await expect(page.locator('main input[readonly], main textarea[readonly]')).toHaveCount(0);
	});

	test('na ekranie jest dokladnie jeden przycisk zapisu (D-11)', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(CENNIK);
		// One save is one commit and one Cloudflare build. Scoped to <main>, because the
		// shell's „Wyloguj" is legitimately a submit button of its own form in the header.
		await expect(page.locator('main button[type="submit"]')).toHaveCount(1);
		await expect(przyciskZapisz(page)).toHaveCount(1);
	});
});

test.describe('Ekran cennika: trzy odmowy, ktore ten ekran posiada', () => {
	test('pusty warunek ZUS jest odmawiany po polsku, z odnosnikiem prosto do pola', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(CENNIK);
		await wypelnij(page, { [POLA_CENNIK.zusEtykieta]: '' });
		await przyciskZapisz(page).click();

		const panel = page.locator('[data-panel="blad"]');
		await expect(panel).toBeVisible();
		await expect(panel).toContainText(KOPIA_WALIDACJA.podsumowanieNaglowek);
		await expect(panel).toContainText(KOPIA_WALIDACJA.zusBrak);
		// Focused, so a screen-reader user is taken to the refusal instead of being left at
		// the top of an apparently unchanged page.
		await expect(panel).toBeFocused();

		// WCAG 2.4.4: the summary entry points at the control it is about, and that control
		// exists and is marked invalid.
		const odnosnik = panel.getByRole('link', { name: KOPIA_WALIDACJA.zusBrak });
		const cel = await odnosnik.getAttribute('href');
		expect(cel).toBeTruthy();
		const kontrolka = page.locator(`main ${cel}`);
		await expect(kontrolka).toHaveAttribute('aria-invalid', 'true');

		// Nothing was saved.
		await expect(page.locator('[data-panel="sukces"]')).toHaveCount(0);
		expect(page.url()).not.toContain('zapisano');
	});

	test('cztery pola z tym samym komunikatem daja CZTERY ROZNE odnosniki (WCAG 2.4.4)', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(CENNIK);
		// Blanking the whole „Opis opłat" fieldset. Four of these five controls answer with the
		// SAME sentence („Uzupełnij to pole."), and the ZUS one has its own, so the case also
		// covers the mixed shape rather than only the degenerate one.
		await wypelnij(page, {
			[POLA_CENNIK.naglowekEtykieta]: '',
			[POLA_CENNIK.kwotaOpisEtykieta]: '',
			[POLA_CENNIK.zusEtykieta]: '',
			[POLA_CENNIK.wyzywienieEtykieta]: '',
			[POLA_CENNIK.nieobecnoscEtykieta]: ''
		});
		await przyciskZapisz(page).click();

		const panel = page.locator('[data-panel="blad"]');
		await expect(panel).toBeVisible();
		await expect(panel.getByRole('link')).toHaveCount(5);

		// The link text IS the whole accessible name of the link. Five entries reading
		// „Uzupełnij to pole." and pointing at five different controls are one link five
		// times: a screen-reader user listing the links hears no difference between them.
		const teksty = await panel
			.getByRole('link')
			.evaluateAll((odnosniki) => odnosniki.map((odnosnik) => odnosnik.textContent?.trim() ?? ''));
		expect(new Set(teksty).size, `odnosniki podsumowania nie sa rozroznialne: ${teksty}`).toBe(
			teksty.length
		);

		// Distinctness alone would be satisfiable by a counter. Each entry has to name the
		// field it will take the editor to, and the name has to be the field's OWN label.
		for (const etykieta of [
			POLA_CENNIK.naglowekEtykieta,
			POLA_CENNIK.kwotaOpisEtykieta,
			POLA_CENNIK.zusEtykieta,
			POLA_CENNIK.wyzywienieEtykieta,
			POLA_CENNIK.nieobecnoscEtykieta
		]) {
			expect(
				teksty.some((tekst) => tekst.includes(etykieta)),
				`podsumowanie nie nazywa pola „${etykieta}"`
			).toBe(true);
		}
	});

	test('obnizka nie mniejsza od stawki jest odmawiana, wiec kwota ujemna jest niewyrazalna', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(CENNIK);
		await wypelnij(page, {
			[POLA_CENNIK.stawkaEtykieta]: '2000',
			[POLA_CENNIK.obnizkaEtykieta]: '2000'
		});
		await przyciskZapisz(page).click();

		const panel = page.locator('[data-panel="blad"]');
		await expect(panel).toBeVisible();
		await expect(panel).toContainText(KOPIA_WALIDACJA.obnizkaNieMniejsza);
		await expect(page.locator('[data-panel="sukces"]')).toHaveCount(0);
	});

	test('kwota zerowa bez warunku jest odmawiana (D-31)', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(CENNIK);
		await wypelnij(page, {
			[POLA_CENNIK.wyzywienieEtykieta]: 'Za drugie dziecko płacisz 0 zł.'
		});
		await przyciskZapisz(page).click();

		const panel = page.locator('[data-panel="blad"]');
		await expect(panel).toBeVisible();
		await expect(panel).toContainText(KOPIA_WALIDACJA.kwotaZeroBezWarunku);
		await expect(page.locator('[data-panel="sukces"]')).toHaveCount(0);
	});

	test('odmowa oddaje kazda wpisana wartosc, takze kwoty (Contract 10c)', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(CENNIK);
		await wypelnij(page, {
			[POLA_CENNIK.stawkaEtykieta]: '2500',
			[POLA_CENNIK.naglowekEtykieta]: 'Opłaty w skrócie, wersja robocza',
			[POLA_CENNIK.zusEtykieta]: ''
		});
		await przyciskZapisz(page).click();
		await expect(page.locator('[data-panel="blad"]')).toBeVisible();

		// A refused save that lost the other six fields would send an editor back to retype
		// work the server never had a quarrel with.
		await expect(pole(page, POLA_CENNIK.stawkaEtykieta)).toHaveValue('2500');
		await expect(pole(page, POLA_CENNIK.naglowekEtykieta)).toHaveValue(
			'Opłaty w skrócie, wersja robocza'
		);
		await expect(pole(page, POLA_CENNIK.wyzywienieEtykieta)).toHaveValue(cennik.wyzywienie);
	});
});

test.describe('Ekran cennika: poprawny zapis', () => {
	test('poprawny zapis pokazuje panel Zapisano z obietnica dwoch minut i odnosnikiem do strony', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(CENNIK);
		await wypelnij(page);
		await przyciskZapisz(page).click();

		const panel = page.locator('[data-panel="sukces"]');
		await expect(panel).toBeVisible();
		await expect(panel).toContainText(KOPIA_ZAPIS.zapisanoNaglowek);
		// The honest D-18 promise: saved, and visible on the site in about two minutes. No
		// build polling, no progress bar, no auto-refresh.
		await expect(panel).toContainText(KOPIA_ZAPIS.zapisanoTresc);
		await expect(panel).toBeFocused();

		const odnosnik = panel.getByRole('link', { name: zobaczStrone(KOPIA_CENNIK.stronaNazwa) });
		await expect(odnosnik).toHaveAttribute('href', '/cennik');
		await expect(odnosnik).toHaveAttribute('target', '_blank');
		await expect(odnosnik).toHaveAttribute('rel', /noopener/);
		await expect(odnosnik).toContainText(KOPIA_POWLOKA.nowaKarta.trim());
	});

	test('odswiezenie po zapisie nie zapisuje ponownie (POST, przekierowanie, GET)', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(CENNIK);
		await wypelnij(page);
		await przyciskZapisz(page).click();
		await expect(page.locator('[data-panel="sukces"]')).toBeVisible();

		// The browser is sitting on a GET, so a reload re-runs a read. If the action had
		// returned the panel directly instead of redirecting, this reload would resubmit the
		// POST, and on this screen that means a second commit and a second Cloudflare build.
		const odpowiedz = await page.reload();
		expect(odpowiedz?.request().method()).toBe('GET');
		expect(odpowiedz?.status()).toBe(200);
		await expect(page.locator('[data-panel="sukces"]')).toBeVisible();
	});
});

test.describe('Ekran cennika: dostepnosc', () => {
	test('ekran w stanie czystym nie narusza WCAG 2.1 AA', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(CENNIK);
		await expect(page.locator('main fieldset')).toHaveCount(2);
		const wynik = await new AxeBuilder({ page }).withTags(ZNACZNIKI).analyze();
		expect(wynik.violations).toEqual([]);
	});

	test('ekran z podsumowaniem bledow i aria-invalid nie narusza WCAG 2.1 AA', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto(CENNIK);
		await wypelnij(page, { [POLA_CENNIK.zusEtykieta]: '' });
		await przyciskZapisz(page).click();
		await expect(page.locator('[data-panel="blad"]')).toBeVisible();
		// The invalid state is genuinely rendered, so this is not the clean scan again.
		await expect(page.locator('main [aria-invalid="true"]')).toHaveCount(1);

		const wynik = await new AxeBuilder({ page }).withTags(ZNACZNIKI).analyze();
		expect(wynik.violations).toEqual([]);
	});
});

test.describe('Ekran cennika bez JavaScriptu (D-17)', () => {
	test('zapis i odmowa dzialaja przy wylaczonym JavaScripcie', async ({ browser }) => {
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

			const odpowiedz = await page.goto(CENNIK);
			expect(odpowiedz?.status()).toBe(200);

			// The refusal first: it is the half that has to survive a full round trip with
			// every other typed value intact and with no client code anywhere in the path.
			await wypelnij(page, { [POLA_CENNIK.zusEtykieta]: '' });
			await page.getByRole('button', { name: KOPIA_ZAPIS.zapisz }).click();
			const blad = page.locator('[data-panel="blad"]');
			await expect(blad).toBeVisible();
			await expect(blad).toContainText(KOPIA_WALIDACJA.zusBrak);
			await expect(pole(page, POLA_CENNIK.wyzywienieEtykieta)).toHaveValue(cennik.wyzywienie);

			// Then the save, reached by the browser's own navigation.
			await wypelnij(page);
			await page.getByRole('button', { name: KOPIA_ZAPIS.zapisz }).click();
			const sukces = page.locator('[data-panel="sukces"]');
			await expect(sukces).toBeVisible();
			await expect(sukces).toContainText(KOPIA_ZAPIS.zapisanoTresc);
			expect(page.url()).toContain('zapisano');
		} finally {
			await kontekst.close();
		}
	});
});
