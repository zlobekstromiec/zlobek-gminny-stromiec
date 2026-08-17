/** The homepage fact tiles: their store, their reader and their CODE-AUTHORED slot table
 *  (05-UI-SPEC Contract 7 and Contract 11; 05 D-32, D-33; threats T-05-09-01, T-05-09-04).
 *
 *  ONE STORE FEEDS FIVE SURFACES. src/lib/content/w-skrocie.json holds the opening-hours
 *  atoms and the number of places. From here they reach the homepage fact strip, the top
 *  bar, the shared contact block, /kontakt and the site footer. Before this module the
 *  hours were typed in three places and could disagree with each other on one page.
 *
 *  IT LIVES IN THE SHARED HALF OF $lib, never in its server-only subtree, because
 *  src/lib/components/KeyFacts.svelte and src/lib/components/Footer.svelte are client
 *  components and SvelteKit refuses at build time to bundle that subtree into client code.
 *  The same boundary is recorded at src/lib/zdjecia.ts, src/lib/stan-naboru.ts and
 *  src/lib/pola-strony.ts.
 *
 *  TRUST BOUNDARY. From this plan the JSON below is written by the editorial panel, so it is
 *  untrusted input even though the person who saved it is authenticated, and whatever
 *  survives this reader is PRERENDERED into the żłobek's front page. The reader is built on
 *  the matured postFromEntry discipline of the news reader: the entry is typed `unknown`,
 *  the container is guarded before ANY property access, every field is narrowed through one
 *  primitive, and the result is CONSTRUCTED key by key and never spread from the raw entry.
 *
 *  IT DEGRADES, IT NEVER THROWS (T-05-09-01). A malformed store falls back to the
 *  code-authored defaults below with a build warning, rather than aborting `vite build`.
 *  That is the opposite call from src/lib/cennik.ts, and deliberately so: /cennik has no
 *  honest half-rendered state and a wrong FEE must never reach a parent, while a stale
 *  opening-hours line on an otherwise working homepage is strictly better than no homepage
 *  at all. One bad JSON must not take the whole prerendered site down.
 *
 *  THE ICON AND THE TINT STAY IN CODE, and that is not a stylistic preference. KeyFacts
 *  indexes its icon map with NO fallback, and TypeScript widens a JSON member to a plain
 *  `string`, so importing either union from JSON fails `npm run check` and blocks every
 *  commit through pre-commit. Because the arity is fixed at four, the icon and the tint are
 *  a CODE-AUTHORED SLOT TABLE zipped with the stored strings BY POSITION. That DELETES the
 *  hazard rather than guarding it: no editor input can ever produce an icon key, so no
 *  editor typo can put `undefined` where a component is called and take the prerendered
 *  homepage down. It is also why the runtime icon fallback 05 D-32 asked for is
 *  unnecessary here rather than merely skipped: there is no input that could reach it.
 *
 *  The import attribute is not decoration: src/lib/content/site.ts loads this module, and
 *  tests/forms-copy.unit.ts loads THAT module under bare `node --test`, where an ESM JSON
 *  import without `with { type: 'json' }` is refused outright. Vite accepts the attribute
 *  too, so one form works in both places. The relative `.ts` extensions are required by the
 *  same type stripping.
 *
 *  Copy rules (UI-SPEC v1.2 paragraf 8) apply to the comments here too: no emoji, no em
 *  dashes, en dash only inside a numeric range.
 */
import wSkrocie from './content/w-skrocie.json' with { type: 'json' };
import { CENNIK } from './cennik.ts';
import { godzinyKafelka, type AtomyGodzin } from './godziny.ts';

/** The four icon keys `KeyFacts.svelte` maps, and the four tint surfaces it paints. Declared
 *  as unions so the slot table below cannot name a fifth of either. */
export type KluczIkony = 'smile' | 'clock' | 'coins' | 'house';
export type KluczTintu = 'yellow' | 'blue' | 'orange' | 'green';

/** One rendered tile.
 *
 *  DECLARED HERE rather than in src/lib/content/site.ts, where it used to live, purely to
 *  keep the module graph acyclic: site.ts imports this module for the tiles, so this module
 *  cannot import a type back out of it. site.ts re-exports the name, so every existing
 *  `import type { KeyFact } from '$lib/content/site'` keeps working. */
export type KeyFact = {
	label: string;
	value: string;
	/** rendered on its own line below the value, Nunito 400 15px muted */
	suffix?: string;
	/** bespoke duotone icon shown in the tint chip */
	icon: KluczIkony;
	/** tint chip surface (decorative only; icon stroke stays accessible-tier) */
	tint: KluczTintu;
};

