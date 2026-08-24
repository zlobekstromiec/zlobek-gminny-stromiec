import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
/* Asercje porownuja sie ze STALYMI, nigdy z przepisanym literalem: precedens
   tests/admin-cennik.spec.ts. Przepisany napis rozjechalby sie z modulem prozy przy
   pierwszej korekcie i test bronilby wtedy nieistniejacej tresci. */
import { KWOTA_PODPIS, PODPIS_PLACI, ROZBICIE } from '../src/lib/content/cennik';
import { CENNIK } from '../src/lib/cennik';

/**
 * Cennik acceptance test: encodes FEES-01 (a parent can read the fees page) plus the
 * WCAG 2.1 AA baseline (SITE-04) for the /cennik route. Covers FEE-1, FEE-2 and FEE-3
 * of 05-VALIDATION.md.
 *
 * Contract highlights (05-UI-SPEC.md Contracts 3 and 4):
 * - nine sections since quick 260820-m35 (Contract 3 annotated in lockstep), no <table>:
 *   an amount and its condition are one block, and a table splits them into cells that
 *   land on different rows at mobile width;
 * - the payable amount is COMPUTED from two stored numbers (05 D-28), so this file
 *   pins the ARITHMETIC and never a particular amount. Nothing here retypes a złoty
 *   figure, which is what lets an editor change the fee in the panel without turning
 *   the suite red;
 * - a zero amount may appear ONLY inside the ZUS block, together with its condition
 *   (dane-bip paragraf 10, punkt 1). That gate is a scoped PAIR, not a copy of
 *   tests/rekrutacja.spec.ts:183: the older assertion forbids ANY zero inside
 *   .fee-box, and /cennik renders one on purpose.
 *
 * Do NOT weaken these assertions to make the suite pass; they are the executable
 * acceptance criteria and change only in lockstep with an approved UI-SPEC amendment.
 */

/* Declared ONCE. The boundary is what makes it safe: „1 500 zł" and „20 zł" both
   carry a digit before the zero, so only a standalone zero amount matches. */
const ZERO = /(^|[^0-9])0(,00)?\s*zł/;

/* Zakres listy „Co obejmuje opłata" (quick 260820-m35). Sekcja jest wskazywana przez
   swoj wlasny naglowek, wiec selektor nie zalezy od kolejnosci sekcji na stronie. */
const LISTA_ZAKRESU = 'section[aria-labelledby="zakres-heading"] ul.lista';

/* Adres zweryfikowany `curl` przed planowaniem (HTTP 200, bez przekierowania). Wariant
   `/en/` i sciezka `/swiadczenia/aktywnyrodzic/...` sa oba bledne, wiec adres jest
   przypiety doslownie. */
const URL_ZUS = 'https://www.zus.pl/aktywnyrodzic/wiadczenie-aktywnie-w-zlobku';

