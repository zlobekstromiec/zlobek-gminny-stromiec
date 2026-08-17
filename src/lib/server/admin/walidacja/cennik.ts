// The Cennik validator (Phase 05, Plan 05-05; FEES-01, 05 D-27, D-28, D-31; threats
// T-05-05-01 to T-05-05-04).
//
// EVERY VALUE THIS READS IS UNTRUSTED INPUT even though the person who sent it is
// authenticated. It travels from a form field into a JSON file, into a commit on a PUBLIC
// repository, through the build-time reader in src/lib/cennik.ts and onto a page a parent
// reads to find out what the żłobek costs. An editor is not an attacker, but a mistyped
// amount published for two minutes on a public body's website is the same defect either
// way, and this file is the last place it is catchable while somebody is still looking at
// the screen.
//
// THREE RULES LIVE HERE THAT NO SHARED READER CAN EXPRESS:
//
//  1. The cross-field invariant `obnizka < stawka` (05 D-28). `liczbaWZakresie` in ./pola.ts
//     takes an INDEPENDENT minimum and maximum per field and cannot see a second field at
//     all. Without this rule an editor produces a negative payable amount, and the
//     boundary-anchored zero pattern below does not match a negative figure, so nothing
//     downstream would catch it either.
//  2. The conditional-zero rule (05 D-31, dane-bip paragraf 10 punkt 1): a zero amount may
//     appear only in a field that also carries the name of the benefit that makes it zero.
//  3. Both amounts are whole złoty, because `liczbaWZakresie` accepts a four-digit run and
//     nothing else. The uchwała quotes grosze and this store DROPS them deliberately: the
//     alternative is widening the repository's only numeric validator, which every other
//     screen also depends on, for one field.
//
// THE ZERO PATTERN IS BOUNDARY ANCHORED AND IS EXPORTED, so the unit suite drives the exact
// value the validator uses rather than a retyped twin. A literal substring search for a
// zero amount is not merely weaker, it is UNUSABLE: „1 500 zł" ends with those very
// characters, a trap this project already recorded at 04-06 and again in 05-UI-SPEC
// Contract 10.
//
// Pure and dependency-free apart from the shared field readers and the copy module: no
// fetch, no I/O, no clock. Nothing here logs, not the editor handle and not one submitted
// sentence, on any path.
//
// The relative imports carry an explicit `.ts` extension because
// tests/admin-walidacja-cennik.unit.ts loads this module directly under bare `node --test`,
// where the framework's path alias does not exist. Reaching for that alias here would make
// the whole validator undrivable without a browser.
import { KOPIA_WALIDACJA, tekstZaDlugi } from '../../../content/panel.ts';
import {
	POLE_KWOTY_OPIS,
	POLE_NAGLOWKA,
	POLE_NIEOBECNOSCI,
	POLE_OBNIZKI,
	POLE_STAWKI,
	POLE_WYZYWIENIA,
	POLE_ZASTEPCZA,
	POLE_ZUS,
	type ZrodloPol
} from '../../../pola-strony.ts';
import {
	BLAD_ZBYT_DLUGI,
	flaga,
	kodBledu,
	liczbaWZakresie,
	tekstWymagany,
	type WynikPol
} from './pola.ts';

// Re-exported so a server caller keeps importing the whole vocabulary from the validator
// beside it while exactly one declaration exists.
export {
	POLE_KWOTY_OPIS,
	POLE_NAGLOWKA,
	POLE_NIEOBECNOSCI,
	POLE_OBNIZKI,
	POLE_STAWKI,
	POLE_WYZYWIENIA,
	POLE_ZASTEPCZA,
	POLE_ZUS
};

/** Repository path of the one file this screen writes. Exported and pinned against the
 *  filesystem in the unit suite: a save that wrote a path nothing reads would report
 *  success to the editor, produce a real commit and a real Cloudflare build, and change
 *  nothing a parent can see. That failure is silent in every single layer. */
export const SCIEZKA_CENNIK = 'src/lib/content/cennik.json';

// The caps. Named constants rather than inline numbers, because the refusal an editor reads
// quotes the cap the server actually enforced (`tekstZaDlugi`), and a number living in two
// places is a message that will eventually lie (T-04.1-26). Sized against the committed
// store plus generous room: the longest sentence in it today is about 150 characters.
/** The short title above the amount. */
export const MAKS_NAGLOWKA = 80;
/** One fee sentence: the description, the ZUS condition, wyżywienie, nieobecność. */
export const MAKS_ZDANIA = 600;

/** Both amounts are whole złoty and non-negative. The upper bound is the four-digit run
 *  `liczbaWZakresie` accepts; stating it here as well keeps the bound readable beside the
 *  rule it belongs to rather than only inside a shared regular expression. */
