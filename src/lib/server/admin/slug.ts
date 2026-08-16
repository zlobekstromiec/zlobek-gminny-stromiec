// The filename generator (Phase 04.1, Plan 04.1-06; D-14, P-16, SC3, threat T-04.1-24).
//
// WHAT THE OUTPUT OF THIS FILE ACTUALLY IS: the public URL of an aktualność, forever.
// src/lib/server/aktualnosci.ts derives each post's slug from the on-disk FILENAME and
// never from the fields, which is what makes „editing a title keeps the URL" and
// „a deleted post 404s" true for free (Phase 3 D-07 and D-08). This module therefore
// runs at CREATE time only. The edit screen reads the filename from its route parameter
// and never recomputes it, because recomputing it would rename the file, break every
// link anybody has shared, and orphan the old URL.
//
// IT ALSO CARRIES A SECURITY PROPERTY (T-04.1-24). The title is the only part of a
// written path a human supplies, so the strict character class below is what stops a
// path escaping src/lib/content/aktualnosci/. Nothing here concatenates a raw title into
// a path: the title becomes ASCII letters, digits and single hyphens first, or it becomes
// nothing at all.
//
// PURE, and deliberately import-free: no I/O, no clock, no dependency of any kind, so
// `node --test` drives every branch with no harness. Nothing here logs: a title is
// staff-authored content and does not belong in a log line (RODO, C-03).
//
// EXPLICITLY REJECTED: an ad-hoc character map for the Polish diacritics. NFD
// normalisation plus a combining-mark strip handles eight of the nine correctly and
// keeps working for every other accented alphabet a pasted title might contain, which a
// hand-written map does not.

/** Longest slug half of a filename. The date prefix adds eleven characters and the
 *  extension five, so the whole name stays comfortably short enough to read in a URL bar
 *  and in a git diff. Exported so the suite reads the cap rather than restating it. */
export const MAKS_SLUGU = 60;

/** Folder the public reader globs. Declared here rather than in a route, because
 *  SvelteKit permits only its own named exports from a +page.server.ts and because a
 *  path that appears in exactly one place cannot drift into a save that succeeds and
 *  changes nothing. No trailing slash: callers join with one. */
export const KATALOG_WPISOW = 'src/lib/content/aktualnosci';

/** The one extension the reader's glob accepts. */
export const ROZSZERZENIE_WPISU = '.json';

/**
 * ASCII slug of a Polish title.
 *
 * Three passes, in this order and for these reasons:
 *
 *  1. NFD normalisation, then every combining mark removed. That covers ą, ć, ę, ń, ó,
 *     ś, ź and ż, and every other accented Latin letter a pasted title might carry.
 *  2. An EXPLICIT pass for the stroked l, in both cases. It is the ONE Polish letter
 *     with no canonical decomposition, so pass 1 leaves it exactly as it was and an
 *     NFD-only implementation silently emits a non-ASCII byte into a filename. That is
 *     the classic Polish slug bug, it is invisible until somebody tries to open the
 *     post, and tests/admin-slug.unit.ts exists mostly to keep this pass here.
 *  3. Lowercase, collapse every run of anything else into one hyphen, trim the hyphens
 *     off both ends.
 *
 * The result is either the empty string or `[a-z0-9]+(-[a-z0-9]+)*`. Nothing else is
 * reachable, which is what makes the caller's path safe by construction.
 */
export function slugAscii(tekst: string, maks: number = MAKS_SLUGU): string {
	const bezOgonkow = tekst
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/gu, '')
		// Pass 2. Written as code points rather than as the letters themselves, so the
		// pass survives every editor, diff and patch round trip unchanged and so a reader
		// can see at a glance that it is a deliberate single-character exception rather
		// than a typo. U+0141 and U+0142 are the stroked L in its two cases.
		.replace(/\u0141/gu, 'L')
		.replace(/\u0142/gu, 'l');

	const podstawa = bezOgonkow
		.toLowerCase()
		.replace(/[^a-z0-9]+/gu, '-')
		.replace(/^-+|-+$/gu, '');

	if (podstawa.length <= maks) return podstawa;
	// Trimmed again after the cut: slicing mid-word can leave the hyphen that separated
	// it, and a filename ending in a hyphen is a URL ending in a hyphen.
	return podstawa.slice(0, maks).replace(/-+$/u, '');
}

/**
 * The filename an aktualność is created with: the ISO date, the slug of the title, and
 * the JSON extension.
 *
 * The date leads so the folder sorts chronologically in every tool that lists it, which
 * is how the two seed files are already named.
 *
 * A title made only of punctuation or emoji produces an empty slug, and the name is then
 * the date alone rather than a date with a dangling hyphen. That case is real: the
 * validator accepts any non-empty title, and `2026-08-14-.json` would publish a post at
 * an address ending in a hyphen that nobody would notice until they tried to share it.
 */
export function nazwaPlikuWpisu(iso: string, tytul: string): string {
	const slug = slugAscii(tytul);
	return slug.length === 0 ? `${iso}${ROZSZERZENIE_WPISU}` : `${iso}-${slug}${ROZSZERZENIE_WPISU}`;
}

/** Full repository path of an entry, from the slug the public reader exposes. Built here
 *  so no route ever concatenates a path of its own, and so the delete action and the
 *  edit action cannot disagree about where a file lives. */
export function sciezkaWpisu(slug: string): string {
	return `${KATALOG_WPISOW}/${slug}${ROZSZERZENIE_WPISU}`;
}
