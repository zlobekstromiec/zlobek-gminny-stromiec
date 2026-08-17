// The gallery reader (Phase 05, Plan 05-06; GALLERY-01, GALLERY-02, 05 D-25, D-26).
//
// WHAT IT IS ACCOUNTABLE TO: a prerendered public page and a panel screen that both read
// src/lib/content/galeria.json, a file the editorial panel writes and a person can also hand
// edit in a pull request. So this module follows the matured reader discipline of
// src/lib/server/aktualnosci.ts rather than trusting a compile-time shape: the entry is typed
// `unknown`, the container is guarded BEFORE any property access, every string goes through
// one narrowing primitive, the result is CONSTRUCTED KEY BY KEY and never spread, and a
// malformed entry is warned about and skipped rather than thrown. One bad JSON value must not
// abort the whole-site prerender.
//
// WHY IT IS IN $lib AND NOT $lib/server. The panel's pulpit counter reads it too, and that
// route runs inside the Cloudflare Worker. The same boundary src/lib/zdjecia.ts records:
// SvelteKit refuses at build time to bundle src/lib/server/ into anything else, so a reader
// two sides need lives here. Nothing in this module touches the filesystem or a glob, which
// is what keeps it safe on both sides and drivable under a plain test runner.
//
// This module carries NO visible string: the captions and the alt text are CONTENT, read out
// of the store, and the panel's own labels live in src/lib/content/panel.ts.
import { bazowaNazwa } from './zdjecia-nazwy.ts';

/** Exactly the shape one entry of src/lib/content/galeria.json holds, in its key order. */
export interface ZdjecieGalerii {
	/** Bare basename inside src/lib/assets/uploads (04.1 P-20). */
	plik: string;
	/** The short room name shown under the picture on the public page (05 D-25). */
	podpis: string;
	/** What is in the picture, for a screen reader. Never the same string as the caption. */
	alt: string;
}

/** One entry plus the processed picture the build carries for it. */
export type ZdjecieGaleriiZObrazem<T> = ZdjecieGalerii & { obraz: T };

/** Return `wartosc` when it is a string with non-whitespace content, otherwise undefined. The
 *  single narrowing primitive of this reader: every field below passes through it, which is
 *  what stops an unvalidated value reaching a consumer. Same shape and same reason as
 *  `readString` in src/lib/server/aktualnosci.ts. */
function czytajTekst(wartosc: unknown): string | undefined {
	return typeof wartosc === 'string' && wartosc.trim() !== '' ? wartosc : undefined;
}

/**
 * One stored entry as a gallery photo, or null.
 *
 * ALL THREE FIELDS ARE REQUIRED, which mirrors the save-time refusals exactly: the panel
 * refuses to store a photo with a blank caption or a blank alt (05 D-25), so an entry missing
 * either one can only have arrived by hand and is content nobody checked. Dropping it costs
 * one tile; rendering it costs the page an unlabelled image, which is a WCAG 1.1.1 failure on
 * a public body's website.
 */
export function zdjecieGalerii(wpis: unknown): ZdjecieGalerii | null {
	// An entry holding null, an array, a bare string or a number would throw on the first
	// property access, before any field guard could run.
	if (typeof wpis !== 'object' || wpis === null || Array.isArray(wpis)) return null;
	const rekord = wpis as Record<string, unknown>;
	const plik = czytajTekst(rekord.plik);
	const podpis = czytajTekst(rekord.podpis);
	const alt = czytajTekst(rekord.alt);
	if (plik === undefined || podpis === undefined || alt === undefined) return null;
	// Key by key from guarded locals only, never `...wpis`.
	const zdjecie: ZdjecieGalerii = { plik, podpis, alt };
	return zdjecie;
}

/**
 * Every usable photo in the store, in stored order.
 *
 * A malformed container WARNS and returns an empty list rather than throwing: this reader runs
 * during the whole-site prerender and inside the panel's pulpit, and neither of those may be
 * taken down by one bad value in one JSON file.
 */
export function czytajGalerie(dane: unknown): ZdjecieGalerii[] {
	if (typeof dane !== 'object' || dane === null || Array.isArray(dane)) {
		console.warn('galeria: pomijam store (nie jest obiektem JSON)');
		return [];
	}
	const lista = (dane as Record<string, unknown>).zdjecia;
	if (!Array.isArray(lista)) {
		console.warn('galeria: pomijam store (brak listy zdjęć)');
		return [];
	}
	const zdjecia: ZdjecieGalerii[] = [];
	for (const wpis of lista) {
		const zdjecie = zdjecieGalerii(wpis);
		if (zdjecie !== null) zdjecia.push(zdjecie);
	}
	return zdjecia;
}

/**
 * The list a page renders: every photo whose file is really among the processed uploads.
 *
 * THE DROP IS WHAT MAKES „the lightbox can never open onto nothing" TRUE (05-UI-SPEC
 * Contract 2). It is the filter src/routes/o-nas/+page.svelte already applies to the facility
 * photographs, moved here rather than re-derived, so the gallery cannot acquire a second
 * answer to the same question. A stored name the build does not carry means the picture was
 * removed outside the panel; the entry is dropped at BUILD time and no consumer downstream
 * needs a guard of its own.
 *
 * Separate from `czytajGalerie` on purpose: the panel's pulpit counter has no picture map and
 * must count what the EDITING SCREEN will show, which is the stored list.
 *
 * THE MEMBERSHIP TEST IS `Object.hasOwn`, NEVER `!== undefined` (T-05-07-02). The map arrives
 * from `wedlugBazowejNazwy`, which builds a plain object, and a plain object answers
 * `constructor`, `__proto__`, `toString`, `valueOf` and `hasOwnProperty` off its prototype.
 * Asking only whether the lookup came back defined therefore ADMITS those five names with
 * `obraz` bound to a function instead of a picture, and the first `obraz.img.src` on /o-nas
 * throws a TypeError in the middle of the whole-site prerender — which is exactly the
 * „one bad entry can never abort the prerender" property this filter exists to hold. The
 * store is hand-editable and `zdjecieGalerii` constrains `plik` no further than „it is a
 * string", so those names are genuinely in reach; the panel's own upload path is narrower
 * only because `WZORZEC_NAZWY` forces an image extension on it.
 */
export function galeriaZObrazami<T>(
	zdjecia: readonly ZdjecieGalerii[],
	wedlugNazwy: Record<string, T>
): ZdjecieGaleriiZObrazem<T>[] {
	const doRenderu: ZdjecieGaleriiZObrazem<T>[] = [];
	for (const zdjecie of zdjecia) {
		const nazwa = bazowaNazwa(zdjecie.plik);
		if (!Object.hasOwn(wedlugNazwy, nazwa)) continue;
		const obraz = wedlugNazwy[nazwa];
		if (obraz === undefined) continue;
		doRenderu.push({ plik: zdjecie.plik, podpis: zdjecie.podpis, alt: zdjecie.alt, obraz });
	}
	return doRenderu;
}
