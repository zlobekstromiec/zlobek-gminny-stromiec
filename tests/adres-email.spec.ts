import { test, expect, type Page } from '@playwright/test';
import { contact } from '../src/lib/content/site';

/**
 * Bramka łamania adresu e-mail (quick 260901-duo, decyzje D-1 i D-2).
 *
 * Adres `publicznyzlobek@ugstromiec.pl` łamał się na stronie głównej w środku domeny
 * i zostawiał osierocone „ec.pl" w drugim wierszu, bo `.item-link` niesie
 * `overflow-wrap: anywhere`, czyli zgodę na złamanie w DOWOLNYM miejscu. Naprawa to
 * znacznik `<wbr>` bezpośrednio po małpie, renderowany w jednym miejscu
 * (`src/lib/components/AdresEmail.svelte`) i współdzielony przez wszystkie sześć
 * powierzchni.
 *
 * Dlaczego pomiar idzie na WĘZŁY TEKSTOWE, a nie na element: wewnątrz `.item-link`,
 * które jest `display: inline-flex`, element opakowujący jest zblokowanym elementem
 * elastycznym i zwraca JEDEN prostokąt obejmujący oba wiersze niezależnie od tego, czy
 * tekst się zawinął. Pomiar na elemencie nie zobaczyłby tej usterki w ogóle.
 * `Range.getClientRects()` rozpięty na węźle tekstowym zwraca jeden prostokąt na każdy
 * wiersz, więc liczba prostokątów JEST liczbą wierszy zajętych przez ten węzeł.
 *
 * Żaden inny test tego nie złapie: `npm run check`, eslint oraz axe przechodzą przy
 * każdym łamaniu, bo złamany wiersz jest poprawny składniowo i dostępny.
 */

const WIDOKI = [
	{ nazwa: '1440 px', width: 1440, height: 1000 },
	{ nazwa: '1024 px', width: 1024, height: 768 }
] as const;

/** Trasy, które renderują adres: strona główna (karta kontaktowa plus stopka),
 *  /kontakt (dwa odnośniki plus stopka) i /rekrutacja (panel awaryjny plus stopka). */
const TRASY = ['/', '/kontakt', '/rekrutacja'] as const;

/** Uchwyt bramki. Klasa nie niesie żadnego wyglądu: komponent nie ma bloku `style`,
 *  więc nie dostaje skrótu zakresu Svelte i selektor działa z zewnątrz. */
const ADRES = '.adres-email';

type WezelPomiar = { tekst: string; prostokaty: number; gora: number };
type Pomiar = { tekst: string; wezly: WezelPomiar[] };

async function zmierzAdresy(page: Page, selektor: string): Promise<Pomiar[]> {
	return page.$$eval(selektor, (elementy) =>
		elementy.map((el) => ({
			tekst: el.textContent ?? '',
			wezly: Array.from(el.childNodes)
				// Węzły komentarza wstawiane przez hydratację Svelte odpadają po `nodeType`.
				.filter((w) => w.nodeType === 3 && (w.textContent ?? '') !== '')
				.map((w) => {
					const zakres = document.createRange();
					zakres.selectNodeContents(w);
					// Prostokąty zerowej szerokości to artefakt granic zakresu, nie złamanie wiersza.
					const prostokaty = Array.from(zakres.getClientRects()).filter((p) => p.width > 0);
					return {
						tekst: w.textContent ?? '',
						prostokaty: prostokaty.length,
						gora: prostokaty.length > 0 ? prostokaty[0].top : -1
					};
				})
		}))
	);
}

