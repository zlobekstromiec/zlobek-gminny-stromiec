// Shared form result contract (FORM-01, FORM-02; 04-RESEARCH.md Pattern 2 and
// Code Example 6). Deliberately NOT under src/lib/server/: the browser island
// imports this same union as a type, and SvelteKit's server-only import rule
// would reject that from $lib/server. Nothing here has a runtime dependency, so
// the module is safe in both bundles and in `node --test`.

/** Stable machine codes. The island maps each one to Polish copy, which is what
 *  keeps long prose (and therefore the em-dash and emoji bans) out of server
 *  code and makes every failure directly assertable in Playwright. */
export type FormCode = 'walidacja' | 'zgoda' | 'turnstile' | 'limit' | 'wysylka';

export type FormResult =
	| { ok: true }
	| {
			ok: false;
			code: FormCode;
			/** Per-field message keys for aria-describedby wiring: short stable keys
			 *  only (brak, niepoprawny, zbyt-dlugi). Never Polish prose, and never an
			 *  echo of a submitted value. */
			pola?: Record<string, string>;
	  };

/** A failure must NEVER be reported as 200. Playwright, monitoring and any future
 *  alerting all key off the status code, so every handler maps its code through
 *  this table instead of writing a status inline (D-12). */
export const STATUS_DLA_KODU: Readonly<Record<FormCode, number>> = Object.freeze({
	walidacja: 400,
	zgoda: 400,
	turnstile: 400,
	limit: 429,
	wysylka: 502
});
