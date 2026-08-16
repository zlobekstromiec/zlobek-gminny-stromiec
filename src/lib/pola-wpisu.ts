// The aktualność form's WIRE VOCABULARY: the name of every control the edit screens
// render and the action reads back (Phase 04.1, Plan 04.1-06).
//
// WHY IT IS NOT INSIDE THE VALIDATOR. Exactly the reason src/lib/stan-naboru.ts records
// for the recruitment switch, and it was learned there the hard way: the validator lives
// under src/lib/server/, SvelteKit refuses to bundle that directory into client code,
// and the page rendering the controls needs the identical strings the action parses.
// Duplicating them across a client file and a server file is the arrangement in which a
// rename breaks the save SILENTLY, because the form would post one name to an action
// reading another, validation would refuse a field the editor had filled in, and the
// message would tell them to complete something they had already completed.
//
// The names are deliberately IDENTICAL to the JSON keys src/lib/content/aktualnosci/*.json
// already uses, so a reader comparing a form field to a committed file does not have to
// hold a translation table in their head. The three date selects are the exception: they
// are three controls that produce ONE stored value, so they carry their own names and the
// stored key doubles as the error key for the whole group.
//
// This module carries NO visible string: nothing here is ever rendered to an editor. The
// Polish labels and hints live in src/lib/content/panel.ts and are swept by
// tests/admin-copy.unit.ts, which is where they belong.
//
// Pure: no I/O, no clock, no imports. Safe on both sides of the boundary.

export const POLE_TYTUL = 'tytul';

/** The three selects of UI-SPEC Component Contract 5. */
export const POLE_DZIEN = 'dzien';
export const POLE_MIESIAC = 'miesiac';
export const POLE_ROK = 'rok';

/** Not a control: the stored key, reused as the ONE error key for the date group. One
 *  fieldset, one message, per the Accessibility Contract. */
export const POLE_DATA = 'data';

export const POLE_ZAJAWKA = 'zajawka';
export const POLE_TRESC = 'tresc';

/** Written by the photo island of Plan 07. The validator already reads them, so the
 *  D-15 „alt is required when a photo is present" rule exists on the server before the
 *  control that can trigger it does. */
export const POLE_OBRAZ = 'obraz';
export const POLE_OBRAZ_ALT = 'obraz_alt';

export const POLE_ZASTEPCZA = 'placeholder';

/** The head SHA captured when the screen opened (D-10). Carried in a hidden field and
 *  compared before any blob is written. */
export const POLE_SHA = 'sha';

/** Query marker that turns the „Zapisano" panel on after the 303 redirect. A marker on a
 *  fresh GET rather than an action return, so a refresh can never produce a second
 *  commit and a second Cloudflare build. */
export const ZNACZNIK_ZAPISANO = 'zapisano';

/** Query marker for the deletion confirmation on the list screen. Separate from the one
 *  above because the two panels say different things: „Zapisano" and „Usunięto". */
export const ZNACZNIK_USUNIETO = 'usunieto';

/** The minimum a submitted form has to offer to be read. `FormData` satisfies it
 *  structurally, and so does a plain object in a unit suite, which is what keeps every
 *  branch of the validator drivable under `node --test` with no browser and no harness. */
export interface ZrodloPol {
	get(nazwa: string): unknown;
}

/**
 * Every value of the form, as strings, exactly as it was submitted or as it is stored.
 *
 * This is the ECHO shape, not the stored shape: it exists so a refused save hands the
 * editor back what they typed rather than an empty form (Contract 10c, „every typed value
 * intact"). It is deliberately all-strings and never validated, because a value that was
 * refused still has to be rendered back into the control that holds it. The stored shape
 * is `WpisDane` in the validator, and the two are not interchangeable on purpose.
 */
export interface WartosciWpisu {
	tytul: string;
	dzien: string;
	miesiac: string;
	rok: string;
	zajawka: string;
	tresc: string;
	zastepcza: boolean;
}

/** A submitted value as a string. A file part, a missing key and a null all become the
 *  empty string, which is what a control renders as „nothing typed here". */
function tekst(surowy: unknown): string {
	return typeof surowy === 'string' ? surowy : '';
}

/** Read the echo shape. Used by both editor screens so a refusal on either one restores
 *  exactly the same set of controls. */
export function wartosciWpisu(zrodlo: ZrodloPol): WartosciWpisu {
	return {
		tytul: tekst(zrodlo.get(POLE_TYTUL)),
		dzien: tekst(zrodlo.get(POLE_DZIEN)),
		miesiac: tekst(zrodlo.get(POLE_MIESIAC)),
		rok: tekst(zrodlo.get(POLE_ROK)),
		zajawka: tekst(zrodlo.get(POLE_ZAJAWKA)),
		tresc: tekst(zrodlo.get(POLE_TRESC)),
		// An unticked checkbox omits its key entirely, which is the HTML convention the
		// server reader follows too: absent is false and never an error.
		zastepcza: zrodlo.get(POLE_ZASTEPCZA) !== null && zrodlo.get(POLE_ZASTEPCZA) !== undefined
	};
}

/** The empty form a create screen opens with, apart from the date, which the route
 *  pre-selects to today. */
export function pusteWartosciWpisu(dzien: string, miesiac: string, rok: string): WartosciWpisu {
	return { tytul: '', dzien, miesiac, rok, zajawka: '', tresc: '', zastepcza: false };
}
