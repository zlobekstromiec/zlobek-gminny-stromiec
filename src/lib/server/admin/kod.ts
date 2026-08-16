// One-time login code for the editorial panel (CMS-01; 04.1-RESEARCH.md Security
// Domain V2/V6/V7, threats T-04.1-05, T-04.1-05b, T-04.1-05c, T-04.1-15).
//
// THIS MODULE FAILS CLOSED, and that is a deliberate divergence from the fail-open
// degrade documented at length in src/lib/server/forms/ratelimit.ts. That module is
// an abuse control sitting BEHIND Turnstile, so a KV outage there costs a rate-limit
// window and refusing instead would throw away a parent's enquiry that is stored
// nowhere. This module IS the authentication boundary: a missing binding, a KV error
// or a corrupt entry must refuse the login, never grant a session. Copying the
// fail-open comment from the rate limiter into this file would be a security defect.
//
// RODO note (the same reasoning ratelimit.ts states, and for the same reason: KV keys
// are operator-visible): the key is a one-way salted SHA-256 of the address truncated
// to 8 bytes, so KV never holds a staff address in readable form. The stored VALUE is
// a salted digest of the code plus an expiry plus an attempt count, so KV never holds
// the code either. A staff address is personal data on a public body's system, so
// nothing here logs a value: console output names bindings and outcomes only, never
// an address, never a code, never an interpolated error object.
import { podLimitem } from '../forms/ratelimit.ts';

/** Digits in the code (04.1-UI-SPEC "Discretion Decisions Recorded"). Six digits are
 *  defensible only because the number of guesses is bounded: the caps, not the length,
 *  are what make the 10^6 space unguessable. There are TWO of them and both are needed.
 *  MAKS_PROB below burns the code, but it is a read-modify-write on KV and therefore
 *  cannot bound a concurrent burst (see podLimitemProby); LIMIT_PROB bounds the number
 *  of guesses one client may make at all. Removing either one leaves the length doing
 *  work it cannot do. */
export const DLUGOSC_KODU = 6;
/** Code lifetime in seconds. 15 minutes, the same number the login screen and the
 *  e-mail body both state, so the three can never drift apart. */
export const TTL_KODU_S = 900;
/** Wrong attempts that burn the code. The editor then asks for a new one; there is
 *  deliberately no account lockout, because locking an address out is a denial of
 *  service handed to anyone who knows a staff e-mail.
 *
 *  WHAT THIS CAP DOES NOT DO, stated where the number is declared: it is enforced by
 *  reading the entry, adding one and writing it back, which is not atomic, so a burst
 *  of simultaneous guesses all read the same count and all write the same next one. It
 *  bounds SEQUENTIAL attempts, which is the shape a real editor produces, and it does
 *  not bound a burst. The budget in podLimitemProby is what bounds the burst. */
export const MAKS_PROB = 5;
/** Code requests per client per hour, matching the public forms' per-client ceiling. */
export const LIMIT_KODOW = 5;
/** Code GUESSES per client per hour. Deliberately larger than LIMIT_KODOW, because a
 *  person who mistypes a code retypes it on the same screen and must not be refused for
 *  it, and deliberately far below what a guessing run needs: ten tries an hour against
 *  a 10^6 space is nothing, while MAKS_PROB still burns the code long before the tenth.
 *  This exists because MAKS_PROB alone CANNOT bound guesses, for the three reasons
 *  written above podLimitemProby. */
export const LIMIT_PROB = 10;
/** Code guesses per day site-wide. This is a runaway guard, not the security control:
 *  every site-wide ceiling is also an availability lever, since exhausting it refuses
 *  the next honest editor too, so it sits far above any real editorial day rather than
 *  close to it. The control that matters is the per-client ceiling above. */
export const LIMIT_PROB_DOBOWY = 500;
/** Code requests per day site-wide. The Resend free tier is 100 messages a day shared
 *  with the forms' own guard of 40, so 20 leaves comfortable headroom while sitting far
 *  above any real staff need. */
export const LIMIT_KODOW_DOBOWY = 20;
/** KV key prefix for a pending code. */
export const PREFIKS_KODU = 'adm:kod';
/** The panel's OWN site-wide daily rate-limit prefix (P-04). Distinct from the forms'
 *  PREFIKS_DOBOWY on purpose: sharing one counter means a login flood can refuse a
 *  parent's enrolment enquiry, and a busy contact-form day can lock staff out of their
 *  own panel. Raising the ceiling for one caller does not fix it, because that caller
 *  still increments the shared counter. */
export const PREFIKS_DOBOWY_PANELU = 'rl:doba:adm';
/** The daily bucket for GUESSES, separate from the one above for the same reason that
 *  one is separate from the forms': a flood of wrong codes must not consume the budget
 *  for requesting a new one. Sharing them would mean an editor who mistyped their code
 *  a few times could no longer ask for a fresh one, which is the exact dead end the
 *  „Wyślij kod ponownie" instruction promises is always open. Guesses also send no
 *  mail, so they have no business inside a ceiling that exists to protect a send
 *  budget. */