test.describe('Cennik: FEES-01 acceptance', () => {
	test('strona /cennik odpowiada statusem 200', async ({ page }) => {
		const response = await page.goto('/cennik');
		expect(response?.status()).toBe(200);
	});

	test('dokładnie jeden nagłówek h1 o treści Cennik', async ({ page }) => {
		await page.goto('/cennik');
		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cennik');
	});

	test('wszystkie sekcje cennika są obecne i opisane własnym nagłówkiem', async ({ page }) => {
		await page.goto('/cennik');
		for (const nazwa of [
			'Opłata za pobyt',
			// Siodmy wpis, dodany przez quick 260820-m35: zakres oplaty z uchwaly.
			'Co obejmuje opłata',
			'Świadczenie „Aktywnie w żłobku" (ZUS)',
			// Quick 260824-hev: „Wyżywienie", „Nieobecność dziecka" i „Jak i kiedy płacić"
			// przestaly byc osobnymi pasmami i sa teraz KARTAMI w tej jednej sekcji. Kazda
			// z nich niosla okolo 150 znakow, a dostawala pelnowymiarowe pasmo z pusta szyna
			// obok. Ich naglowki zeszly na poziom h3 i sa pinowane nizej.
			'Dobrze wiedzieć',
			'Podstawa prawna'
		]) {
			await expect(page.getByRole('heading', { name: nazwa, exact: true })).toBeVisible();
		}
	});

	/* Quick 260824-hev. Trzy najciensze sekcje strony (okolo 150 znakow kazda) mialy wlasne
	   pasmo i wlasna pusta szyne, przez co strona czytala sie jak niedokonczona: 3918 px na
	   3500 znakow i dziewiec zmian tla. Sa teraz trzema kartami w jednym pasmie, rozpietymi na
	   obu torach podzialu redakcyjnego. Ten test pilnuje, ze zadna tresc nie zginela po drodze. */
	test('trzy cienkie tematy są kartami w jednej sekcji, nie osobnymi pasmami (260824-hev)', async ({
		page
	}) => {
		await page.goto('/cennik');
		const sekcja = page.locator('section[aria-labelledby="wiedziec-heading"]');
		await expect(sekcja).toHaveCount(1);

		const karty = sekcja.locator('.karta');
		await expect(karty).toHaveCount(3);
		for (const [i, nazwa] of [
			'Wyżywienie',
			'Nieobecność dziecka',
			'Jak i kiedy płacić'
		].entries()) {
			await expect(karty.nth(i).getByRole('heading', { level: 3, name: nazwa })).toBeVisible();
		}

		// Zadne z tych zdan nie zniknelo przy przenosinach.
		await expect(sekcja).toContainText(CENNIK.wyzywienie);
		await expect(sekcja).toContainText(CENNIK.nieobecnosc);
		await expect(sekcja).toContainText('na rzecz Gminy Stromiec');

		// Karty sa rozpiete na obu torach, wiec szyna nie swieci pustka obok jednego zdania.
		const szer = (await sekcja.locator('.karty').boundingBox())!.width;
		const tor = (await sekcja.locator('h2').boundingBox())!;
		expect(szer).toBeGreaterThan(tor.width * 2);
	});

	test('kwoty renderują się jako panele i listy definicji, nigdy jako tabela', async ({ page }) => {
		await page.goto('/cennik');
		await expect(page.locator('main table')).toHaveCount(0);
		await expect(page.locator('.rozbicie dl > div')).toHaveCount(3);
	});

	test('rozbicie kwoty zgadza się z tym, co strona sama pokazuje (D-28)', async ({ page }) => {
		await page.goto('/cennik');
		const wiersze = page.locator('.rozbicie dl > div');
		const liczba = async (i: number) =>
			Number((await wiersze.nth(i).locator('dd').innerText()).replace(/[^0-9-]/g, ''));
		const stawka = await liczba(0);
		const obnizka = await liczba(1);
		const placi = await liczba(2);
		expect(placi).toBe(stawka - obnizka);
		expect(obnizka).toBeGreaterThanOrEqual(0);
		expect(obnizka).toBeLessThan(stawka);
	});

	/* Siedem punktow, bo tyle wylicza uchwala (par. 1 ust. 2, mail dyrektor 2026-08-20).
	   Liczba jest przypieta, a nie „wieksza od zera": skrocenie listy do szesciu punktow
	   przemilczaloby jeden z obowiazkow, ktore oplata pokrywa. */
	test('sekcja zakresu wylicza siedem punktów z uchwały (260820-m35)', async ({ page }) => {
		await page.goto('/cennik');
		const lista = page.locator(LISTA_ZAKRESU);
		await expect(lista).toHaveCount(1);
		await expect(lista.locator('li')).toHaveCount(7);
	});

	/* Odnosnik, o ktory prosi dyrektor. Pinujemy adres, nowa karte i `noopener`, bo
	   `target="_blank"` bez niego oddaje otwartej stronie uchwyt `window.opener`. */
	test('odnośnik do ZUS prowadzi pod zweryfikowany adres i otwiera nową kartę (260820-m35)', async ({
		page
	}) => {
		await page.goto('/cennik');
		const link = page.getByRole('link', { name: /^Świadczenie aktywnie w żłobku/ });
		await expect(link).toBeVisible();
		await expect(link).toHaveAttribute('href', URL_ZUS);
		await expect(link).toHaveAttribute('target', '_blank');
		await expect(link).toHaveAttribute('rel', /noopener/);
	});

	/* Ramka oplat po quicku 260823-p4w. Klient poprosil, zeby strona podawala jako cene
	   STAWKE Z UCHWALY, bo o to poprosila dyrektorka. Ten test pilnuje warunku, ktory czyni to
	   uczciwym: obie kwoty sa na ekranie, kazda pod wlasna etykieta, w JEDNEJ ramce, i zadna
	   regula responsywna ich nie rozdziela. Gdyby nota obnizki kiedykolwiek zniknela albo
	   wyladowala poza ramka, strona zaczelaby sugerowac, ze rodzic placi 2337 zl. */
	test('ramka podaje stawkę z uchwały i obok niej kwotę faktycznie płaconą (260823-p4w)', async ({
		page
	}) => {
		await page.goto('/cennik');
		const ramka = page.locator('.ramka-oplaty');
		await expect(ramka).toHaveCount(1);

		// Naglowkiem ramki jest STAWKA, nie kwota placona.
		const podpisy = ramka.locator('p.kwota-podpis');
		await expect(podpisy).toHaveCount(2);
		await expect(podpisy.nth(0)).toHaveText(KWOTA_PODPIS);
		await expect(podpisy.nth(1)).toHaveText(PODPIS_PLACI);

		const kwoty = ramka.locator('p.kwota');
		await expect(kwoty).toHaveCount(2);
		await expect(kwoty.nth(0)).toHaveText(CENNIK.stawkaProza);
		await expect(kwoty.nth(1)).toHaveText(CENNIK.kwotaProza);

		// Kazda kwota stoi BEZPOSREDNIO pod swoja etykieta.
		await expect(ramka.locator('p.kwota-podpis + p.kwota')).toHaveCount(2);

		// Nota obnizki lezy W TEJ SAMEJ ramce co stawka i niesie kwote placona.
		const nota = ramka.locator('.nota-obnizki');
		await expect(nota).toHaveCount(1);
		await expect(nota).toBeVisible();
		await expect(nota.locator('p.kwota')).toHaveText(CENNIK.kwotaProza);
		expect(await nota.innerText()).toContain(CENNIK.obnizkaTekst);

		// Obie etykiety sa bezkwotowe i ROZNE: zlanie ich w jedna znosi caly sens tego bloku.
		expect(await podpisy.nth(0).innerText()).not.toMatch(/\d/);
		expect(await podpisy.nth(1).innerText()).not.toMatch(/\d/);
		expect(KWOTA_PODPIS).not.toBe(PODPIS_PLACI);
		expect(ROZBICIE.stawka).toMatch(/przed obniżką/);
	});

	/* Nigdzie na stronie 2337 zl nie jest podane jako kwota, ktora rodzic placi. To jest
	   granica calej zmiany 260823-p4w, wiec jest testem, a nie notatka w commicie. */
	test('stawka z uchwały nigdy nie stoi pod etykietą płatnika (260823-p4w)', async ({ page }) => {
		await page.goto('/cennik');
		const placi = page.locator('.nota-obnizki p.kwota');
		await expect(placi).toHaveText(CENNIK.kwotaProza);
		expect(await placi.innerText()).not.toContain(CENNIK.stawkaTekst);

		const wiersz = page.locator('.rozbicie dl > div').nth(2);
		await expect(wiersz.locator('dt')).toHaveText(ROZBICIE.placi);
		await expect(wiersz.locator('dd')).toHaveText(CENNIK.placiTekst);
	});

	test('kwota zero pojawia się wyłącznie razem ze swoim warunkiem (D-31)', async ({ page }) => {
		await page.goto('/cennik');
		const blokZus = page.locator('#zus-blok');
		await expect(blokZus).toHaveCount(1);
		const trescZus = await blokZus.innerText();
		expect(trescZus).toMatch(/Aktywnie w żłobku/);
		expect(trescZus).toMatch(ZERO);
	});

	test('strona bez bloku ZUS nie zawiera już żadnej kwoty zerowej (D-31)', async ({ page }) => {
		await page.goto('/cennik');
		const bezZus = await page.evaluate(() => {
			const main = document.querySelector('main')!.cloneNode(true) as HTMLElement;
			main.querySelector('#zus-blok')?.remove();
			return main.innerText;
		});
		expect(bezZus).not.toMatch(ZERO);
	});

	test('sekcja o podstawie prawnej kieruje do dokumentów', async ({ page }) => {
		await page.goto('/cennik');
		const link = page.getByRole('link', { name: 'Zobacz dokumenty' });
		await expect(link).toBeVisible();
		await expect(link).toHaveAttribute('href', '/dokumenty');
	});

	test('stronę zamyka wezwanie do zapisu dziecka', async ({ page }) => {
		await page.goto('/cennik');
		await expect(page.getByRole('link', { name: 'Zapisz dziecko' })).toHaveAttribute(
			'href',
			'/rekrutacja'
		);
	});

	test('emituje polskie metadane SEO wraz z noindex (D-11)', async ({ page }) => {
		await page.goto('/cennik');
		await expect(page).toHaveTitle('Cennik: Publiczny Żłobek w Stromcu');
		await expect(page.locator('head meta[name="description"]')).toHaveAttribute(
			'content',
			/Opłaty w Publicznym Żłobku w Stromcu/
		);
		await expect(page.locator('head meta[name="robots"]')).toHaveAttribute('content', 'noindex');
	});

	test('brak naruszeń WCAG 2.1 AA (SITE-04 / A11Y baseline)', async ({ page }) => {
		await page.goto('/cennik');
		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();
		expect(results.violations).toEqual([]);
	});
});
