import type { FormyRzeczownika } from '$lib/liczebniki';

/** Labels for the /o-nas kadra headcount (02-UI-SPEC Copywriting Contract,
 *  amended 2026-08-16). The two counts are CMS numbers an editor sets in the
 *  panel, so the label CANNOT be a fixed word: „6 opiekunki" is wrong Polish,
 *  and the editor who types 6 has no way to correct it from the panel. Both
 *  labels therefore carry all three forms and the page declines them. */

export const FORMY_OPIEKUNKI: FormyRzeczownika = {
	pojedyncza: 'opiekunka',
	mnoga: 'opiekunki',
	dopelniacz: 'opiekunek'
};

/** „personel pomocniczy" is a COLLECTIVE noun: it names the group, never its
 *  members, so no numeral can stand in front of it („3 personel pomocniczy" is
 *  ungrammatical for every count). What is being counted is people, so the
 *  counted head is „osoba" and only that word declines; „personelu
 *  pomocniczego" is the genitive it governs and stays fixed. */
export const FORMY_PERSONELU: FormyRzeczownika = {
	pojedyncza: 'osoba personelu pomocniczego',
	mnoga: 'osoby personelu pomocniczego',
	dopelniacz: 'osób personelu pomocniczego'
};

/** One person on the kadra list. `rola` is optional because most of the team share one
 *  role that the section heading already states, and repeating „opiekunka" on three
 *  consecutive lines is noise; the dyrektor is the one entry whose role a parent needs
 *  spelled out. */
export interface CzlonekKadry {
	imie: string;
	rola?: string;
}

/**
 * The named team, sent by the żłobek on 2026-08-18.
 *
 * WHY THIS IS CODE AND NOT CONTENT AN EDITOR CAN CHANGE, which is a real gap and is
 * recorded rather than hidden. The o-nas store is written by the panel through
 * `walidujStroneONas`, which rebuilds the file key by key from guarded locals and never
 * spreads what was submitted. An array added to that JSON by hand would therefore be
 * DELETED the first time an editor saved the O nas screen: not refused, not warned about,
 * silently dropped, and nobody would connect the loss to the save. Giving the panel a
 * repeatable group for it is the correct fix and it is not small (a prefix and two fields
 * in pola-strony.ts, a branch in the validator, controls on /admin/o-nas, Polish labels
 * and errors in panel.ts, and the four suites that pin all of those). Until that lands,
 * a code-authored list is the honest shape: changing it is a pull request, which is at
 * least a change somebody can see.
 *
 * D-02 of the 02-UI-SPEC still holds in the part that matters. There are no staff
 * photographs and no individual biographies here, only the names the żłobek asked us to
 * publish; what D-02 ruled out was profile pages, not the existence of a team list.
 *
 * ORDER IS THE ORDER SHE SENT, with the dyrektor last, exactly as in her message.
 */
export const KADRA: readonly CzlonekKadry[] = Object.freeze([
	{ imie: 'Justyna Kamińska' },
	{ imie: 'Agnieszka Bernaciak' },
	{ imie: 'Renata Rumniak-Cyngot' },
	{ imie: 'Kamila Dobosz', rola: 'Dyrektor' }
]);
