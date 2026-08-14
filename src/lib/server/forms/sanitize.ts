// Injection-safe field sanitizers for the public form endpoints (FORM-01,
// FORM-02; 04-RESEARCH.md Code Example 5 and Pitfall 1, threat T-04-01). Pure and
// dependency-free on purpose: no fetch, no I/O, no runtime globals, so
// tests/forms.unit.ts can drive every branch under `node --test` with no harness.
// Divergence from the src/lib/server/dokumenty.ts convention this file otherwise
// follows: dokumenty.ts logs the offending value when it rejects one, and these
// modules must never do that. A form field carries a parent's and a child's
// personal data and may not reach a log (RODO, C-03), so nothing here logs at all.

// Conservative address shape: up to 64 characters before the at sign that are not
// whitespace or header-structural, then a host and a 2-or-more-letter TLD. A full
// RFC 5322 regex is famously unmaintainable and still would not stop header
// injection, which is the actual threat.
const EMAIL = /^[^\s@,;<>"]{1,64}@[a-zA-Z0-9.-]{1,190}\.[a-zA-Z]{2,}$/;

/** CR, LF, TAB, NUL and the header-structural characters, listed as literals
 *  rather than a control-character regex so the set stays greppable and needs no
 *  lint suppression. Any one of these in an address would let a crafted value
 *  split the reply-to header and smuggle a second recipient. */
const ZNAKI_NIEBEZPIECZNE = ['\r', '\n', '\t', '\u0000', '<', '>', ',', ';', '"'];

/** RFC-practical maximum for an address, and the cap the reply-to header gets. */
export const MAKS_EMAIL = 254;
const MAKS_TELEFON = 24;
/** Digits, spaces and hyphens, with at most one leading plus. */
const TELEFON = /^\+?[0-9 -]+$/;

/** Strip C0 and C1 control characters, keeping the newline. Written as an explicit
 *  code-point scan instead of a control-character regex: it covers C1 (which the
 *  obvious C0-only regex misses) and it needs no eslint no-control-regex escape. */
function bezZnakowKontrolnych(wartosc: string): string {
	let wynik = '';
	for (const znak of wartosc) {
		if (znak === '\n') {
			wynik += znak;
			continue;
		}
		const kod = znak.codePointAt(0) ?? 0;
		const c0 = kod <= 0x1f;
		const c1 = kod === 0x7f || (kod >= 0x80 && kod <= 0x9f);
		if (c0 || c1) continue;
		wynik += znak;
	}
	return wynik;
}

/** Validate an address for use as reply_to. This is the only thing standing
 *  between a request field and an SMTP header (T-04-01).
 *
 *  The value is REJECTED and never repaired. A silently corrected address sends
 *  the żłobek's reply to the wrong person, which is worse than telling the parent
 *  to fix their typo, and a stripped CRLF hides an attack instead of stopping it. */
export function bezpiecznyEmail(surowy: unknown): string | null {
	if (typeof surowy !== 'string') return null;
	const wartosc = surowy.trim();
	if (wartosc.length === 0 || wartosc.length > MAKS_EMAIL) return null;
	if (ZNAKI_NIEBEZPIECZNE.some((znak) => wartosc.includes(znak))) return null;
	if (!EMAIL.test(wartosc)) return null;
	return wartosc;
}

/** Body text: strip control characters, keep newlines, collapse runaway blank
 *  lines and cap the length. The body cannot become a header, so this is about
 *  keeping the staff mail readable and bounded, not about injection. */
export function bezpiecznyTekst(surowy: unknown, maks: number): string | null {
	if (typeof surowy !== 'string') return null;
	const wartosc = bezZnakowKontrolnych(surowy)
		.replace(/\n{3,}/g, '\n\n')
		.trim();
	if (wartosc.length === 0 || wartosc.length > maks) return null;
	return wartosc;
}

/** Optional phone field. Rejects rather than strips anything outside the allowed
 *  set, for consistency with the address rule: a number with characters removed
 *  is a different number, and dialling the wrong one is a real failure. */
export function bezpiecznyTelefon(surowy: unknown): string | null {
	if (typeof surowy !== 'string') return null;
	const wartosc = surowy.trim();
	if (wartosc.length === 0 || wartosc.length > MAKS_TELEFON) return null;
	if (!TELEFON.test(wartosc)) return null;
	return wartosc;
}
