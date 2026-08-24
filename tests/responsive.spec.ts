import { test, expect } from '@playwright/test';

/**
 * Responsive acceptance (SITE-02): the homepage is mobile-first and adapts across
 * a phone/tablet/desktop viewport matrix without horizontal overflow, and the
 * navigation swaps between the hamburger drawer (phone and tablet) and the inline
 * links (desktop). Authoritative breakpoint: 01-UI-SPEC Amendment v1.7 §1, which
 * moves the nav flip from 768px to 1024px so a sixth chip fits without touching
 * the locked 44px-target chip geometry.
 */

const VIEWPORTS = {
	phone: { width: 375, height: 667 },
	tablet: { width: 768, height: 1024 },
	// The tier the v1.7 nav flip lands on. Named separately from `desktop` so the
	// pre-existing 1280px assertions keep measuring what they always measured.
	desktopSm: { width: 1024, height: 768 },
	desktop: { width: 1280, height: 800 },
	desktopXl: { width: 1920, height: 1080 }
} as const;

for (const [name, viewport] of Object.entries(VIEWPORTS)) {
	test(`no horizontal overflow at ${name} (${viewport.width}px)`, async ({ page }) => {
		await page.setViewportSize(viewport);
		await page.goto('/');
		// The document must not scroll horizontally (allow a 1px rounding tolerance).
		const overflow = await page.evaluate(
			() => document.documentElement.scrollWidth - document.documentElement.clientWidth
		);
		expect(overflow).toBeLessThanOrEqual(1);
	});
}

/* Amendment v1.6 §12: every public route stays overflow-free at both desktop
 * tiers, now that the recomposed sections fill the 72rem container. Amendment
 * v1.7 §1 adds the 768px and 1024px widths, the two tiers the nav flip moves
 * between: the breakpoint move is invisible to a 375px or 1280px assertion in
 * either direction. */
const ROUTES = [
	'/',
	'/o-nas',
	'/rekrutacja',
	'/cennik',
	'/kontakt',
	'/dokumenty',
	'/aktualnosci'
] as const;

for (const route of ROUTES) {
	for (const viewport of [
		VIEWPORTS.tablet,
		VIEWPORTS.desktopSm,
		VIEWPORTS.desktop,
		VIEWPORTS.desktopXl
	]) {
		test(`no horizontal overflow on ${route} at ${viewport.width}px`, async ({ page }) => {
			await page.setViewportSize(viewport);
			await page.goto(route);
			const overflow = await page.evaluate(
				() => document.documentElement.scrollWidth - document.documentElement.clientWidth
			);
			expect(overflow).toBeLessThanOrEqual(1);
		});
	}
}

/* Two composition guards for the v1.6 desktop grids: the /rekrutacja form rail
 * sits to the RIGHT of the info column, and the DayPlan panel sits to the RIGHT
 * of its heading. Positions only, no colors and no ordering beyond this. */
test('rekrutacja: kolumna formularza stoi na prawo od kolumny informacji (v1.6 §7)', async ({
	page
}) => {
	await page.setViewportSize(VIEWPORTS.desktop);
	await page.goto('/rekrutacja');
	const info = await page.locator('.kolumna-info').boundingBox();
	const formularz = await page.locator('.blok-formularz').boundingBox();
	expect(info).not.toBeNull();
	expect(formularz).not.toBeNull();
	expect(formularz!.x).toBeGreaterThan(info!.x + info!.width - 1);
});

