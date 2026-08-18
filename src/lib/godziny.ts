/** The opening-hours composer (05-UI-SPEC Contract 7, 05 D-32, D-33).
 *
 *  WHAT PROBLEM IT SOLVES. Until plan 05-09 the opening hours lived on FIVE surfaces with
 *  THREE sources: the homepage fact tile, the shared contact object that the top bar, the
 *  contact block and /kontakt all render, and a hard-coded literal in the footer. Making
 *  only the tile editable would have let an editor change the hours in the homepage strip
 *  while the footer of that very same page kept showing the old ones. Unifying the sources
 *  is the point of the W skrócie screen; the screen is only the delivery mechanism.
 *
 *  ATOMS, NOT PROSE, which is the same lesson 05 D-03 records about the fee amounts. Each
 *  surface needs a different fragment: the tile wants the bare range, the top bar wants the
 *  short day form beside it, and the footer wants the full day name, the range and the
 *  weekend line on three separate lines. Storing any one of those as a sentence would force
 *  the others to take it apart again.
 *
 *  ONE FUNCTION PER SURFACE STRING, deliberately, even where two of them return the same
 *  fragment today. Call sites COMPOSE rather than concatenate, so a surface added later
 *  cannot quietly invent a sixth phrasing of the same fact by gluing two atoms together in
 *  a new order.
 *
 *  IT LIVES IN THE SHARED HALF OF $lib and never in its server-only subtree, for the reason
 *  src/lib/zdjecia.ts, src/lib/stan-naboru.ts and src/lib/pola-strony.ts each record:
 *  SvelteKit refuses at build time to bundle that subtree into client code, and the footer
 *  and the top bar are client components.
 *
 *  IT CARRIES NO EDITOR-VISIBLE STRING and no visitor-visible chrome. „Czynne:" stays in
 *  src/lib/components/TopBar.svelte, where it is copy about the bar rather than a fact about
 *  the hours; the labels of the four fields live in src/lib/content/panel.ts. This module
 *  only rearranges values somebody else authored.
 *
 *  Pure: no I/O, no clock, no framework import, no module-scope state. Safe on both sides of
 *  the client and server boundary, which is what lets a component, a route and a bare
 *  `node --test` all load it.
 *
 *  Copy rules (UI-SPEC v1.2 paragraf 8) apply to the comments here too: no emoji, no em
 *  dashes, en dash only inside a numeric range. The hours range is exactly that case, and
 *  the day abbreviation is exactly the case where a plain hyphen is correct.
 */

/** The four stored fragments the żłobek's opening hours are made of.
 *
 *  Every member is a compile-time claim about editor-owned JSON, which is to say a claim
 *  the reader in src/lib/w-skrocie.ts does not trust. Nothing composes from an unvalidated
 *  value: the reader narrows each field before any function here ever sees it. */
export interface AtomyGodzin {
	/** The range itself, for example „6:30–16:30". */
	godziny: string;
	/** The days written out, for example „poniedziałek-piątek". */
	dniPelne: string;
	/** The short day form, for example „pon.-pt.". */
	dniSkrot: string;
	/** What happens at the weekend, for example „soboty i niedziele: nieczynne". */
	weekend: string;
}

/** The homepage fact tile's value: the bare range, with no days beside it, because the
 *  tile's own label already says „Godziny otwarcia". */
export function godzinyKafelka(atomy: AtomyGodzin): string {
	return atomy.godziny;
}

/** The shared contact line, rendered by the top bar, by the contact block and by /kontakt.
 *  The short day form and the range, one space apart, which is byte for byte what
 *  `contact.hours` held as a literal before this module existed. */
export function godzinyPaska(atomy: AtomyGodzin): string {
	return `${atomy.dniSkrot} ${atomy.godziny}`;
}

/** Footer line 1: the days, written out, because the footer has the room for it and a
 *  parent scanning it is not reading an abbreviation table. */
export function godzinyStopkiDni(atomy: AtomyGodzin): string {
	return atomy.dniPelne;
}

/** Footer line 2: the range, set large. Returns the same fragment as `godzinyKafelka`, and
 *  stays a function of its own for the reason stated in the header: two surfaces asking the
 *  same question today are still two surfaces. */
export function godzinyStopkiZakres(atomy: AtomyGodzin): string {
	return atomy.godziny;
}

/** Footer line 3: the weekend. */
export function godzinyStopkiWeekend(atomy: AtomyGodzin): string {
	return atomy.weekend;
}

/**
 * The sixth surface (2026-08-18): the „Miejsca i godziny opieki" block of „Nasze miejsce i
 * codzienność" on /o-nas. A whole sentence rather than a fragment, because that section is
 * prose blocks and not labelled tiles.
 *
 * IT IS A FUNCTION HERE RATHER THAN A TEMPLATE IN THE BLOCK, which is the header's rule
 * doing its job on the first surface added after it was written. Composing
 * `${dniPelne} ${godziny}` at the call site is how the seventh surface then invents a
 * seventh phrasing, and the reason the hours were unified in the first place.
 *
 * BOTH ATOMS GO IN VERBATIM. Writing „od poniedziałku do piątku" here would read better
 * than the stored „poniedziałek-piątek" and would be exactly the rephrasing this module
 * exists to prevent: the stored value is the żłobek's, and a surface that quietly improves
 * it has made the store stop describing the page. The weekend atom is deliberately absent,
 * not forgotten: it is a fragment shaped for a labelled footer line („soboty i niedziele:
 * nieczynne") and cannot enter a sentence without being reworded.
 */
export function godzinyBlokuOpieki(atomy: AtomyGodzin): string {
	return `Żłobek jest czynny ${atomy.dniPelne} w godzinach ${atomy.godziny}.`;
}
