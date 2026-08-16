// The server half of the document upload, and like the photo half its whole point is what
// it does NOT do (Phase 04.1, Plan 04.1-08; P-22, threats T-04.1-11, T-04.1-31, T-04.1-32).
//
// THIS MODULE NEVER TOUCHES THE BYTES. It strips the data URL prefix and hands the payload
// on verbatim. That is the free plan's budget rather than tidiness: a Cloudflare Worker on
// the free plan gets roughly ten milliseconds of processor time per request, and turning a
// file into its textual form is real work on the processor rather than waiting on I/O, so
// the runtime cannot overlap it with anything. A document may be ten megabytes, twenty five
// times the size of a prepared photo, so the argument D-12 made for moving that conversion
// into the browser applies here with more force and not less. That is P-22, the recorded
// deviation from the UI-SPEC route table, and it is why the file field is the one control
// on these screens that needs JavaScript.
//
// A CONSEQUENCE WORTH STATING: because nothing here interprets the bytes, the pattern below
// is the ONLY thing standing between a request and a file the żłobek's website will serve.
// It is therefore an ALLOW-LIST of three media types and a strict payload charset, never a
// blocklist, and the length is checked FIRST so an enormous string is refused before any
// matching starts (T-04.1-11).
//
// THE WRITTEN PATH IS BUILT FROM A SLUG AND AN ALLOW-LISTED EXTENSION, never from the
// submitted filename (T-04.1-31, T-04.1-32). A filename is the one thing in this submission
// that a person could otherwise aim at a path, and the answer is the same one
// src/lib/server/admin/uploads.ts gives for a cover: the name is generated, not accepted.
//
// Pure: no fetch, no I/O, no clock. Nothing here logs.
import { MAKS_PLIKU_DOKUMENTU, ROZSZERZENIA_DOKUMENTU, TYPY_DOKUMENTU } from '../../pliki.ts';

// Re-exported so a server caller reads the accepted set from the module it is already
// importing while exactly one declaration of it exists. Same arrangement obraz.ts uses for
// the crop ratio and walidacja/pola.ts for the year window, and for the same reason: a set
// declared twice is a control that offers one thing and a server that accepts another.
export { MAKS_PLIKU_DOKUMENTU, ROZSZERZENIA_DOKUMENTU, TYPY_DOKUMENTU };

/**
 * Longest payload accepted, in characters.
 *
 * DERIVED from the byte cap rather than written out, so the two can never drift: base64
 * spends four characters on every three bytes and pads to a multiple of four. A number
 * typed here independently would eventually accept a file the hint promised to refuse, or
 * refuse one it promised to accept, and the editor would have no way to tell which.
 */
export const MAKS_PLIKU_BASE64 = Math.ceil(MAKS_PLIKU_DOKUMENTU / 3) * 4;

/** Repository directory the document files live in. The public reader resolves a stored
 *  path by joining the process directory, `static` and that path, so a file here is served
 *  verbatim at the public path below. No trailing slash: callers join with one. */
export const KATALOG_DOKUMENTOW = 'static/dokumenty';

/** The canonical public prefix the stored `plik` value must carry. src/lib/server/dokumenty.ts
 *  refuses any entry without it, with a build warning and nothing else, so the panel must be
 *  incapable of emitting anything else. */
export const PREFIKS_DOKUMENTU = '/dokumenty/';

/** Repository directory of the document ENTRIES, which the public reader globs. Declared
 *  beside the file directory so the two halves of one document are named in one place. */
export const KATALOG_TRESCI_DOKUMENTOW = 'src/lib/content/dokumenty';

/** The one extension the entry glob accepts. */
export const ROZSZERZENIE_TRESCI = '.json';

/** Regex-safe form of a literal. The accepted media types carry a slash, a dot and a
 *  hyphen, and the pattern below is BUILT from the allow-list rather than written out, so a
 *  type added to src/lib/pliki.ts cannot be accepted by the control and refused here. */
function uciecz(tekst: string): string {
	return tekst.replace(/[.*+?^${}()|[\]\\/-]/gu, '\\$&');
}

/**
 * A data URL carrying one of the three accepted document types.
 *
 * Anchored at both ends, so nothing may be smuggled before or after. The payload charset is
 * the standard alphabet with optional padding and nothing else, which is what makes it safe
 * for commit.ts to splice the payload into a request body by concatenation: a value that
 * could contain a quotation mark would break out of the body it is spliced into. That module
 * re-checks the charset itself before sending, so the guarantee holds even if a future
 * caller reaches it by another route.
 */
