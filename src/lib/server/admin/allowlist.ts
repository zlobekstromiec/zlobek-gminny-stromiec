// Editor allowlist and handle derivation for the admin panel (D-02, D-04;
// 04.1-01-PLAN.md threats T-04.1-02 and T-04.1-07). Pure and dependency-free on
// purpose: no fetch, no I/O, no runtime globals, so tests/admin-sesja.unit.ts can
// drive every branch under `node --test` with no harness.
//
// Nothing here logs at all, and that is a requirement rather than a style choice.
// A staff e-mail address is personal data on a public body's system (RODO, C-03),
// and zlobekstromiec/zlobek-gminny-stromiec is a PUBLIC repository (D-02), so an
// address may reach neither a log line, nor a commit message, nor a rendered page
// other than the login echo line.

/** Maximum length of the editor handle shown as „Zalogowano jako" and written into
 *  commit messages (D-04). Exported so tests assert against the constant and never
 *  against a retyped literal, following the MAKS_EMAIL precedent in sanitize.ts. */
export const MAKS_UCHWYTU = 20;

/** Everything a handle may NOT contain. Offending characters, including every
 *  Polish diacritic and the at sign itself, are dropped rather than transliterated:
 *  the handle is an identifier, not a display name, and a lossy identifier is
 *  harmless where a leaked address is not. */
const NIEDOZWOLONE_W_UCHWYCIE = /[^a-z0-9._-]/g;

/**
 * Is this address on the comma separated allowlist secret (ADMIN_EMAILS)?
 *
 * Fails CLOSED: an unset, empty or whitespace-only list matches nobody. This is
 * the opposite direction to the deliberate fail-open degrade in
 * src/lib/server/forms/ratelimit.ts, and the difference is the whole point. The
 * rate limiter is an abuse control sitting behind Turnstile, where refusing a
 * parent's enrollment would cost more than it protects. This function IS the
 * authentication boundary, so a missing secret must open nothing.
 *
 * An empty address never matches, so an empty element in a sloppily edited list
 * (`a@x.pl,,b@y.pl`, or a trailing comma) cannot become a wildcard.
 *
 * Called from src/hooks.server.ts on EVERY admin request, not only at login. That
 * re-check is what makes a stateless cookie revocable: removing an address from
 * the secret and rebuilding logs that person out on their next request rather
 * than up to 30 days later (D-02, D-03).
 */
export function naLiscie(adres: unknown, lista: string | undefined): boolean {
	if (typeof adres !== 'string') return false;
	const szukany = adres.trim().toLowerCase();
	if (szukany.length === 0) return false;
	if (typeof lista !== 'string') return false;
	return lista
		.split(',')
		.map((element) => element.trim().toLowerCase())
		.filter((element) => element.length > 0)
		.includes(szukany);
}

/**
 * Reduce an address to the short non-personal handle of D-04, for example
 * `anna.kowalska@example.test` to `anna.kowalska`.
 *
 * The part before the first at sign, lowercased, stripped of every character
 * outside `a-z0-9._-` and truncated to MAKS_UCHWYTU. The result can therefore
 * never contain an at sign, which is the property that keeps a full address out
 * of commit messages and out of the panel header.
 *
 * Returns an empty string for an unusable input rather than throwing: the caller
 * is an authentication path that has already decided the address is allowlisted,
 * and a handle is a label, not a credential.
 */
export function uchwytZAdresu(adres: unknown): string {
	if (typeof adres !== 'string') return '';
	const przedMalpa = adres.split('@')[0] ?? '';
	return przedMalpa
		.trim()
		.toLowerCase()
		.replace(NIEDOZWOLONE_W_UCHWYCIE, '')
		.slice(0, MAKS_UCHWYTU);
}
