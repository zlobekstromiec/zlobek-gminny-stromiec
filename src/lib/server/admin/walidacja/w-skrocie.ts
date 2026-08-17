// The W skrócie validator (Phase 05, Plan 05-09; 05-UI-SPEC Contract 11; 05 D-32, D-33;
// threats T-05-09-04, T-05-09-06).
//
// EVERY VALUE THIS READS IS UNTRUSTED INPUT even though the person who sent it is
// authenticated. It travels from a form field into a JSON file, into a commit on a PUBLIC
// repository, through the build-time reader in src/lib/w-skrocie.ts, and from there onto
// FIVE surfaces at once: the homepage fact strip, the bar at the top of every page, the
// contact block, /kontakt and the site footer. One mistyped range is therefore one mistyped
// range in five places, and this file is the last point at which it is catchable while
// somebody is still looking at the screen.
//
// THE ARITY IS FIXED AT FOUR TILES AND IS NOT A FIELD (05-UI-SPEC Contract 11). There is no
// repeatable group here and no index-scoped control, so nothing a submission can carry is
// able to ASK for a fifth tile: the closed allowlist below reads a fixed set of names and
// the result is constructed key by key from guarded locals, never spread from what arrived.
// That is the structural form of the refusal the plan asks for, and it is stronger than a
// count check, because a count check can only refuse what somebody was already able to
// express. The rendering half of the same guarantee lives in the reader, which returns
// exactly four tiles or falls back to the code-authored defaults; both halves are pinned in
// tests/admin-walidacja-w-skrocie.unit.ts.
//
// AN ABSENT FIELD IS A REFUSAL, NEVER A DEFAULT, which is ./nabor.ts's rule and the reason
// it exists: a request that simply omitted a control would otherwise silently blank the
// żłobek's opening hours, and a parent would read that within two minutes.
//
// THE NUMBER OF PLACES GOES THROUGH `liczbaWZakresie`, which checks the DIGIT SHAPE before
// the parse. `Number.parseInt` accepts „50abc" and returns 50; this project's zero-coercion
// promise is what stops that reaching a tile.
//
// THE NOTE IS OPTIONAL AND ALWAYS WRITTEN. „Optional" here means „may be left empty without
// a refusal", not „may be absent from the file": an omitted key would change the store's
// byte shape and break the serialization pin, and „no note" is honestly an empty string.
//
// Pure and dependency-free apart from the shared field readers and the copy module: no
// fetch, no I/O, no clock. Nothing here logs, not the editor handle and not one submitted
// value, on any path.
//
// The relative imports carry an explicit `.ts` extension because
// tests/admin-walidacja-w-skrocie.unit.ts loads this module directly under bare
// `node --test`, where the framework's path alias does not exist.
import { KOPIA_WALIDACJA, tekstZaDlugi } from '../../../content/panel.ts';
import {
	POLE_DNI_PELNYCH,
	POLE_DNI_SKROTU,
	POLE_DOPISKU,
	POLE_GODZIN,
	POLE_MIEJSC,
	POLE_WEEKENDU,
	POLE_ZASTEPCZA_GODZIN,
	POLE_ZASTEPCZA_MIEJSC,
	type ZrodloPol
} from '../../../pola-strony.ts';
import {
	BLAD_ZBYT_DLUGI,
	flaga,
	kodBledu,
	liczbaWZakresie,
	tekstOpcjonalny,
	tekstWymagany,
	type WynikPol
} from './pola.ts';

// Re-exported so a server caller keeps importing the whole vocabulary from the validator
// beside it while exactly one declaration exists.
export {
	POLE_DNI_PELNYCH,
	POLE_DNI_SKROTU,
	POLE_DOPISKU,
	POLE_GODZIN,
	POLE_MIEJSC,
	POLE_WEEKENDU,
	POLE_ZASTEPCZA_GODZIN,
	POLE_ZASTEPCZA_MIEJSC
};

/** Repository path of the one file this screen writes. Exported and pinned against the
 *  filesystem in the unit suite: a save that wrote a path nothing reads would report success
 *  to the editor, produce a real commit and a real Cloudflare build, and change nothing a
 *  parent can see. That failure is silent in every single layer. */
export const SCIEZKA_W_SKROCIE = 'src/lib/content/w-skrocie.json';

/** Cap on one hours atom. Named rather than inline, because the refusal an editor reads
 *  quotes the cap the server actually enforced (`tekstZaDlugi`), and a number living in two
 *  places is a message that will eventually lie (T-04.1-26). Generous against the committed
 *  values, the longest of which is about thirty characters. */
export const MAKS_ATOMU = 120;

/** Cap on the optional note under the number of places. Same size, same reasoning. */
export const MAKS_DOPISKU = 120;

/** The number of places is a whole, non-negative count. The upper bound is the four-digit
 *  run `liczbaWZakresie` accepts; stating it here keeps the bound readable beside the rule
 *  it belongs to rather than only inside a shared regular expression. */
export const MIN_MIEJSC = 0;
export const MAKS_MIEJSC = 9999;

