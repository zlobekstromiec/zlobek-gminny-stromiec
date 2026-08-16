// Signed, revocable panel session cookie (P-01, P-02, D-03; 04.1-01-PLAN.md
// threat T-04.1-01). The cookie is the only thing a browser sends to prove who an
// editor is, so it is attacker-controlled input until the HMAC has verified.
//
// WebCrypto only. The Node built-in cryptography module does not exist on workerd
// and importing it would be a silent production-only failure, so its name is not
// written anywhere in this directory and is described here instead.
//
// Nothing here logs at all, and that is a requirement rather than a style choice:
// the payload carries a staff e-mail address, which is personal data on a public
// body's system (RODO, C-03) in a PUBLIC repository (D-02).
//
// `teraz` is an epoch millisecond value handed in by the caller in every exported
// function, matching src/lib/server/forms/ratelimit.ts, so no call site can read a
// second clock and tests/admin-sesja.unit.ts can freeze time.
import type { Cookies } from '@sveltejs/kit';

/** Cookie name. The `__Host-` prefix is a browser-enforced control: a cookie so
 *  named is refused unless it is Secure, has Path=/ and carries no Domain, which
 *  makes it impossible for a sibling subdomain to set or overwrite it. This is why
 *  Path is `/` rather than the narrower `/admin` sketched in 04.1-RESEARCH.md
 *  Pattern 3: the prefix is the stronger control and it requires the wider path. */
export const NAZWA_CIASTKA = '__Host-panel_sesja';

/** Session lifetime in seconds (D-03: 30 days). */
export const ZYCIE_SESJI_S = 30 * 24 * 60 * 60;

/** Renewal threshold in seconds (P-02: 5 days). D-03 says the session renews on
 *  use; renewing on literally every request would emit a Set-Cookie on every page
 *  view. Renewing only once more than this much of the life has elapsed keeps a
 *  weekly editor permanently signed in while leaving most responses cookie-free. */
export const PROG_ODNOWIENIA_S = 5 * 24 * 60 * 60;

/** The verified cookie payload. `adres` is the full e-mail address and stays
 *  inside this object; only `uchwyt` is allowed to cross into locals or a commit. */
export interface Sesja {
	adres: string;
	uchwyt: string;
	/** Issued at, epoch seconds. */
	iat: number;
	/** Expires at, epoch seconds. */
	exp: number;
}

/** Imported HMAC keys, keyed by the secret itself. A cache miss costs one extra
 *  importKey call and nothing else, so a miss can never change an answer. A
 *  rejected import is evicted so a transient failure is not cached forever. */
const klucze = new Map<string, Promise<CryptoKey>>();

