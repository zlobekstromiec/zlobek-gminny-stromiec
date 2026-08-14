import { test, expect } from '@playwright/test';

/**
 * /api/kontakt endpoint acceptance test: encodes CONTACT-03, FORM-01 and FORM-02
 * against the REAL Cloudflare runtime. `playwright.config.ts` runs
 * `npm run build && npm run preview`, and `npm run preview` is
 * `wrangler pages dev`, so these requests hit the actual Pages Function and pick
 * up the gitignored `.dev.vars` (always-pass dummy Turnstile secret plus
 * FORM_DRY_RUN=1, so no real mail is ever sent).
 *
 * Contract highlights (04-01-PLAN.md, 04-RESEARCH.md Pattern 2 and Pattern 3):
 * - the happy path returns 200 with a body of exactly {ok:true};
 * - every rejection returns its documented status AND its stable machine code:
 *   walidacja/zgoda/turnstile -> 400, limit -> 429, wysylka -> 502. A failure is
 *   NEVER reported as 200 (D-12);
 * - the recipient cannot be influenced by the request body: extra to/bcc keys are
 *   neither honoured nor rejected, they are simply ignored (FORM-02);
 * - only POST exists, so any other verb must keep returning the framework's 405
 *   (no fallback handler, no verb confusion).
 *
 * There is no page UI yet (it lands in Plans 03 and 04), so every case talks to
 * the endpoint directly with `page.request`. The suite is serial because all
 * cases share one client IP and therefore one rate-limit counter: running them in
 * parallel would make the order, and the limiter, non-deterministic.
 *
 * Do NOT weaken these assertions to make the suite pass; they are the executable
 * acceptance criteria and change only in lockstep with an approved amendment.
 */

// Cloudflare's always-pass dummy sitekey emits this token shape. Paired with the
// always-pass dummy secret in .dev.vars, siteverify accepts it.
const TOKEN = 'XXXX.DUMMY.TOKEN.XXXX';

const POPRAWNE = {
	imie: 'Jan Kowalski',
	email: 'jan.kowalski@example.com',
	wiadomosc: 'Dzien dobry, prosze o informacje o wolnych miejscach.',
	zgoda: true,
	turnstile: TOKEN
};

test.describe.serial('API kontakt: CONTACT-03 / FORM-01 / FORM-02 acceptance', () => {
	test('poprawne zgłoszenie zwraca 200 oraz treść {ok:true}', async ({ page }) => {
		const res = await page.request.post('/api/kontakt', { data: POPRAWNE });
		expect(res.status()).toBe(200);
		expect(await res.json()).toEqual({ ok: true });
	});

	test('brak zgody RODO zwraca 400 i kod zgoda (RECRUIT-04 / CONTACT-03)', async ({ page }) => {
		const { zgoda, ...bezZgody } = POPRAWNE;
		expect(zgoda).toBe(true);
		const res = await page.request.post('/api/kontakt', { data: bezZgody });
		expect(res.status()).toBe(400);
		expect(await res.json()).toMatchObject({ ok: false, code: 'zgoda' });
	});

	test('niepoprawny adres e-mail zwraca 400 i kod walidacja', async ({ page }) => {
		const res = await page.request.post('/api/kontakt', {
			data: { ...POPRAWNE, email: 'jan(at)example.com' }
		});
		expect(res.status()).toBe(400);
		const tresc = await res.json();
		expect(tresc).toMatchObject({ ok: false, code: 'walidacja' });
		expect(tresc.pola).toMatchObject({ email: 'niepoprawny' });
	});

	test('adres e-mail z CRLF jest odrzucany, nigdy naprawiany (FORM-02, T-04-01)', async ({
		page
	}) => {
		const res = await page.request.post('/api/kontakt', {
			data: { ...POPRAWNE, email: 'jan@example.com\r\nBcc: atakujacy@example.com' }
		});
		expect(res.status()).toBe(400);
		expect(await res.json()).toMatchObject({ ok: false, code: 'walidacja' });
	});

	// The payload-immutability assertion itself lives in tests/forms.unit.ts. This
	// case only proves the endpoint neither rejects nor honours the extra keys.
	test('dodatkowe klucze to i bcc w ciele żądania są ignorowane i nadal zwracamy 200 (FORM-02)', async ({
		page
	}) => {
		const res = await page.request.post('/api/kontakt', {
			data: {
				...POPRAWNE,
				to: 'atakujacy@example.com',
				bcc: 'atakujacy@example.com'
			}
		});
		expect(res.status()).toBe(200);
		expect(await res.json()).toEqual({ ok: true });
	});

	test('brak tokenu Turnstile zwraca 400 i kod turnstile (FORM-02)', async ({ page }) => {
		const { turnstile, ...bezTokenu } = POPRAWNE;
		expect(turnstile).toBe(TOKEN);
		const res = await page.request.post('/api/kontakt', { data: bezTokenu });
		expect(res.status()).toBe(400);
		expect(await res.json()).toMatchObject({ ok: false, code: 'turnstile' });
	});

	test('metoda GET na /api/kontakt zwraca 405 (brak fallbacku, brak pomyłki metody)', async ({
		page
	}) => {
		const res = await page.request.get('/api/kontakt');
		expect(res.status()).toBe(405);
	});

	test('ciało żądania powyżej limitu 8 KiB zwraca 400 i kod walidacja', async ({ page }) => {
		const res = await page.request.post('/api/kontakt', {
			data: { ...POPRAWNE, wiadomosc: 'x'.repeat(9000) }
		});
		expect(res.status()).toBe(400);
		expect(await res.json()).toMatchObject({ ok: false, code: 'walidacja' });
	});

	test('wypełniony honeypot zwraca 200, żeby bot uznał wysyłkę za udaną', async ({ page }) => {
		const res = await page.request.post('/api/kontakt', {
			data: { ...POPRAWNE, strona: 'https://spam.example.com' }
		});
		expect(res.status()).toBe(200);
		expect(await res.json()).toEqual({ ok: true });
	});
});
