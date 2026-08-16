// The server half of the photo upload, and the whole point of it is what it does NOT do
// (Phase 04.1, Plan 04.1-07; D-12, threats T-04.1-11 and T-04.1-28).
//
// THIS MODULE NEVER TOUCHES THE PIXELS. It strips the data URL prefix and hands the
// payload on verbatim. That is not tidiness, it is the free plan's budget: a Cloudflare
// Worker on the free plan gets roughly ten milliseconds of CPU per request, and turning a
// few hundred kilobytes of image into its textual form was measured at about 6.6 ms of
// that budget all by itself. It is real work on the processor, not waiting on I/O, so it
// is not something the runtime can overlap with anything. The browser therefore does that
// conversion once, while the editor is looking at the preview, and the worker forwards the
// result unchanged into the blob request that src/lib/server/admin/commit.ts assembles by
// concatenation for exactly the same reason.
//
// A CONSEQUENCE WORTH STATING: because nothing here interprets the bytes, the pattern
// below is the ONLY thing standing between a request and the repository. It is therefore
// an allowlist of three image types and a strict payload charset, never a blocklist, and
// the length is checked FIRST so an enormous string is refused before any matching starts
// (T-04.1-11).
//
// Pure: no fetch, no I/O, no clock. Nothing here logs.
import { PROPORCJA_WPISU } from '../../zdjecia.ts';

// Re-exported so a server caller reads the ratio the island crops to from the module it
// is already importing, while exactly one declaration of it exists. Same arrangement
// walidacja/pola.ts uses for the year window, and for the same reason: a ratio declared
// twice is a preview that promises one framing and a card that renders another.
export { PROPORCJA_WPISU };

/**
 * Longest payload accepted, in characters.
 *
 * The island targets 200 to 400 KB of image, which is roughly 270 to 540 thousand
 * characters once encoded, so this is about triple the expected size and still a firm
 * ceiling. Named and exported rather than inlined, because the validator beside this file
 * uses it to tell „too large" apart from „not an image" when choosing which Polish
 * sentence the editor reads.
 */
export const MAKS_BASE64 = 1_400_000;

/**
 * A data URL carrying one of the three accepted image types.
 *
 * Anchored at both ends, so nothing may be smuggled before or after. The payload charset
 * is the standard alphabet with optional padding and nothing else, which is what makes it
 * safe for `commit.ts` to splice the payload into a request body by concatenation: a
 * value that could contain a quotation mark would break out of the body it is spliced
 * into. That module re-checks the charset itself before sending, so the guarantee holds
 * even if a future caller reaches it by another route.
 */
const WZORZEC_DATA_URL = /^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/;

/**
 * The payload of an accepted data URL, or null.
 *
 * ORDER OF THE CHECKS IS LOAD BEARING and is asserted by tests/admin-obraz.unit.ts with a
 * mutation recorded in the plan SUMMARY: the type check costs nothing, the length check
 * costs one property read, and only then does anything scan the string. Reversing the last
 * two would let a hand-built request spend the whole request budget inside the pattern on
 * a value that was always going to be refused.
 */
export function base64ZDataUrl(wartosc: unknown): string | null {
	if (typeof wartosc !== 'string') return null;
	if (wartosc.length > MAKS_BASE64) return null;
	const trafienie = WZORZEC_DATA_URL.exec(wartosc);
	return trafienie === null ? null : trafienie[1];
}

/** True when the value is a string the cap alone refused, which is the difference between
 *  „this photo is too large" and „this is not a photo" to the person reading the message.
 *  Kept beside the cap so the two can never disagree about which side of it a value fell. */
export function zaDuzeZdjecie(wartosc: unknown): boolean {
	return typeof wartosc === 'string' && wartosc.length > MAKS_BASE64;
}
