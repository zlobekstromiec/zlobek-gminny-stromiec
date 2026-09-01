import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test, expect, type Page } from '@playwright/test';

/**
 * PRAWO KONCENTRYCZNOSCI NA WSZYSTKICH POWIERZCHNIACH MEDIOW NARAZ (260901-amq, D-2, D-3).
 *
 * PO CO OSOBNY PLIK. Kazda z tych powierzchni ma juz swoj plik akceptacyjny, ale zaden z nich
 * nie widzi pozostalych, wiec regula obejmujaca CALY projekt nie miala dotad ani jednego
 * miejsca, w ktorym byloby widac, ze ktoras powierzchnia cicho odjechala. Zgloszenie, ktore
 * uruchomilo to zadanie, brzmialo „round buttons mixing with squares of different corner
 * sizes": wada nie siedziala w zadnym pojedynczym komponencie, tylko MIEDZY nimi.
 *
 * REGULA: promien wewnetrzny = promien kontenera minus wciecie. Skala to 8/16/24, a wciecia
 * to 8/16, wiec wynik zawsze lada na istniejacym tokenie i `app.css` nie zyskuje nowego.
 * Powierzchnia bez kontenera i bez wciecia nie wyprowadza zadnej liczby z odejmowania i bierze
 * ja z tabeli uzycia zablokowanej specyfikacji: 24 dla zdjecia wiodacego i duzych powierzchni,
 * 16 dla skali karty, 8 dla okladek i zdjec wewnatrz opraw.
 *
 * WERDYKTY AUDYTU z 2026-09-01 mieszkaja W KODZIE, przy kazdej regule z osobna, i tam nalezy
 * ich szukac. Tutaj sa tylko liczby, ktore z nich wynikaja.
 *
 * WSZYSTKO MIERZONE NA WARTOSCI OBLICZONEJ PRZEZ PRZEGLADARKE, nigdy na zrodle CSS. Asercja
 * przezyje wiec przemianowanie tokenu i przemianowanie selektora wewnetrznego, a upadnie
 * dokladnie wtedy, gdy zmieni sie to, co widzi odwiedzajacy.
 *
 * NIE OSLABIAJ TYCH ASERCJI, zeby pakiet przeszedl. Kazda z nich jest zapisem decyzji
 * zablokowanej w 260901-amq-CONTEXT.md i zmienia sie wylacznie razem z ta decyzja.
 */

/** Milimetrowka reguly: jaka wartosc ma miec kazda powierzchnia i skad ta wartosc pochodzi. */
type Powierzchnia = {
	nazwa: string;
	adres: string;
	wybor: string;
	promien: string;
};

/** The one post that carries a gallery, FOUND ON DISK rather than written down.
 *
 *  Today exactly one entry has photographs and it is NOT the newest one, so neither a literal
 *  slug nor the „newest post" helper from tests/aktualnosci.spec.ts would find it. Reading the
 *  directory is the same move tests/opisy-zdjec.unit.ts makes, and for the same reason: this
 *  repository has turned today's content into a contract more than once, and an editor adding
 *  a post is ordinary work rather than a reason for a red build. */
function wpisZGaleria(): string {
	const katalog = fileURLToPath(new URL('../src/lib/content/aktualnosci', import.meta.url));
	for (const plik of readdirSync(katalog).sort()) {
		if (!plik.endsWith('.json')) continue;
		const wpis = JSON.parse(readFileSync(`${katalog}/${plik}`, 'utf8')) as {
			zdjecia?: unknown[];
		};
		if (Array.isArray(wpis.zdjecia) && wpis.zdjecia.length > 0) {
			return `/aktualnosci/${plik.replace(/\.json$/u, '')}`;
		}
	}
	throw new Error('Zaden wpis nie ma galerii, wiec tego kontraktu nie da sie sprawdzic');
}

const WPIS = wpisZGaleria();

