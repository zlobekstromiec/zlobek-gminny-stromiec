import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import AxeBuilder from '@axe-core/playwright';
import {
	test,
	expect,
	NAZWA_CIASTKA,
	tokenSesji,
	ADRES_TESTOWY,
	ADRES_SPOZA_LISTY,
	SEKRET_TESTOWY
} from './fixtures/admin';
// Assertions interpolate the copy module and never retype a sentence, so a copy
// change moves the screen and the test together or turns the suite red.
import {
	KOPIA_LOGOWANIE,
	KOPIA_POWLOKA,
	KOPIA_PULPIT,
	wyslanoKodNa
} from '../src/lib/content/panel';

/**
 * Panel auth gate acceptance test: encodes CMS-01 and success criterion SC1 of
 * phase 04.1 against the REAL Cloudflare runtime. `playwright.config.ts` runs
 * `npm run build && npm run preview:test`, and `preview:test` is
 * `wrangler pages dev` with the admin bindings attached, so every request below
 * hits the actual Pages Function and the actual `handle()` in src/hooks.server.ts.
 *
 * Contract highlights (04.1-01-PLAN.md, threats T-04.1-01, T-04.1-02, T-04.1-09
 * and T-04.1-14):
 * - an unauthenticated GET of any panel path other than the login is answered with
 *   a 303 to the login, including paths whose routes later plans have not written
 *   yet: the gate runs before routing, so an unbuilt path is refused rather than
 *   404-ed, and that is the property, not an accident;
 * - an unauthenticated POST is refused the same way and never reaches a handler,
 *   so a form action cannot be invoked directly (a 200 or a 405 here would both be
 *   failures, for different reasons);
 * - a tampered payload, a foreign-signed cookie and a validly signed cookie for an
 *   address that is NOT on the bound allowlist all land back on the login. The
 *   last of these is the revocation case: it is the assertion that turns red if the
 *   `naLiscie` re-check is ever deleted from `handle()`, which is a change that
 *   leaves the file type-clean and every unit test green;
 * - the panel is never indexable.
 *
 * Session mechanics (signing, expiry, the renewal threshold, the allowlist parser
 * and the handle derivation) are covered by tests/admin-sesja.unit.ts and are
 * deliberately NOT duplicated here. This file covers the gate as the browser and
 * the runtime actually see it.
 *
 * Plan 04.1-03 extends this file with the LOGIN's own security properties, because
 * the unit suite that already covers the one-time code (tests/admin-kod.unit.ts)
 * runs in no automated gate (04.1-VALIDATION.md, the AG-3 caveat), and `npm run
 * test` does. Three of them are here:
 *
 * - ENUMERATION PARITY (T-04.1-03): the step 1 response for an allowlisted address
 *   and for one that is definitely not on the list must be indistinguishable. The
 *   assertion compares the rendered card, not the whole document, so an unrelated
 *   per-response value such as the CSP nonce cannot mask a real difference;
 * - the TIMING half of the same property (T-04.1-04) is NOT observable from here
 *   and is deliberately not pretended to be. See the docblock above that case;
 * - the ATTEMPT CAP (T-04.1-05) driven end to end against the real runtime, which
 *   is the second enforced check 04.1-02-SUMMARY.md records as owed by this plan.
 *
 * Do NOT weaken these assertions to make the suite pass; they are the executable
 * acceptance criteria and change only in lockstep with an approved amendment.
 */

const LOGOWANIE = '/admin/logowanie';

/** A form POST from a real browser carries this. Playwright's APIRequestContext
 *  does NOT, and without it SvelteKit answers a form action with the serialized
 *  action result instead of a rendered page, so every assertion about visible copy
 *  below would be asserting against JSON. Observed, not assumed. */
const NAGLOWKI_FORMULARZA = {
	origin: 'http://localhost:4173',
	accept: 'text/html'
};

/** Every panel path the gate must refuse without a session. Only some of these
 *  have routes today: the rest are written by later plans of this phase, and they
 *  are listed now on purpose, because the gate must already cover them. */
