import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { recruitment, urzad } from '../src/lib/content/site';
import { BIP_ZLOBEK, KRYTERIA, OPLATY, PROCEDURA, REMIS } from '../src/lib/content/rekrutacja';
import { KOPIA_FALLBACK, KOPIA_ZGLOSZENIE, tekstBledu } from '../src/lib/content/forms';

/**
 * /rekrutacja page acceptance test: encodes RECRUIT-01 (a parent reads the current
 * nabór status, the admission criteria with their point values, the real procedure
 * and a compact fee summary), RECRUIT-02 (a parent downloads the wnioski, and
 * reaches the complete set on the BIP) and RECRUIT-03 (a parent can leave a
 * waiting-list zgłoszenie from this page), plus the WCAG 2.1 AA gate for the route
 * (SITE-04).
 *
 * Contract highlights (04-UI-SPEC.md Amendment v1.4 /rekrutacja composition, the
 * Copywriting Contract and the Accessibility Contract; 04-06-PLAN.md):
 * - every fact is read from the content modules here as well, so a future data
 *   sweep cannot leave the page and this test agreeing on a wrong value (the
 *   assertions below interpolate, they never retype);
 * - the closed nabór is NEUTRAL information: it is never rendered in the danger
 *   colour (UI-SPEC hard rule 2), and the archival 2026/2027 stage dates are never
 *   rendered at all (source document section 10.3);
 * - the criteria are a real table with a caption, column headers and a row header
 *   per criterion, not a styled list;
 * - the fee box never states an unconditional zero amount (section 10.1);
 * - every download link resolves under /dokumenty/ and returns 200, and the BIP
 *   link is safe against reverse tabnabbing;
 * - a failed submit keeps every typed value and never looks like a success (D-12).
 *
 * Endpoint-level behaviour (status codes, machine codes, honeypot, the silently
 * dropped child-name key, verb handling) is covered by tests/rekrutacja-api.spec.ts
 * and is deliberately NOT duplicated here. This file covers the page and the island.
 *
 * The submit-to-success case runs against the real Cloudflare runtime through
 * `npm run preview:test`, which carries Cloudflare's always-pass dummy Turnstile
 * secret plus FORM_DRY_RUN=1, paired with the always-pass dummy sitekey in
 * src/lib/content/forms.ts (04-RESEARCH.md Pitfall 5). No mail is ever sent.
 *
 * Do NOT weaken these assertions to make the suite pass; they are the executable
 * acceptance criteria and change only in lockstep with an approved UI-SPEC
 * amendment.
 */

const IMIE = 'Anna Kowalska';
const EMAIL = 'anna.kowalska@example.com';
const WIADOMOSC = 'Dzień dobry, proszę o wpisanie nas na listę rezerwową.';
const MIESIAC = '3';

/** Archival stage dates from the 2026/2027 nabór. They exist in the committed
 *  source document and may NEVER be rendered as current (section 10.3), so their
 *  absence from the delivered HTML is an assertion, not a convention. */
const DATY_ARCHIWALNE = ['01.04.2026', '27.04.2026', '29.04.2026', '12.05.2026'];

/** The field Turnstile injects into its own container. It is the only DOM signal
 *  the widget gives us: with the always-pass dummy sitekey Cloudflare renders NO
 *  visible challenge and NO frame at all, so waiting for a frame would wait forever
 *  (established empirically in Plan 04-04). */
const POLE_TOKENU = 'input[name="cf-turnstile-response"]';

/** Navigate and wait until the Turnstile widget has rendered, so every later
 *  assertion (and every axe scan) sees a settled DOM instead of a page that is still
 *  hydrating the island and inserting the challenge. */
async function otworzRekrutacje(page: Page): Promise<void> {
	await page.goto('/rekrutacja');
	await expect(page.locator(POLE_TOKENU)).toBeAttached({ timeout: 30_000 });
}

/** The always-pass dummy sitekey issues a token without any interaction, but not
 *  instantly. Waiting for the widget's own response field to hold a value is what
 *  makes the success path deterministic. */
async function poczekajNaToken(page: Page): Promise<void> {
	await expect(page.locator(POLE_TOKENU)).toHaveValue(/.+/, { timeout: 30_000 });
}