// Naglowek rekrutacji stoi na TEJ SAMEJ siatce co tresc pod nim (2026-08-19). Do tej pory
// byly to dwie siatki dwukolumnowe o roznych proporcjach jedna nad druga, 1.2/1 w naglowku
// i 1.4/1 w tresci, wiec panel statusu mial przy 1280 px 473 px i zaczynal sie na x=704 nad
// blokiem szyny o 433 px zaczynajacym sie na x=743. Prawe krawedzie zgadzaly sie co do
// piksela, wiec panel wystawal o 39 px w lewo i czytal sie jak wychodzacy poza kolumne.
//
// Asercja porownuje DWA ELEMENTY ZE SOBA, nigdy z liczba pikseli: szerokosc kontenera,
// padding i przerwa miedzy kolumnami moga sie zmienic i nie o nich jest ten kontrakt.
// Obie asercje sa falszywe przed ta zmiana, i to dokladnie o zmierzone 39 px.
test('rekrutacja: panel statusu ma tę samą szynę co blok awarii (2026-08-19)', async ({ page }) => {
	await page.setViewportSize(VIEWPORTS.desktop);
	await page.goto('/rekrutacja');

	const panel = await page.locator('.status-banner').boundingBox();
	const awaria = await page.locator('.blok-awaria').boundingBox();
	expect(panel).not.toBeNull();
	expect(awaria).not.toBeNull();
	expect(Math.abs(panel!.x - awaria!.x)).toBeLessThanOrEqual(1);
	expect(Math.abs(panel!.width - awaria!.width)).toBeLessThanOrEqual(1);

	// Ta sama zmiana prostuje lewa kolumne: akapit wprowadzajacy i kolumna tresci zaczynaja
	// sie i koncza w tym samym miejscu. Bez tego naglowek moglby zgadzac sie po prawej, a
	// nadal rozjezdzac sie po lewej.
	const intro = await page.locator('.uklad-naglowka .intro').boundingBox();
	const info = await page.locator('.kolumna-info').boundingBox();
	expect(intro).not.toBeNull();
	expect(info).not.toBeNull();
	expect(Math.abs(intro!.x - info!.x)).toBeLessThanOrEqual(1);
	expect(Math.abs(intro!.width - info!.width)).toBeLessThanOrEqual(1);
});

