// Where a cover photo lands, what it may be called, and which names already exist
// (Phase 04.1, Plan 04.1-07; D-14, P-19, P-20, Pitfall 4, threat T-04.1-10).
//
// TWO PROPERTIES OF A FILENAME MATTER HERE, and both of them fail silently when they are
// wrong, which is why this module exists instead of two string joins inside two routes.
//
// 1. THE NAME MUST LAND INSIDE THE BUILD GLOB. The three public consumers resolve a cover
//    by globbing this directory for a fixed set of extensions and keying the result by the
//    final path segment. A name outside that set is simply absent from the map, and an
//    absent key yields the decorative tint fallback: the post publishes, the build
//    succeeds, nothing warns, and the picture the editor chose is never rendered. So the
//    extension is forced to the lowercase one the island always produces, an upper-case
//    variant is unreachable by construction, and the modern format the site's own
//    optimizer emits as a DERIVATIVE (avif) is deliberately not in the accepted input set.
//
// 2. THE LOOKUP BEING BY NAME IS THE PATH TRAVERSAL DEFENCE (T-04.1-10, inherited from
//    T-03-03). An unknown name yields that same fallback rather than a read of an
//    arbitrary path, so nothing a request can put in the stored field turns into a file
//    the site opens. This module keeps that true from the writing side as well: the name a
//    save writes is GENERATED from the entry, never accepted from the request, and the one
//    value that does arrive from a request, the cover an edit screen carries back, is
//    admitted only if it matches a character class with no separator and no dot run in it.
//
// Nothing here logs. Pure apart from the build-time glob, which is a compile-time
// substitution rather than a filesystem read at runtime.

/** Repository path of the directory the three public consumers glob. No trailing slash:
 *  callers join with one, exactly as slug.ts does for the entries folder. */
export const KATALOG_UPLOADS = 'src/lib/assets/uploads';

/** The extension every generated cover carries. Lowercase, and fixed rather than derived
 *  from the upload, because the island re-encodes to the type named by TYP_OKLADKI in
 *  src/lib/zdjecia.ts whatever it was given, so the extension is fully determined. */
export const ROZSZERZENIE = '.jpg';

/**
 * The cover basename of one entry (P-19).
 *
 * Named after the entry's own filename stem, so it is date prefixed, unique for that entry
 * by construction, obviously paired with its JSON in a directory listing, and, because the
 * stem has already been through the slug generator, guaranteed to be lowercase ASCII
 * letters, digits and single hyphens. There is no second slug pass here on purpose: a
 * second implementation of that transformation is a second chance to lose a stroked l.
 */
export function nazwaOkladki(stemWpisu: string): string {
	return `${stemWpisu}${ROZSZERZENIE}`;
}

/** Exactly what `slugAscii` can produce, followed by one of the extensions the build glob
 *  accepts. No separator, no dot run, no upper case, so a value matching this cannot name
 *  anything outside the uploads directory however it is joined. */
const WZORZEC_NAZWY = /^[a-z0-9]+(?:-[a-z0-9]+)*\.(?:jpg|jpeg|png|webp)$/;

/**
 * A cover basename that arrived in a request, or null.
 *
 * The edit screen carries the entry's current cover back in a hidden field so a save that
 * changes only the title keeps the picture. That value is therefore client controlled, and
 * it is the one string in this phase that could otherwise reach a written path, which is
 * why it is admitted by an allowlist rather than cleaned up. Everything else, the create
 * screen included, uses `nazwaOkladki` and never asks a person for a filename at all.
 */
export function bezpiecznaNazwaOkladki(wartosc: unknown): string | null {
	if (typeof wartosc !== 'string') return null;
	const nazwa = wartosc.trim();
	return WZORZEC_NAZWY.test(nazwa) ? nazwa : null;
}

/** Full repository path of a cover. Takes an already-admitted basename, so the join
 *  cannot escape the directory, and exists so no route concatenates a path of its own. */
export function sciezkaOkladki(nazwa: string): string {
	return `${KATALOG_UPLOADS}/${nazwa}`;
}

/**
 * Every cover basename present in the build the panel is running on.
 *
 * The pattern is the one the three public consumers use, character for character, so the
 * accepted extension set cannot drift between what the site can render and what the panel
 * believes exists. Only the KEYS are taken: the values are processed picture objects meant
 * for a browser, and this module runs on the server.
 *
 * THE ANSWER IS THE LAST BUILD, NEVER THE REPOSITORY, which is the same two-minute window
 * every reading screen in this panel lives with. It is used for one decision only, whether
 * a deletion should also remove a cover, and in that direction being out of date is safe:
 * an unknown name simply means „do not delete anything", never „delete something else".
 */
export function istniejaceNazwy(): ReadonlySet<string> {
	const pliki = import.meta.glob('$lib/assets/uploads/*.{jpg,jpeg,png,webp}', {
		query: { enhanced: true },
		eager: true,
		import: 'default'
	});
	const nazwy = new Set<string>();
	for (const sciezka of Object.keys(pliki)) {
		const nazwa = sciezka.split('/').pop();
		if (nazwa) nazwy.add(nazwa);
	}
	return nazwy;
}

/**
 * The cover path a deletion may safely remove, or null (P-18).
 *
 * THREE CONDITIONS, and the first one is stricter than the plan asked for, deliberately.
 *
 *  1. The name must be the one THIS entry's stem generates. A cover the panel created is
 *     named after its entry and belongs to nothing else, so removing it with the entry
 *     leaves no orphan. A cover that carries any other name was put there by hand and may
 *     be shared: both seed images in this repository are referenced by the o nas page as
 *     well, and a rule that only asked „does another aktualność use it" would have removed
 *     a picture the o nas page renders. Leaving an unreferenced legacy file behind costs a
 *     few kilobytes in a directory listing; deleting a shared one breaks a public page.
 *  2. No other entry may point at the name, which is the check P-18 named. Reachable only
 *     by hand-edited content today, and cheap enough to keep as defence in depth.
 *  3. The file must be present in the build. Nothing to delete otherwise, and asking git to
 *     remove a path that is not there fails the whole atomic save, which would turn a
 *     successful deletion into a Polish error panel for no reason.
 */
export function okladkaDoUsuniecia(
	slug: string,
	obraz: string | undefined,
	obrazyInnychWpisow: readonly (string | undefined)[]
): string | null {
	if (obraz === undefined) return null;
	const nazwa = bezpiecznaNazwaOkladki(obraz.split('/').pop());
	if (nazwa === null) return null;
	if (nazwa !== nazwaOkladki(slug)) return null;
	const uzywana = obrazyInnychWpisow.some((inny) => inny !== undefined && inny.endsWith(nazwa));
	if (uzywana) return null;
	if (!istniejaceNazwy().has(nazwa)) return null;
	return sciezkaOkladki(nazwa);
}
