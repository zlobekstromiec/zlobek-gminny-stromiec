import AxeBuilder from '@axe-core/playwright';
import {
	test,
	expect,
	NAZWA_CIASTKA,
	tokenSesji,
	ADRES_SPOZA_LISTY,
	SEKRET_TESTOWY
} from './fixtures/admin';

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
 * Do NOT weaken these assertions to make the suite pass; they are the executable
 * acceptance criteria and change only in lockstep with an approved amendment.
 */

const LOGOWANIE = '/admin/logowanie';

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
