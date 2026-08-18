// The five facility descriptions the żłobek sent on 2026-08-18, rendered as the „Nasze
// miejsce i codzienność" section of /o-nas.
//
// WHY THIS IS A MODULE AND NOT A KEY IN o-nas.json. The o-nas store is written by the
// editorial panel through `walidujStroneONas`, which rebuilds the file KEY BY KEY from
// guarded locals and never spreads the submitted object. That is a deliberate defence
// (an unvalidated value can never reach the store by riding along inside a spread), and
// its unavoidable consequence is that a key the validator does not know about is DELETED
// on the first save. Not refused, not warned about: dropped, by an editor who changed the
// misja paragraph and had no way to see what else went. Content that is not panel-aware
// therefore lives in a .ts module, which is the same place `rekrutacja.ts` and the copy
// half of `cennik.ts` already live for the same reason.
//
// THESE ARE THE ŻŁOBEK'S OWN WORDS, lightly edited and no further. Two changes were made
// to every block and nothing else was touched: the spaced en dash the sender's mail
// client produced („muzyczno – rytmicznej") is not a construction this project ships, and
// „przy żłobkowym placu zabaw" is spelled out as „plac zabaw przy żłobku". No claim was
// added, softened or made more marketing-shaped. If a sentence here reads like a promise,
// it is because the placówka made it.
//
// The order is the order she wrote them in. It happens to run outside-in and then forward
// in time (sale, plac zabaw, toalety, posiłki, adaptacja), which is a better reading order
// than anything a rearrangement would buy.

/** One block: a heading and one paragraph. No icon and no image field. The section is
 *  prose, and the photographs of these same rooms are two sections further down in the
 *  gallery, where they are already captioned and already open in a lightbox. Pairing each
 *  block with its own picture would show a parent the same sala twice on one page. */
export interface BlokMiejsca {
	tytul: string;
	opis: string;
}

export const MIEJSCE: readonly BlokMiejsca[] = Object.freeze([
	{
		tytul: 'Nasze sale i wyposażenie',
		opis: 'Dysponujemy dwiema przestronnymi salami, w pełni wyposażonymi w pomoce dydaktyczne, zabawki edukacyjne oraz wygodne meble dostosowane do maluchów. Każda przestrzeń została zaprojektowana tak, aby dzieci mogły swobodnie się bawić, uczyć i odpoczywać w bezpiecznym otoczeniu.'
	},
	{
		tytul: 'Bezpieczny plac zabaw',
		opis: 'Nasz żłobek dysponuje własnym, ogrodzonym placem zabaw, gdzie dzieci mogą spędzać czas na świeżym powietrzu. Plac wyposażony jest w bezpieczne, atestowane urządzenia zabawowe dostosowane do wieku maluchów. Miękka nawierzchnia i cieniowane miejsca zapewniają komfort i bezpieczeństwo podczas codziennych aktywności na zewnątrz.'
	},
	{
		tytul: 'Toalety przyjazne dzieciom',
		opis: 'W naszym żłobku znajdują się toalety specjalnie przygotowane z myślą o małych dzieciach. Niska zabudowa, przyjazne kolory i bezpieczne rozwiązania sprawiają, że korzystanie z nich jest dla maluchów komfortowe i przyjemne.'
	},
	{
		tytul: 'Zdrowe i smaczne posiłki',
		opis: 'Codzienne wyżywienie zapewnia nam Publiczna Szkoła Podstawowa w Stromcu. Dzięki temu mamy pewność, że każde dziecko otrzymuje świeże, zbilansowane i wysokiej jakości posiłki, dostosowane do potrzeb żywieniowych maluchów.'
	},
	{
		tytul: 'Łagodna adaptacja z rodzicami',
		opis: 'W pierwszych dniach września zapraszamy na spokojny proces adaptacji, który odbywa się wspólnie z rodzicami. Wiemy, jak ważne jest dla dziecka poczucie bezpieczeństwa, dlatego indywidualnie dostosowujemy tempo adaptacji do potrzeb każdego malucha.'
	}
]);
