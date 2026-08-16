/** Polish noun declension after a number.
 *
 *  Polish needs THREE forms wherever a count is printed next to a noun, and a
 *  site that prints only one of them reads as broken to a parent: „6 opiekunki"
 *  is wrong the same way „6 caregiver" is wrong in English. The rule (CLDR
 *  one/few/many for pl) is:
 *
 *    1                                        -> pojedyncza   (1 opiekunka)
 *    last digit 2-4, but NOT 12-14 at the end -> mnoga        (2, 3, 4, 22 opiekunki)
 *    everything else, including 0             -> dopelniacz   (0, 5, 11, 12 opiekunek)
 *
 *  This lives in $lib (never $lib/server) because both the public pages and the
 *  editorial panel print counts, and the panel runs in the Cloudflare Worker
 *  where node built-ins are unavailable. No Intl.PluralRules: it would pull a
 *  locale dependency for a rule that is four lines, and it returns category
 *  names rather than the words, which we would still have to map by hand.
 */

/** The three forms of one countable noun, in the order the rule selects them. */
export type FormyRzeczownika = {
	/** Used for exactly 1: „opiekunka", „wpis", „dokument". */
	pojedyncza: string;
	/** Used for 2-4 (and 22-24, 32-34 ...): „opiekunki", „wpisy", „dokumenty". */
	mnoga: string;
	/** Genitive plural, used for 0 and 5+ and the teens: „opiekunek", „wpisow". */
	dopelniacz: string;
};

/** Picks the form that belongs with `liczba`. Returns the WORD only. */
export function odmienRzeczownik(liczba: number, formy: FormyRzeczownika): string {
	// Guard the shape rather than trusting the caller: these counts come from
	// editor-saved JSON, so a hand-edited "6.5", a negative or a NaN must not pick
	// a form that reads as a confident lie. Only a genuine non-negative integer
	// selects a form; anything else degrades to the genitive plural, the one form
	// that is never absurd next to a strange quantity. Note the deliberate absence
	// of Math.abs here: it would map -1 onto „1 opiekunka".
	if (!Number.isInteger(liczba) || liczba < 0) return formy.dopelniacz;
	const n = liczba;
	if (n === 1) return formy.pojedyncza;

	const ostatniaCyfra = n % 10;
	const dwieOstatnieCyfry = n % 100;
	const jestNastka = dwieOstatnieCyfry >= 12 && dwieOstatnieCyfry <= 14;
	if (ostatniaCyfra >= 2 && ostatniaCyfra <= 4 && !jestNastka) return formy.mnoga;

	return formy.dopelniacz;
}

/** The whole phrase: the number, a space, and the correctly declined noun. */
export function liczbaZRzeczownikiem(liczba: number, formy: FormyRzeczownika): string {
	return `${liczba} ${odmienRzeczownik(liczba, formy)}`;
}
