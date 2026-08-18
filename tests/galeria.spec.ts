import { readFileSync } from 'node:fs';
import { test, expect, type Locator, type Page } from '@playwright/test';
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
 * list and the one-versus-two step is confirmed independently from tile geometry: with only a
 * handful of photographs in the store, geometry alone cannot tell two columns from three.
 *
 * THE STORE'S LENGTH IS NOT A CONTRACT. Assertions here are written against whatever the store
 * holds, because an editor adding a photograph through the panel is ordinary work. The row
 * assertion below names the FIRST PAIR for that reason: an earlier version counted distinct
 * `top` values across the whole list and passed only while the store held exactly two photos.
 *
 * Do NOT weaken these assertions to make the suite pass.
 *
 * The lightbox half of this contract (GAL-3 open state, GAL-4 and the dialog half of GAL-6)
 * lives in the second describe block below, added by plan 05-08. The tile and the dialog are
 * ONE contract and they stay in one file: splitting them means two places to keep in step.
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

/* --- Podgląd zdjęcia (lightbox), plan 05-08. Helpers used only by the second block. ------- */

/** The close button's accessible name, 05-UI-SPEC Copywriting Contract §Lightbox. Not editor
 *  owned, so it is pinned literally rather than interpolated. */
const PRZYCISK_ZAMKNIJ = 'Zamknij podgląd';

/** The selector the browser's own tab order follows, and the one the island's trap must bound.
 *  Kept as one string so the test and the assertion cannot drift apart. */
const FOKUSOWALNE = 'a[href], button:not([disabled]), [tabindex]';

function kafelek(page: Page, i = 0): Locator {
	return lista(page).locator('a').nth(i);
}

function podglad(page: Page): Locator {
	return page.getByRole('dialog');
}

/** True when focus is still somewhere inside the dialog. Evaluated INSIDE the page, because
 *  `document.activeElement` is the only authority on where focus actually went. */
function fokusWPodgladzie(page: Page): Promise<boolean> {
	return podglad(page).evaluate((element) => element.contains(document.activeElement));
}

/** The dialog's focusable elements in DOM order, described well enough to assert which one is
 *  first without asserting how it is implemented. */
function kolejnoscFokusu(page: Page): Promise<string[]> {
	return podglad(page).evaluate(
		(element, wybor) =>
			Array.from(element.querySelectorAll<HTMLElement>(wybor))
				.filter((kandydat) => kandydat.tabIndex >= 0)
				.map(
					(kandydat) =>
						`${kandydat.tagName.toLowerCase()}:${kandydat.getAttribute('aria-label') ?? kandydat.textContent?.trim() ?? ''}`
				),
		FOKUSOWALNE
	);
}

/**
 * Milliseconds from the frame the dialog first exists to the frame it reaches full opacity,
 * measured inside the page with requestAnimationFrame.
 *
 * WHY NOT `getComputedStyle(...).transitionDuration`: the fade is a Svelte transition, not a
 * declared CSS `transition`, so that property reads `0s` with the preference and without it,
 * and an assertion built on it would pass whatever the component did. This measures what a
 * visitor actually sees and is agnostic to how the fade is produced.
 *
 * The clock starts when the element APPEARS, not when the probe is installed, so the click
 * round trip is outside the measurement and a slow shared server cannot inflate it.
 */
