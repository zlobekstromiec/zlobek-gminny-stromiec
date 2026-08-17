/** The fee store and its reader (FEES-01, 05 D-03, D-28, D-29).
 *
 *  ONE store feeds THREE surfaces: the /cennik page, the OPLATY constant that
 *  src/lib/components/FeeBox.svelte renders on /rekrutacja, and (from plan 05-09) the
 *  homepage fee tile. Changing a number in src/lib/content/cennik.json changes all of
 *  them at once, which is the whole point: before this module the amounts were typed
 *  in three places and could disagree.
 *
 *  This lives in the SHARED half of $lib and deliberately not in its server-only
 *  subtree, for two independent reasons: the public page is prerendered, and the panel
 *  screen of plan 05-04 echoes the formatted amount back to the editor from inside the
 *  Cloudflare Worker, where node built-ins do not exist. (That subtree is named by a
 *  path this file must not spell, for the false-positive reason recorded in
 *  src/lib/kwoty.ts.)
 *
 *  TRUST BOUNDARY. From plan 05-04 the JSON below is written by the editorial panel,
 *  so it is untrusted input even though the person who saved it is authenticated, and
 *  whatever survives this reader is prerendered and published to parents. The reader is
 *  therefore the single validation boundary of the fee pipeline, built on the matured
 *  postFromEntry discipline of the news reader (the server-only aktualnosci module,
 *  lines 102 to 158): the entry is
 *  typed `unknown`, the container is guarded before ANY property access, every field is
 *  narrowed through one primitive, and the result is CONSTRUCTED key by key and never
 *  spread from the raw entry. Consumers carry no defensive guards of their own.
 *
 *  TWO NUMBERS ARE STORED AND THE THIRD IS COMPUTED (05 D-28). The store holds the
 *  statutory rate and the reduction; what a parent pays is subtracted here. The page
 *  therefore cannot contradict its own arithmetic, and no editor can save a breakdown
 *  whose three figures do not add up, because only two of them are savable.
 *
 *  Copy rules (UI-SPEC v1.2 paragraf 8): no emoji, no em dashes; en dash only inside
 *  numeric ranges. That ban applies to the comments in this file too.
 *
 *  The import attribute is not decoration: tests/cennik-reader.unit.ts loads this
 *  module directly under bare `node --test`, where an ESM JSON import without
 *  `with { type: 'json' }` is refused outright. Vite accepts the attribute too, so one
 *  form works in both places (the same note as src/lib/content/site.ts:7-10).
 */
import cennik from './content/cennik.json' with { type: 'json' };
import { zlote } from './kwoty.ts';

/** The period word that turns a bare amount into the prose form OPLATY.kwota ships.
 *  It sits here rather than in a content module because it is welded to the computed
 *  amount: the two are always rendered as one string and must never drift apart. */
const OKRES = 'miesięcznie';

/** The shape stored on disk, as the panel writes it. Every member is a compile-time
 *  claim about hand-editable JSON, which is to say a claim the reader does not trust. */
export interface WpisCennika {
	placeholder: boolean;
	/** The statutory rate from the uchwała, whole złoty. */
	stawka: number;
	/** The reduction, whole złoty. Zero is legal and hides the breakdown (D-29). */
	obnizka: number;
	naglowek: string;
	kwotaOpis: string;
	zus: string;
	wyzywienie: string;
	nieobecnosc: string;
}

/** The view every fee surface renders. Nothing here is optional: a field that could
 *  not be validated stops the whole view from existing, rather than degrading one
 *  line into undefined, because /cennik has no honest half-rendered state. */
export interface WidokCennika {
	stawka: number;
	obnizka: number;
	/** Computed, never stored: stawka minus obnizka. */
	placi: number;
	stawkaTekst: string;
	obnizkaTekst: string;
	placiTekst: string;
	/** „1 500 zł miesięcznie": the exact prose form OPLATY.kwota exposes. */
	kwotaProza: string;
	naglowek: string;
	kwotaOpis: string;
	zus: string;
	wyzywienie: string;
	nieobecnosc: string;
	/** False when obnizka is zero, so the breakdown block is not rendered at all. */
	pokazRozbicie: boolean;
	placeholder: boolean;
}

/** Return `value` when it is a string with non-whitespace content, otherwise
 *  undefined. The single narrowing primitive for text: every string the view exposes
 *  passes through it, which is what stops an unvalidated value reaching a page. */
