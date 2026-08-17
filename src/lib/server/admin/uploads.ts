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
import { slugAscii } from './slug.ts';
import { bazowaNazwa, wedlugBazowejNazwy } from '../../zdjecia-nazwy.ts';

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
 *
 * THE GLOB HERE DELIBERATELY OMITS THE ENHANCED QUERY, unlike the two rendering consumers.
 * This module runs on the SERVER and takes only the keys, so asking the image optimizer for
 * processed picture objects would pull work and bytes nobody reads into the Worker bundle.
 * The pattern itself is still the public one character for character, which is what keeps the
 * accepted extension set from drifting between what the site can render and what the panel
 * believes exists. The glob stays inline rather than moving into the shared mapper because
 * Vite analyses it statically and its arguments must be literals at their own call site
 * (see the header of src/lib/zdjecia-nazwy.ts).
 */
export function istniejaceNazwy(): ReadonlySet<string> {
	const pliki = import.meta.glob('$lib/assets/uploads/*.{jpg,jpeg,png,webp}', {
		eager: true,
		import: 'default'
	});
	return new Set(Object.keys(wedlugBazowejNazwy(pliki)));
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
	obrazyInnychWpisow: readonly (string | undefined)[],
	// Injected by the unit suite, exactly as every other side effect in this phase is, so
	// the whole decision is drivable with no build and no browser. The default is evaluated
	// only when a caller omits it, which is why importing this module costs nothing under a
	// plain test runner.
	istniejace: ReadonlySet<string> = istniejaceNazwy()
): string | null {
	if (obraz === undefined) return null;
	const nazwa = bezpiecznaNazwaOkladki(bazowaNazwa(obraz));
	if (nazwa === null) return null;
	if (nazwa !== nazwaOkladki(slug)) return null;
	const uzywana = obrazyInnychWpisow.some((inny) => inny !== undefined && inny.endsWith(nazwa));
	if (uzywana) return null;
	if (!istniejace.has(nazwa)) return null;
	return sciezkaOkladki(nazwa);
}

// ---------------------------------------------------------------------------------------
// O nas facility photos (Plan 04.1-09, P-25).
//
// An o nas photo has neither of the two things a cover is named from: no publication date
// and no entry slug. The only human-meaningful thing it carries is its own alt text, which
// D-15 already makes required, so that is what the name is derived from.
//
// THE PREFIX DOES TWO JOBS, and the second one is why it is not merely decorative. It keeps
// the uploads directory readable, which is the reason P-25 gives; and it is the marker that
// says „the panel generated this name for the o nas page", which is what makes the deletion
// rule below safe. The identical reasoning is written out at `okladkaDoUsuniecia`: both
// pictures currently in this directory were placed by hand and are rendered by BOTH the o
// nas page and a seeded aktualność, so a deletion rule that only asked „does anything else
// point at this name" would eventually remove a file a public page renders.
// ---------------------------------------------------------------------------------------

/** Prefix of every basename this panel generates for an o nas facility photo. */
export const PREFIKS_O_NAS = 'obiekt-';

/** Longest slug taken from an alt sentence. An alt is a whole sentence and a filename made
 *  of one is unreadable in a directory listing, which is the thing the prefix exists to
 *  protect. */
export const MAKS_RDZENIA_O_NAS = 40;

/** Used when the alt slugs to nothing, which is reachable: „..." is a legal alt as far as
 *  the text rules are concerned and produces an empty slug. A bare prefix would give a
 *  filename that is only a prefix and a dot. */
const RDZEN_ZAPASOWY = 'zdjecie';

/**
 * The basename a NEW o nas photo is written under (P-25).
 *
 * `zajete` is every name that must not be taken: the basenames already in the build PLUS
 * the ones handed out earlier in the same submission, because several photos can arrive at
 * once and two of them can carry the same description. When the derived name is taken, an
 * ascending numeric suffix is appended rather than the existing file being overwritten:
 * overwriting would replace a picture that another item, or the aktualności collection,
 * still points at.
 *
 * A REPLACEMENT DOES NOT COME THROUGH HERE. When an item already has a panel-generated
 * basename and the editor chooses a new picture for it, the new bytes are written at the
 * name the item already has, which is P-21 exactly: a replacement is an overwrite in place
 * and needs neither a new name nor a deletion. The consequence, recorded because it is
 * visible: after an alt edit the filename no longer echoes the description. The name is a
 * readability aid, never an identity, and the alternative costs an orphaned file plus a
 * moved URL for every wording fix.
 */