const SCIEZKI_CHRONIONE = [
	'/admin',
	'/admin/aktualnosci',
	'/admin/o-nas',
	'/admin/plan-dnia',
	'/admin/dokumenty',
	'/admin/nabor',
	'/admin/pomoc'
];

/** SvelteKit refuses a cross-origin form POST with a 403 in its own CSRF layer,
 *  which runs BEFORE hooks. Without this header every POST case below would pass
 *  for the wrong reason: it would be measuring the CSRF check rather than the gate.
 *  Sending the harness origin puts the request past CSRF and in front of handle(). */
const NAGLOWKI_POST = { origin: 'http://localhost:4173' };

/** Flip one character of the payload segment, keeping it inside the base64url
 *  alphabet so the value stays well formed and can only fail on its signature. */
function zepsujLadunek(token: string): string {
	const [dane, podpis] = token.split('.');
	const znak = dane[3] === 'A' ? 'B' : 'A';
	return `${dane.slice(0, 3)}${znak}${dane.slice(4)}.${podpis}`;
}

function ciastkoSesji(token: string): Record<string, string> {
	return { cookie: `${NAZWA_CIASTKA}=${token}` };
}

test.describe('Brama panelu: SC1 / CMS-01', () => {
	for (const sciezka of SCIEZKI_CHRONIONE) {
		test(`GET ${sciezka} bez sesji odsyla 303 na ekran logowania`, async ({ request }) => {
			const odpowiedz = await request.get(sciezka, { maxRedirects: 0 });
			expect(odpowiedz.status()).toBe(303);
			expect(odpowiedz.headers()['location']).toContain(LOGOWANIE);
		});
	}

	for (const sciezka of ['/admin', '/admin/nabor']) {
		test(`POST ${sciezka} bez sesji jest odrzucony przed trasa`, async ({ request }) => {
			const odpowiedz = await request.post(sciezka, {
				form: {},
				headers: NAGLOWKI_POST,
				maxRedirects: 0
			});
			// 200 would mean an action ran without a session. 405 would mean the
			// request reached the router and was refused for the wrong reason, which
			// on a path with no route yet would hide the gate entirely.
			expect(odpowiedz.status()).not.toBe(200);
			expect(odpowiedz.status()).not.toBe(405);
			expect(odpowiedz.status()).toBe(303);
			expect(odpowiedz.headers()['location']).toContain(LOGOWANIE);
		});
	}

	test('ekran logowania jest dostepny bez sesji i zwraca 200', async ({ request }) => {
		const odpowiedz = await request.get(LOGOWANIE, { maxRedirects: 0 });
		expect(odpowiedz.status()).toBe(200);
	});

	test('poprawnie podpisane ciastko z listy dostepu wpuszcza do panelu', async ({ request }) => {
		// The positive control for the three refusal cases below. Without it they
		// could all be passing because of something unrelated to the cookie.
		const odpowiedz = await request.get('/admin', {
			headers: ciastkoSesji(await tokenSesji()),
			maxRedirects: 0
		});
		expect(odpowiedz.status()).toBe(200);
	});

	test('ciastko z podmieniona litera ladunku wraca na logowanie', async ({ request }) => {
		const odpowiedz = await request.get('/admin', {
			headers: ciastkoSesji(zepsujLadunek(await tokenSesji())),
			maxRedirects: 0
		});
		expect(odpowiedz.status()).toBe(303);
		expect(odpowiedz.headers()['location']).toContain(LOGOWANIE);
	});

	test('ciastko podpisane innym sekretem wraca na logowanie', async ({ request }) => {
		const obcy = await tokenSesji(undefined, `${SEKRET_TESTOWY}-obcy`);
		const odpowiedz = await request.get('/admin', {
			headers: ciastkoSesji(obcy),
			maxRedirects: 0
		});
		expect(odpowiedz.status()).toBe(303);
		expect(odpowiedz.headers()['location']).toContain(LOGOWANIE);
	});

	test('waznie podpisane ciastko spoza listy dostepu wraca na logowanie (odwolanie)', async ({
		request
	}) => {
		// The signature is valid and the expiry is in the future, so the ONLY thing
		// that can refuse this request is the allowlist re-check inside handle().
		// Removing that re-check must turn this case red (D-02, D-03, T-04.1-02).
		const odpowiedz = await request.get('/admin', {
			headers: ciastkoSesji(await tokenSesji(ADRES_SPOZA_LISTY)),
			maxRedirects: 0
		});
		expect(odpowiedz.status()).toBe(303);
		expect(odpowiedz.headers()['location']).toContain(LOGOWANIE);
	});
});

