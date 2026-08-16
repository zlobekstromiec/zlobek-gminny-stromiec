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
import { POLE_STAN, STAN_OTWARTY, STAN_ZAMKNIETY, stanZWartosci } from '../../../stan-naboru.ts';
import type { WynikPol } from './pola.ts';

// Re-exported rather than redeclared, so a caller on the server may keep importing the
// whole vocabulary from the validator beside it while exactly one definition exists. The
// page cannot import from this file at all: see the header of src/lib/stan-naboru.ts.
export { POLE_STAN, STAN_OTWARTY, STAN_ZAMKNIETY, stanZWartosci };

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