/** Exactly the shape src/lib/content/w-skrocie.json holds, in the committed KEY ORDER. The
 *  panel serializes an object of this shape, so the file's byte form and the validator's
 *  output cannot drift; tests/admin-walidacja-w-skrocie.unit.ts pins the serialized form
 *  byte for byte against the real file. */
export interface WSkrocieDane {
	godziny: {
		/** LAUNCH GATE (Faza 6). The hours are [KD]-sourced, recorded as „może ulec zmianie",
		 *  and this boolean is the marker that used to be a `// PLACEHOLDER:` line comment in
		 *  src/lib/content/site.ts. tests/zastepcze.unit.ts is the sweep that now finds it. */
		placeholder: boolean;
		godziny: string;
		dniPelne: string;
		dniSkrot: string;
		weekend: string;
	};
	miejsca: {
		placeholder: boolean;
		/** Whole places, no decimals. Stored as a number for the same reason the two fee
		 *  amounts are: the panel validates the digit shape before the parse, so nothing but a
		 *  whole number can ever be written here. */
		wartosc: number;
		/** Optional short note under the number. Always PRESENT and possibly empty, never
		 *  absent: an omitted key would change the file's byte shape and break the
		 *  serialization pin, and „no note" is honestly an empty string. */
		dopisek: string;
	};
}

/** The validated view every consumer reads. Nothing here is optional. */
export interface WidokWSkrocie {
	godziny: AtomyGodzin;
	godzinyZastepcze: boolean;
	miejsca: number;
	dopisek: string;
	miejscaZastepcze: boolean;
}

/** The code-authored fallback, and simultaneously the values this migration started from.
 *  Every one of them was copied out of src/lib/content/site.ts and
 *  src/lib/components/Footer.svelte rather than retyped, so the move is provably
 *  value preserving. */
const DOMYSLNE: WidokWSkrocie = {
	godziny: {
		godziny: '6:30–16:30',
		dniPelne: 'poniedziałek-piątek',
		dniSkrot: 'pon.-pt.',
		weekend: 'soboty i niedziele: nieczynne'
	},
	godzinyZastepcze: true,
	miejsca: 50,
	dopisek: '',
	miejscaZastepcze: false
};

/** Return `value` when it is a string with non-whitespace content, otherwise undefined. The
 *  single narrowing primitive for text, exactly as in src/lib/cennik.ts. */
function tekst(value: unknown): string | undefined {
	return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}

/** Return `value` when it is a non-negative whole number, otherwise undefined.
 *  `Number.isSafeInteger` rejects NaN, Infinity, a hand-edited „50.5" and the string „50" in
 *  one test, and the sign check rejects a negative count before it can reach a tile. */
function liczba(value: unknown): number | undefined {
	return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : undefined;
}

/** A container that can safely be read from, or undefined. Anything else (null, an array, a
 *  bare string, a number) would throw on the first property access, before any field guard
 *  could run. */
function obiekt(value: unknown): Record<string, unknown> | undefined {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined;
	return value as Record<string, unknown>;
}

/**
 * Map the store to the view, or refuse it with a build warning.
 *
 * Refusing here means „use the code-authored defaults", never „stop the build". See the
 * degrade-direction note in the module header: the homepage is prerendered and a stale
 * hours line beats a site that does not build.
 */
export function wSkrocieZWpisu(wpis: unknown): WidokWSkrocie | null {
	const rekord = obiekt(wpis);
	if (!rekord) {
		console.warn('w skrocie: odrzucono sklep (to nie jest obiekt JSON)');
		return null;
	}

	const godzinyRekord = obiekt(rekord.godziny);
	if (!godzinyRekord) {
		console.warn('w skrocie: odrzucono sklep (brak grupy godzin)');
		return null;
	}
	const godziny = tekst(godzinyRekord.godziny);
	const dniPelne = tekst(godzinyRekord.dniPelne);
	const dniSkrot = tekst(godzinyRekord.dniSkrot);
	const weekend = tekst(godzinyRekord.weekend);
	if (!godziny || !dniPelne || !dniSkrot || !weekend) {
		console.warn('w skrocie: odrzucono sklep (pusty albo nietekstowy atom godzin)');
		return null;
	}

	const miejscaRekord = obiekt(rekord.miejsca);
	if (!miejscaRekord) {
		console.warn('w skrocie: odrzucono sklep (brak grupy liczby miejsc)');
		return null;
	}
	const miejsca = liczba(miejscaRekord.wartosc);
	if (miejsca === undefined) {
		console.warn('w skrocie: odrzucono sklep (liczba miejsc nie jest pelna, nieujemna liczba)');
		return null;
	}
	// The note is genuinely optional, so a missing or blank one is not a refusal: it simply
	// means the tile renders no second line.
	const dopisek = tekst(miejscaRekord.dopisek) ?? '';

	// CONSTRUCTED KEY BY KEY from guarded locals only, never `...rekord`, which is how
	// unvalidated fields survived three successive fixes in the news reader.
	return {
		godziny: { godziny, dniPelne, dniSkrot, weekend },
		godzinyZastepcze: godzinyRekord.placeholder === true,
		miejsca,
		dopisek,
		miejscaZastepcze: miejscaRekord.placeholder === true
	};
}

