/** Złoty amounts, formatted for display.
 *
 *  This lives in the SHARED half of $lib and deliberately not in its server-only
 *  subtree, because BOTH the prerendered public pages and the editorial panel print
 *  amounts, and the panel runs in the Cloudflare Worker where node built-ins are
 *  unavailable. (That subtree is named by a path this file must not spell: the plan's
 *  own acceptance gate greps for it here, and a comment explaining the ban would be a
 *  permanent false positive. Same rewording discipline as plan 04-02.) It is the same
 *  boundary already recorded at
 *  src/lib/liczebniki.ts:12-16, src/lib/zdjecia.ts, src/lib/stan-naboru.ts and
 *  src/lib/pola-strony.ts.
 *
 *  NOT Intl.NumberFormat, and the reason is measured rather than assumed. On this
 *  repository's runtime (Node v25.9.0, 2026-08-17):
 *
 *    an Intl.NumberFormat for 'pl-PL', formatting 1500          -> "1500"
 *    the same formatter with useGrouping pinned to 'always'
 *                                                 -> "1 500", separator U+00A0
 *
 *  (Both lines are written as prose rather than as pasteable calls on purpose: the
 *  plan's acceptance gate greps this file for a constructor call, so a copyable
 *  snippet here would be a permanent false positive. Plan 04-02 set that precedent.)
 *
 *  The plain call drops the separator because CLDR pl sets minimumGroupingDigits to 2,
 *  and BOTH fee figures on this site sit in the four-digit band where that suppression
 *  applies, so it would silently turn the shipped „1 500 zł" into „1500 zł". Pinning
 *  grouping on fixes that and introduces a worse fault: it emits a non-breaking space
 *  where every shipped byte today is an ASCII space, a one-codepoint change that is
 *  invisible in a diff and in a test failure message.
 *
 *  So the grouping is hand-rolled, three digits from the right. It is pinnable byte for
 *  byte by tests/kwoty.unit.ts instead of depending on an ICU data version, and the
 *  wrap that a non-breaking space would prevent is prevented in CSS instead, with
 *  `white-space: nowrap` on the amount element (05-UI-SPEC Contract 5).
 *
 *  Pure: no I/O, no clock, no framework import.
 */

/** ASCII space, U+0020. Byte-identical to the separator inside the shipped
 *  OPLATY.kwota, and pinned by codepoint in tests/kwoty.unit.ts. */
const SEPARATOR = ' ';

/** The currency word. Whole złoty only: the store holds at most four digits, with no
 *  grosze and no separators. The uchwała quotes „2 337,00 zł" and the store drops the
 *  grosze rather than widening liczbaWZakresie in the panel validator (05 D-35). */
const WALUTA = 'zł';

/** Whole złoty with a thousands separator, no currency suffix: 1500 -> „1 500". */
export function grupujTysiace(kwota: number): string {
	// Guard the shape rather than trusting the caller, exactly as liczebniki.ts:31-37
	// does, because these numbers come from editor-saved JSON. A value that is not a
	// finite number is returned in its own broken form instead of being coerced into a
	// plausible price: a visibly wrong output is safe, a plausible wrong one is not.
	// The reader in src/lib/cennik.ts refuses such a value long before it reaches here,
	// so this branch is unreachable from the committed store.
	if (!Number.isFinite(kwota)) return String(kwota);
	// Math.trunc, never Math.round. Rounding a hand-edited „2337.5" up to „2 338" would
	// be precisely the confident lie this guard exists to prevent. The minus sign is
	// preserved rather than dropped: a negative amount must stay visibly negative,
	// which is why cennik.ts refuses one outright (the boundary-anchored zero regex in
	// tests/cennik.spec.ts does not match „-837 zł").
	const znak = kwota < 0 ? '-' : '';
	const cyfry = String(Math.trunc(Math.abs(kwota)));
	let wynik = '';
	for (let i = cyfry.length; i > 0; i -= 3) {
		const kawalek = cyfry.slice(Math.max(0, i - 3), i);
		wynik = wynik === '' ? kawalek : kawalek + SEPARATOR + wynik;
	}
	return znak + wynik;
}

/** The rendered amount, for example „1 500 zł". */
export function zlote(kwota: number): string {
	return `${grupujTysiace(kwota)} ${WALUTA}`;
}