test.describe('Panel z sesja: pulpit i dostepnosc', () => {
	test('zalogowany redaktor otwiera pulpit z dokladnie jednym naglowkiem h1', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt).not.toContain('@');
		const odpowiedz = await page.goto('/admin');
		expect(odpowiedz?.status()).toBe(200);
		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pulpit');
	});

	test('pulpit niesie dyrektywe noindex (T-04.1-14)', async ({ page, zalogowany }) => {
		expect(zalogowany.adres).toContain('@');
		await page.goto('/admin');
		await expect(page.locator('head meta[name="robots"]')).toHaveAttribute('content', 'noindex');
	});

	test('ekran logowania nie narusza WCAG 2.1 AA', async ({ page }) => {
		await page.goto(LOGOWANIE);
		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();
		expect(results.violations).toEqual([]);
	});

	test('pulpit nie narusza WCAG 2.1 AA', async ({ page, zalogowany }) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto('/admin');
		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();
		expect(results.violations).toEqual([]);
	});
});

/**
 * SERIAL, and this is load bearing rather than a convenience.
 *
 * There is exactly ONE pending-code entry per address in KV, and the harness
 * allowlist holds exactly ONE address, so every case below that requests or spends a
 * code is operating on the same key. Run in parallel, the attempt counter of the cap
 * case would be reset by another case asking for a fresh code, and the cap would
 * appear to fail or, far worse, appear to pass while counting somebody else's
 * attempts. Observed on the first run: the very first wrong code came back with
 * „Za dużo prób", because two cases had been interleaving on one entry.
 *
 * Do NOT remove `.serial` to speed the file up. The right fix, if this ever becomes a
 * bottleneck, is a second allowlisted address in the harness bindings, not weaker
 * isolation.
 */
