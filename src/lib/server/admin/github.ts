// GitHub App authentication for the panel (Phase 04.1, Plan 04.1-04; D-08,
// 04.1-RESEARCH.md Pattern 1 and Code Example 1).
//
// The panel commits as a GitHub App owned by the zlobekstromiec Org, not as any
// person and not with a personal access token. The App has no expiry date to
// lapse silently and survives the account that created it being removed, which
// matters in a project whose whole point is that no developer is around
// afterwards. What it costs is this file: a private key has to become a signed
// JWT, and that JWT has to be exchanged for a short-lived installation token.
//
// WebCrypto only. The Node built-in cryptography module does not exist on
// workerd, so anything that reaches for it fails at deploy time rather than here.
// No JWT library either: the payload is three fixed claims, and a library would be
// generality with a supply-chain surface attached.
//
// Nothing in this file logs. Not the key, not the JWT, not the token, not on the
// error path. An error message carries a step name and an HTTP status and nothing
// else, which is what tests/admin-commit.unit.ts asserts by inspecting the message
// AND the stack of a failed mint.
import { AGENT, WERSJA_API } from './repo.ts';

const ALG = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' } as const;

/** Imported signing key, cached for the lifetime of the isolate.
 *
 *  This cache is the reason this module has module-scoped state at all. Measured
 *  in 04.1-RESEARCH.md and reconfirmed against the real App key: importKey costs
 *  about 4 ms while the signature itself costs about 1 ms, so the IMPORT is the
 *  expensive half and re-importing per request would spend most of a save's CPU
 *  budget on work that never changes. On workerd, module scope means once per
 *  isolate, which is exactly the right lifetime: long enough to matter, and
 *  discarded whenever the isolate is.
 *
 *  The PEM is kept alongside the key so a rotated secret cannot keep signing with
 *  the retired key. It is the same string instance the environment already holds,
 *  so this is a reference and not a second copy of the key material. */
let pamiecKlucza: { pem: string; klucz: CryptoKey } | undefined;

/** Installation token plus the instant it expires, in epoch milliseconds. */
let pamiecTokenu: { token: string; wygasa: number } | undefined;

/** A token is treated as spent this long before GitHub actually expires it, so a
 *  save can never begin with a credential that dies mid-sequence. A save is about
 *  seven calls, so a minute is generous by two orders of magnitude. */
const MARGINES_MS = 60_000;

/** GitHub rejects an App JWT whose exp is more than ten minutes ahead. Nine
 *  minutes leaves room for the clock skew the iat below already assumes. */
const WAZNOSC_JWT_S = 540;

/** GitHub rejects an App JWT whose iat is in the future, and the Worker's clock
 *  and GitHub's clock are not the same clock. Backdating by a minute is the
 *  documented remedy. */
const COFNIECIE_JWT_S = 60;

/** Clears both caches. Exported for the unit suite, which drives several
 *  independent keys and clocks through this module and would otherwise observe
 *  one test's cache in the next. Nothing in the application calls it. */
export function wyczyscPamiecTokenu(): void {
	pamiecTokenu = undefined;
	pamiecKlucza = undefined;
}

/** base64url, the JWT flavour: the two substituted characters and no padding.
 *  Strings go through TextEncoder rather than straight into btoa, because btoa
 *  throws on any code point above 255 and a client id is not guaranteed ASCII by
 *  anything we control. */