const POWIERZCHNIE: Powierzchnia[] = [
	// (a) Slot zdjecia wiodacego. Duza powierzchnia, bez kontenera, bez wciecia.
	{ nazwa: 'Hero: slot zdjecia wiodacego', adres: '/', wybor: '.hero-img', promien: '24px' },
	// (b) Blok mediow przy cytacie. Polowa szerokosci ukladu, ponizej 1024 px cala szerokosc.
	{ nazwa: 'AboutTeaser: blok mediow', adres: '/', wybor: '.about-media', promien: '24px' },
	// (d) Okladka kafelka aktualnosci. Przylega do krawedzi karty, wiec wciecia nie ma i 8 px
	//     pochodzi z tabeli uzycia specyfikacji, a nie z odejmowania. Wariant pionowy.
	{
		nazwa: 'NewsCard: okladka kafelka',
		adres: '/',
		wybor: '.news-card:not(.poziomy) .cover',
		promien: '8px'
	},
	// (c) Obraz mapy. Skala karty, nie hero.
	{ nazwa: 'MapPanel: obraz mapy', adres: '/kontakt', wybor: '.map-figure img', promien: '16px' },
	// Kafelek galerii na /o-nas. Stoi samodzielnie w siatce, wiec skala karty.
	{
		nazwa: 'Galeria /o-nas: kafelek',
		adres: '/o-nas',
		wybor: 'section#galeria ul.galeria a',
		promien: '16px'
	},
	// (f) Okladka wpisu. POWIERZCHNIA, KTOREJ W TABELI D-2 NIE BYLO. Zdjecie wiodace strony.
	{ nazwa: 'Wpis: okladka', adres: WPIS, wybor: '.cover-band img', promien: '24px' },
	// Kafelek galerii wpisu. Ten sam komponent co na /o-nas, wiec ta sama liczba; wpisany
	// osobno, bo dowodzi, ze jedna regula obowiazuje na obu stronach naraz.
	{
		nazwa: 'Galeria wpisu: kafelek',
		adres: WPIS,
		wybor: '.galeria-wpisu ul.galeria a',
		promien: '16px'
	}
];

/** All four corners of the element, as the browser computed them. Four rather than one, because
 *  a surface can lose the law on a single corner and still look right in a screenshot. */
function naroza(page: Page, wybor: string): Promise<string[]> {
	return page
		.locator(wybor)
		.first()
		.evaluate((element) => {
			const styl = getComputedStyle(element);
			return [
				styl.borderTopLeftRadius,
				styl.borderTopRightRadius,
				styl.borderBottomLeftRadius,
				styl.borderBottomRightRadius
			];
		});
}

test.describe('Prawo koncentrycznosci mediow (260901-amq, D-2, D-3)', () => {
	for (const powierzchnia of POWIERZCHNIE) {
		test(`${powierzchnia.nazwa} ma promien ${powierzchnia.promien}`, async ({ page }) => {
			await page.goto(powierzchnia.adres);
			// Kontrola dodatnia: zielona asercja o promieniu ma znaczyc „powierzchnia ma taki
			// promien", a nie „selektor niczego nie znalazl".
			await expect(
				page.locator(powierzchnia.wybor).first(),
				`powierzchnia ${powierzchnia.nazwa} nie istnieje pod ${powierzchnia.adres}`
			).toBeVisible();

			const cztery = await naroza(page, powierzchnia.wybor);
			expect(cztery).toEqual([
				powierzchnia.promien,
				powierzchnia.promien,
				powierzchnia.promien,
				powierzchnia.promien
			]);
		});
	}

	// D-3, asercja przekrojowa. Zadna powierzchnia medialna w calym projekcie nie jest kolem
	// ani pigulka. Osobno od siedmiu przypadkow powyzej, bo tamte pinuja KONKRETNE liczby, a
	// ten pinuje regule: gdyby ktos kiedys przestawil ktoras z nich na inna wartosc, tamten
	// przypadek powie „nie ta liczba", a ten powie „to juz nie jest narozniki, to jest kolo".
	test('zadna powierzchnia medialna nie jest kolem ani pigulka (D-3)', async ({ page }) => {
		for (const powierzchnia of POWIERZCHNIE) {
			await page.goto(powierzchnia.adres);
			const cztery = await naroza(page, powierzchnia.wybor);
			for (const wartosc of cztery) {
				expect(wartosc, `${powierzchnia.nazwa}: promien procentowy to kolo`).not.toContain('%');
				expect(
					Number.parseFloat(wartosc),
					`${powierzchnia.nazwa}: promien ${wartosc} czyta sie jako pigulka`
				).toBeLessThanOrEqual(100);
			}
		}
	});
});