// ZASTEPUJE asercje poprawki v1.6 §4 („panel stoi na prawo od naglowka"), ktora od
// 2026-08-18 jest falszywa Z ZALOZENIA. Tamten uklad byl skrojony pod siedem wierszy
// zastepczych; prawdziwy harmonogram ma czternascie i zostawial 979 px martwej
// przestrzeni po lewej przy kazdej szerokosci desktopowej.
//
// Asercja nie zostala ZLUZOWANA, tylko zamieniona na kontrakt nowego ukladu. Luzniejsza
// wersja („panel gdziekolwiek jest") przechodzilaby takze na starym ukladzie, a wtedy
// brama przestaje cokolwiek chronic. Kazdy z czterech warunkow ponizej jest falszywy na
// ukladzie sprzed tej zmiany:
//  1. panel stal OBOK naglowka, nie pod nim;
//  2. panel byl ograniczony do 44rem, wiec nie mial szerokosci wiersza naglowkowego;
//  3. harmonogram mial jedna kolumne, nie dwie;
//  4. akapit wprowadzajacy stal POD naglowkiem w lewej szynie, nie obok niego.
test('strona główna: plan dnia to pełna szerokość i dwie kolumny (2026-08-18)', async ({
	page
}) => {
	await page.setViewportSize(VIEWPORTS.desktop);
	await page.goto('/');

	const opis = await page.locator('.dayplan .opis').boundingBox();
	const panel = await page.locator('.dayplan .panel').boundingBox();
	expect(opis).not.toBeNull();
	expect(panel).not.toBeNull();

	// 1 + 2. Panel i wiersz naglowkowy sa rodzenstwem w jednokolumnowej siatce, wiec maja
	// tę samą krawędź i tę samą szerokość, a panel stoi PONIŻEJ. Porownanie z `.opis`, a
	// nie z liczba pikseli, zeby zmiana paddingu kontenera nie psula tej asercji.
	expect(Math.abs(panel!.x - opis!.x)).toBeLessThanOrEqual(1);
	expect(Math.abs(panel!.width - opis!.width)).toBeLessThanOrEqual(1);
	expect(panel!.y).toBeGreaterThan(opis!.y + opis!.height - 1);

	// 3. Dokladnie dwie kolumny. Kazdy wiersz wypelnia swoja kolumne, wiec liczba
	// roznych odsuniec poziomych JEST liczba kolumn.
	const odsuniecia = await page
		.locator('.dayplan .panel li')
		.evaluateAll((wiersze) => [
			...new Set(wiersze.map((w) => Math.round(w.getBoundingClientRect().x)))
		]);
	expect(odsuniecia).toHaveLength(2);

	// 4. Podzial redakcyjny naglowka: akapit stoi na prawo od h2.
	const h2 = await page.getByRole('heading', { name: 'Nasz dzień w żłobku' }).boundingBox();
	const intro = await page.locator('.dayplan .intro').boundingBox();
	expect(h2).not.toBeNull();
	expect(intro).not.toBeNull();
	expect(intro!.x).toBeGreaterThan(h2!.x + h2!.width - 1);

	// 5. Kazdy opis zaczyna sie na krawedzi swojej kolumny, a nie raz obok godziny i raz
	// pod nia (2026-08-18). Liczba roznych odsuniec poziomych `.what` ma byc ROWNA
	// liczbie kolumn. Uruchomione na ukladzie sprzed tej zmiany daja TRZY odsuniecia,
	// [128, 668, 786]: w lewej kolumnie kazdy opis zawinal sie pod godzine, w prawej
	// czesc zawinela sie, a czesc zmiescila obok, 118 px dalej.
	const odsunieciaOpisow = await page
		.locator('.dayplan .panel .what')
		.evaluateAll((opisy) => [
			...new Set(opisy.map((o) => Math.round(o.getBoundingClientRect().x)))
		]);
	expect(odsunieciaOpisow).toHaveLength(2);

	// Kazdy opis stoi OBOK swojej godziny, nie pod nia. Sam licznik odsuniec przeszedlby
	// takze na ukladzie, w ktorym wszystkie czternascie wierszy zawija sie pod godzine,
	// bo wtedy odsuniec tez sa dwa.
	const wszystkieObok = await page.locator('.dayplan .panel li').evaluateAll((wiersze) =>
		wiersze.every((w) => {
			const godzina = w.querySelector('.time')!.getBoundingClientRect();
			const opis = w.querySelector('.what')!.getBoundingClientRect();
			return opis.x > godzina.x + godzina.width - 1 && Math.abs(opis.top - godzina.top) < 12;
		})
	);
	expect(wszystkieObok).toBe(true);
});

// Ta sama usterka na telefonie, tylko odwrocona: trzy z czternastu wierszy mieszcily opis
// obok godziny, a jedenascie zawijalo go pod nia. Kontrakt telefonu jest odwrotnoscia
// kontraktu desktopu: KAZDY wiersz stoi w kolumnie, bo lista ma przy 375 px tylko 264 px,
// a szyna 104 px zostawilaby na tekst okolo 19 znakow.
test('telefon: każdy wiersz planu dnia stoi w kolumnie, godzina nad opisem (2026-08-18)', async ({
	page
}) => {
	await page.setViewportSize(VIEWPORTS.phone);
	await page.goto('/');

	// Licznik osobno, bo `every` na pustej liscie zwraca `true`: bez tego test przeszedlby
	// takze wtedy, gdyby sekcja w ogole sie nie wyrenderowala. Sprawdzamy NIEPUSTOSC, nie
	// konkretna liczbe wierszy: harmonogram jest edytowalny z /admin/plan-dnia, wiec
	// przypiecie czternastki zamienilo by dzisiejsza tresc w kontrakt.
	expect(await page.locator('.dayplan .panel li').count()).toBeGreaterThan(0);

	const wszystkiePodSpodem = await page.locator('.dayplan .panel li').evaluateAll((wiersze) => {
		return wiersze.every((w) => {
			const godzina = w.querySelector('.time')!.getBoundingClientRect();
			const opis = w.querySelector('.what')!.getBoundingClientRect();
			return opis.top >= godzina.top + godzina.height - 1;
		});
	});
	expect(wszystkiePodSpodem).toBe(true);
});