const WZORZEC_DATA_URL = new RegExp(
	`^data:(${TYPY_DOKUMENTU.map(uciecz).join('|')});base64,([A-Za-z0-9+/]+={0,2})$`
);

/** An accepted attachment: the payload exactly as the browser produced it, and the
 *  extension its media type is written with. */
export interface PlikZDataUrl {
	/** The base64 payload, already stripped of its prefix and NEVER decoded. */
	base64: string;
	/** Drawn from the allow-list keyed by the accepted media type, never from a filename. */
	rozszerzenie: string;
}

/**
 * The payload and extension of an accepted data URL, or null.
 *
 * ORDER OF THE CHECKS IS LOAD BEARING and is asserted by
 * tests/admin-walidacja-dokumenty.unit.ts: the type check costs nothing, the length check
 * costs one property read, and only then does anything scan the string. Reversing the last
 * two would let a hand-built request spend the whole request budget inside the pattern on a
 * fourteen megabyte value that was always going to be refused.
 *
 * BOTH VALUES COME OUT OF ONE MATCH, deliberately. Two functions each running the pattern
 * would scan a fourteen megabyte string twice for one answer, which is the exact cost this
 * whole module exists to avoid.
 */
export function base64ZDataUrlDokumentu(wartosc: unknown): PlikZDataUrl | null {
	if (typeof wartosc !== 'string') return null;
	if (wartosc.length > MAKS_PLIKU_BASE64) return null;
	const trafienie = WZORZEC_DATA_URL.exec(wartosc);
	if (trafienie === null) return null;
	const rozszerzenie = ROZSZERZENIA_DOKUMENTU[trafienie[1]];
	// Unreachable while the pattern is built from the same table, and checked anyway: an
	// undefined extension would silently write a file with no extension at all, which the
	// public reader would then label with the whole filename.
	if (rozszerzenie === undefined) return null;
	return { base64: trafienie[2], rozszerzenie };
}

/** True when the value is a string the cap alone refused, which is the difference between
 *  „this file is too large" and „this is not a document" to the person reading the message.
 *  Kept beside the cap so the two can never disagree about which side of it a value fell. */
export function zaDuzyPlik(wartosc: unknown): boolean {
	return typeof wartosc === 'string' && wartosc.length > MAKS_PLIKU_BASE64;
}

/** Where one document's file lives, in the repository and on the website. */
export interface SciezkiDokumentu {
	/** Repository path, for a tree entry. */
	repo: string;
	/** The value stored in the entry's `plik` field, which is also the download URL. */
	publiczna: string;
}

/**
 * Both paths of a document file, from the slug of its name and an allow-listed extension.
 *
 * NOTHING A PERSON TYPED REACHES THIS JOIN. The slug has already been through `slugAscii`,
 * whose output is either empty or lowercase ASCII letters, digits and single hyphens, and
 * the extension is a value of the allow-list table. A separator, a dot run and an upper-case
 * letter are therefore all unreachable, which is what makes the public reader's own prefix
 * and traversal guard a second line of defence rather than the only one.
 */
export function sciezkaDokumentu(slug: string, rozszerzenie: string): SciezkiDokumentu {
	const nazwa = `${slug}${rozszerzenie}`;
	return {
		repo: `${KATALOG_DOKUMENTOW}/${nazwa}`,
		publiczna: `${PREFIKS_DOKUMENTU}${nazwa}`
	};
}

/** Repository path of one document's file, from the value stored in its entry. Built by
 *  stripping the canonical prefix the reader already required, so a deletion removes the
 *  file the ENTRY names and never a path anything in the request supplied. Null when the
 *  stored value does not carry that prefix or smuggles a traversal segment, in which case
 *  there is nothing this panel put there and nothing it should remove. */
export function sciezkaZPubliczej(publiczna: unknown): string | null {
	if (typeof publiczna !== 'string') return null;
	if (!publiczna.startsWith(PREFIKS_DOKUMENTU)) return null;
	const nazwa = publiczna.slice(PREFIKS_DOKUMENTU.length);
	if (nazwa.length === 0 || nazwa.includes('/') || nazwa.includes('\\') || nazwa.includes('..')) {
		return null;
	}
	return `${KATALOG_DOKUMENTOW}/${nazwa}`;
}

/** Repository path of one document's ENTRY, from its slug. Exists so no route concatenates
 *  a path of its own and so the editor screens and the delete action cannot disagree about
 *  where a document lives. */
export function sciezkaTresciDokumentu(slug: string): string {
	return `${KATALOG_TRESCI_DOKUMENTOW}/${slug}${ROZSZERZENIE_TRESCI}`;
}