async function czasPojawienia(page: Page, wyzwalacz: Locator): Promise<number> {
	await page.evaluate(() => {
		const okno = window as unknown as { __czasPojawienia?: Promise<number> };
		okno.__czasPojawienia = new Promise<number>((rozwiaz) => {
			const limit = performance.now() + 5000;
			let poczatek: number | null = null;
			const krok = () => {
				const element = document.querySelector('[role="dialog"]');
				if (element) {
					if (poczatek === null) poczatek = performance.now();
					if (Number(getComputedStyle(element).opacity) >= 1) {
						rozwiaz(performance.now() - poczatek);
						return;
					}
				}
				if (performance.now() > limit) {
					rozwiaz(-1);
					return;
				}
				requestAnimationFrame(krok);
			};
			requestAnimationFrame(krok);
		});
	});

	await wyzwalacz.click();

	return page.evaluate(
		() => (window as unknown as { __czasPojawienia: Promise<number> }).__czasPojawienia
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
		// PIERWSZE DWA, nie wszystkie. Wersja liczaca rozne wartosci `top` w calej liscie
		// twierdzila „jeden rzad" i przechodzila tylko dopoki store mial dokladnie dwa
		// zdjecia; trzecie, dodane przez redaktora, zawija sie do drugiego rzedu i jest to
		// poprawny uklad, a nie regresja. Teza brzmi „od 768px kafelki stoja obok siebie",
		// wiec sprawdzamy ja na pierwszej parze.
		expect(naTablecie[0], 'od 768px pierwsze dwa kafelki maja stac w rzedzie').toBe(naTablecie[1]);
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
		//
		// „Nasze miejsce i codzienność" joined the list on 2026-08-18, between kadra and the
		// gallery. It carries the five facility descriptions the żłobek sent, and it sits
		// there because it describes what the photographs below it are OF. This assertion is
		// about ORDER, so it is exactly the assertion that should notice a new section: the
		// gallery still comes last, which is what Contract 1 pins.
		await expect(page.locator('main').getByRole('heading', { level: 2 })).toHaveText([
			'Nasza misja',
			'Nasze wartości',
			'Nasz dzień w żłobku',
			'Nasza kadra',
			'Nasze miejsce i codzienność',
			NAGLOWEK
		]);
	});
});

/* -------------------------------------------------------------------------------------------
   Podgląd zdjęcia (lightbox): GAL-3 in its OPEN state, GAL-4, the dialog half of GAL-6.

   THREE OF THESE ASSERTIONS ARE THE FIRST OF THEIR KIND IN THIS REPOSITORY, and that is the
   reason this block was written rather than copied. `AxeBuilder` is called in twelve spec files
   and every one of those calls scans a page in a LOAD-TIME state; not one scans an OPEN
   OVERLAY. `tests/nav.spec.ts` proves the drawer's dialog role, first focus, Escape and focus
   restore, but it runs no axe scan while the drawer is open and it never presses Tab. A focus
   trap that is never Tab tested is a focus trap nobody has verified, so the trap here is
   pressed in BOTH directions against the real browser tab order.

   EVERY ASSERTION IS WRITTEN SO THAT IT FAILS ON THE PAGE AS IT STANDS WITHOUT THE ISLAND:
   - the boundedness cases fail because focus leaves the dialog for the tile link that precedes
     it and the tile link that follows it, both outside the dialog;
   - the reduced-motion case runs its POSITIVE CONTROL first, so „pojawia się natychmiast"
     cannot pass on a component that never faded at all;
   - the modifier-click negative carries its own positive control in the same test, so it
     cannot pass on a component that never opens.
   ------------------------------------------------------------------------------------------- */
