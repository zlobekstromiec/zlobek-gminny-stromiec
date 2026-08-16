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
