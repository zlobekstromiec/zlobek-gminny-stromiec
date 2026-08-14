// Server-side Turnstile verification (FORM-02; 04-RESEARCH.md Code Example 3,
// threat T-04-03). A client-only widget is never acceptable: the token proves
// nothing until this call confirms it with Cloudflare, so this runs on every
// submission before any work that costs quota. Durability note: it fails CLOSED,
// which is the whole point, and it is the only module under src/lib/server/forms/
// permitted to log anything at all.
const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

interface OdpowiedzSiteverify {
	success?: boolean;
	'error-codes'?: string[];
}

/** Verify a Turnstile token. Returns false for a failed challenge AND for any
 *  network or parse error: a siteverify outage must never open the relay. */
export async function zweryfikujTurnstile(
	secret: string,
	token: string,
	remoteip?: string
): Promise<boolean> {
	// Tokens are single-use and live 300 seconds. A fresh idempotency_key per
	// attempt makes a legitimate retry of THIS call safe without double-spending
	// the token at Cloudflare's end.
	const idempotency_key = crypto.randomUUID();
	try {
		const res = await fetch(SITEVERIFY, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ secret, response: token, remoteip, idempotency_key })
		});
		const wynik = (await res.json()) as OdpowiedzSiteverify;
		if (wynik.success !== true) {
			// The error codes are diagnostic and carry no personal data. They are the
			// ONLY thing from a request that may ever be logged: never the token,
			// never the IP, never a field value (RODO, C-03).
			console.warn(`turnstile: ${wynik['error-codes']?.join(',') ?? 'unknown'}`);
			return false;
		}
		return true;
	} catch {
		// Fail CLOSED.
		return false;
	}
}