export const MIN_KWOTY = 0;
export const MAKS_KWOTY = 9999;

/**
 * A ZERO AMOUNT, anchored so that a larger amount ENDING in zero cannot match.
 *
 * The digit run has to be exactly „0", optionally carrying grosze that are themselves zero:
 * a digit may neither precede the run nor follow it. That is what separates „0 zł" and
 * „0,00 zł" (an amount of nothing, which needs its condition beside it) from „1 500 zł",
 * „20 zł" and „1 000 zł", every one of which contains the same characters and every one of
 * which is a perfectly ordinary fee.
 *
 * THE GROSZE BRANCH IS NOT DECORATION (T-05-05-01). `kwoty.ts` records that the uchwała
 * writes amounts with grosze, and the render-time gate in `tests/cennik.spec.ts` has carried
 * an explicit `(,00)?` branch since it was written. Without the branch here the two halves
 * disagreed: the save-time rule accepted „płacisz 0,00 zł" with no condition beside it and
 * published it to a page a parent reads. The branch requires BOTH grosze digits to be zero,
 * so „0,50 zł" is still an ordinary amount, and the trailing lookahead still refuses
 * „10,00 zł", whose own digits contain the same characters.
 *
 * Exported so the unit suite drives THIS pattern rather than a copy of it. A twin would
 * agree with it on the day it was written and diverge the first time either was tightened,
 * and the divergence would be invisible: the suite would keep passing.
 */
export const WZORZEC_ZERA = /(?<!\d)0(?:,00)?(?!\d)\s*zł/u;

/**
 * The marker that makes a zero amount lawful: the name of the benefit that pays it.
 *
 * A field may say „0 zł" only when it also says WHY a parent pays nothing, and on this site
 * there is exactly one such reason. Matched case insensitively and without the typographic
 * quotes that surround it in the store, so an editor who writes the name without them, or
 * mid-sentence, is not refused for punctuation.
 */
export const MARKER_ZUS = 'Aktywnie w żłobku';

/** Exactly the shape src/lib/content/cennik.json holds, in the committed KEY ORDER. The
 *  panel serializes THIS object, so the file's byte shape and the validator's output cannot
 *  drift; the unit suite asserts the serialized form byte for byte against the real file. */
export interface CennikDane {
	placeholder: boolean;
	stawka: number;
	obnizka: number;
	naglowek: string;
	kwotaOpis: string;
	zus: string;
	wyzywienie: string;
	nieobecnosc: string;
}

/** Required text, with the two refusals the error table distinguishes: „nothing here" and
 *  „too long", the second one quoting the cap that was actually enforced. Same helper shape
 *  as `czytajWymagany` in ./o-nas.ts. */
function czytajZdanie(surowy: unknown, maks: number): { wartosc: string | null; blad?: string } {
	const wartosc = tekstWymagany(surowy, maks);
	if (wartosc !== null) return { wartosc };
	return {
		wartosc: null,
		blad:
			kodBledu(surowy, wartosc, maks) === BLAD_ZBYT_DLUGI
				? tekstZaDlugi(maks)
				: KOPIA_WALIDACJA.poleBrak
	};
}

/** True when the value states a zero amount WITHOUT the condition that explains it. The
 *  two halves are read from the same field's own text on purpose: a condition written in a
 *  neighbouring field is a condition a parent reading this one may never see. */
export function zeroBezWarunku(wartosc: string): boolean {
	if (!WZORZEC_ZERA.test(wartosc)) return false;
	return !wartosc.toLocaleLowerCase('pl').includes(MARKER_ZUS.toLocaleLowerCase('pl'));
}

/**
 * Read one submitted cennik.
 *
 * EVERY FIELD IS READ BEFORE ANYTHING IS REFUSED (Contract 10a: one summary panel, every
 * offending control linked from it). An editor who got two fields wrong should be told
 * twice, once, rather than once, twice.
 *
 * An absent field is a FAILURE and never a default. Defaulting would mean a request that
 * simply omitted a control silently blanked a fee sentence, which a parent would read on
 * the site within two minutes; the same rule ./nabor.ts states about one boolean.
 */