function b64url(dane: ArrayBuffer | string): string {
	const bajty = typeof dane === 'string' ? new TextEncoder().encode(dane) : new Uint8Array(dane);
	let latin = '';
	for (const bajt of bajty) latin += String.fromCharCode(bajt);
	return btoa(latin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Decodes a PKCS#8 PEM into the buffer `crypto.subtle.importKey` wants.
 *
 * The format check is the whole point of this function existing separately.
 * GitHub hands you a PKCS#1 key (`-----BEGIN RSA PRIVATE KEY-----`); WebCrypto's
 * `pkcs8` format means PKCS#8 (`-----BEGIN PRIVATE KEY-----`) and there is NO
 * PKCS#1 import path. Feeding the downloaded file straight in throws
 * `DOMException: Invalid keyData`, an opaque error that appears at the first save
 * on the deployed site and nowhere earlier. Verified by direct execution during
 * research: same key, PKCS#1 fails to import, PKCS#8 imports and signs.
 *
 * So the header is checked first and the failure is NAMED. The conversion is a
 * one-line operator step performed outside the working tree:
 *   openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in <pobrany>.pem -out <pkcs8>.pem
 *
 * No part of the key reaches the thrown message.
 */
export function pemDoArrayBuffer(pem: string): ArrayBuffer {
	if (pem.includes('BEGIN RSA PRIVATE KEY')) {
		throw new Error(
			'klucz aplikacji: format pkcs1 nie jest obslugiwany przez WebCrypto, przekonwertuj klucz na pkcs8'
		);
	}
	if (!pem.includes('BEGIN PRIVATE KEY')) {
		throw new Error('klucz aplikacji: nierozpoznany format naglowka pem');
	}
	const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
	const binarne = atob(b64);
	const bufor = new Uint8Array(binarne.length);
	for (let i = 0; i < binarne.length; i++) bufor[i] = binarne.charCodeAt(i);
	return bufor.buffer;
}

/** Signs the three-claim RS256 JWT GitHub accepts as an App credential. The clock
 *  arrives as a parameter so the caller's single reading of it is what both the
 *  cache decision and the claims are built from. */
async function jwtAplikacji(clientId: string, pkcs8Pem: string, teraz: number): Promise<string> {
	if (pamiecKlucza === undefined || pamiecKlucza.pem !== pkcs8Pem) {
		pamiecKlucza = {
			pem: pkcs8Pem,
			klucz: await crypto.subtle.importKey('pkcs8', pemDoArrayBuffer(pkcs8Pem), ALG, false, [
				'sign'
			])
		};
	}
	const sekundy = Math.floor(teraz / 1000);
	const naglowek = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
	const tresc = b64url(
		JSON.stringify({
			iat: sekundy - COFNIECIE_JWT_S,
			exp: sekundy + WAZNOSC_JWT_S,
			// The CLIENT id, not the App id. Both are accepted today and both were
			// confirmed working against the real App, but current GitHub guidance
			// names the client id as the issuer, so that is what this uses.
			iss: clientId
		})
	);
	const wejscie = `${naglowek}.${tresc}`;
	const podpis = await crypto.subtle.sign(
		ALG,
		pamiecKlucza.klucz,
		new TextEncoder().encode(wejscie)
	);
	return `${wejscie}.${b64url(podpis)}`;
}

/**
 * Returns an installation access token for the panel's one repository, minting a
 * fresh one only when the cached token is gone or close to expiring.
 *
 * Takes the clock and fetch by injection with real defaults, exactly as obsluz()
 * takes every side effect, so the cache boundary and the whole request shape are
 * drivable from a unit test with no network and no waiting.
 *
 * Throws rather than returning a result union: unlike a save, there is no useful
 * partial outcome here and no Polish message the editor could act on. The caller
 * turns the throw into the generic failure the panel shows.
 */
export async function tokenInstalacji(
	env: {
		GITHUB_APP_CLIENT_ID?: string;
		GITHUB_APP_INSTALLATION_ID?: string;
		GITHUB_APP_PRIVATE_KEY?: string;
	},
	teraz: number = Date.now(),
	fetchImpl: typeof fetch = fetch
): Promise<string> {
	if (pamiecTokenu !== undefined && pamiecTokenu.wygasa > teraz + MARGINES_MS) {
		return pamiecTokenu.token;
	}

	const clientId = env.GITHUB_APP_CLIENT_ID;
	const instalacja = env.GITHUB_APP_INSTALLATION_ID;
	const kluczPem = env.GITHUB_APP_PRIVATE_KEY;
	// Fail closed on a missing binding at a branch we wrote, never on an undefined
	// we assumed: all three are optional in app.d.ts on purpose.
	if (!clientId || !instalacja || !kluczPem) {
		throw new Error('panel: niepelna konfiguracja aplikacji GitHub');
	}

	const jwt = await jwtAplikacji(clientId, kluczPem, teraz);
	const odpowiedz = await fetchImpl(
		`https://api.github.com/app/installations/${instalacja}/access_tokens`,
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${jwt}`,
				Accept: 'application/vnd.github+json',
				'X-GitHub-Api-Version': WERSJA_API,
				// GitHub rejects an API request that arrives without a user agent.
				'User-Agent': AGENT
			}
		}
	);
	if (!odpowiedz.ok) {
		// The status and nothing else. A refused mint must not become a log line
		// carrying the JWT that was refused.
		throw new Error(`github: token instalacji ${odpowiedz.status}`);
	}
	const dane = (await odpowiedz.json()) as { token: string; expires_at: string };
	pamiecTokenu = { token: dane.token, wygasa: Date.parse(dane.expires_at) };
	return dane.token;
}