export const PREFIKS_DOBOWY_PROB = 'rl:doba:adm-proba';
/** Cleanup-only lifetime multiplier, the same reasoning as MNOZNIK_TTL in the rate
 *  limiter: the expiry that decides validity is the `wygasa` stamp INSIDE the stored
 *  value, and the KV lifetime exists only so an abandoned entry does not linger. It is
 *  longer than the code lifetime because a wrong attempt rewrites the entry, and a KV
 *  write overwrites the previous expiration. */
export const MNOZNIK_TTL_KODU = 2;

/** Outcome of storing a code. Discriminated so no call site can mistake a refusal for
 *  a success by reading a bare boolean the wrong way round. */
export type WynikZapisu = { ok: true } | { ok: false; powod: 'blad' };

/** Why an exchange was refused. `za-duzo-prob` is deliberately distinguishable from
 *  `zly-kod` so the login screen can show the „Za dużo prób" panel rather than another
 *  inline field error. A vanished entry reads as `wygasl`, because from KV alone an
 *  expired code and a burned one are indistinguishable, and „wyślij kod ponownie" is
 *  the right instruction for both. */
export type PowodOdmowy = 'zly-kod' | 'wygasl' | 'za-duzo-prob' | 'blad';

/** Outcome of exchanging a code. */
export type WynikSprawdzenia = { ok: true } | { ok: false; powod: PowodOdmowy };

/** The shape stored in KV. There is no field for the code and none for the address. */
interface WpisKodu {
	skrot: string;
	wygasa: number;
	proby: number;
}

/** Largest multiple of 10 that fits in a Uint32, so values at or above it are
 *  rejected instead of folded. Taking a bare modulo of the full 2^32 range would make
 *  the low digits very slightly more likely, which is exactly the bias a CSPRNG is
 *  used to avoid. */
const GRANICA_BEZ_OBCIAZENIA = 4294967290;

/**
 * Six uniformly distributed digits from the platform CSPRNG.
 *
 * Never the language's ordinary pseudo-random helper: it is not cryptographically
 * secure, and a predictable login code is the whole authentication boundary handed
 * away. Its name is deliberately NOT written here, because the acceptance gate for
 * this module is a literal grep and a comment explaining the ban would break it, the
 * same rewording the pre-launch gates already forced in 04-02.
 */
export function wygenerujKod(): string {
	const bufor = new Uint32Array(1);
	let kod = '';
	while (kod.length < DLUGOSC_KODU) {
		crypto.getRandomValues(bufor);
		if (bufor[0] >= GRANICA_BEZ_OBCIAZENIA) continue;
		kod += String(bufor[0] % 10);
	}
	return kod;
}

/** Hex rendering of the first `bajtow` bytes of a SHA-256 over `tekst`. Never
 *  hand-rolled: crypto.subtle is in the runtime, on every path this code runs on. */
async function skrot(tekst: string, bajtow?: number): Promise<string> {
	const bufor = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(tekst));
	const bajty = [...new Uint8Array(bufor)];
	return (bajtow === undefined ? bajty : bajty.slice(0, bajtow))
		.map((bajt) => bajt.toString(16).padStart(2, '0'))
		.join('');
}

/**
 * KV key for a pending code, mirroring the salted-digest shape of kluczLimitu in the
 * rate limiter. The address must not survive into the key in any readable form: KV
 * keys are operator-visible, and a staff e-mail address is personal data on a public
 * body's system. 16 hex characters is ample collision resistance for an entry that
 * lives fifteen minutes.
 */
export async function kluczKodu(adres: string, sol: string): Promise<string> {
	return `${PREFIKS_KODU}:${await skrot(`${sol}:${adres}`, 8)}`;
}

/**
 * Digest of the code itself, salted and bound to the address so the same code issued
 * to two people does not produce the same stored value. The full digest is kept: this
 * one is compared, not used as a key, so there is nothing to gain by truncating it.
 */
export async function skrotKodu(adres: string, kod: string, sol: string): Promise<string> {
	return skrot(`${sol}:${adres}:${kod}`);
}

/**
 * Length-independent comparison of two hex digests.
 *
 * `sprawdzKod` compares DIGESTS and never the codes: a plain equality on a six-digit
 * string returns early on the first differing character, which leaks prefix and length
 * timing to anyone willing to measure it. The loop below always walks the longer of
 * the two inputs and folds every difference into one accumulator, so its running time
 * does not depend on where the inputs diverge.
 */