/** Fields are addressed by ROLE plus accessible name, never by label text alone:
 *  the consent sentence on this form legitimately ends with „zgłoszenia i kontaktu
 *  zwrotnego", and label-only queries on either form have already proven ambiguous
 *  (Plan 04-04). The two selects are addressed by id, because the visible legend of
 *  their fieldset contains both select labels as substrings. */
async function wypelnijZgloszenie(page: Page): Promise<void> {
	await page.getByRole('textbox', { name: KOPIA_ZGLOSZENIE.imieEtykieta }).fill(IMIE);
	await page.getByRole('textbox', { name: KOPIA_ZGLOSZENIE.emailEtykieta }).fill(EMAIL);
	await page.getByRole('textbox', { name: KOPIA_ZGLOSZENIE.wiadomoscEtykieta }).fill(WIADOMOSC);
	await page.locator('#zgloszenie-miesiac').selectOption(MIESIAC);
	await page.locator('#zgloszenie-rok').selectOption(String(new Date().getFullYear()));
}

test.describe('Rekrutacja: RECRUIT-01 / RECRUIT-02 / RECRUIT-03 acceptance', () => {
	test('strona /rekrutacja odpowiada statusem 200', async ({ page }) => {
		const response = await page.goto('/rekrutacja');
		expect(response?.status()).toBe(200);
	});

	test('dokładnie jeden nagłówek h1 o treści Rekrutacja do żłobka', async ({ page }) => {
		await page.goto('/rekrutacja');
		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rekrutacja do żłobka');
	});

	test('banner statusu podaje trzy linie stanu naboru prosto z site.ts (D-06, D-14)', async ({
		page
	}) => {
		await page.goto('/rekrutacja');
		const banner = page.locator('.status-banner');
		await expect(banner).toHaveCount(1);
		// Treść pochodzi z site.ts, więc przełączenie recruitmentOpen zmienia stronę
		// główną i tę stronę razem, bez zmiany komponentu.
		await expect(banner).toContainText(recruitment.heading);
		await expect(banner).toContainText(recruitment.deadline);
		await expect(banner).toContainText(recruitment.nastepnyNabor);
	});

	test('stan naboru nie jest komunikatem błędu: brak tokenów danger (UI-SPEC reguła 2)', async ({
		page
	}) => {
		await page.goto('/rekrutacja');
		const banner = page.locator('.status-banner');
		const klasy = (await banner.getAttribute('class')) ?? '';
		expect(klasy).not.toMatch(/danger/);
		// #B91C1C = rgb(185, 28, 28): kolor semantyczny zarezerwowany dla awarii.
		const kolory = await banner.evaluate((el) => {
			const style = getComputedStyle(el);
			return `${style.color} ${style.backgroundColor} ${style.borderColor}`;
		});
		expect(kolory).not.toContain('185, 28, 28');
	});

	test('kryteria to prawdziwa tabela z podpisem i nagłówkami wierszy (RECRUIT-01)', async ({
		page
	}) => {
		await page.goto('/rekrutacja');
		const tabela = page.locator('table');
		await expect(tabela).toHaveCount(1);
		await expect(tabela.locator('caption')).toHaveText('Kryteria przyjęcia i liczba punktów');
		await expect(tabela.locator('thead th[scope="col"]')).toHaveCount(2);
		await expect(tabela.locator('tbody th[scope="row"]')).toHaveCount(KRYTERIA.length);

		for (const wiersz of KRYTERIA) {
			await expect(tabela).toContainText(wiersz.kryterium);
		}
		// Punktacja regulaminu: 50 za zamieszkanie, 20 i 10 za pozostałe kryteria.
		for (const punkty of ['50', '20', '10']) {
			await expect(tabela.locator('tbody td', { hasText: punkty }).first()).toBeVisible();
		}
		// Zasada remisu jest prozą pod tabelą, bo dotyczy całej tabeli. Lokalizator
		// celuje w ten konkretny akapit: to samo zdanie występuje także w kroku
		// procedury o punktacji, bo tam również jest prawdziwe.
		const remis = page.locator('.remis');
		await expect(remis).toHaveCount(1);
		await expect(remis).toHaveText(REMIS);
	});

	test('procedura mówi o złożeniu osobistym, podaje pokój i termin odwołania', async ({ page }) => {
		await page.goto('/rekrutacja');
		const procedura = page.locator('.procedura');
		await expect(procedura).toHaveCount(1);
		await expect(procedura.locator('li')).toHaveCount(PROCEDURA.length);
		await expect(procedura).toContainText('osobiście');
		await expect(procedura).toContainText('elektroniczną');
		// Adres i pokój są interpolowane z modułu treści, nigdy przepisane.
		await expect(procedura).toContainText(urzad.room);
		await expect(procedura).toContainText(urzad.wnioskiHours);
		await expect(procedura).toContainText('Komisja Rekrutacyjna');
		await expect(procedura).toContainText('7 dni');
		await expect(procedura).toContainText('deklaracji kontynuacji');
	});

	test('ramka opłat podaje kwotę i wyżywienie, a zero nigdy bez warunku (D-15, sekcja 10.1)', async ({
		page
	}) => {
		await page.goto('/rekrutacja');
		const ramka = page.locator('.fee-box');
		await expect(ramka).toHaveCount(1);
		await expect(ramka).toContainText(OPLATY.kwota);
		await expect(ramka).toContainText(OPLATY.wyzywienie);
		await expect(ramka).toContainText(OPLATY.nieobecnosc);
		// Warunek ZUS jest w tym samym bloku co kwota i nigdy od niej oddzielony.
		await expect(ramka).toContainText('ZUS');

		const tresc = await ramka.innerText();
		// Kwota zerowa nie może wystąpić jako opłata rodzica. Wzorzec pomija liczby
		// takie jak „1 500 zł" i „20 zł", bo tam przed zerem stoi cyfra.
		expect(tresc).not.toMatch(/(^|[^0-9])0(,00)?\s*zł/);
	});

	test('każdy wniosek do pobrania wskazuje realny plik pod /dokumenty/ i zwraca 200 (RECRUIT-02)', async ({
		page
	}) => {
		await page.goto('/rekrutacja');
		const wiersze = page.locator('a.doc-row');
		const ile = await wiersze.count();
		expect(ile).toBeGreaterThan(0);
		for (let i = 0; i < ile; i++) {
			const href = await wiersze.nth(i).getAttribute('href');
			expect(href).toMatch(/^\/dokumenty\//);
			const res = await page.request.get(href!);
			expect(res.status()).toBe(200);
		}
	});

	test('link do BIP jest bezpieczny i oznaczony jako nowa karta (RECRUIT-02, T-04-31)', async ({
		page
	}) => {
		await page.goto('/rekrutacja');
		// Lokalizator jest zawężony do sekcji z wnioskami: ten sam adres BIP jest
		// linkowany także ze stopki na każdej podstronie (wymóg dla jednostki
		// publicznej), a tu sprawdzamy link należący do tej sekcji.
		const sekcja = page.locator('section[aria-labelledby="wnioski-heading"]');
		const bip = sekcja.locator(`a[href="${BIP_ZLOBEK.url}"]`);
		await expect(bip).toHaveCount(1);
		await expect(bip).toBeVisible();
		await expect(bip).toHaveAttribute('target', '_blank');
		await expect(bip).toHaveAttribute('rel', 'noopener noreferrer');
		await expect(bip).toHaveAccessibleName(/otwiera się w nowej karcie/);
	});

	test('zgoda RODO nie jest zaznaczona po wejściu na stronę (RECRUIT-04)', async ({ page }) => {
		await page.goto('/rekrutacja');
		const zgoda = page.getByRole('checkbox');
		await expect(zgoda).toHaveCount(1);
		await expect(zgoda).not.toBeChecked();
	});

	test('klauzula informacyjna jest obecna i zwinięta po wejściu (D-03)', async ({ page }) => {
		await page.goto('/rekrutacja');
		const klauzula = page.locator('details');
		await expect(klauzula).toHaveCount(1);
		expect(await klauzula.evaluate((el: HTMLDetailsElement) => el.open)).toBe(false);
		await expect(page.locator('details summary')).toHaveText(KOPIA_ZGLOSZENIE.klauzulaEtykieta);
	});

	test('panel awaryjny i element noscript są w HTML przed interakcją (Pitfall 7)', async ({
		page
	}) => {
		await page.goto('/rekrutacja');
		const panel = page.locator('.fallback');
		await expect(panel.first()).toBeVisible();
		await expect(panel.first().getByText(KOPIA_FALLBACK.naglowek)).toBeVisible();

		const noscript = page.locator('noscript');
		expect(await noscript.count()).toBeGreaterThan(0);
	});

	test('strona nie publikuje archiwalnych terminów naboru 2026/2027 (sekcja 10.3)', async ({
		page
	}) => {
		await page.goto('/rekrutacja');
		const html = await page.content();
		for (const data of DATY_ARCHIWALNE) {
			expect(html).not.toContain(data);
		}
	});

	test('pełna ścieżka wysyłki: formularz zamienia się w panel sukcesu (RECRUIT-03, D-11)', async ({
		page
	}) => {
		await otworzRekrutacje(page);
		await wypelnijZgloszenie(page);
		await page.getByRole('checkbox').check();
		await poczekajNaToken(page);

		await page.getByRole('button', { name: KOPIA_ZGLOSZENIE.wyslij }).click();

		const sukces = page.getByRole('heading', { name: KOPIA_ZGLOSZENIE.sukcesNaglowek });
		await expect(sukces).toBeVisible({ timeout: 30_000 });
		await expect(sukces).toBeFocused();
		await expect(page.getByText(KOPIA_ZGLOSZENIE.sukcesTresc)).toBeVisible();
		// Formularz jest usunięty z DOM, a nie tylko ukryty (D-11).
		await expect(page.locator('form')).toHaveCount(0);
	});

	test('wysyłka bez zgody RODO zachowuje wpisane wartości i pokazuje instrukcję (D-12)', async ({
		page
	}) => {
		await otworzRekrutacje(page);
		await wypelnijZgloszenie(page);
		await poczekajNaToken(page);

		await page.getByRole('button', { name: KOPIA_ZGLOSZENIE.wyslij }).click();

		const alert = page.locator('[role="alert"]');
		await expect(alert).toBeVisible();
		await expect(alert).toContainText('Popraw zaznaczone pola');
		await expect(alert).toContainText(tekstBledu('zgoda'));

		// Formularz zostaje na miejscu, a każda wpisana wartość nadal w nim jest.
		await expect(page.locator('form')).toHaveCount(1);
		await expect(page.locator('#zgloszenie-imie')).toHaveValue(IMIE);
		await expect(page.locator('#zgloszenie-email')).toHaveValue(EMAIL);
		await expect(page.locator('#zgloszenie-wiadomosc')).toHaveValue(WIADOMOSC);
		await expect(page.locator('#zgloszenie-miesiac')).toHaveValue(MIESIAC);
		await expect(page.locator('#zgloszenie-rok')).toHaveValue(String(new Date().getFullYear()));
		await expect(page.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
		// Nic nie zostało wysłane, więc panel sukcesu nie może istnieć.
		await expect(page.getByText(KOPIA_ZGLOSZENIE.sukcesNaglowek)).toHaveCount(0);
	});

	test('brak naruszeń WCAG 2.1 AA na /rekrutacja (SITE-04 / A11Y baseline)', async ({ page }) => {
		await otworzRekrutacje(page);
		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();
		expect(results.violations).toEqual([]);
	});

	test('brak naruszeń WCAG 2.1 AA w stanie błędu walidacji z aria-invalid', async ({ page }) => {
		await otworzRekrutacje(page);
		// Puste wysłanie zaznacza wszystkie wymagane kontrolki jako nieprawidłowe, więc
		// skan obejmuje wyrenderowany stan aria-invalid, a nie tylko stan spoczynku.
		await page.getByRole('button', { name: KOPIA_ZGLOSZENIE.wyslij }).click();
		await expect(page.locator('[role="alert"]')).toBeVisible();
		await expect(page.locator('#zgloszenie-imie')).toHaveAttribute('aria-invalid', 'true');

		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();
		expect(results.violations).toEqual([]);
	});
});