function klucz(sekret: string): Promise<CryptoKey> {
	const zapamietany = klucze.get(sekret);
	if (zapamietany) return zapamietany;
	const swiezy = crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(sekret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	klucze.set(sekret, swiezy);
	swiezy.catch(() => klucze.delete(sekret));
	return swiezy;
}

function doBase64Url(bajty: Uint8Array): string {
	let binarne = '';
	for (const bajt of bajty) binarne += String.fromCharCode(bajt);
	return btoa(binarne).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function zBase64Url(segment: string): Uint8Array | null {
	// Reject anything outside the base64url alphabet up front, so a padded or
	// standard-base64 value is malformed rather than quietly re-interpreted.
	if (!/^[A-Za-z0-9_-]+$/.test(segment)) return null;
	try {
		const binarne = atob(segment.replace(/-/g, '+').replace(/_/g, '/'));
		const bajty = new Uint8Array(binarne.length);
		for (let i = 0; i < binarne.length; i += 1) bajty[i] = binarne.charCodeAt(i);
		return bajty;
	} catch {
		return null;
	}
}

/** Compare two base64url strings without returning early on the first differing
 *  character, so the time taken does not leak how much of a forged signature was
 *  correct. The length check is up front on purpose: the digest length is fixed
 *  and public, so a wrong-length value is malformed rather than a near miss. */
function rowneCiagi(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	let roznica = 0;
	for (let i = 0; i < a.length; i += 1) {
		roznica |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return roznica === 0;
}

async function podpis(sekret: string, dane: string): Promise<string> {
	const bajty = await crypto.subtle.sign(
		'HMAC',
		await klucz(sekret),
		new TextEncoder().encode(dane)
	);
	return doBase64Url(new Uint8Array(bajty));
}

/** Issue a session token: base64url payload, a dot, the base64url HMAC-SHA256 of
 *  that payload. The separator is a dot rather than a colon so the value needs no
 *  cookie-value escaping. */
export async function podpiszSesje(
	sekret: string,
	adres: string,
	uchwyt: string,
	teraz: number
): Promise<string> {
	const iat = Math.floor(teraz / 1000);
	const ladunek: Sesja = { adres, uchwyt, iat, exp: iat + ZYCIE_SESJI_S };
	const dane = doBase64Url(new TextEncoder().encode(JSON.stringify(ladunek)));
	return `${dane}.${await podpis(sekret, dane)}`;
}

/**
 * Verify a session token and return its payload, or null.
 *
 * Every failure direction is CLOSED and silent: a missing secret, a non-string
 * value, a malformed shape, a foreign or tampered signature, unreadable JSON, a
 * payload missing a field, and an elapsed expiry all return null. The caller
 * cannot tell which, and neither can an attacker.
 */
export async function weryfikujSesje(
	sekret: string | undefined,
	token: unknown,
	teraz: number
): Promise<Sesja | null> {
	// A missing or blank binding must open nothing. Fails CLOSED.
	if (typeof sekret !== 'string' || sekret.trim().length === 0) return null;
	if (typeof token !== 'string') return null;

	const czesci = token.split('.');
	if (czesci.length !== 2) return null;
	const [dane, podany] = czesci;
	if (dane.length === 0 || podany.length === 0) return null;

	let oczekiwany: string;
	try {
		oczekiwany = await podpis(sekret, dane);
	} catch {
		// An unusable key is not a valid session. Fails CLOSED, and says nothing:
		// the secret must not reach a log even by way of an error object.
		return null;
	}
	if (!rowneCiagi(oczekiwany, podany)) return null;

	const bajty = zBase64Url(dane);
	if (!bajty) return null;
	let odczytane: unknown;
	try {
		odczytane = JSON.parse(new TextDecoder().decode(bajty));
	} catch {
		return null;
	}

	// Guard, then construct key by key from guarded locals, never by spreading:
	// the boundary discipline postFromEntry() in src/lib/server/aktualnosci.ts set.
	if (typeof odczytane !== 'object' || odczytane === null || Array.isArray(odczytane)) return null;
	const zapis = odczytane as Record<string, unknown>;
	const { adres, uchwyt, iat, exp } = zapis;
	if (typeof adres !== 'string' || adres.length === 0) return null;
	if (typeof uchwyt !== 'string') return null;
	if (typeof iat !== 'number' || !Number.isFinite(iat)) return null;
	if (typeof exp !== 'number' || !Number.isFinite(exp)) return null;
	// The expiry comparison. A valid signature over an elapsed payload is still a
	// dead session, so this line is load bearing and its removal turns the unit
	// suite red rather than merely widening a window.
	if (Math.floor(teraz / 1000) >= exp) return null;

	return { adres, uchwyt, iat, exp };
}

/** Has enough of the session's life elapsed to be worth re-issuing (P-02)? */
export function wymagaOdnowienia(sesja: Sesja, teraz: number): boolean {
	return Math.floor(teraz / 1000) - sesja.iat > PROG_ODNOWIENIA_S;
}

/** Write the session cookie. Every flag is required by the `__Host-` prefix or by
 *  the threat model: HttpOnly keeps it away from any script, Secure and Path=/ are
 *  what the prefix demands, and SameSite=Lax rather than Strict because the login
 *  flow arrives by redirect and Strict would drop the cookie on that first hop. */
export function ustawCiastko(cookies: Cookies, token: string): void {
	cookies.set(NAZWA_CIASTKA, token, {
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		path: '/',
		maxAge: ZYCIE_SESJI_S
	});
}

/** Clear the session cookie. The flags are repeated because a `__Host-` cookie is
 *  refused by the browser when the clearing Set-Cookie omits Secure or Path=/, and
 *  a refused clear is a session that quietly survives „Wyloguj". */
export function wyczyscCiastko(cookies: Cookies): void {
	cookies.delete(NAZWA_CIASTKA, {
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		path: '/'
	});
}
