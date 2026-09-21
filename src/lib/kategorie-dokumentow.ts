// The document category union and its fixed order (Phase 04.1, Plan 04.1-08; D-13, P-24).
//
// WHY IT IS NOT INSIDE src/lib/server/dokumenty.ts, where it used to live. That module
// imports node:fs, because the PUBLIC reader stats each file on disk at build time to
// compute its size (D-14). The panel is not prerendered: its routes run inside the
// Cloudflare Worker, and this deployment enables only the async-local-storage compatibility
// flag, so anything the panel imports that reaches node:fs would be bundled into the Worker
// and fail there. The union, the order and the type therefore live in a module with no
// imports at all, and the public reader imports them back and re-exports the type, so
// exactly ONE declaration exists and nothing that already imported `Kategoria` from the
// reader had to change. Same arrangement, and the same reason, as src/lib/daty.ts in Plan
// 04.1-06 and src/lib/zdjecia.ts in Plan 04.1-07.
//
// THE ORDER IS PART OF THE CONTRACT. The public page groups by it, the panel lists by it
// and the panel's category select offers its options in it, so a category renamed or
// reordered here moves all three at once and cannot move only one.
//
// P-24: the RODO category STAYS. It was dormant on the public page under a Phase 2
// decision (D-13: the group appears only once it holds a document), and quietly dropping it
// from the panel would have stranded any entry that already used it with no screen able to
// edit it. It WOKE on 2026-09-21, when the inspektor ochrony danych delivered seven
// klauzule and a piktogram, and the dormancy rule itself is untouched: it simply has
// documents now.
//
// „organizacja" JOINED ON THE SAME DAY, between `statut` and `rodo`. The żłobek sent three
// documents that are neither rekrutacja paperwork nor an uchwała nor a RODO klauzula (the
// regulamin organizacyjny, the standardy ochrony małoletnich and the zasady adaptacji), and
// filing them under „Statut i uchwały" would have told a parent they are acts of the Rada
// Gminy, which none of them is. Its POSITION is the editorial claim: the two documents that
// bind the żłobek's day come after the acts that create it and before the data-protection
// paperwork.
//
// This module carries NO visible string: the Polish headings live in
// src/lib/server/dokumenty.ts for the public page and in src/lib/content/panel.ts for the
// panel, which is where the copy sweep governs them. Pure: no I/O, no clock, no imports.

export type Kategoria = 'rekrutacja' | 'statut' | 'organizacja' | 'rodo';

/** Every category, in the fixed order both the public page and the panel render. */
export const KATEGORIE: readonly Kategoria[] = Object.freeze([
	'rekrutacja',
	'statut',
	'organizacja',
	'rodo'
] as const);

/** True when a stored value is one of the four. Used by the validator rather than a
 *  retyped list, so the panel cannot accept a category the site does not group. */
export function jestKategoria(wartosc: unknown): wartosc is Kategoria {
	return typeof wartosc === 'string' && (KATEGORIE as readonly string[]).includes(wartosc);
}

/**
 * The category select's options: the shared values paired POSITIONALLY with labels the
 * caller read out of src/lib/content/panel.ts.
 *
 * The labels arrive as an argument rather than being imported, so this module keeps its
 * promise to carry no visible string and the Polish-only sweep keeps governing them where
 * they live. Pairing them in one function rather than in each screen is what stops a select
 * that offers fewer labels than there are values, which would silently post an empty
 * category the server then refuses for a reason nobody could see.
 *
 * A missing label falls back to the value rather than to an empty option: an option with no
 * text is unreachable for everybody, and a visible English-looking key is at least a visible
 * defect. The suite asserts the two lists are the same length, so the fallback is
 * unreachable in practice.
 */
export function opcjeKategorii(
	etykiety: readonly string[]
): { wartosc: string; etykieta: string }[] {
	return KATEGORIE.map((kategoria, i) => ({
		wartosc: kategoria,
		etykieta: etykiety[i] ?? kategoria
	}));
}
