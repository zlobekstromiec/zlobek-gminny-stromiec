import { readFileSync } from 'node:fs';
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Public gallery acceptance gate (GALLERY-01; 05-UI-SPEC Contract 1; 05 D-12, D-19, D-20,
 * D-24, D-25; 05-VALIDATION rows GAL-1, GAL-2, GAL-5 and the tile half of GAL-6).
 *
 * WHAT THIS FILE IS ACCOUNTABLE TO. „Nasze miejsce" is gone and the gallery stands in its
 * place, on the page a parent actually reads. The section is also the target of the footer's
 * „Galeria" shortcut, so its id and its heading are a link contract and not decoration.
 *
 * EVERY VALUE IS INTERPOLATED FROM THE STORE, never retyped. The captions and the alt text
 * are editor owned from this phase on (05-UI-SPEC §„Test lockstep", the asymmetry note), so a
 * retyped assertion would turn an ordinary save into a red build. The two strings that are
 * NOT editor owned, the section heading and the hidden link prefix, are pinned literally,
 * because those two are the contract.
 *
 * THE GRID TIERS ARE READ OFF THE RENDERED PAGE, not off a class name, so a CSS refactor that
 * keeps the layout does not turn them red. The column count comes from the resolved track
 * list and the one-versus-two step is confirmed independently from tile geometry: with two
 * photographs in the store, geometry alone cannot tell two columns from three.
 *
 * Do NOT weaken these assertions to make the suite pass.
 *
 * The lightbox half of this contract (GAL-3, GAL-4 and the dialog half of GAL-6) is added to
 * this same file by plan 05-08.
 */

function wczytaj<T>(wzgledna: string): T {
	return JSON.parse(readFileSync(new URL(wzgledna, import.meta.url), 'utf8'));
}

const galeria = wczytaj<{
	zdjecia: { plik: string; podpis: string; alt: string }[];
}>('../src/lib/content/galeria.json');

const oNas = wczytaj<{ obiekt_opis: string }>('../src/lib/content/o-nas.json');

/** The two contract strings of 05-UI-SPEC Contract 1, pinned rather than interpolated. */
const NAGLOWEK = 'Galeria: nasze miejsce';
const PREFIKS_ODNOSNIKA = 'Powiększ zdjęcie: ';

/** The stored facility description as a reader sees it. `renderInline` turns the bold markers
 *  into elements, so the rendered text carries the same characters with the markers gone. */
const OPIS_OBIEKTU = oNas.obiekt_opis.replaceAll('**', '');

/** The extensions the build glob accepts. The tile's href has to land on one of them, which
 *  is what makes the no-scripting affordance real rather than intended (05-UI-SPEC
 *  Contract 2, progressive enhancement). */
const ROZSZERZENIA = /\.(?:jpe?g|png|webp)$/;

const ZNACZNIKI = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

function sekcja(page: Page) {
	return page.locator('section#galeria');
}

function lista(page: Page) {
	return sekcja(page).locator('ul.galeria');
}

function kafelki(page: Page) {
	return lista(page).locator('li');
}

/** The resolved column track list of the grid, as the browser computed it. */
function sciezkiKolumn(page: Page): Promise<string[]> {
	return lista(page).evaluate((element) =>
		getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/u)
	);
}

