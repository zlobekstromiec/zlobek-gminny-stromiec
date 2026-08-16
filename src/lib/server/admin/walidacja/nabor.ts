// The recruitment switch validator (Phase 04.1, Plan 04.1-05; D-16, threat
// T-04.1-22).
//
// One boolean, and it still gets a validator of its own, because the value this reads
// is UNTRUSTED INPUT even though the person who sent it is authenticated. It travels
// from a form field into a JSON file, into a commit on a public repository and onto
// the front page a parent reads. An allowlist of exactly two literals is what keeps
// anything else out of that chain; src/lib/content/site.ts then consumes a boolean, so
// even a malformed value that somehow reached the file could not become a headline.
//
// Pure and dependency-free apart from the shared readers and the copy module: no
// fetch, no I/O, no clock. Nothing here logs.
import { KOPIA_WALIDACJA } from '../../../content/panel.ts';
import type { WynikPol } from './pola.ts';

/** Name of the form control, exported so the route, the page and the spec all read one
 *  source instead of retyping a string that has to match in three places. */
export const POLE_STAN = 'stan';

/** The only two values this action accepts. Not a boolean on the wire: two radios post
 *  a word, and „otwarty"/„zamkniety" says in the request what it means, so a stray
 *  „on" or „true" from anywhere else is refused rather than coerced. */
export const STAN_OTWARTY = 'otwarty';
export const STAN_ZAMKNIETY = 'zamkniety';

/** Exactly the shape src/lib/content/nabor.json holds. The panel serializes THIS
 *  object, so the file's shape and the validator's output cannot drift; the unit suite
 *  asserts the serialized form byte for byte against the committed file. */
export interface NaborDane {
	otwarty: boolean;
}

/**
 * Read the submitted recruitment state.
 *
 * An absent field is a failure rather than a default. Defaulting would mean a request
 * that simply omitted the control silently closed the nabór, which is a state change
 * nobody asked for and which a parent would see on the front page within two minutes.
 */
export function walidujNabor(surowy: unknown): WynikPol<NaborDane> {
	if (surowy === STAN_OTWARTY) return { ok: true, dane: { otwarty: true } };
	if (surowy === STAN_ZAMKNIETY) return { ok: true, dane: { otwarty: false } };
	// Both the untouched form and an unexpected value land here on purpose: see the
	// comment on KOPIA_WALIDACJA.stanNaboruBrak for why they share one instruction.
	return { ok: false, pola: { [POLE_STAN]: KOPIA_WALIDACJA.stanNaboruBrak } };
}

/** The value to render as the checked radio when the form comes back. Kept beside the
 *  validator so the page never has to know which literal means which boolean. */
export function stanZWartosci(otwarty: boolean): string {
	return otwarty ? STAN_OTWARTY : STAN_ZAMKNIETY;
}
