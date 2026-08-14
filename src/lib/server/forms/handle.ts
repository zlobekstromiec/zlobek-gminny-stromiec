// Shared form orchestrator (FORM-01, FORM-02; 04-RESEARCH.md Pattern 3 and
// Code Example 6). Runs one pipeline in strict cheap-to-expensive order so a bot
// burns as little quota as possible, and maps every outcome through the shared
// status table rather than writing status numbers inline.
//
// Every side effect arrives by injection, which is what lets tests/forms.unit.ts
// drive the entire decision table with stubs and no network. Both endpoints are
// thin adapters over this function, so the two forms cannot drift apart.
//
// Durability notes:
// - Nothing here logs. No branch returns 200 together with ok false (D-12).
// - A dwell-time check was considered and deliberately omitted: the form pages are
//   prerendered, so the HTML cannot carry a freshly signed render timestamp, and an
//   unsigned client-supplied timestamp proves nothing at all.
import { STATUS_DLA_KODU } from '../../forms/types.ts';
import type { FormCode, FormResult } from '../../forms/types.ts';
import type { WynikWalidacji } from './validate.ts';

export interface Zaleznosci<T> {
	waliduj: (dane: unknown) => WynikWalidacji<T>;
	/** STATIC subject constant supplied by the endpoint, never user input. */
	temat: string;
	zbudujTresc: (dane: T) => string;
	replyTo: (dane: T) => string;
	weryfikujTurnstile: (token: string, ip: string) => Promise<boolean>;
	podLimitem: (ip: string) => Promise<boolean>;
	wyslij: (temat: string, tresc: string, replyTo: string) => Promise<boolean>;
}

export interface Odpowiedz {
	wynik: FormResult;
	status: number;
}

function niepowodzenie(code: FormCode, pola?: Record<string, string>): Odpowiedz {
	return {
		wynik: pola === undefined ? { ok: false, code } : { ok: false, code, pola },
		status: STATUS_DLA_KODU[code]
	};
}

const SUKCES: Odpowiedz = { wynik: { ok: true }, status: 200 };

export async function obsluz<T>(
	surowe: string,
	ip: string,
	zaleznosci: Zaleznosci<T>
): Promise<Odpowiedz> {
	// 1. Parse. Free, so it runs first.
	let dane: unknown;
	try {
		dane = JSON.parse(surowe);
	} catch {
		return niepowodzenie('walidacja');
	}
	const cialo = typeof dane === 'object' && dane !== null ? (dane as Record<string, unknown>) : {};

	// 2. Honeypot. A real parent never fills a visually hidden field. Answer 200 so
	// a naive bot believes it succeeded and stops retrying; the send is skipped.
	if (typeof cialo.strona === 'string' && cialo.strona.length > 0) {
		return SUKCES;
	}

	// 3. Shape, caps and consent. Still free, and it rejects the majority of bad
	// submissions before a single outbound request is made.
	const walidacja = zaleznosci.waliduj(dane);
	if (!walidacja.ok) {
		return niepowodzenie(walidacja.code, walidacja.pola);
	}

	// 4. Turnstile. One outbound fetch, unmetered, and it fails closed.
	const token = typeof cialo.turnstile === 'string' ? cialo.turnstile : '';
	if (token.length === 0) {
		return niepowodzenie('turnstile');
	}
	if (!(await zaleznosci.weryfikujTurnstile(token, ip))) {
		return niepowodzenie('turnstile');
	}

	// 5. Rate limit. Deliberately AFTER Turnstile: only verified humans consume the
	// KV write budget, so a bot flood cannot exhaust the free tier and thereby
	// disable rate limiting for real parents.
	if (!(await zaleznosci.podLimitem(ip))) {
		return niepowodzenie('limit');
	}

	// 6. Send, awaited. One of 100 per day.
	const tresc = zaleznosci.zbudujTresc(walidacja.dane);
	const replyTo = zaleznosci.replyTo(walidacja.dane);
	const wyslane = await zaleznosci.wyslij(zaleznosci.temat, tresc, replyTo);
	return wyslane ? SUKCES : niepowodzenie('wysylka');
}