test.describe('Galeria na /o-nas: kontrakt publiczny (GALLERY-01)', () => {
	test('sekcja galerii ma kotwice, przyjmuje fokus i jest nazwana wlasnym naglowkiem', async ({
		page
	}) => {
		const odpowiedz = await page.goto('/o-nas');
		expect(odpowiedz?.status()).toBe(200);

		// Exactly one section carries the fragment the footer jumps to.
		await expect(sekcja(page)).toHaveCount(1);
		// A keyboard user following the footer link lands INSIDE the gallery.
		await expect(sekcja(page)).toHaveAttribute('tabindex', '-1');

		// Two attributes, two jobs: the id is the jump target, aria-labelledby names the
		// section and points at the h2's OWN id.
		const nazwaneprzez = await sekcja(page).getAttribute('aria-labelledby');
		expect(nazwaneprzez).toBeTruthy();
		const naglowek = page.locator(`#${nazwaneprzez}`);
		await expect(naglowek).toHaveText(NAGLOWEK);
		expect(await naglowek.evaluate((element) => element.tagName)).toBe('H2');
		// And the heading really is inside the section it names.
		await expect(sekcja(page).locator(`#${nazwaneprzez}`)).toHaveCount(1);
	});

	test('stara sekcja „Nasze miejsce" i jej identyfikator zniknely razem (D-20)', async ({
		page
	}) => {
		await page.goto('/o-nas');
		await expect(page.getByRole('heading', { name: 'Nasze miejsce', exact: true })).toHaveCount(0);
		await expect(page.locator('#obiekt-heading')).toHaveCount(0);
		await expect(page.locator('[aria-labelledby="obiekt-heading"]')).toHaveCount(0);
		// And there is no SECOND photo set on the page (D-20): every picture in the page body
		// is a gallery tile.
		await expect(page.locator('main img')).toHaveCount(galeria.zdjecia.length);
		await expect(kafelki(page).locator('img')).toHaveCount(galeria.zdjecia.length);
	});

	test('opis obiektu zostaje jako wstep NAD siatka i jest tekstem ze store O nas', async ({
		page
	}) => {
		await page.goto('/o-nas');
		const wstep = sekcja(page).locator('p.prose');
		await expect(wstep).toHaveCount(1);
		await expect(wstep).toHaveText(OPIS_OBIEKTU);

		// Above the grid, read from geometry rather than from DOM order alone.
		const pudelkoWstepu = await wstep.boundingBox();
		const pudelkoListy = await lista(page).boundingBox();
		expect(pudelkoWstepu).not.toBeNull();
		expect(pudelkoListy).not.toBeNull();
		if (pudelkoWstepu && pudelkoListy) {
			expect(pudelkoWstepu.y).toBeLessThan(pudelkoListy.y);
		}
	});

	test('kazdy kafelek ma opis alternatywny, widoczny podpis, i nigdy ten sam tekst (D-25)', async ({
		page
	}) => {
		await page.goto('/o-nas');
		await expect(kafelki(page)).toHaveCount(galeria.zdjecia.length);

		for (const [i, zdjecie] of galeria.zdjecia.entries()) {
			const kafelek = kafelki(page).nth(i);
			const obraz = kafelek.locator('img');
			const alt = (await obraz.getAttribute('alt')) ?? '';
			expect(alt.trim().length, 'alt nie moze byc pusty (WCAG 1.1.1)').toBeGreaterThan(0);
			expect(alt).toBe(zdjecie.alt);

			// The caption is VISIBLE and it is the stored one.
			const podpis = kafelek.locator('figcaption');
			await expect(podpis).toBeVisible();
			await expect(podpis).toHaveText(zdjecie.podpis);

			// The rule that matters: the caption names the room, the alt describes the photo,
			// and one string can never do both jobs (04.1 D-15 kept intact).
			expect(alt).not.toBe(await podpis.innerText());
		}
	});

	test('nazwy dostepne odnosnikow kafelkow sa rozne, wiec dwanascie linkow to dwanascie nazw', async ({
		page
	}) => {
		await page.goto('/o-nas');
		const odnosniki = lista(page).locator('a');
		const ile = await odnosniki.count();
		expect(ile).toBe(galeria.zdjecia.length);

		// The accessible name of a tile link is the visually-hidden prefix followed by the
		// photo's alt, which is what disambiguates twelve otherwise identical links
		// (WCAG 2.4.4). Reconstructed from the rendered DOM rather than from the store, so a
		// page that dropped the prefix fails here even though the store still holds it.
		const nazwy = await odnosniki.evaluateAll((elementy) =>
			elementy.map((element) =>
				`${element.textContent ?? ''} ${element.querySelector('img')?.getAttribute('alt') ?? ''}`
					.replace(/\s+/gu, ' ')
					.trim()
			)
		);
		expect(new Set(nazwy).size, 'dwa odnosniki nosza te sama nazwe').toBe(ile);

		// And the name really is the contract's one, asserted through the engine that computes
		// accessible names rather than through a string this test assembled.
		for (const zdjecie of galeria.zdjecia) {
			await expect(
				lista(page).getByRole('link', { name: `${PREFIKS_ODNOSNIKA}${zdjecie.alt}`, exact: true })
			).toHaveCount(1);
		}
	});

	test('siatka ma jedna kolumne, dwie od 768px i trzy od 1024px, z odstepem 24px (D-12)', async ({
		page
	}) => {
		await page.goto('/o-nas');

		for (const [szerokosc, kolumny] of [
			[375, 1],
			[768, 2],
			[1024, 3]
		] as const) {
			await page.setViewportSize({ width: szerokosc, height: 900 });
			await expect
				.poll(() => sciezkiKolumn(page), { message: `${szerokosc}px: liczba kolumn` })
				.toHaveLength(kolumny);

			const odstepy = await lista(page).evaluate((element) => {
				const styl = getComputedStyle(element);
				return { kolumnowy: styl.columnGap, wierszowy: styl.rowGap };
			});
			expect(odstepy.kolumnowy, `${szerokosc}px: odstep kolumn`).toBe('24px');
			expect(odstepy.wierszowy, `${szerokosc}px: odstep wierszy`).toBe('24px');
		}
	});

	// The tier assertion above reads the resolved track list. This one reads GEOMETRY, so the
	// two are independent: a grid declared with three tracks that somehow rendered stacked
	// would pass the first and fail this.
	test('kafelki naprawde stoja jeden pod drugim na telefonie i obok siebie od 768px', async ({
		page
	}) => {
		await page.goto('/o-nas');
		expect(galeria.zdjecia.length).toBeGreaterThan(1);

		await page.setViewportSize({ width: 375, height: 900 });
		const naTelefonie = await kafelki(page).evaluateAll((elementy) =>
			elementy.map((element) => Math.round(element.getBoundingClientRect().top))
		);
		expect(new Set(naTelefonie).size, 'na telefonie kafelki maja stac jeden pod drugim').toBe(
			naTelefonie.length
		);

		await page.setViewportSize({ width: 768, height: 900 });
		const naTablecie = await kafelki(page).evaluateAll((elementy) =>
			elementy.map((element) => Math.round(element.getBoundingClientRect().top))
		);
		expect(new Set(naTablecie).size, 'od 768px pierwsze dwa kafelki maja stac w rzedzie').toBe(1);
	});

	test('od 1024px lista zajmuje oba tory ukladu redakcyjnego, a wstep zostaje w prawym', async ({
		page
	}) => {
		await page.setViewportSize({ width: 1280, height: 1000 });
		await page.goto('/o-nas');

		// The h2 sits in the LEFT rail of the editorial split, so its left edge is where
		// track 1 begins. Comparing against it rather than against the container's own box
		// keeps the assertion about the tracks instead of about the container's padding.
		const pudelkoNaglowka = await sekcja(page).getByRole('heading', { level: 2 }).boundingBox();
		const pudelkoListy = await lista(page).boundingBox();
		const pudelkoWstepu = await sekcja(page).locator('p.prose').boundingBox();
		expect(pudelkoNaglowka).not.toBeNull();
		expect(pudelkoListy).not.toBeNull();
		expect(pudelkoWstepu).not.toBeNull();
		if (!pudelkoNaglowka || !pudelkoListy || !pudelkoWstepu) return;

		// The list starts where track 1 starts: it spans both tracks.
		expect(Math.abs(pudelkoListy.x - pudelkoNaglowka.x)).toBeLessThanOrEqual(1);
		// The prose stays in the RIGHT track, so it starts well to the right of the list.
		expect(pudelkoWstepu.x).toBeGreaterThan(pudelkoListy.x + 100);

		// A lone tile must never stretch to the full row (05-UI-SPEC Contract 1, the
		// one-photo state): with three tracks every tile is far narrower than half the
		// container, which is what an auto-fitting track list would break.
		const kafelek = await kafelki(page).first().boundingBox();
		expect(kafelek).not.toBeNull();
		if (kafelek) expect(kafelek.width).toBeLessThan(pudelkoListy.width / 2);
	});

	// GAL-5. With scripting off there is no island at all, so the tile has to be a working
	// link on its own. Asserting the href RESOLVES is what makes that claim true rather than
	// intended: a link to an asset the build does not carry is a dead affordance.
	test('bez skryptow kazdy kafelek jest zwyklym odnosnikiem do prawdziwego pliku obrazu', async ({
		browser
	}) => {
		const kontekst = await browser.newContext({ javaScriptEnabled: false });
		try {
			const page = await kontekst.newPage();
			const odpowiedz = await page.goto('/o-nas');
			expect(odpowiedz?.status()).toBe(200);

			const odnosniki = lista(page).getByRole('link');
			await expect(odnosniki).toHaveCount(galeria.zdjecia.length);

			for (let i = 0; i < galeria.zdjecia.length; i++) {
				const href = (await odnosniki.nth(i).getAttribute('href')) ?? '';
				expect(href, `kafelek ${i + 1} nie ma adresu`).not.toBe('');
				expect(href, `kafelek ${i + 1}: ${href}`).toMatch(ROZSZERZENIA);
				const zasob = await kontekst.request.get(new URL(href, page.url()).toString());
				expect(zasob.status(), `kafelek ${i + 1}: ${href}`).toBe(200);
				expect(zasob.headers()['content-type'] ?? '').toContain('image/');
			}
		} finally {
			await kontekst.close();
		}
	});

	// GAL-6, the tile half. The project's FIRST use of emulateMedia's reduced-motion setting.
	// The positive control runs first on purpose: an assertion that „the transform is none"
	// passes on a page that never had one, so the hover effect is proven to exist before it is
	// proven to be switched off.
	test('kafelek skaluje sie przy najechaniu, ale nie przy prefers-reduced-motion (GAL-6)', async ({
		page
	}) => {
		await page.goto('/o-nas');
		const odnosnik = lista(page).locator('a').first();
		const obraz = odnosnik.locator('img');

		await odnosnik.hover();
		await expect
			.poll(() => obraz.evaluate((element) => getComputedStyle(element).transform), {
				message: 'kontrola dodatnia: bez reduced-motion kafelek ma sie skalowac'
			})
			.not.toBe('none');

		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.reload();
		const odnosnikZ = lista(page).locator('a').first();
		await odnosnikZ.hover();
		await expect
			.poll(() => odnosnikZ.locator('img').evaluate((el) => getComputedStyle(el).transform), {
				message: 'przy reduced-motion kafelek nie moze sie skalowac'
			})
			.toBe('none');
	});

	test('strona z galeria nie narusza WCAG 2.1 AA (GAL-3, stan zapelniony)', async ({ page }) => {
		await page.goto('/o-nas');
		await expect(kafelki(page).first()).toBeVisible();
		const wynik = await new AxeBuilder({ page }).withTags(ZNACZNIKI).analyze();
		expect(wynik.violations).toEqual([]);
	});

	test('strona nadal ma dokladnie jeden naglowek pierwszego stopnia i te sama kolejnosc sekcji', async ({
		page
	}) => {
		await page.goto('/o-nas');
		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('O nas');
		// Section 6 changed its heading and nothing else moved (05-UI-SPEC Contract 1). Scoped
		// to the page body: the footer owns three h2 column headings of its own.
		await expect(page.locator('main').getByRole('heading', { level: 2 })).toHaveText([
			'Nasza misja',
			'Nasze wartości',
			'Nasz dzień w żłobku',
			'Nasza kadra',
			NAGLOWEK
		]);
	});
});
