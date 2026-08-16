// Shared field readers for every panel form (Phase 04.1, Plan 04.1-05).
//
// Pure and dependency-free apart from the forms sanitizer, so `node --test` can drive
// every branch with no harness: no fetch, no I/O, no runtime globals, no clock. That
// is the same rule src/lib/server/forms/sanitize.ts states about itself, and it is
// what lets a collection validator built on these readers be proven without a browser.
//
// NOTHING HERE LOGS. A panel field can carry a staff-authored sentence and, in later
// plans, an entry title; neither belongs in a log line, for the same reason the forms
// sanitizers stay silent (RODO, C-03).
//
// EVERY READER REJECTS, IT NEVER REPAIRS. That is inherited verbatim from
// sanitize.ts: a silently corrected value is a different value, and here it would be
// committed to a public repository and published on the żłobek's website. A rejected
// field comes back to the editor with a Polish instruction; a repaired one comes back
// to nobody.
//
// This module deals in SHORT STABLE KEYS and never in Polish prose. The copy lives in
// src/lib/content/panel.ts and the mapping from a key to a sentence belongs to the
// per-collection validator beside this file, which is what keeps the long-prose copy
// rules (no emoji, no em dash, Polish only) enforceable by one sweep over one module.
import { bezpiecznyTekst } from '../../forms/sanitize.ts';

/** The field was left alone, or a required control never arrived. */
export const BLAD_BRAK = 'brak';
/** The field carries something, and that something is not acceptable. */
export const BLAD_NIEPOPRAWNY = 'niepoprawny';
/** The field is acceptable in shape and too long for the cap the server enforces. */
export const BLAD_ZBYT_DLUGI = 'zbyt-dlugi';

export type KluczBledu = typeof BLAD_BRAK | typeof BLAD_NIEPOPRAWNY | typeof BLAD_ZBYT_DLUGI;

/** Result union of a collection validator, shaped on `WynikWalidacji` in
 *  src/lib/server/forms/validate.ts. The `zgoda` arm of that union has no meaning
 *  here: a panel form carries no RODO consent, because the editor is not a data
 *  subject of their own edit. The failure arm therefore carries only the per-field
 *  map, and it is never empty: a validator that failed without naming a field would
 *  render a summary panel with nothing to link to. */
export type WynikPol<T> = { ok: true; dane: T } | { ok: false; pola: Record<string, string> };

/** Absent, null, or whitespace only. An untouched `<select>` and an untouched
 *  `<input>` both post an empty string rather than nothing at all, which is why this
 *  cannot simply be an undefined check. Copied in spirit from `pusty` in
 *  src/lib/server/forms/validate.ts. */
export function pusty(surowy: unknown): boolean {
	if (surowy === undefined || surowy === null) return true;
	return typeof surowy === 'string' && surowy.trim().length === 0;
}

/** Why a reader said no, in the vocabulary above. Takes the raw value AND the
 *  reader's answer, because „empty" and „too long" are not distinguishable from a
 *  null alone, and the UI-SPEC error table has a separate sentence for each. */
export function kodBledu(surowy: unknown, wynik: unknown, maks: number): KluczBledu | null {
	if (wynik !== null && wynik !== undefined) return null;
	if (pusty(surowy)) return BLAD_BRAK;
	if (typeof surowy === 'string' && surowy.trim().length > maks) return BLAD_ZBYT_DLUGI;
	return BLAD_NIEPOPRAWNY;
}

/** Required narrative or single-line text, with the cap the field's own hint states.
 *  Built on `bezpiecznyTekst` rather than on a second implementation of it, so the
 *  control-character strip and the runaway-blank-line collapse the public forms
 *  already rely on apply to panel content too. */
export function tekstWymagany(surowy: unknown, maks: number): string | null {
	return bezpiecznyTekst(surowy, maks);
}

/**
 * Optional text.
 *
 * Three outcomes, deliberately, because two would lose the difference that matters:
 *  • `undefined` means the editor left the control alone, which is valid;
 *  • `null` means they typed something and it was refused;
 *  • a string is the accepted value.
 *
 * Collapsing the first two would make an over-long optional field indistinguishable
 * from an untouched one, and the editor would watch their text vanish on save with no
 * message. Same reasoning as the optional telefon and wiadomosc fields in
 * src/lib/server/forms/validate.ts.
 */
export function tekstOpcjonalny(surowy: unknown, maks: number): string | null | undefined {
	if (pusty(surowy)) return undefined;
	return bezpiecznyTekst(surowy, maks);
}

/** Base-ten integer inside an inclusive range. The digit shape is checked BEFORE the
 *  parse, because `Number.parseInt` accepts „12abc" and returns 12 and `Number`
 *  accepts „12.0" and „ 12 \n". Same guard as `liczbaCalkowita` in the forms
 *  validator, restated here so this module keeps its zero-coercion promise. */