/** Exactly the shape src/lib/content/w-skrocie.json holds, in the committed KEY ORDER. The
 *  panel serializes THIS object, so the file's byte shape and the validator's output cannot
 *  drift; the unit suite asserts the serialized form byte for byte against the real file. */
export interface WSkrocieDane {
	godziny: {
		placeholder: boolean;
		godziny: string;
		dniPelne: string;
		dniSkrot: string;
		weekend: string;
	};
	miejsca: {
		placeholder: boolean;
		wartosc: number;
		dopisek: string;
	};
}

/** Required text, with the two refusals the error table distinguishes: „nothing here" and
 *  „too long", the second one quoting the cap that was actually enforced. Same helper shape
 *  as `czytajZdanie` in ./cennik.ts, and it takes the empty-field message as an argument
 *  because every field on this screen has its own (WCAG 3.3.3). */
function czytajAtom(
	surowy: unknown,
	brak: string,
	maks: number = MAKS_ATOMU
): { wartosc: string | null; blad?: string } {
	const wartosc = tekstWymagany(surowy, maks);
	if (wartosc !== null) return { wartosc };
	return {
		wartosc: null,
		blad: kodBledu(surowy, wartosc, maks) === BLAD_ZBYT_DLUGI ? tekstZaDlugi(maks) : brak
	};
}

/**
 * Read one submitted set of homepage tiles.
 *
 * EVERY FIELD IS READ BEFORE ANYTHING IS REFUSED (Contract 10a: one summary panel, every
 * offending control linked from it). An editor who got two fields wrong should be told
 * twice, once, rather than once, twice.
 */
export function walidujWSkrocie(zrodlo: ZrodloPol): WynikPol<WSkrocieDane> {
	const pola: Record<string, string> = {};

	const godziny = czytajAtom(zrodlo.get(POLE_GODZIN), KOPIA_WALIDACJA.godzinyOtwarciaBrak);
	if (godziny.blad !== undefined) pola[POLE_GODZIN] = godziny.blad;

	const dniPelne = czytajAtom(zrodlo.get(POLE_DNI_PELNYCH), KOPIA_WALIDACJA.dniBrak);
	if (dniPelne.blad !== undefined) pola[POLE_DNI_PELNYCH] = dniPelne.blad;

	const dniSkrot = czytajAtom(zrodlo.get(POLE_DNI_SKROTU), KOPIA_WALIDACJA.skrotDniBrak);
	if (dniSkrot.blad !== undefined) pola[POLE_DNI_SKROTU] = dniSkrot.blad;

	const weekend = czytajAtom(zrodlo.get(POLE_WEEKENDU), KOPIA_WALIDACJA.weekendBrak);
	if (weekend.blad !== undefined) pola[POLE_WEEKENDU] = weekend.blad;

	const miejsca = liczbaWZakresie(zrodlo.get(POLE_MIEJSC), MIN_MIEJSC, MAKS_MIEJSC);
	if (miejsca === null) pola[POLE_MIEJSC] = KOPIA_WALIDACJA.liczbaMiejscBrak;

	// Three outcomes from one reader, and the middle one is why `tekstOpcjonalny` exists:
	// `undefined` is „left alone", which is valid and stores an empty string; `null` is
	// „typed something and it was refused", which has to come back with a message or the
	// editor watches their text vanish on save.
	const dopisek = tekstOpcjonalny(zrodlo.get(POLE_DOPISKU), MAKS_DOPISKU);
	if (dopisek === null) pola[POLE_DOPISKU] = tekstZaDlugi(MAKS_DOPISKU);

	// The null checks are what NARROWS the locals below; they are not a second gate. Every
	// reader above records a message when it refuses, so a null here always arrives with a
	// non-empty map, which is the promise `WynikPol` makes about its failure arm. Written as
	// one condition rather than as a cast, because a cast would keep compiling on the day
	// somebody adds a field and forgets its message.
	if (
		Object.keys(pola).length > 0 ||
		godziny.wartosc === null ||
		dniPelne.wartosc === null ||
		dniSkrot.wartosc === null ||
		weekend.wartosc === null ||
		miejsca === null ||
		dopisek === null
	) {
		return { ok: false, pola };
	}

	// CONSTRUCTED KEY BY KEY from guarded locals, in the committed file's key order, and
	// never by spreading the submitted data. This is also where the fixed arity becomes a
	// property rather than a promise: the result names exactly the two editable tiles and
	// nothing a submission carries can add a third.
	return {
		ok: true,
		dane: {
			godziny: {
				placeholder: flaga(zrodlo.get(POLE_ZASTEPCZA_GODZIN)),
				godziny: godziny.wartosc,
				dniPelne: dniPelne.wartosc,
				dniSkrot: dniSkrot.wartosc,
				weekend: weekend.wartosc
			},
			miejsca: {
				placeholder: flaga(zrodlo.get(POLE_ZASTEPCZA_MIEJSC)),
				wartosc: miejsca,
				dopisek: dopisek ?? ''
			}
		}
	};
}