for (const trasa of TRASY) {
	for (const widok of WIDOKI) {
		test(`${trasa} przy ${widok.nazwa}: adres łamie się wyłącznie przy małpie`, async ({
			page
		}) => {
			await page.setViewportSize({ width: widok.width, height: widok.height });
			await page.goto(trasa);

			const pomiary = await zmierzAdresy(page, ADRES);
			// Bez tego przypadek przechodziłby także wtedy, gdyby adres zniknął z trasy.
			expect(pomiary.length, `trasa ${trasa} nie renderuje ani jednego adresu`).toBeGreaterThan(0);

			const [przedMalpa, domena] = [
				contact.email.slice(0, contact.email.lastIndexOf('@') + 1),
				contact.email.slice(contact.email.lastIndexOf('@') + 1)
			];

			for (const pomiar of pomiary) {
				// 1. Kopiowalność (D-1): tekst wystąpienia jest bajt w bajt adresem ze `site.ts`.
				//    Spacja wstrzyknięta przez nową linię w źródle komponentu zapala ten warunek.
				expect(pomiar.tekst, 'adres nie jest kopiowalny jako jeden ciąg').toBe(contact.email);

				// 2. Dokładnie dwa węzły tekstowe: część przed małpą wraz z małpą, oraz domena.
				expect(
					pomiar.wezly.map((w) => w.tekst),
					'adres nie jest podzielony dokładnie przy małpie'
				).toEqual([przedMalpa, domena]);

				// 3. Właściwa asercja D-1: złamanie w środku części lokalnej albo w środku domeny
				//    dałoby DWA prostokąty na tym samym węźle.
				for (const wezel of pomiar.wezly) {
					expect(wezel.prostokaty, `„${wezel.tekst}" łamie się w środku`).toBe(1);
				}

				// 4. Trzeciej możliwości nie ma: albo adres stoi w jednym wierszu, albo domena
				//    zaczyna nowy wiersz PONIŻEJ części z małpą.
				const [gora, dol] = [pomiar.wezly[0].gora, pomiar.wezly[1].gora];
				const jedenWiersz = Math.abs(dol - gora) <= 1;
				expect(jedenWiersz || dol > gora, 'domena nie stoi ani obok, ani pod małpą').toBe(true);
			}
		});
	}
}

/* Reguła STRUKTURALNA, nie licznik dzisiejszej treści: liczba wystąpień na trasę nie jest
   wpisana na sztywno, bo powierzchnie przybywają i ubywają. Kontrakt brzmi: każdy odnośnik
   pocztowy niesie dokładnie jedno wystąpienie komponentu, i stopka też, więc żadna
   powierzchnia nie może po cichu wrócić do własnego kawałka znaczników. */
for (const trasa of TRASY) {
	test(`${trasa}: każdy odnośnik pocztowy i stopka czytają jedno źródło adresu`, async ({
		page
	}) => {
		await page.setViewportSize({ width: 1440, height: 1000 });
		await page.goto(trasa);

		const odnosniki = page.locator('a[href^="mailto:"]');
		const ile = await odnosniki.count();
		expect(ile, `trasa ${trasa} nie ma ani jednego odnośnika pocztowego`).toBeGreaterThan(0);
		for (let i = 0; i < ile; i++) {
			await expect(odnosniki.nth(i).locator(ADRES)).toHaveCount(1);
		}

		// Stopka renderuje adres CELOWO jako zwykły tekst (zasada jednego odnośnika
		// pocztowego na stronie głównej od tego zależy), ale przez ten sam komponent.
		await expect(page.locator(`footer p.org ${ADRES}`)).toHaveCount(1);
	});
}

/* Zadanie 3 (D-3): sam znacznik `<wbr>` naprawia ESTETYKĘ złamania, ale nie zmienia tego,
   że kolumna pozycji kontaktowych na stronie głównej była węższa niż adres. Zmierzone na
   zbudowanej stronie przed zmianą: `.item-text` miało 198 px przy 1440 px i 168 px przy
   1024 px, a adres potrzebuje 227 px, więc łamał się na dwa wiersze przy obu szerokościach.

   Przypadek celuje w SEKCJĘ KONTAKTOWĄ, nie w dowolne wystąpienie: adres w stopce tej samej
   strony ma inną szerokość do dyspozycji i ma pełne prawo się zawinąć. */
for (const widok of WIDOKI) {
	test(`strona główna przy ${widok.nazwa}: adres kontaktowy stoi w jednym wierszu`, async ({
		page
	}) => {
		await page.setViewportSize({ width: widok.width, height: widok.height });
		await page.goto('/');

		const pomiary = await zmierzAdresy(page, 'section.contact a.item-link .adres-email');
		expect(pomiary, 'sekcja kontaktowa nie renderuje adresu').toHaveLength(1);

		const [gora, dol] = pomiary[0].wezly.map((w) => w.gora);
		expect(
			Math.abs(dol - gora),
			'adres w karcie kontaktowej zawija domenę do drugiego wiersza'
		).toBeLessThanOrEqual(1);
	});
}