export function liczbaWZakresie(surowy: unknown, min: number, maks: number): number | null {
	let wartosc: number;
	if (typeof surowy === 'number') {
		if (!Number.isInteger(surowy)) return null;
		wartosc = surowy;
	} else if (typeof surowy === 'string') {
		const przyciety = surowy.trim();
		if (!/^[0-9]{1,4}$/.test(przyciety)) return null;
		wartosc = Number.parseInt(przyciety, 10);
	} else {
		return null;
	}
	if (wartosc < min || wartosc > maks) return null;
	return wartosc;
}

/** The checkbox convention: an unticked HTML checkbox omits its key entirely, so an
 *  absent field is FALSE and never an error. Any present value counts as ticked,
 *  which is safe here and would not be for a RODO consent box: that one is compared
 *  by strict identity against boolean true in the forms validator, because consent
 *  needs an affirmative act rather than a coincidence of coercion. „Treść zastępcza"
 *  is a staff bookkeeping flag on their own content and carries no such requirement. */
export function flaga(surowy: unknown): boolean {
	return !pusty(surowy);
}

/** Both shapes a date has to take in this project, produced from one reading of the
 *  three selects so they can never disagree. */
export interface DataZlozona {
	/** `YYYY-MM-DD`, the shape src/lib/server/aktualnosci.ts requires. */
	iso: string;
	/** `DD.MM.YYYY`, the existing shape of the dokument `wersja` field. */
	kropki: string;
}

/** Accepted year window for a content date. Wide enough for an archival document and
 *  a scheduled entry, narrow enough that a typed 1926 or 2226 is refused rather than
 *  published: a date nobody would ever notice being wrong is exactly the value that
 *  needs a bound. */
export const ROK_MIN = 2020;
export const ROK_MAKS = 2100;

/** Zero-pad to two digits. Both stored shapes are fixed width, and a single-digit day
 *  would fail the reader's own `^(\d{4})-(\d{2})-(\d{2})$` guard. */
function dwie(liczba: number): string {
	return String(liczba).padStart(2, '0');
}

/**
 * Read a date from the three selects of UI-SPEC Component Contract 5.
 *
 * The calendar check is a round trip through `Date.UTC` rather than a per-month table:
 * 31 April becomes 1 May, the reconstructed parts no longer match what was asked for,
 * and the value is refused. A table would need a leap-year rule of its own, and a
 * wrong leap-year rule fails once every four years in a way no test run in between
 * would catch.
 */
export function dataZTrzech(dzien: unknown, miesiac: unknown, rok: unknown): DataZlozona | null {
	const d = liczbaWZakresie(dzien, 1, 31);
	const m = liczbaWZakresie(miesiac, 1, 12);
	const r = liczbaWZakresie(rok, ROK_MIN, ROK_MAKS);
	if (d === null || m === null || r === null) return null;

	const stempel = new Date(Date.UTC(r, m - 1, d));
	if (
		stempel.getUTCFullYear() !== r ||
		stempel.getUTCMonth() !== m - 1 ||
		stempel.getUTCDate() !== d
	) {
		return null;
	}

	return { iso: `${r}-${dwie(m)}-${dwie(d)}`, kropki: `${dwie(d)}.${dwie(m)}.${r}` };
}

/** Cap for a pasted BIP address. Long enough for the real ones, short enough that a
 *  pasted page of text is refused before it reaches a commit. */
export const MAKS_ADRES = 500;

/**
 * An https address and nothing else.
 *
 * Only https is accepted, deliberately: an http link from a public body's site is a
 * downgrade the visitor never asked for, and the UI-SPEC hint already promises the
 * editor „zaczynający się od https://". `javascript:` and `data:` are refused by the
 * same rule rather than by a blocklist, which is the right direction: an allowlist of
 * one scheme cannot be outgrown by a scheme nobody thought of.
 *
 * Parsed with the URL constructor rather than matched with a regex, because a regex
 * that looks right and accepts `https://evil.example\@bank.pl` is the classic way this
 * check fails.
 */
export function adresHttps(surowy: unknown, maks: number = MAKS_ADRES): string | null {
	if (typeof surowy !== 'string') return null;
	const wartosc = surowy.trim();
	if (wartosc.length === 0 || wartosc.length > maks) return null;
	// A control character or a space inside an address would be a smuggled line break
	// in a JSON value the panel is about to commit.
	if (/[\s<>"]/.test(wartosc)) return null;
	let adres: URL;
	try {
		adres = new URL(wartosc);
	} catch {
		return null;
	}
	if (adres.protocol !== 'https:') return null;
	if (adres.hostname.length === 0) return null;
	return wartosc;
}