// Siedmiopunktowa lista „Co obejmuje opłata" (quick 260820-m35). Ta lista NIE siedzi w
// prawym torze podzialu redakcyjnego: jest rozpieta na oba tory (`grid-column: 1 / -1`,
// idiom galerii z Kontraktu 2) i od 1024 px jest dwukolumnowa. Bez tego przy 1280 px
// lewa szyna 300 px stalaby pusta na okolo 230 px pod naglowkiem, czyli dokladnie ten
// „duzy pusty obszar", ktorego zlecajacy zakazal.
//
// Asercja wysokosci `li` jest tu tym, co chroni pomiar: kolumna ma (1088 − 48) / 2 =
// 520 px, czyli limit 65ch dla tekstu 16 px, wiec kazdy punkt miesci sie w JEDNEJ linii
// (24 px). Punkt dluzszy niz 60 znakow zlamalby sie na dwie linie i lista urosla by o
// polowe, a wtedy uklad przestaje rozwiazywac problem, dla ktorego powstal.
const LISTA_ZAKRESU = 'section[aria-labelledby="zakres-heading"] ul.lista li';

test('cennik: zakres opłaty to dwie kolumny przy 1280 px, każdy punkt w jednej linii (260820-m35)', async ({
	page
}) => {
	await page.setViewportSize(VIEWPORTS.desktop);
	await page.goto('/cennik');

	const punkty = page.locator(LISTA_ZAKRESU);
	await expect(punkty).toHaveCount(7);

	const pierwszy = await punkty.nth(0).boundingBox();
	const drugi = await punkty.nth(1).boundingBox();
	expect(pierwszy).not.toBeNull();
	expect(drugi).not.toBeNull();

	// Dwie kolumny: element 2 stoi OBOK elementu 1, nie pod nim. Siatka
	// `repeat(2, minmax(0, 1fr))` daje to deterministycznie; `column-count` zostawilby
	// rownowazenie przegladarce i ta asercja bylaby zgadywanka.
	expect(drugi!.x).toBeGreaterThan(pierwszy!.x + pierwszy!.width - 1);
	expect(Math.abs(drugi!.y - pierwszy!.y)).toBeLessThanOrEqual(1);

	// Dokladnie dwie kolumny na calej liscie, nie tylko w pierwszym wierszu.
	const odsuniecia = await punkty.evaluateAll((wiersze) => [
		...new Set(wiersze.map((w) => Math.round(w.getBoundingClientRect().x)))
	]);
	expect(odsuniecia).toHaveLength(2);

	// Kazdy punkt w jednej linii: wiersz 24 px plus zapas na zaokraglenia.
	const wysokosci = await punkty.evaluateAll((wiersze) =>
		wiersze.map((w) => w.getBoundingClientRect().height)
	);
	for (const wysokosc of wysokosci) {
		expect(wysokosc).toBeLessThanOrEqual(40);
	}
});

test('cennik: zakres opłaty to jedna kolumna przy 375 px (260820-m35)', async ({ page }) => {
	await page.setViewportSize(VIEWPORTS.phone);
	await page.goto('/cennik');

	const punkty = page.locator(LISTA_ZAKRESU);
	await expect(punkty).toHaveCount(7);

	const odsuniecia = await punkty.evaluateAll((wiersze) => [
		...new Set(wiersze.map((w) => Math.round(w.getBoundingClientRect().x)))
	]);
	expect(odsuniecia).toHaveLength(1);
});

