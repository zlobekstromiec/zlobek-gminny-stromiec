// KV rate limiting without storing an IP (FORM-02; 04-RESEARCH.md Pattern 4,
// threat T-04-04). Two independent ceilings, both plain integer counters.
//
// RODO note: the per-client key is a one-way salted SHA-256 truncated to 8 bytes
// with a one-hour lifetime, and the daily key is a fixed constant. The stored
// values are integers. KV therefore holds no identifying data and no submission
// content at any point, which is what lets the klauzula say we store nothing.
//
// Durability note: an in-memory Map would look like a limiter and be none. Worker
// isolates are ephemeral and numerous, so the counter has to live in KV.

/** Per-client fixed window. */
export const OKNO_S = 3600;
export const DOMYSLNY_LIMIT = 5;
/** Site-wide daily window. */
export const DOBA_S = 86400;
export const DOMYSLNY_LIMIT_DOBOWY = 40;
/** Fixed, non-derived key: the daily counter is deliberately not per client. */
export const KLUCZ_DOBOWY = 'rl:doba';

/** A stored counter that is missing, empty or corrupt reads as zero rather than
 *  NaN, so a bad value can never make the comparison silently pass. */
function licznik(surowy: string | null): number {
	const wartosc = Number(surowy ?? '0');
	return Number.isFinite(wartosc) && wartosc > 0 ? Math.floor(wartosc) : 0;
}

/** Build the per-client KV key. The form name is part of the key so the two
 *  endpoints keep independent counters: a busy contact form must not be able to
 *  lock a parent out of the enrollment form. 16 hex characters is ample collision
 *  resistance for a one-hour counter and keeps the key far under the 512-byte
 *  limit. Never hand-roll the hash: crypto.subtle is in the runtime. */
export async function kluczLimitu(formularz: string, ip: string, sol: string): Promise<string> {
	const bajty = new TextEncoder().encode(`${sol}:${formularz}:${ip}`);
	const skrot = await crypto.subtle.digest('SHA-256', bajty);
	const hex = [...new Uint8Array(skrot)]
		.slice(0, 8)
		.map((bajt) => bajt.toString(16).padStart(2, '0'))
		.join('');
	return `rl:${formularz}:${hex}`;
}

/**
 * Check and consume one submission slot. Returns false when either ceiling is hit.
 *
 * Both counters are READ before either is written, so a submission blocked by the
 * daily ceiling does not burn the parent's hourly allowance on the way out.
 *
 * The per-client window protects a parent from a neighbour sharing an address.
 * The daily ceiling protects the project: the Resend send budget is 100 messages
 * per day for the whole site, and a ceiling of 40 leaves generous headroom for
 * retries and for the BCC copy while making it impossible for a distributed flood
 * of Turnstile-verified submissions to exhaust the quota and silently stop
 * delivering real enrollment enquiries.
 */
export async function podLimitem(
	kv: KVNamespace | undefined,
	formularz: string,
	ip: string,
	sol: string,
	limit = DOMYSLNY_LIMIT,
	limitDobowy = DOMYSLNY_LIMIT_DOBOWY
): Promise<boolean> {
	if (!kv) {
		// A not-yet-provisioned namespace degrades to Turnstile-only protection
		// instead of throwing. Names only the missing binding, never the client.
		console.warn('ratelimit: brak wiazania FORMS_KV, limit nieaktywny');
		return true;
	}

	const klucz = await kluczLimitu(formularz, ip, sol);

	// Every KV operation is inside the guard deliberately. The `!kv` branch above
	// only catches an ABSENT binding; a binding that is present but unusable (an id
	// pointing at a namespace that does not exist, or a transient KV failure) makes
	// get/put REJECT, and an unguarded rejection escapes obsluz entirely and becomes
	// an opaque 500 on every submission of both forms. +error.svelte does not fire
	// for a +server.ts, so the island would receive a body it cannot map to any
	// Polish message, breaking the D-12 promise precisely when a parent is trying to
	// enroll. Mirrors the try/catch already guarding the Resend call in mailer.ts.
	//
	// A KV failure therefore fails OPEN, exactly like the missing-binding branch: the
	// limiter is an abuse control, not the security gate. Turnstile still verifies
	// every submission server-side, so failing open costs a rate-limit window, while
	// failing closed would reject genuine enrollment enquiries that are stored
	// nowhere and thus lost for good. An over-limit result still returns false: only
	// a thrown KV error reaches the catch.
	try {
		const biezace = licznik(await kv.get(klucz));
		if (biezace >= limit) return false;

		const dobowe = licznik(await kv.get(KLUCZ_DOBOWY));
		if (dobowe >= limitDobowy) return false;

		// expirationTtl restarts on every write: a fixed window that self-cleans.
		await kv.put(klucz, String(biezace + 1), { expirationTtl: OKNO_S });
		await kv.put(KLUCZ_DOBOWY, String(dobowe + 1), { expirationTtl: DOBA_S });
		return true;
	} catch {
		// Nothing from the request is logged: the key is a salted hash, but the error
		// object could carry anything, so it is deliberately not interpolated.
		console.warn('ratelimit: operacja KV nieudana, limit nieaktywny dla tego zgloszenia');
		return true;
	}
}