test.describe.serial('Logowanie: nieodroznialnosc, limit prob i wylogowanie', () => {
	/**
	 * T-04.1-03. The two branches must not differ in the response a person or a script
	 * can see. The card element is compared rather than the document, because the
	 * document carries a fresh CSP nonce on every response and comparing it would make
	 * this case fail for a reason that has nothing to do with the allowlist.
	 *
	 * The echoed address is normalised out before the comparison, because Component
	 * Contract 2 deliberately prints it back so a typo is visible. It is the person's
	 * own input on their own screen and it is the ONLY thing allowed to differ.
	 */
	test('krok 1 odpowiada tak samo dla adresu z listy i spoza listy (T-04.1-03)', async ({
		page
	}) => {
		async function wyslijAdres(adres: string) {
			await page.goto(LOGOWANIE);
			await page.getByLabel(KOPIA_LOGOWANIE.adresEtykieta, { exact: false }).fill(adres);
			const czekaj = page.waitForResponse(
				(odp) => odp.request().method() === 'POST' && odp.url().includes('/admin/logowanie')
			);
			await page.getByRole('button', { name: KOPIA_LOGOWANIE.adresPrzycisk }).click();
			const odpowiedz = await czekaj;
			const karta = page.locator('.karta');
			await expect(karta).toBeVisible();
			return {
				status: odpowiedz.status(),
				naglowki: await page.locator('h1, h2').allInnerTexts(),
				tresc: (await karta.innerText()).replace(adres, 'ADRES').replace(/\s+/g, ' ').trim()
			};
		}

		const zListy = await wyslijAdres(ADRES_TESTOWY);
		const spozaListy = await wyslijAdres(ADRES_SPOZA_LISTY);

		expect(zListy.status).toBe(spozaListy.status);
		expect(zListy.naglowki).toEqual(spozaListy.naglowki);
		expect(zListy.tresc).toBe(spozaListy.tresc);
		// A positive control: if the step 2 screen had failed to render at all, the two
		// empty strings above would still be equal and this case would pass for the
		// wrong reason.
		expect(zListy.tresc).toContain(KOPIA_LOGOWANIE.kodNaglowek);
	});

	/**
	 * T-04.1-04, and the honest half of it.
	 *
	 * The real oracle is TIME: if the allowlisted branch awaited Resend and the other
	 * did not, the difference would be hundreds of milliseconds and no amount of
	 * identical copy would hide it. Under `preview:test` the PANEL_DRY_RUN seam
	 * short-circuits the send, so a stopwatch here would measure nothing and would
	 * report a pass that means nothing.
	 *
	 * What IS checkable from here is the STRUCTURAL property that makes the oracle
	 * impossible: the step 1 handler never awaits the send, it hands it to the
	 * execution context's post-response hook (04.1 P-08). This case asserts that
	 * against the source, and says plainly that it is a proxy.
	 *
	 * THE REAL CHECK IS NOT CLOSED BY THIS FILE. It is the response-time distribution
	 * comparison on the live deployment, item 1 of „Not Inferable From Unit Tests" in
	 * .planning/phases/04.1-replace-sveltia-with-custom-polish-cms/04.1-VALIDATION.md,
	 * and it is owned by Plan 10's UAT. Do not delete this comment to make the gap look
	 * closed.
	 */
	test('krok 1 nie czeka na wysylke maila (P-08, wlasciwosc strukturalna)', () => {
		const zrodlo = readFileSync(
			fileURLToPath(new URL('../src/routes/admin/logowanie/+page.server.ts', import.meta.url)),
			'utf8'
		);
		expect(zrodlo).toContain('waitUntil');
		expect(zrodlo).not.toMatch(/await\s+wyslijKod/);
		expect(zrodlo).toMatch(/poOdpowiedzi\([\s\S]{0,120}?wyslijKod\(/);
	});

	/**
	 * T-04.1-05, the AG-3 second enforced check for the burn that
	 * tests/admin-kod.unit.ts already proves in isolation. This one drives the whole
	 * thing through the real Worker and the real KV binding.
	 *
	 * The wrong codes are numbered rather than repeated, so a server that ignored the
	 * value entirely could not pass by accident.
	 */
	test('piata bledna proba wypala kod, a szosta juz nie przechodzi (T-04.1-05)', async ({
		request
	}) => {
		const zamowienie = await request.post(`${LOGOWANIE}?/wyslij`, {
			form: { adres: ADRES_TESTOWY },
			headers: NAGLOWKI_FORMULARZA,
			maxRedirects: 0
		});
		expect(zamowienie.status()).toBe(200);
		expect(await zamowienie.text()).toContain(KOPIA_LOGOWANIE.kodNaglowek);

		async function wpiszKod(kod: string) {
			const odpowiedz = await request.post(`${LOGOWANIE}?/zaloguj`, {
				form: { adres: ADRES_TESTOWY, kod },
				headers: NAGLOWKI_FORMULARZA,
				maxRedirects: 0
			});
			return { status: odpowiedz.status(), tresc: await odpowiedz.text() };
		}

		for (const numer of [1, 2, 3, 4]) {
			const proba = await wpiszKod(`00000${numer}`);
			expect(proba.tresc).toContain(KOPIA_LOGOWANIE.bladKodNiepoprawny);
			expect(proba.tresc).not.toContain(KOPIA_LOGOWANIE.zaDuzoProbNaglowek);
		}

		const piata = await wpiszKod('000005');
		expect(piata.status).toBe(429);
		expect(piata.tresc).toContain(KOPIA_LOGOWANIE.zaDuzoProbNaglowek);
		// „Wyślij kod ponownie" stays on the screen: the code is burned, the person is
		// not locked out. An address lockout would be a denial of service handed to
		// anyone who knows a staff e-mail.
		expect(piata.tresc).toContain(KOPIA_LOGOWANIE.ponowneWyslanie);

		const szosta = await wpiszKod('000006');
		// Never a session, and never a 303 to the pulpit. It reads as an expired code,
		// because from KV alone a burned code and an expired one are indistinguishable
		// and „Wyślij kod ponownie" is the right instruction for both.
		expect(szosta.status).not.toBe(303);
		expect(szosta.tresc).toContain(KOPIA_LOGOWANIE.kodWygaslNaglowek);
	});

	test('bledny kod zachowuje wpisany adres i zostawia krok 2 na ekranie', async ({ request }) => {
		await request.post(`${LOGOWANIE}?/wyslij`, {
			form: { adres: ADRES_TESTOWY },
			headers: NAGLOWKI_FORMULARZA,
			maxRedirects: 0
		});
		const odpowiedz = await request.post(`${LOGOWANIE}?/zaloguj`, {
			form: { adres: ADRES_TESTOWY, kod: '111111' },
			headers: NAGLOWKI_FORMULARZA,
			maxRedirects: 0
		});
		const tresc = await odpowiedz.text();
		expect(tresc).toContain(KOPIA_LOGOWANIE.bladKodNiepoprawny);
		expect(tresc).toContain(KOPIA_LOGOWANIE.kodEtykieta);
		expect(tresc).toContain(wyslanoKodNa(ADRES_TESTOWY));
	});

	/**
	 * The positive control for the whole login: a valid session really does open the
	 * pulpit. It is minted by the fixture rather than by exchanging a real code,
	 * because the code only exists inside a mailbox and inside a KV digest, and a test
	 * that dug it out of either would be testing the harness. The end-to-end round trip
	 * with a real inbox is the manual UAT owned by Plan 10.
	 */
	test('wylogowanie konczy sesje i odsyla na ekran logowania (D-03)', async ({
		page,
		zalogowany
	}) => {
		expect(zalogowany.uchwyt.length).toBeGreaterThan(0);
		await page.goto('/admin');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(KOPIA_PULPIT.naglowek);

		await page.getByRole('button', { name: KOPIA_POWLOKA.wyloguj }).click();
		await page.waitForURL(/\/admin\/logowanie\?powod=wylogowano/);
		await expect(page.getByText(KOPIA_LOGOWANIE.wylogowano)).toBeVisible();

		// The cookie is really gone, not merely unused by the page we landed on.
		const odpowiedz = await page.goto('/admin');
		expect(odpowiedz?.url()).toContain(LOGOWANIE);
	});

	test('GET /admin/wyloguj nie konczy sesji (Wyloguj jest POST-em, T-04.1-17)', async ({
		request
	}) => {
		const token = await tokenSesji();
		const przed = await request.get('/admin', {
			headers: ciastkoSesji(token),
			maxRedirects: 0
		});
		expect(przed.status()).toBe(200);

		// A GET of the logout path must not be a working logout. What the framework
		// answers to it is its own business (the route exports an action and no page),
		// but it must not clear anything.
		const get = await request.get('/admin/wyloguj', {
			headers: { ...ciastkoSesji(token), accept: 'text/html' },
			maxRedirects: 0
		});
		expect(get.status()).not.toBe(303);
		expect(get.headers()['set-cookie'] ?? '').not.toContain(NAZWA_CIASTKA);

		const po = await request.get('/admin', {
			headers: ciastkoSesji(token),
			maxRedirects: 0
		});
		expect(po.status()).toBe(200);
	});
});