function rowneSkroty(a: string, b: string): boolean {
	let roznica = a.length ^ b.length;
	const dlugosc = Math.max(a.length, b.length);
	for (let i = 0; i < dlugosc; i++) {
		roznica |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
	}
	return roznica === 0;
}

/** A missing or whitespace-only salt is a misconfiguration, and the same one the rate
 *  limiter guards against. Here it is REFUSED rather than skipped: an unsalted digest
 *  of a known address is trivially precomputable, and this module is the boundary that
 *  decides whether somebody is logged in. `trim` is deliberate, because an unset secret
 *  reaches a caller as an empty string and a whitespace-only secret is the same
 *  misconfiguration wearing a different shape. */
function bezSoli(sol: string): boolean {
	return sol.trim().length === 0;
}

/** Read one entry, rejecting anything that is not the exact shape written below. A
 *  corrupt or partial value must not be repaired into something usable: a missing
 *  attempt count that read as zero would reset the burn counter on every write. */
function czytajWpis(surowy: string | null): WpisKodu | null {
	if (surowy === null) return null;
	try {
		const wartosc: unknown = JSON.parse(surowy);
		if (typeof wartosc !== 'object' || wartosc === null || Array.isArray(wartosc)) return null;
		const rekord = wartosc as Record<string, unknown>;
		if (typeof rekord.skrot !== 'string' || rekord.skrot.length === 0) return null;
		if (typeof rekord.wygasa !== 'number' || !Number.isFinite(rekord.wygasa)) return null;
		if (typeof rekord.proby !== 'number' || !Number.isFinite(rekord.proby)) return null;
		return { skrot: rekord.skrot, wygasa: rekord.wygasa, proby: Math.floor(rekord.proby) };
	} catch {
		return null;
	}
}

/**
 * Store a freshly generated code as a salted digest.
 *
 * `teraz` is the LAST parameter and there is no second clock read inside, so the unit
 * suite can freeze time and so a single call can never straddle the expiry boundary.
 *
 * Fails CLOSED: a missing binding, a missing salt or any KV error returns `blad`, and
 * the caller must then show the „Nie udało się wysłać kodu" panel rather than pretend
 * a code is waiting in an inbox.
 */
export async function zapiszKod(
	kv: KVNamespace | undefined,
	adres: string,
	kod: string,
	sol: string,
	teraz: number
): Promise<WynikZapisu> {
	if (!kv) {
		console.warn('kod: brak wiazania FORMS_KV, logowanie niemozliwe');
		return { ok: false, powod: 'blad' };
	}
	if (bezSoli(sol)) {
		console.warn('kod: brak RATE_LIMIT_SALT, logowanie niemozliwe');
		return { ok: false, powod: 'blad' };
	}

	try {
		const klucz = await kluczKodu(adres, sol);
		const wpis: WpisKodu = {
			skrot: await skrotKodu(adres, kod, sol),
			wygasa: teraz + TTL_KODU_S * 1000,
			proby: 0
		};
		await kv.put(klucz, JSON.stringify(wpis), {
			expirationTtl: MNOZNIK_TTL_KODU * TTL_KODU_S
		});
		return { ok: true };
	} catch {
		// Nothing from the request is interpolated: the key is a digest, but an error
		// object could carry anything.
		console.warn('kod: zapis do KV nieudany, logowanie odrzucone');
		return { ok: false, powod: 'blad' };
	}
}

/**
 * Exchange a code for a verdict, consuming it on success.
 *
 * A correct code deletes the entry and returns ok, so the same code can never be
 * replayed. An expired entry is deleted and reported as `wygasl`. A wrong code
 * increments the attempt count and rewrites the entry; the attempt that reaches
 * MAKS_PROB deletes it instead and reports `za-duzo-prob`, which is what burns the
 * code after five wrong tries.
 *
 * Fails CLOSED on every error path, for the reason stated in the module header.
 */
export async function sprawdzKod(
	kv: KVNamespace | undefined,
	adres: string,
	kod: string,
	sol: string,
	teraz: number
): Promise<WynikSprawdzenia> {
	if (!kv) {
		console.warn('kod: brak wiazania FORMS_KV, logowanie odrzucone');
		return { ok: false, powod: 'blad' };
	}
	if (bezSoli(sol)) {
		console.warn('kod: brak RATE_LIMIT_SALT, logowanie odrzucone');
		return { ok: false, powod: 'blad' };
	}

	try {
		const klucz = await kluczKodu(adres, sol);
		const wpis = czytajWpis(await kv.get(klucz));
		if (wpis === null) return { ok: false, powod: 'wygasl' };

		if (teraz >= wpis.wygasa) {
			await kv.delete(klucz);
			return { ok: false, powod: 'wygasl' };
		}

		// Digests, never the codes themselves (T-04.1-05c).
		if (rowneSkroty(wpis.skrot, await skrotKodu(adres, kod, sol))) {
			await kv.delete(klucz);
			return { ok: true };
		}

		const proby = wpis.proby + 1;
		if (proby >= MAKS_PROB) {
			await kv.delete(klucz);
			return { ok: false, powod: 'za-duzo-prob' };
		}

		// The rewrite keeps the ORIGINAL wygasa stamp, so a stream of wrong attempts
		// cannot extend the life of a code. The KV lifetime is refreshed by the write,
		// which is exactly why validity is decided by the stamp and not by the lifetime.
		await kv.put(klucz, JSON.stringify({ ...wpis, proby }), {
			expirationTtl: MNOZNIK_TTL_KODU * TTL_KODU_S
		});
		return { ok: false, powod: 'zly-kod' };
	} catch {
		console.warn('kod: operacja KV nieudana, logowanie odrzucone');
		return { ok: false, powod: 'blad' };
	}
}

