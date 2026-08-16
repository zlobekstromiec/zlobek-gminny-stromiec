// The dokument form's WIRE VOCABULARY: the name of every control the two editor screens
// render and the action reads back (Phase 04.1, Plan 04.1-08).
//
// WHY IT IS NOT INSIDE THE VALIDATOR. Exactly the reason src/lib/pola-wpisu.ts records for
// the aktualność form, and it is now the fourth time this boundary has decided a module's
// location in this phase: the validator lives under src/lib/server/, SvelteKit refuses to
// bundle that directory into client code, and the page rendering the controls needs the
// identical strings the action parses. Duplicating them across a client file and a server
// file is the arrangement in which a rename breaks the save SILENTLY.
//
// THE GENERIC NAMES ARE IMPORTED, NOT RETYPED. The three date selects, the placeholder
// checkbox, the head SHA and the two query markers are not specific to a collection, so
// they are declared once in src/lib/pola-wpisu.ts and re-exported here. A second
// declaration of `dzien` would be a second thing to rename.
//
// The names are deliberately IDENTICAL to the JSON keys src/lib/content/dokumenty/*.json
// already uses, so a reader comparing a form field to a committed file does not have to
// hold a translation table in their head.
//
// This module carries NO visible string: nothing here is ever rendered to an editor. The
// Polish labels and hints live in src/lib/content/panel.ts and are swept by
// tests/admin-copy.unit.ts.
//
// Pure: no I/O, no clock. Safe on both sides of the boundary.
import {
	POLE_DZIEN,
	POLE_MIESIAC,
	POLE_ROK,
	POLE_SHA,
	POLE_ZASTEPCZA,
	ZNACZNIK_USUNIETO,
	ZNACZNIK_ZAPISANO,
	type ZrodloPol
} from './pola-wpisu.ts';

export {
	POLE_DZIEN,
	POLE_MIESIAC,
	POLE_ROK,
	POLE_SHA,
	POLE_ZASTEPCZA,
	ZNACZNIK_USUNIETO,
	ZNACZNIK_ZAPISANO
};
export type { ZrodloPol };

export const POLE_NAZWA = 'nazwa';
export const POLE_KATEGORIA = 'kategoria';

/** Hidden field the file island writes the chosen document into, as a data URL. It is the
 *  only way a document file enters this project, and its value is produced entirely in the
 *  browser (P-22). With scripting off it is never filled, which is exactly what the
 *  no-script panel beside the control promises. */
export const POLE_PLIK = 'plik';

/** The chosen file's own name and size, carried alongside the payload so a refused save can
 *  render „Wybrany plik: ..." again instead of showing an editor an empty control while a
 *  megabytes-long hidden value silently survives beside it. Display only: nothing derived
 *  from either value is ever written to a path (T-04.1-31). */
export const POLE_PLIK_NAZWA = 'plik_nazwa';
export const POLE_PLIK_ROZMIAR = 'plik_rozmiar';

/** Not a control: the stored key, reused as the ONE error key for the version date group.
 *  One fieldset, one message, per the Accessibility Contract. */
export const POLE_WERSJA = 'wersja';

export const POLE_ZRODLO = 'zrodlo_bip';

/**
 * Every value of the form, as strings, exactly as it was submitted or as it is stored.
 *
 * This is the ECHO shape, not the stored shape: it exists so a refused save hands the editor
 * back what they typed rather than an empty form (Contract 10c). It is deliberately
 * all-strings and never validated, because a value that was refused still has to be
 * rendered back into the control that holds it. The stored shape is `DokumentEntry` in
 * src/lib/server/dokumenty.ts, and the two are not interchangeable on purpose.
 */
export interface WartosciDokumentu {
	nazwa: string;
	kategoria: string;
	dzien: string;
	miesiac: string;
	rok: string;
	zrodlo: string;
	zastepcza: boolean;
	/** The prepared data URL of a file chosen but not yet saved, or empty. Echoed back on a
	 *  refusal like every other typed value: an editor whose name collided must not also
	 *  have to find and attach the file a second time. */
	plik: string;
	/** The chosen file's own name and human-readable size, for the „Wybrany plik" line. */
	plikNazwa: string;
	plikRozmiar: string;
}

/** A submitted value as a string. A file part, a missing key and a null all become the
 *  empty string, which is what a control renders as „nothing typed here". */
function tekst(surowy: unknown): string {
	return typeof surowy === 'string' ? surowy : '';
}

/** Read the echo shape. Used by both editor screens so a refusal on either one restores
 *  exactly the same set of controls. */
export function wartosciDokumentu(zrodlo: ZrodloPol): WartosciDokumentu {
	return {
		nazwa: tekst(zrodlo.get(POLE_NAZWA)),
		kategoria: tekst(zrodlo.get(POLE_KATEGORIA)),
		dzien: tekst(zrodlo.get(POLE_DZIEN)),
		miesiac: tekst(zrodlo.get(POLE_MIESIAC)),
		rok: tekst(zrodlo.get(POLE_ROK)),
		zrodlo: tekst(zrodlo.get(POLE_ZRODLO)),
		// An unticked checkbox omits its key entirely, which is the HTML convention the
		// server reader follows too: absent is false and never an error.
		zastepcza: zrodlo.get(POLE_ZASTEPCZA) !== null && zrodlo.get(POLE_ZASTEPCZA) !== undefined,
		plik: tekst(zrodlo.get(POLE_PLIK)),
		plikNazwa: tekst(zrodlo.get(POLE_PLIK_NAZWA)),
		plikRozmiar: tekst(zrodlo.get(POLE_PLIK_ROZMIAR))
	};
}

/** The empty form a create screen opens with, apart from the version date, which the route
 *  pre-selects to today. */
export function pusteWartosciDokumentu(
	dzien: string,
	miesiac: string,
	rok: string
): WartosciDokumentu {
	return {
		nazwa: '',
		kategoria: '',
		dzien,
		miesiac,
		rok,
		zrodlo: '',
		zastepcza: false,
		plik: '',
		plikNazwa: '',
		plikRozmiar: ''
	};
}
