// The date vocabulary shared by the three Polish selects and by the server that reads
// them (Phase 04.1, Plan 04.1-06; 04.1-UI-SPEC Component Contract 5).
//
// WHY IT IS NOT INSIDE walidacja/pola.ts, where the year window started. That file
// lives under src/lib/server/, and SvelteKit refuses at build time to bundle anything
// from there into client code. The refusal is correct and worth keeping. But the years
// a select OFFERS and the years a validator ACCEPTS are the same fact seen from two
// sides: an offered year the validator rejects is a control that refuses its own
// options, and that is precisely the bug a duplicated constant produces. So the window
// is declared once, here, and walidacja/pola.ts imports and re-exports it.
//
// This module carries NO visible string. The month NAMES are not here either: they come
// from MIESIACE_WYBOR in ./content/forms.ts, which is the project's one month table (the
// reason is written in src/lib/server/forms/mailer.ts). Declaring a second one is
// forbidden.
//
// Pure: no I/O, no clock, no imports. Safe on both sides of the boundary. The current
// year arrives as an argument rather than being read from Date here, so every caller
// stays testable and the module has no hidden dependency on when it runs.

/** Accepted year window for a content date. Wide enough for an archival document and a
 *  scheduled entry, narrow enough that a typed 1926 or 2226 is refused rather than
 *  published: a date nobody would ever notice being wrong is exactly the value that
 *  needs a bound. */
export const ROK_MIN = 2020;
export const ROK_MAKS = 2100;

/** How far either side of the current year the selects reach. Two years back covers an
 *  entry being backdated to a past school year, two forward covers a scheduled notice,
 *  and five options fit on a phone. The validator's window stays much wider, so this is
 *  an affordance and never the guard. */
export const OKNO_LAT = 2;

/** Every day number a month can have. The impossible combinations (31 April, 30
 *  February) are refused by `dataZTrzech`, which round-trips through Date.UTC rather
 *  than consulting a per-month table: disabling options per month would need JavaScript
 *  and this screen has to work without it. */
export const DNI_MIESIACA: readonly number[] = Object.freeze(
	Array.from({ length: 31 }, (_, i) => i + 1)
);

/**
 * The years the three selects offer.
 *
 * `rokZapisany` is the year an already-saved entry carries. It is folded in because an
 * entry written in 2021 must still open showing its own date: a select that could not
 * express the committed value would silently offer the editor a different date than the
 * one in the file, and the first save would move the entry in time without anybody
 * asking for it.
 *
 * Always ascending, always inside the validator's window, never with a duplicate.
 */
export function lataDoWyboru(rokBiezacy: number, rokZapisany?: number): number[] {
	const zebrane = new Set<number>();
	for (let rok = rokBiezacy - OKNO_LAT; rok <= rokBiezacy + OKNO_LAT; rok++) {
		if (rok >= ROK_MIN && rok <= ROK_MAKS) zebrane.add(rok);
	}
	if (
		rokZapisany !== undefined &&
		Number.isInteger(rokZapisany) &&
		rokZapisany >= ROK_MIN &&
		rokZapisany <= ROK_MAKS
	) {
		zebrane.add(rokZapisany);
	}
	return [...zebrane].sort((a, b) => a - b);
}