function tekst(value: unknown): string | undefined {
	return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}

/** Return `value` when it is a non-negative whole number of złoty, otherwise
 *  undefined. Number.isSafeInteger rejects NaN, Infinity, a hand-edited „2337.5" and
 *  a string „2337" in one test, and the sign check rejects a negative amount before
 *  it can reach the formatter. */
function pelneZlote(value: unknown): number | undefined {
	return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : undefined;
}

/** Map one on-disk entry to the view, or refuse it with a build warning.
 *
 *  Refusing is deliberate and it is NOT the degrade policy of the news reader, which
 *  skips one bad post and prerenders the rest. There is exactly one fee entry, /cennik
 *  has no empty state, and a fee page missing its ZUS sentence would publish an amount
 *  without the condition under which a parent does not pay it. So a malformed store
 *  fails `vite build` (see the module-scope check below) rather than reaching a parent,
 *  and a failed build leaves the previous deployment live. The panel validator in plan
 *  05-04 is the guard that stops an editor ever reaching this state. */
export function cennikZWpisu(wpis: unknown): WidokCennika | null {
	// A store holding null, an array, a bare string or a number would throw on the
	// first property access, before any field guard could run.
	if (typeof wpis !== 'object' || wpis === null || Array.isArray(wpis)) {
		console.warn('cennik: odrzucono wpis (to nie jest obiekt JSON)');
		return null;
	}
	const rekord = wpis as Record<string, unknown>;

	const stawka = pelneZlote(rekord.stawka);
	if (stawka === undefined) {
		console.warn('cennik: odrzucono wpis (stawka nie jest pelna, nieujemna kwota)');
		return null;
	}
	const obnizka = pelneZlote(rekord.obnizka);
	if (obnizka === undefined) {
		console.warn('cennik: odrzucono wpis (obnizka nie jest pelna, nieujemna kwota)');
		return null;
	}
	// STRICTLY less, not „at most". An obnizka equal to the stawka renders „0 zł" as
	// the fee itself, which is the unconditioned zero dane-bip paragraf 10 punkt 1
	// forbids, and a larger one renders a negative amount that the boundary-anchored
	// zero regex in tests/cennik.spec.ts cannot see. This is the last place either
	// mistake is catchable.
	if (obnizka >= stawka) {
		console.warn('cennik: odrzucono wpis (obnizka nie jest mniejsza od stawki)');
		return null;
	}

	const naglowek = tekst(rekord.naglowek);
	const kwotaOpis = tekst(rekord.kwotaOpis);
	const zus = tekst(rekord.zus);
	const wyzywienie = tekst(rekord.wyzywienie);
	const nieobecnosc = tekst(rekord.nieobecnosc);
	if (!naglowek || !kwotaOpis || !zus || !wyzywienie || !nieobecnosc) {
		console.warn('cennik: odrzucono wpis (brakuje wymaganego pola tekstowego)');
		return null;
	}

	const placi = stawka - obnizka;
	// Constructed key by key from guarded locals only, never `...rekord`, which is how
	// unvalidated fields survived three successive fixes in the news reader. The key
	// set is pinned by a sorted equality in tests/cennik-reader.unit.ts.
	return {
		stawka,
		obnizka,
		placi,
		stawkaTekst: zlote(stawka),
		obnizkaTekst: zlote(obnizka),
		placiTekst: zlote(placi),
		kwotaProza: `${zlote(placi)} ${OKRES}`,
		naglowek,
		kwotaOpis,
		zus,
		wyzywienie,
		nieobecnosc,
		// A reduction of zero would render „Obniżka 0 zł", an amount with no condition
		// attached, so the whole breakdown block disappears instead (05 D-29).
		pokazRozbicie: obnizka > 0,
		placeholder: rekord.placeholder === true
	};
}

const widok = cennikZWpisu(cennik);
if (!widok) {
	// Thrown at module scope on purpose, so `vite build` fails loudly. See the refusal
	// rationale above cennikZWpisu: /cennik has no honest empty state, and a failed
	// build leaves the previous deployment serving the previous, correct fees.
	throw new Error(
		'cennik: src/lib/content/cennik.json jest niepoprawny, wiec strona /cennik nie moze powstac'
	);
}

/** The committed store, validated once at build time. */
export const CENNIK: WidokCennika = widok;
