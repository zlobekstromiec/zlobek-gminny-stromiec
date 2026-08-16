import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test as base, expect } from '@playwright/test';
import { NAZWA_CIASTKA, podpiszSesje } from '../../src/lib/server/admin/sesja';
import { uchwytZAdresu } from '../../src/lib/server/admin/allowlist';

/**
 * Authenticated-panel fixture, reused by every later plan of phase 04.1.
 *
 * The panel's real login is an e-mail one-time code (D-01), which needs a mailbox
 * and a KV round trip. A browser suite that walked that flow before every case
 * would be testing the mail path over and over instead of the screen under test,
 * so this fixture mints the SAME cookie the login would mint, signed with the SAME
 * secret the preview harness binds, and hands the browser a live session.
 *
 * This file lives outside Playwright's spec matcher
 * (`**\/*.@(spec|test).?(c|m)[jt]s?(x)`), so it is never collected as a test.
 *
 * The secret and the address are READ OUT of the `preview:test` script rather than
 * retyped, following the repository rule that a test interpolates its values and
 * never restates them. If the harness bindings and the fixture ever drifted apart,
 * the signature would still verify but the allowlist re-check in
 * src/hooks.server.ts would refuse it, and every case in every panel spec would
 * fail on a redirect with no hint as to why. Reading one source removes the drift
 * entirely, and a missing binding throws here with a sentence that names it.
 */

const KORZEN = fileURLToPath(new URL('../../', import.meta.url));

function wiazanieHarnessu(nazwa: string): string {
	const pakiet = JSON.parse(readFileSync(`${KORZEN}package.json`, 'utf8'));
	const skrypt: string = pakiet.scripts?.['preview:test'] ?? '';
	const trafienie = skrypt.match(new RegExp(`-b ${nazwa}=(\\S+)`));
	if (!trafienie) {
		throw new Error(
			`Skrypt preview:test nie wiaze ${nazwa}, wiec fixture nie ma czym podpisac sesji.`
		);
	}
	return trafienie[1];
}

/** The deployment secret the preview harness binds as ADMIN_SESSION_SECRET. */
export const SEKRET_TESTOWY = wiazanieHarnessu('ADMIN_SESSION_SECRET');

/** The single address the preview harness puts on ADMIN_EMAILS. */
export const ADRES_TESTOWY = wiazanieHarnessu('ADMIN_EMAILS');

/** An address that is deliberately NOT on the bound allowlist. Used by the
 *  revocation case: its cookie signature is perfectly valid, so the only thing
 *  that can refuse it is the allowlist re-check inside handle(). */
export const ADRES_SPOZA_LISTY = 'byly.redaktor@example.test';

/** Mint a session token exactly as the login endpoint will. Exported so specs can
 *  build tampered, foreign-signed and de-allowlisted variants from the real thing
 *  rather than from a hand-written string that might be malformed for some other
 *  reason and pass for the wrong cause. */
export async function tokenSesji(
	adres: string = ADRES_TESTOWY,
	sekret: string = SEKRET_TESTOWY,
	teraz: number = Date.now()
): Promise<string> {
	return podpiszSesje(sekret, adres, uchwytZAdresu(adres), teraz);
}

export interface Zalogowany {
	adres: string;
	uchwyt: string;
}

export const test = base.extend<{ zalogowany: Zalogowany }>({
	zalogowany: async ({ context }, use) => {
		const token = await tokenSesji();
		await context.addCookies([
			{
				name: NAZWA_CIASTKA,
				value: token,
				// OBSERVED, not assumed: passing `url: 'http://localhost:4173'` here is
				// refused outright with "Invalid cookie fields". Chromium DROPS the
				// Secure flag when the seeding URL is plain http (a cookie with an
				// ordinary name seeded that way comes back with secure: false), and the
				// `__Host-` prefix then fails its own validation because the prefix
				// requires Secure. Naming the domain and the path explicitly, with no
				// URL at all, is accepted and stores a genuinely Secure cookie, which
				// Chromium then sends to http://localhost because localhost is a
				// trustworthy origin. Both values are exactly what the prefix demands:
				// Path=/ and a host-only cookie with no Domain attribute.
				domain: 'localhost',
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'Lax'
			}
		]);

		// Fail LOUDLY rather than silently running the whole spec unauthenticated. A
		// refused cookie would turn every authenticated case into a login redirect,
		// and a suite that reports "redirected to login" for both the gate working
		// and the fixture broken is a suite that proves nothing.
		const ciastka = (await context.cookies('http://localhost:4173')).filter(
			(ciastko) => ciastko.name === NAZWA_CIASTKA
		);
		expect(
			ciastka,
			`Przegladarka odrzucila ciastko ${NAZWA_CIASTKA}, wiec fixture nie ma sesji.`
		).toHaveLength(1);
		expect(ciastka[0].value).toBe(token);

		await use({ adres: ADRES_TESTOWY, uchwyt: uchwytZAdresu(ADRES_TESTOWY) });
	}
});

export { expect, NAZWA_CIASTKA };