export function walidujCennik(zrodlo: ZrodloPol): WynikPol<CennikDane> {
	const pola: Record<string, string> = {};

	const stawka = liczbaWZakresie(zrodlo.get(POLE_STAWKI), MIN_KWOTY, MAKS_KWOTY);
	if (stawka === null) pola[POLE_STAWKI] = KOPIA_WALIDACJA.stawkaNiepoprawna;

	const obnizka = liczbaWZakresie(zrodlo.get(POLE_OBNIZKI), MIN_KWOTY, MAKS_KWOTY);
	if (obnizka === null) pola[POLE_OBNIZKI] = KOPIA_WALIDACJA.obnizkaNiepoprawna;

	// STRICTLY smaller, not „at most". An obniżka equal to the stawka publishes „0 zł" as
	// the fee itself, which is the unconditioned zero of D-31, and a larger one publishes a
	// negative amount that the anchored pattern above cannot see. Checked only when both
	// numbers survived their own readers: „nie jest mniejsza od stawki" would be a
	// bewildering thing to read about a field that is empty.
	if (stawka !== null && obnizka !== null && obnizka >= stawka) {
		pola[POLE_OBNIZKI] = KOPIA_WALIDACJA.obnizkaNieMniejsza;
	}

	const naglowek = czytajZdanie(zrodlo.get(POLE_NAGLOWKA), MAKS_NAGLOWKA);
	if (naglowek.blad !== undefined) pola[POLE_NAGLOWKA] = naglowek.blad;

	const kwotaOpis = czytajZdanie(zrodlo.get(POLE_KWOTY_OPIS), MAKS_ZDANIA);
	if (kwotaOpis.blad !== undefined) pola[POLE_KWOTY_OPIS] = kwotaOpis.blad;

	// D-27. The ZUS sentence gets its OWN refusal rather than the generic one, because it is
	// the field whose absence separates an amount from the condition under which a parent
	// does not pay it, and the message is what stops that from looking like pedantry.
	const zus = czytajZdanie(zrodlo.get(POLE_ZUS), MAKS_ZDANIA);
	if (zus.blad !== undefined) {
		pola[POLE_ZUS] = zus.blad === KOPIA_WALIDACJA.poleBrak ? KOPIA_WALIDACJA.zusBrak : zus.blad;
	}

	const wyzywienie = czytajZdanie(zrodlo.get(POLE_WYZYWIENIA), MAKS_ZDANIA);
	if (wyzywienie.blad !== undefined) pola[POLE_WYZYWIENIA] = wyzywienie.blad;

	const nieobecnosc = czytajZdanie(zrodlo.get(POLE_NIEOBECNOSCI), MAKS_ZDANIA);
	if (nieobecnosc.blad !== undefined) pola[POLE_NIEOBECNOSCI] = nieobecnosc.blad;

	// D-31, applied to EVERY text field rather than only to the four that carry a fee
	// sentence today. The heading is a visible string on the same public block, and a rule
	// that skipped one control would be a rule an editor could walk around by accident.
	// A field that already failed keeps its first refusal: two messages about one control
	// is one message the person never reads.
	for (const [nazwa, czytane] of [
		[POLE_NAGLOWKA, naglowek],
		[POLE_KWOTY_OPIS, kwotaOpis],
		[POLE_ZUS, zus],
		[POLE_WYZYWIENIA, wyzywienie],
		[POLE_NIEOBECNOSCI, nieobecnosc]
	] as const) {
		if (pola[nazwa] !== undefined || czytane.wartosc === null) continue;
		if (zeroBezWarunku(czytane.wartosc)) pola[nazwa] = KOPIA_WALIDACJA.kwotaZeroBezWarunku;
	}

	// The null checks are what NARROWS the locals below; they are not a second gate. Every
	// reader above records a message when it refuses, so a null here always arrives with a
	// non-empty map, which is the promise `WynikPol` makes about its failure arm. Written as
	// one condition rather than as a cast, because a cast would keep compiling on the day
	// somebody adds a field and forgets its message.
	if (
		Object.keys(pola).length > 0 ||
		stawka === null ||
		obnizka === null ||
		naglowek.wartosc === null ||
		kwotaOpis.wartosc === null ||
		zus.wartosc === null ||
		wyzywienie.wartosc === null ||
		nieobecnosc.wartosc === null
	) {
		return { ok: false, pola };
	}

	// CONSTRUCTED KEY BY KEY from guarded locals, in the committed file's key order, and
	// never by spreading the submitted data: a spread is how unvalidated fields survived
	// three successive fixes in the news reader, and here it would also scramble the order
	// the byte-for-byte pin depends on.
	return {
		ok: true,
		dane: {
			placeholder: flaga(zrodlo.get(POLE_ZASTEPCZA)),
			stawka,
			obnizka,
			naglowek: naglowek.wartosc,
			kwotaOpis: kwotaOpis.wartosc,
			zus: zus.wartosc,
			wyzywienie: wyzywienie.wartosc,
			nieobecnosc: nieobecnosc.wartosc
		}
	};
}