test.describe('Podglad zdjecia na /o-nas: kontrakt dialogu (GAL-3 otwarty, GAL-4, GAL-6)', () => {
	test('kafelek otwiera dialog modalny nazwany podpisem tego zdjecia', async ({ page }) => {
		await page.goto('/o-nas');
		// At rest there is no dialog anywhere on the page: the drawer's one is mobile-only and
		// closed, so a match here would be the lightbox rendering when nobody asked for it.
		await expect(podglad(page)).toHaveCount(0);

		await kafelek(page).click();

		await expect(podglad(page)).toBeVisible();
		await expect(podglad(page)).toHaveAttribute('aria-modal', 'true');
		await expect(podglad(page)).toHaveAttribute('tabindex', '-1');

		// The name comes from the caption element INSIDE the dialog, never from a literal
		// (05-UI-SPEC Contract 2 and the Copywriting Contract: the podpis is editor owned).
		const nazwaneprzez = await podglad(page).getAttribute('aria-labelledby');
		expect(nazwaneprzez).toBeTruthy();
		const podpisWDialogu = podglad(page).locator(`[id="${nazwaneprzez}"]`);
		await expect(podpisWDialogu).toHaveCount(1);
		await expect(podpisWDialogu).toHaveText(galeria.zdjecia[0].podpis);

		// ...and the engine that computes accessible names agrees with that reconstruction.
		await expect(page.getByRole('dialog', { name: galeria.zdjecia[0].podpis })).toHaveCount(1);
	});

	test('po otwarciu fokus jest na przycisku zamkniecia i to on jest pierwszy w kolejnosci', async ({
		page
	}) => {
		await page.goto('/o-nas');
		await kafelek(page).click();

		await expect(podglad(page).getByRole('button', { name: PRZYCISK_ZAMKNIJ })).toBeFocused();

		// „First focusable" is a stronger claim than „focused": it is what makes the forward
		// half of the trap a cycle rather than a coincidence.
		const kolejnosc = await kolejnoscFokusu(page);
		expect(kolejnosc.length).toBeGreaterThan(0);
		expect(kolejnosc[0]).toBe(`button:${PRZYCISK_ZAMKNIJ}`);
	});

	// GAL-4, the property no test in this repository has ever asserted.
	test('fokus jest domkniety w obie strony: Shift+Tab z pierwszego i Tab z ostatniego (GAL-4)', async ({
		page
	}) => {
		await page.goto('/o-nas');
		await kafelek(page).click();
		await expect(podglad(page).getByRole('button', { name: PRZYCISK_ZAMKNIJ })).toBeFocused();

		// BACKWARDS from the first focusable. Without the trap this lands on the tile link,
		// which is a sibling of the dialog and outside it, so this is not a tautology.
		await page.keyboard.press('Shift+Tab');
		expect(
			await fokusWPodgladzie(page),
			'Shift+Tab z pierwszego elementu wypuscil fokus poza dialog'
		).toBe(true);

		// FORWARDS from the last focusable. Without the trap this lands on the next tile link.
		await podglad(page).evaluate((element, wybor) => {
			const kandydaci = Array.from(element.querySelectorAll<HTMLElement>(wybor)).filter(
				(kandydat) => kandydat.tabIndex >= 0
			);
			kandydaci[kandydaci.length - 1]?.focus();
		}, FOKUSOWALNE);
		await page.keyboard.press('Tab');
		expect(
			await fokusWPodgladzie(page),
			'Tab z ostatniego elementu wypuscil fokus poza dialog'
		).toBe(true);
	});

	// GAL-4, the case the two above cannot see. The dialog CONTAINER carries tabindex="-1", so
	// it is click focusable: a visitor who clicks the enlarged photograph moves focus onto it,
	// and from there focus is on neither the first nor the last element of the cycle. A trap
	// written as „first element, backwards" plus „last element, forwards" does nothing at all in
	// that state, and the browser default takes focus out of the dialog and behind the scrim.
	test('fokus jest domkniety takze wtedy, gdy trzyma go SAM dialog, a nie zaden z formantow (GAL-4)', async ({
		page
	}) => {
		await page.goto('/o-nas');
		await kafelek(page).click();
		await expect(podglad(page).getByRole('button', { name: PRZYCISK_ZAMKNIJ })).toBeFocused();

		// Positive control: clicking the photograph really does move focus onto the container.
		// Without this the case could pass on a browser that left focus on the close button.
		await podglad(page).locator('img').first().click();
		expect(
			await podglad(page).evaluate((element) => element === document.activeElement),
			'klikniecie w powiekszone zdjecie nie przenioslo fokusu na kontener dialogu'
		).toBe(true);

		// BACKWARDS from the container. Without the fix this lands on the tile link, which is a
		// sibling of the dialog and outside it, so this is not a tautology.
		await page.keyboard.press('Shift+Tab');
		expect(
			await fokusWPodgladzie(page),
			'Shift+Tab z kontenera dialogu wypuscil fokus poza dialog'
		).toBe(true);

		// FORWARDS from the container, for the same reason in the other direction.
		await podglad(page).evaluate((element) => (element as HTMLElement).focus());
		await page.keyboard.press('Tab');
		expect(await fokusWPodgladzie(page), 'Tab z kontenera dialogu wypuscil fokus poza dialog').toBe(
			true
		);
	});

	// GAL-3, the open state. The project's FIRST axe scan of an open overlay, at the same four
	// tag values every other scan in this repository uses.
	test('otwarty podglad nie narusza WCAG 2.1 AA (GAL-3, stan otwarty)', async ({ page }) => {
		await page.goto('/o-nas');
		await kafelek(page).click();
		await expect(podglad(page)).toBeVisible();

		const wynik = await new AxeBuilder({ page }).withTags(ZNACZNIKI).analyze();
		expect(wynik.violations).toEqual([]);
	});

	test('Escape zamyka podglad i oddaje fokus kafelkowi, ktory go otworzyl (GAL-4)', async ({
		page
	}) => {
		await page.goto('/o-nas');
		// The SECOND tile deliberately: „focus went back to a tile" would pass with a hardcoded
		// first tile, „focus went back to THIS tile" would not.
		const drugi = kafelek(page, 1);
		await drugi.click();
		await expect(podglad(page)).toBeVisible();

		await page.keyboard.press('Escape');

		await expect(podglad(page)).toHaveCount(0);
		await expect(drugi).toBeFocused();
	});

	test('przycisk zamkniecia zamyka podglad i oddaje fokus temu samemu kafelkowi', async ({
		page
	}) => {
		await page.goto('/o-nas');
		const drugi = kafelek(page, 1);
		await drugi.click();

		await podglad(page).getByRole('button', { name: PRZYCISK_ZAMKNIJ }).click();

		await expect(podglad(page)).toHaveCount(0);
		await expect(drugi).toBeFocused();
	});

	test('klikniecie tla zamyka podglad i oddaje fokus temu samemu kafelkowi', async ({ page }) => {
		await page.goto('/o-nas');
		const drugi = kafelek(page, 1);
		await drugi.click();
		await expect(podglad(page)).toBeVisible();

		// The panel is centred, so the top-left corner of the viewport is the scrim.
		await page.mouse.click(4, 4);

		await expect(podglad(page)).toHaveCount(0);
		await expect(drugi).toBeFocused();
	});

	test('klawiatura otwiera podglad: Enter i spacja na kafelku', async ({ page }) => {
		await page.goto('/o-nas');
		const pierwszy = kafelek(page);

		await pierwszy.focus();
		await page.keyboard.press('Enter');
		await expect(podglad(page)).toBeVisible();

		await page.keyboard.press('Escape');
		await expect(podglad(page)).toHaveCount(0);
		await expect(pierwszy).toBeFocused();

		await page.keyboard.press('Space');
		await expect(podglad(page)).toBeVisible();
	});

	// The narrow-interception rule. Without an assertion this is the first thing a later
	// refactor silently breaks, and „open image in a new tab" stops working with no gate going
	// red anywhere.
	test('modyfikator i srodkowy przycisk nie otwieraja dialogu, zwykle klikniecie otwiera', async ({
		page
	}) => {
		await page.goto('/o-nas');

		// The listener sits on `document`, so it runs AFTER the island has had its chance, and
		// records whether the island had already called preventDefault. It then prevents the
		// event itself, which is what stops the fall-through cases from opening a browser tab
		// and turning this test into a tab-juggling exercise.
		await page.evaluate(() => {
			const okno = window as unknown as { __zablokowane: boolean[] };
			okno.__zablokowane = [];
			const nasluch = (zdarzenie: Event) => {
				okno.__zablokowane.push(zdarzenie.defaultPrevented);
				zdarzenie.preventDefault();
			};
			document.addEventListener('click', nasluch);
			document.addEventListener('auxclick', nasluch);
		});

		const pierwszy = kafelek(page);

		await pierwszy.click({ modifiers: ['ControlOrMeta'] });
		await expect(podglad(page)).toHaveCount(0);

		await pierwszy.click({ button: 'middle' });
		await expect(podglad(page)).toHaveCount(0);

		// POSITIVE CONTROL, in the same test on purpose: the two negatives above would both
		// pass on a component that never opens anything at all.
		await pierwszy.click();
		await expect(podglad(page)).toBeVisible();

		const zablokowane = await page.evaluate(
			() => (window as unknown as { __zablokowane: boolean[] }).__zablokowane
		);
		expect(zablokowane, 'kolejno: Ctrl lub Cmd, srodkowy, zwykly').toEqual([false, false, true]);
	});

	test('podglad pokazuje zdjecie, podpis i opis alternatywny, w kolejnosci z kontraktu', async ({
		page
	}) => {
		await page.goto('/o-nas');
		const zdjecie = galeria.zdjecia[0];
		await kafelek(page).click();

		const obraz = podglad(page).locator('img');
		await expect(obraz).toHaveCount(1);
		await expect(obraz).toHaveAttribute('alt', zdjecie.alt);

		// The alt is also VISIBLE text, so a sighted visitor reads the description instead of
		// only a screen reader announcing it (05-UI-SPEC Contract 2, the description line).
		await expect(podglad(page).getByText(zdjecie.podpis, { exact: true })).toBeVisible();
		await expect(podglad(page).getByText(zdjecie.alt, { exact: true })).toBeVisible();

		// DOM order from Contract 2: close button, image, caption, description line.
		const kolejnosc = await podglad(page).evaluate((element) =>
			Array.from(element.querySelectorAll('button, img, h2, p')).map((dziecko) =>
				dziecko.tagName.toLowerCase()
			)
		);
		expect(kolejnosc).toEqual(['button', 'img', 'h2', 'p']);
	});

	// GAL-6, the dialog half. Positive control FIRST, exactly as the tile half above does it.
	test('podglad wygasza sie plynnie, a przy prefers-reduced-motion pojawia sie od razu (GAL-6)', async ({
		page
	}) => {
		await page.goto('/o-nas');
		const zRuchem = await czasPojawienia(page, kafelek(page));
		expect(
			zRuchem,
			'kontrola dodatnia: bez preferencji podglad ma sie wygaszac, a nie pojawiac skokiem'
		).toBeGreaterThan(100);

		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.reload();
		const bezRuchu = await czasPojawienia(page, kafelek(page));
		expect(bezRuchu, 'przy reduced-motion podglad ma sie pojawiac natychmiast').toBeGreaterThan(-1);
		expect(bezRuchu, 'przy reduced-motion podglad ma sie pojawiac natychmiast').toBeLessThan(100);
	});

	test('przewijanie strony jest zablokowane tylko na czas otwartego podgladu', async ({ page }) => {
		await page.goto('/o-nas');
		const przelew = () => page.evaluate(() => getComputedStyle(document.body).overflow);
		const przed = await przelew();

		await kafelek(page).click();
		await expect(podglad(page)).toBeVisible();
		expect(await przelew(), 'przy otwartym podgladzie strona pod spodem ma sie nie przewijac').toBe(
			'hidden'
		);

		await page.keyboard.press('Escape');
		await expect(podglad(page)).toHaveCount(0);
		expect(await przelew(), 'blokada przewijania ma byc zdjeta po zamknieciu').toBe(przed);
	});

	// GAL-5 again, from the dialog's side: hydration must add behaviour without taking the
	// no-scripting affordance away, and without leaving a control that does nothing.
	test('bez skryptow nie ma zadnego dialogu, a kafelek zostaje zwyklym odnosnikiem', async ({
		browser
	}) => {
		const kontekst = await browser.newContext({ javaScriptEnabled: false });
		try {
			const page = await kontekst.newPage();
			await page.goto('/o-nas');

			await expect(page.locator('[role="dialog"]')).toHaveCount(0);
			await expect(lista(page).locator('button')).toHaveCount(0);

			const adres = (await kafelek(page).getAttribute('href')) ?? '';
			expect(adres).toMatch(ROZSZERZENIA);
		} finally {
			await kontekst.close();
		}
	});
});