/**
 * Rate-limit a request for a new code, on the panel's own budget.
 *
 * P-04: the trailing PREFIKS_DOBOWY_PANELU is what makes the daily ceiling
 * independent of the public forms, so no route has to remember the prefix.
 *
 * P-06: this call keeps the limiter's documented fail-OPEN degrade on purpose, and
 * that is a different decision from the fail-closed store above. Failing open here
 * only means a code is still sent to an address that is already on the allowlist,
 * while the code exchange itself remains the boundary that decides access.
 *
 * The two ceilings are TRAILING parameters with defaults, the same append rule that
 * added `teraz` in 04-08 and `prefiksDobowy` in 04.1-02, so every existing call site
 * stays byte-identical. They exist for one reason: the Playwright suite shares a
 * client address and needs several codes per run, and five per hour is a ceiling it
 * would cross before it finished asserting anything. The login route raises BOTH from
 * the same RATE_LIMIT_MAX override the two public endpoints already read, and that
 * variable is unset in production, so a real deployment gets the constants above.
 */
export async function podLimitemKodu(
	kv: KVNamespace | undefined,
	ip: string,
	sol: string,
	teraz: number,
	limit: number = LIMIT_KODOW,
	limitDobowy: number = LIMIT_KODOW_DOBOWY
): Promise<boolean> {
	return podLimitem(kv, 'admin-kod', ip, sol, limit, limitDobowy, teraz, PREFIKS_DOBOWY_PANELU);
}

/**
 * Rate-limit an EXCHANGE, which is a guess at a credential.
 *
 * WHY THIS EXISTS AT ALL. MAKS_PROB was written as the whole defence of a six-digit
 * code, and it cannot be: `sprawdzKod` reads the entry, adds one and writes it back,
 * and on KV that sequence is not a counter. Three independent reasons, each sufficient
 * on its own: the read-modify-write is not atomic, so N simultaneous guesses all read
 * the same count and cost one attempt between them; KV is eventually consistent, so
 * guesses arriving at different locations read a stale count even when they are
 * strictly sequential in time; and a read is served from a cache whose smallest
 * allowed lifetime is a minute, so there is no way to make it fresh enough. The cap is
 * therefore a control over an editor mistyping, not over an attacker, and this budget
 * is what bounds the attacker.
 *
 * IT FAILS CLOSED, which is the opposite of podLimitemKodu above and of everything in
 * ratelimit.ts, and the reason is that this counter is not defence in depth behind
 * Turnstile: on a KV outage it is the ONLY rate limit standing in front of a guess at
 * a 10^6 space, so failing open would delete the control exactly when it is needed.
 * Nothing is lost by refusing, because `sprawdzKod` one function up already refuses on
 * the same outage („operacja KV nieudana, logowanie odrzucone"): an editor cannot log
 * in during a KV outage either way, and the only thing this direction changes is that
 * an attacker cannot guess during one either.
 *
 * WHAT IT DOES NOT CLOSE, stated plainly rather than implied away: the budget is per
 * client address. An attacker spread across many addresses is still bounded only per
 * address, up to the deliberately loose site-wide ceiling. This narrows the exposure by
 * orders of magnitude and it does not make the cap strict.
 *
 * The two ceilings are TRAILING parameters with defaults, the same append rule as
 * podLimitemKodu and for the same reason: the Playwright suite shares one client
 * address across a run in which several cases spend wrong codes on purpose.
 */
export async function podLimitemProby(
	kv: KVNamespace | undefined,
	ip: string,
	sol: string,
	teraz: number,
	limit: number = LIMIT_PROB,
	limitDobowy: number = LIMIT_PROB_DOBOWY
): Promise<boolean> {
	return podLimitem(
		kv,
		'admin-proba',
		ip,
		sol,
		limit,
		limitDobowy,
		teraz,
		PREFIKS_DOBOWY_PROB,
		// The fail-closed direction, argued in the docblock above.
		false
	);
}
