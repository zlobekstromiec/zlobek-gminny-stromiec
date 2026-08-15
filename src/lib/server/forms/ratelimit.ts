// KV rate limiting without storing an IP (FORM-02; 04-RESEARCH.md Pattern 4,
// threat T-04-04). Two independent ceilings, both plain integer counters.
//
// RODO note: the per-client key is a one-way salted SHA-256 truncated to 8 bytes
// followed by a coarse hour-of-epoch bucket, and the daily key is a fixed prefix
// followed by a UTC calendar date. Every stored value is an integer. KV therefore
// holds no identifying data and no submission content at any point, which is what
// lets the klauzula say we store nothing. The guarantee is unconditional: this
// module never hashes without a salt, so a misconfigured deployment cannot quietly
// downgrade the stored key into a reversible pseudonym of the visitor.
//
// Durability note: an in-memory Map would look like a limiter and be none. Worker
// isolates are ephemeral and numerous, so the counter has to live in KV.

/** Per-client fixed window. */
export const OKNO_S = 3600;
export const DOMYSLNY_LIMIT = 5;
/** Site-wide daily window. */
export const DOBA_S = 86400;
export const DOMYSLNY_LIMIT_DOBOWY = 40;
/** Prefix of the site-wide daily key, which is deliberately not per client. The
 *  UTC calendar date is appended, so the key itself names the window. */
export const PREFIKS_DOBOWY = 'rl:doba';
/** Cleanup-only lifetime multiplier. The bucket inside the key IS the window; the
 *  stored lifetime exists only so abandoned buckets do not pile up in KV. It has to
 *  be longer than the window it sweeps, because a KV write overwrites the previous
 *  expiration, so a lifetime equal to the window would be restarted by every
 *  accepted request and would never sweep a busy key. */
export const MNOZNIK_TTL = 2;

/** A stored counter that is missing, empty or corrupt reads as zero rather than
 *  NaN, so a bad value can never make the comparison silently pass. */
function licznik(surowy: string | null): number {
	const wartosc = Number(surowy ?? '0');
	return Number.isFinite(wartosc) && wartosc > 0 ? Math.floor(wartosc) : 0;
}

/** Site-wide daily key: the prefix plus the UTC calendar date, for example
 *  rl:doba:2026-08-14. The date IS the window, so the counter starts from zero at
 *  the UTC day boundary no matter how much traffic arrived before it. `teraz` is
 *  required and has no default, so no call site can read a second clock. */
export function kluczDobowy(teraz: number): string {
	return `${PREFIKS_DOBOWY}:${new Date(teraz).toISOString().slice(0, 10)}`;
}

/** Hour-of-epoch bucket for the per-client window. Required parameter, no default,
 *  for the same single-clock reason as kluczDobowy. */
export function kubelekGodzinowy(teraz: number): number {
	return Math.floor(teraz / 1000 / OKNO_S);
}

/** Build the per-client KV key. The form name is part of the key so the two
 *  endpoints keep independent counters: a busy contact form must not be able to
 *  lock a parent out of the enrollment form. 16 hex characters is ample collision
 *  resistance for a one-hour counter and keeps the key far under the 512-byte
 *  limit. The hour bucket is appended OUTSIDE the digest on purpose: it stays
 *  readable so an operator can tell which window a key belongs to, and being
 *  derived from the clock alone it adds nothing identifying to the key. Never
 *  hand-roll the hash: crypto.subtle is in the runtime. */
export async function kluczLimitu(
	formularz: string,
	ip: string,
	sol: string,
	teraz: number
): Promise<string> {
	const bajty = new TextEncoder().encode(`${sol}:${formularz}:${ip}`);
	const skrot = await crypto.subtle.digest('SHA-256', bajty);
	const hex = [...new Uint8Array(skrot)]
		.slice(0, 8)
		.map((bajt) => bajt.toString(16).padStart(2, '0'))
		.join('');
	return `rl:${formularz}:${hex}:${kubelekGodzinowy(teraz)}`;
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
 *
 * Both windows are defined by the BUCKET INSIDE THE KEY: the hour of epoch for the
 * per-client counter, the UTC calendar date for the site-wide one. A refused parent
 * is therefore accepted again the moment the next bucket opens, with no need for the
 * site to fall silent first.
 *
 * `teraz` is the clock and is the LAST parameter on purpose: both endpoints call
 * this function positionally, so appending it is what keeps their call sites
 * untouched. It is read exactly once per call and the same instant feeds both key
 * builders, so the hourly and the daily key can never straddle a boundary within one
 * request.
 */
export async function podLimitem(
	kv: KVNamespace | undefined,
	formularz: string,
	ip: string,
	sol: string,
	limit = DOMYSLNY_LIMIT,
	limitDobowy = DOMYSLNY_LIMIT_DOBOWY,
	teraz: number = Date.now()
): Promise<boolean> {
	if (!kv) {
		// A not-yet-provisioned namespace degrades to Turnstile-only protection
		// instead of throwing. Names only the missing binding, never the client.
		console.warn('ratelimit: brak wiazania FORMS_KV, limit nieaktywny');
		return true;
	}

	// An unsalted truncated SHA-256 of a client address is enumerable across the whole
	// IPv4 space, so the stored key would stop being one way and would become a
	// reversible pseudonym of the visitor. That would contradict both this module's
	// RODO note and the klauzula informacyjna sentence shipped to parents, so a
	// missing salt must never fall through to hashing. `trim` is deliberate: an unset
	// secret arrives from the endpoints as an empty string via `?? ''`, and a
	// whitespace-only secret is the same misconfiguration wearing a different shape.
	//
	// Skipping is the same documented degrade as an absent binding: Turnstile remains
	// the security gate, and failing closed here would reject genuine enquiries that
	// are stored nowhere and are therefore lost for good. Deliberately NOT a hard
	// failure the way a missing RESEND_API_KEY is: the limiter is an abuse control,
	// not a delivery prerequisite.
	if (sol.trim().length === 0) {
		console.warn('ratelimit: brak RATE_LIMIT_SALT, limit nieaktywny');
		return true;
	}

	const klucz = await kluczLimitu(formularz, ip, sol, teraz);
	const kluczDnia = kluczDobowy(teraz);

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
	//
	// The read-modify-write below is not atomic and KV is eventually consistent, so a
	// burst of simultaneous requests can undercount by a slot or two. That is accepted
	// for an abuse control and deliberately left unchanged: the ceiling is a budget
	// guard, not a transaction.
	try {
		const biezace = licznik(await kv.get(klucz));
		if (biezace >= limit) return false;

		const dobowe = licznik(await kv.get(kluczDnia));
		if (dobowe >= limitDobowy) return false;

		// The window is the bucket inside the key, never the stored lifetime. A KV write
		// overwrites the previous expiration, so passing the bare window length here
		// would restart the clock on every accepted request: the single site-wide
		// counter would then climb without ever expiring and refuse every parent on both
		// forms until the whole site fell silent for a full day. The lifetime below is
		// twice the window and only sweeps buckets nobody writes to any more; rewriting
		// a key never moves its boundary.
		await kv.put(klucz, String(biezace + 1), { expirationTtl: MNOZNIK_TTL * OKNO_S });
		await kv.put(kluczDnia, String(dobowe + 1), { expirationTtl: MNOZNIK_TTL * DOBA_S });
		return true;
	} catch {
		// Nothing from the request is logged: the key is a salted hash, but the error
		// object could carry anything, so it is deliberately not interpolated.
		console.warn('ratelimit: operacja KV nieudana, limit nieaktywny dla tego zgloszenia');
		return true;
	}
}
