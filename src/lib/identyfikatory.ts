// How the żłobek's institutional identifiers are WRITTEN (NIP, REGON).
//
// WHY THIS MODULE EXISTS RATHER THAN A CONST IN ONE PAGE. The grouping used to live as a
// local in src/routes/kontakt/+page.svelte, which was correct while /kontakt was the only
// surface that showed a NIP. The footer now shows it too, and it renders on EVERY page, so
// a second copy of the grouping would be a second answer to one question: two places that
// could disagree about how the same ten digits look. Same rule the opening hours already
// follow in $lib/godziny.ts.
//
// THE STORE KEEPS BARE DIGITS and these functions add the separators. That direction is
// deliberate and not merely tidy: an identifier stored pre-formatted has to be stripped
// again by anything that wants to compare it, put it in a URL or hand it to a registry
// lookup, and every such strip is a place to get it wrong. One canonical value, formatted
// at the edge.
//
// NEITHER FUNCTION VALIDATES. A wrong NIP is a content error the żłobek fixes, not
// something a formatter should silently repair or refuse to print: a repaired identifier
// is a DIFFERENT identifier, and this project's readers reject rather than repair. What
// these do guarantee is that a value they cannot format is returned UNCHANGED rather than
// mangled into a shape that looks official and is not.
//
// Pure: no I/O, no clock, no framework import. Safe on both sides of the server boundary
// and drivable under a plain test runner.

/** Digits only, so a value that already carries separators formats the same as a bare one.
 *  Not exported: callers pass whatever the store holds and get back something printable. */
function saneCyfry(wartosc: string): string {
	return wartosc.replace(/\D/g, '');
}

/**
 * A Polish NIP as `000-000-00-00`.
 *
 * That 3-3-2-2 grouping is the form used on Polish official correspondence and invoices,
 * which is the form a parent filling in ZUS paperwork is comparing against.
 *
 * Anything that is not exactly ten digits comes back as the ORIGINAL string, untouched. A
 * partially grouped nine-digit number would read as a real NIP with a typo, which is worse
 * on a public body's website than an obviously unformatted one.
 */
export function nipDoWyswietlenia(nip: string): string {
	const cyfry = saneCyfry(nip);
	if (cyfry.length !== 10) return nip;
	return `${cyfry.slice(0, 3)}-${cyfry.slice(3, 6)}-${cyfry.slice(6, 8)}-${cyfry.slice(8, 10)}`;
}

/**
 * A Polish REGON, printed as bare digits.
 *
 * REGON is conventionally written WITHOUT separators, in either of its two legal lengths:
 * nine digits for the base number and fourteen for a local unit. This function exists
 * anyway, rather than callers printing the raw field, so that the two identifiers are
 * reached the same way from both surfaces and so the one place to change if that
 * convention ever needs grouping is here.
 *
 * A value of neither legal length comes back unchanged, for the same reason as above.
 */
export function regonDoWyswietlenia(regon: string): string {
	const cyfry = saneCyfry(regon);
	if (cyfry.length !== 9 && cyfry.length !== 14) return regon;
	return cyfry;
}