test('phone width shows the hamburger, hides the inline nav links (SITE-02)', async ({ page }) => {
	await page.setViewportSize(VIEWPORTS.phone);
	await page.goto('/');
	// Hamburger visible below md.
	await expect(page.getByRole('button', { name: 'Otwórz menu' })).toBeVisible();
	// The inline desktop nav links are collapsed (nav is display:none below md).
	await expect(
		page.getByRole('navigation', { name: 'Główna nawigacja' }).getByRole('link', {
			name: 'Aktualności'
		})
	).toBeHidden();
});

test('desktop width shows the inline nav links, hides the hamburger (SITE-02)', async ({
	page
}) => {
	await page.setViewportSize(VIEWPORTS.desktop);
	await page.goto('/');
	await expect(
		page.getByRole('navigation', { name: 'Główna nawigacja' }).getByRole('link', {
			name: 'Aktualności'
		})
	).toBeVisible();
	await expect(page.getByRole('button', { name: 'Otwórz menu' })).toBeHidden();
});

/* The two tiers the v1.7 nav flip sits between. Without these the move from 768px
 * to 1024px passes the suite unchanged in either direction, so the change would be
 * unfalsifiable. The 375px and 1280px tests above stay untouched on purpose: they
 * are what proves neither end of the range regressed. */
test('szerokość 768px pokazuje hamburgera i chowa odnośniki w pasku (v1.7 §1)', async ({
	page
}) => {
	await page.setViewportSize(VIEWPORTS.tablet);
	await page.goto('/');
	await expect(page.getByRole('button', { name: 'Otwórz menu' })).toBeVisible();
	await expect(
		page.getByRole('navigation', { name: 'Główna nawigacja' }).getByRole('link', {
			name: 'Aktualności'
		})
	).toBeHidden();
});

test('szerokość 1024px pokazuje odnośniki w pasku i chowa hamburgera (v1.7 §1)', async ({
	page
}) => {
	await page.setViewportSize(VIEWPORTS.desktopSm);
	await page.goto('/');
	await expect(
		page.getByRole('navigation', { name: 'Główna nawigacja' }).getByRole('link', {
			name: 'Aktualności'
		})
	).toBeVisible();
	await expect(page.getByRole('button', { name: 'Otwórz menu' })).toBeHidden();
});

/* Quick 260824-hev. Karty „Dobrze wiedzieć" MUSZA stac w jednym wierszu na desktopie. Test
   struktury w tests/cennik.spec.ts tego nie zlapie: sprawdza szerokosc kontenera, a kontener
   jest pelnej szerokosci takze wtedy, gdy karty sie ulozyly jedna pod druga. Dokladnie tak
   przeszedl na zielono, kiedy reguly trzykolumnowe przegraly kolejnoscia zrodla z regula
   bazowa. Geometria jest jedynym miejscem, ktore to widzi. */
test('cennik: „Dobrze wiedzieć" to trzy karty w jednym wierszu przy 1280 px (260824-hev)', async ({
	page
}) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto('/cennik');
	const karty = page.locator('section[aria-labelledby="wiedziec-heading"] .karta');
	await expect(karty).toHaveCount(3);

	const pudla = await Promise.all((await karty.all()).map((k) => k.boundingBox()));
	const y = pudla.map((p) => Math.round(p!.y));
	const x = pudla.map((p) => Math.round(p!.x));
	expect(new Set(y).size, 'karty nie stoja w jednym wierszu').toBe(1);
	expect(new Set(x).size, 'karty nie maja trzech roznych kolumn').toBe(3);
});

test('cennik: karty „Dobrze wiedzieć" schodza do jednej kolumny przy 375 px (260824-hev)', async ({
	page
}) => {
	await page.setViewportSize({ width: 375, height: 812 });
	await page.goto('/cennik');
	const karty = page.locator('section[aria-labelledby="wiedziec-heading"] .karta');
	const pudla = await Promise.all((await karty.all()).map((k) => k.boundingBox()));
	expect(new Set(pudla.map((p) => Math.round(p!.x))).size, 'karty nie sa jednokolumnowe').toBe(1);
});
