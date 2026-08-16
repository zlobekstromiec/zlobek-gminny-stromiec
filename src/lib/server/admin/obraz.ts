// The server half of the photo upload, and the whole point of it is what it does NOT do
// (Phase 04.1, Plan 04.1-07; D-12, threats T-04.1-11 and T-04.1-28).
//
// THIS MODULE NEVER TOUCHES THE PIXELS. It reads the first eighteen bytes, checks that
// they are the opening of one of the three accepted formats, and hands the payload on
// verbatim. That is not tidiness, it is the free plan's budget: a Cloudflare
// Worker on the free plan gets roughly ten milliseconds of CPU per request, and turning a
// few hundred kilobytes of image into its textual form was measured at about 6.6 ms of
// that budget all by itself. It is real work on the processor, not waiting on I/O, so it
// is not something the runtime can overlap with anything. The browser therefore does that
// conversion once, while the editor is looking at the preview, and the worker forwards the
// result unchanged into the blob request that src/lib/server/admin/commit.ts assembles by
// concatenation for exactly the same reason.
//
// A CONSEQUENCE WORTH STATING: this module is the ONLY thing standing between a request
// and the repository. The pattern below is therefore an allowlist of three image types
// and a strict payload charset, never a blocklist, and the length is checked FIRST so an
// enormous string is refused before any matching starts (T-04.1-11).
//
// WHY THE FIRST BYTES ARE READ AFTER ALL, when the paragraph above says the pixels are
// nobody's business here. The declared media type is a label the client chose, and the
// bytes do not land in a store that shrugs at them: they land in src/lib/assets/uploads/,
// which uploads.ts and the three public consumers glob with the enhanced-image query, so
// EVERY file in that directory is decoded by the image transform AT BUILD TIME. A payload
// that is valid base64 and correctly labelled but is not a decodable image (a truncated
// upload from a flaky mobile connection, or a hand-built request) would be accepted,
// committed and reported to the editor as „Zapisano", and the next Pages build would then
// fail on the transform. That stops the whole public site from deploying, INCLUDING any
// fix the editor tries to make afterwards, because the panel's only write path is a
// commit that triggers the same build. Recovery would need somebody with git access,
// which is exactly the person this project assumes will not be around. The check costs
// one atob over twenty four characters, not over the payload, so the CPU argument above
// survives it intact.
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
 * The opening bytes of the formats that survive the build transform. An allowlist, like
 * everything else in this file: a format nobody listed is refused rather than guessed at.
 */
const SYGNATURY: readonly (readonly number[])[] = [
	[0xff, 0xd8, 0xff], // jpeg
	[0x89, 0x50, 0x4e, 0x47] // png
];

/** Characters of the payload that are decoded, six base64 quadruples. Eighteen bytes,
 *  which reaches WEBP's second marker at bytes 8 to 11 with room to spare. */
const ZNAKOW_NAGLOWKA = 24;

/**
 * True when the payload really begins as one of the accepted formats.
 *
 * This is a header check and not a decode: it says „the first bytes are the opening of a
 * JPEG", never „this is a complete, undamaged image". A file truncated after its header
 * still passes here and can still fail the build transform, so the guarantee is a large
 * reduction of that risk rather than its removal. What it does close is the whole class
 * the editor can produce by accident and the cheap class a hand-built request can send:
 * text, a PDF renamed in the label, a base64 blob of anything at all.
 */
function znanaSygnatura(base64: string): boolean {
	// Only whole quadruples can be decoded, and a payload too short to hold a signature
	// is not an image either: it decodes to nothing and falls through to the refusal.
	const wyciety = base64.slice(0, ZNAKOW_NAGLOWKA);
	const rowny = wyciety.slice(0, wyciety.length - (wyciety.length % 4));
	let naglowek: string;
	try {
		naglowek = atob(rowny);
	} catch {
		// A payload the charset pattern admitted but the decoder will not read is exactly
		// the value this function exists to stop.
		return false;
	}
	const bajty = [...naglowek].map((znak) => znak.charCodeAt(0));
	if (SYGNATURY.some((sygnatura) => sygnatura.every((bajt, i) => bajty[i] === bajt))) return true;
	// WEBP carries its own length between the two halves of its marker, so it is checked
	// on bytes 0 to 3 and again on 8 to 11.
	return naglowek.startsWith('RIFF') && naglowek.slice(8, 12) === 'WEBP';
}

/**
 * The payload of an accepted data URL, or null.
 *
 * ORDER OF THE CHECKS IS LOAD BEARING and is asserted by tests/admin-obraz.unit.ts with a
 * mutation recorded in the plan SUMMARY: the type check costs nothing, the length check
 * costs one property read, only then does anything scan the string, and the decode of the
 * header runs last of all, on a value the pattern has already accepted. Reversing any of
 * that would let a hand-built request spend the whole request budget on a value that was
 * always going to be refused.
 */
export function base64ZDataUrl(wartosc: unknown): string | null {
	if (typeof wartosc !== 'string') return null;
	if (wartosc.length > MAKS_BASE64) return null;
	const trafienie = WZORZEC_DATA_URL.exec(wartosc);
	if (trafienie === null) return null;
	return znanaSygnatura(trafienie[1]) ? trafienie[1] : null;
}

/** True when the value is a string the cap alone refused, which is the difference between
 *  „this photo is too large" and „this is not a photo" to the person reading the message.
 *  Kept beside the cap so the two can never disagree about which side of it a value fell. */
export function zaDuzeZdjecie(wartosc: unknown): boolean {
	return typeof wartosc === 'string' && wartosc.length > MAKS_BASE64;
}