export function nazwaZdjeciaONas(alt: string, zajete: ReadonlySet<string>): string {
	const rdzen = slugAscii(alt, MAKS_RDZENIA_O_NAS) || RDZEN_ZAPASOWY;
	const podstawa = `${PREFIKS_O_NAS}${rdzen}`;
	if (!zajete.has(`${podstawa}${ROZSZERZENIE}`)) return `${podstawa}${ROZSZERZENIE}`;
	// From two, because the unsuffixed name IS the first one. Bounded by the group size the
	// form can post, so this cannot spin.
	for (let numer = 2; numer < 1000; numer++) {
		const kandydat = `${podstawa}-${numer}${ROZSZERZENIE}`;
		if (!zajete.has(kandydat)) return kandydat;
	}
	// Unreachable through the panel: the group is capped far below this. Answering with the
	// suffixed name anyway is still better than an unbounded loop or a throw, because the
	// caller's own collision check is what decides whether it may be written.
	return `${podstawa}-1000${ROZSZERZENIE}`;
}

/**
 * The path a save may safely remove when a facility photo leaves the o nas list, or null.
 *
 * FOUR CONDITIONS, and the first is the one Plan 07 had to learn:
 *
 *  1. The name must carry the prefix this module generates. A picture placed by hand may be
 *     shared with any other surface, and both of the ones in this repository are: the o nas
 *     page and a seeded aktualność render the same two files. Leaving an unreferenced
 *     legacy file behind costs a few kilobytes in a directory listing; deleting a shared
 *     one breaks a public page.
 *  2. It must be admissible as a basename at all, by the same allowlist a cover goes
 *     through, so nothing that arrived in a request can name a path outside this directory.
 *  3. Nothing else may point at it: neither a photo still in the submitted list nor an
 *     aktualność cover. Defence in depth given condition 1, and cheap.
 *  4. The file must be present in the build. Asking git to remove a path that is not in the
 *     tree fails the whole atomic save, which would turn a successful edit into a Polish
 *     error panel for no reason.
 */
export function zdjecieONasDoUsuniecia(
	plik: string,
	nadalUzywane: readonly (string | undefined)[],
	// Injected exactly as it is for a cover, so the whole decision is drivable under a plain
	// test runner with no build and no browser. The default is evaluated only when a caller
	// omits it.
	istniejace: ReadonlySet<string> = istniejaceNazwy()
): string | null {
	const nazwa = bezpiecznaNazwaOkladki(bazowaNazwa(plik));
	if (nazwa === null) return null;
	if (!nazwa.startsWith(PREFIKS_O_NAS)) return null;
	const uzywana = nadalUzywane.some((inny) => inny !== undefined && inny.endsWith(nazwa));
	if (uzywana) return null;
	if (!istniejace.has(nazwa)) return null;
	return sciezkaOkladki(nazwa);
}

// ---------------------------------------------------------------------------------------
// Gallery photos (Phase 05, Plan 05-06; GALLERY-02, 05 D-23 to D-26; 05-UI-SPEC Contract 8).
//
// THE TWO FUNCTIONS BELOW ARE REPRODUCED FROM THE O NAS BLOCK ABOVE, NOT SHARED WITH IT
// BEHIND A PREFIX PARAMETER, and that is a deliberate refusal to remove a duplication. The
// four conditions of the deletion rule ARE the ownership rule of this repository's uploads
// directory: a single generic function parameterised by prefix would make one careless edit
// able to weaken the o nas rule and the gallery rule at the same time, in one commit, with
// one test file to notice it. Two readable copies with two doc comments cost twenty lines;
// one shared copy costs the property.
//
// A NEW PREFIX RATHER THAN THE EXISTING `obiekt-` ONE (05-UI-SPEC Contract 8 resolves the
// open discretion question). There is no `obiekt-` prefixed file in this repository today, so
// the „every photo an editor already uploaded keeps the old prefix" cost of a new prefix does
// not exist, while reusing it would leave a module whose name and comments permanently
// misdescribe which page owns the files.
//
// THREE CONSEQUENCES, stated here rather than discovered later:
//
//  1. `sala-zabaw.jpg` and `plac-zabaw.jpg` were placed here BY HAND and carry no panel
//     prefix, so the panel CANNOT delete them and must not try. An editor who removes one
//     from the gallery list sees it disappear from the page while the file stays in git.
//     That is correct behaviour, not a leak, and a later plan must not „fix" it.
//  2. `sala-zabaw.jpg` is also the cover of the seeded aktualność
//     `2026-08-01-wielkie-otwarcie-zlobka.json`. Deleting it would degrade that post's cover
//     to the decorative tint fallback (05 D-26), which is the second, independent reason the
//     prefix condition comes first.
//  3. Replacing a photo the panel itself named overwrites IN PLACE (P-21); replacing a
//     hand-placed one never does, because there is no panel-generated name to overwrite.
// ---------------------------------------------------------------------------------------