/** The committed store, validated once at build time, or the code-authored defaults. */
export const W_SKROCIE: WidokWSkrocie = wSkrocieZWpisu(wSkrocie) ?? DOMYSLNE;

/** The hours atoms, for the five surfaces that compose a string out of them. */
export const ATOMY_GODZIN: AtomyGodzin = W_SKROCIE.godziny;

/**
 * THE SLOT TABLE. Four slots, in render order, each naming the label, the icon and the tint
 * of one tile. This is the whole mitigation of T-05-09-01: no stored value is ever used as
 * an icon key, because the icon key is not stored anywhere an editor can reach.
 *
 * The LABELS are here too rather than in the store, and that is the same decision: the four
 * `.fact-label` nodes and their strings are locked by 01-UI-SPEC Amendment v1.6 paragraf 3,
 * so they are not an editor's to change.
 */
const SLOTY: readonly { label: string; icon: KluczIkony; tint: KluczTintu }[] = [
	{ label: 'Wiek dzieci', icon: 'smile', tint: 'yellow' },
	{ label: 'Godziny otwarcia', icon: 'clock', tint: 'blue' },
	{ label: 'Opłata miesięczna', icon: 'coins', tint: 'orange' },
	{ label: 'Liczba miejsc', icon: 'house', tint: 'green' }
];

/** FINAL: [BIP] statut range (od ukończenia 20. tygodnia życia do 3 lat, wyjątkowo do 4).
 *  Code-authored and read-only in the panel (05-UI-SPEC Contract 7): the same range is
 *  stated a second time, in a second phrasing, in `recruitment.infoCard`, and an editable
 *  tile would let an editor change one of them and not the other. */
const WIEK_WARTOSC = 'od 20. tyg. życia do 3 lat';
const WIEK_DOPISEK = 'wyjątkowo do 4 lat';

/**
 * The fee tile's note, code-authored beside the slot table and NOT stored.
 *
 * It carries the conditional zero, and its exact shape is the safety property: the zero
 * figure may appear only inside the same string as the ZUS condition (dane-bip paragraf 10
 * punkt 1). Making the tile computed and locked removes the hazard structurally instead of
 * guarding it, which is why 05-UI-SPEC „Test lockstep" prescribes RETYPING exactly this
 * string in tests/home.spec.ts rather than interpolating it.
 *
 * THE DAILY FOOD FIGURE INSIDE IT IS THE ONE VALUE THIS PLAN LEAVES IN TWO PLACES: here, and
 * in the wyżywienie sentence an editor owns on /admin/cennik. tests/home.spec.ts cross-checks
 * the two so they cannot drift apart silently.
 */
const OPLATA_DOPISEK =
	'+ wyżywienie maks. 20 zł/dzień; możliwe 0 zł ze świadczeniem ZUS „Aktywnie w żłobku"';

/** The four values, in slot order, each from the source Contract 7 assigns it. */
const WARTOSCI: readonly { value: string; suffix?: string }[] = [
	{ value: WIEK_WARTOSC, suffix: WIEK_DOPISEK },
	{ value: godzinyKafelka(W_SKROCIE.godziny) },
	// Read from the cennik store view DIRECTLY and never through the OPLATY prose constant:
	// src/lib/content/rekrutacja.ts already imports src/lib/content/site.ts, so routing the
	// tile that way would close a cycle, and OPLATY is prose („1 500 zł miesięcznie") while
	// the tile needs the bare amount.
	{ value: CENNIK.placiTekst, suffix: OPLATA_DOPISEK },
	{ value: String(W_SKROCIE.miejsca), suffix: W_SKROCIE.dopisek }
];

/** The four tiles, the stored strings ZIPPED with the slot table BY POSITION. */
export const KAFELKI: KeyFact[] = SLOTY.map((slot, indeks) => {
	const wartosc = WARTOSCI[indeks];
	const kafelek: KeyFact = {
		label: slot.label,
		value: wartosc.value,
		icon: slot.icon,
		tint: slot.tint
	};
	// An absent note emits no member at all, so a tile with no second line renders exactly
	// as it did before this store existed.
	if (wartosc.suffix !== undefined && wartosc.suffix !== '') kafelek.suffix = wartosc.suffix;
	return kafelek;
});