/** Prefix of every basename this panel generates for a gallery photo. */
export const PREFIKS_GALERII = 'galeria-';

/** Longest slug taken from a caption. A caption is already short, but nothing stops an editor
 *  from pasting a paragraph into it, and a filename made of one is unreadable in a directory
 *  listing, which is the thing the prefix exists to protect. */
export const MAKS_RDZENIA_GALERII = 40;

/** Used when neither the caption nor the alt slugs to anything, which is reachable: „..." is
 *  a legal caption as far as the text rules are concerned and produces an empty slug. A bare
 *  prefix would give a filename that is only a prefix and a dot. */
const RDZEN_ZAPASOWY_GALERII = 'zdjecie';

/**
 * The basename a NEW gallery photo is written under.
 *
 * THE CORE COMES FROM THE CAPTION, not from the alt, and that is the one deliberate
 * difference from `nazwaZdjeciaONas` above. The caption is the short room name („Sala zabaw")
 * and makes a filename a person can read in a directory listing; a gallery alt is a whole
 * descriptive sentence (05 D-25) and would make one nobody can. The alt is the fallback,
 * because an item can in principle carry a caption that slugs to nothing.
 *
 * `zajete` is every name that must not be taken: the basenames already in the build PLUS the
 * ones handed out earlier in the same submission, because up to twelve photos arrive at once
 * and two of them can carry the same caption. When the derived name is taken, an ascending
 * numeric suffix is appended rather than the existing file being overwritten: overwriting
 * would replace a picture another item, or the aktualności collection, still points at.
 *
 * A REPLACEMENT DOES NOT COME THROUGH HERE (P-21): when an item already has a panel-generated
 * basename and the editor chooses a new picture for it, the new bytes are written at the name
 * the item already has.
 */
export function nazwaZdjeciaGalerii(
	podpis: string,
	alt: string,
	zajete: ReadonlySet<string>
): string {
	const rdzen =
		slugAscii(podpis, MAKS_RDZENIA_GALERII) ||
		slugAscii(alt, MAKS_RDZENIA_GALERII) ||
		RDZEN_ZAPASOWY_GALERII;
	const podstawa = `${PREFIKS_GALERII}${rdzen}`;
	if (!zajete.has(`${podstawa}${ROZSZERZENIE}`)) return `${podstawa}${ROZSZERZENIE}`;
	// From two, because the unsuffixed name IS the first one. Bounded by the group size the
	// form can post, so this cannot spin.
	for (let numer = 2; numer < 1000; numer++) {
		const kandydat = `${podstawa}-${numer}${ROZSZERZENIE}`;
		if (!zajete.has(kandydat)) return kandydat;
	}
	// Unreachable through the panel: the gallery is capped at twelve. Answering with the
	// suffixed name anyway is still better than an unbounded loop or a throw.
	return `${podstawa}-1000${ROZSZERZENIE}`;
}

/**
 * The path a save may safely remove when a photo leaves the gallery list, or null.
 *
 * FOUR CONDITIONS, all four required, in this order:
 *
 *  1. The value must reduce to an admissible basename at all, by the same allowlist a cover
 *     goes through, so nothing that arrived in a request can name a path outside the uploads
 *     directory however it is joined.
 *  2. That basename must carry the GALLERY prefix. This is the condition that protects the
 *     two hand-placed seed files: neither of them carries it, so neither is reachable by this
 *     function under any combination of the other three inputs.
 *  3. Nothing still in use may point at it: neither a photo still in the submitted gallery
 *     list nor an aktualność cover. Defence in depth given condition 2, and cheap.
 *  4. The file must be present in the build. Asking git to remove a path that is not in the
 *     tree fails the whole atomic save, which would turn a successful edit into a Polish
 *     error panel for no reason.
 */
export function zdjecieGaleriiDoUsuniecia(
	plik: string,
	nadalUzywane: readonly (string | undefined)[],
	// Injected exactly as it is for a cover and for an o nas photo, so the whole decision is
	// drivable under a plain test runner with no build and no browser. The default is
	// evaluated only when a caller omits it.
	istniejace: ReadonlySet<string> = istniejaceNazwy()
): string | null {
	const nazwa = bezpiecznaNazwaOkladki(bazowaNazwa(plik));
	if (nazwa === null) return null;
	if (!nazwa.startsWith(PREFIKS_GALERII)) return null;
	const uzywana = nadalUzywane.some((inny) => inny !== undefined && inny.endsWith(nazwa));
	if (uzywana) return null;
	if (!istniejace.has(nazwa)) return null;
	return sciezkaOkladki(nazwa);
}
