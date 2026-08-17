# DESIGN-BANK: Design B full-site content for Phases 2-6

> Source: "Żłobek Stromiec website design v2" handoff (2026-08-13), merged-tone decision
> in 01-UI-SPEC.md Amendment v1.2. This is a CONTENT BANK, not a contract. Every fact
> is PLACEHOLDER until written client confirmation. Legal texts are DRAFTS requiring
> IOD/legal review. All `kontakt@zlobekstromiec.pl` occurrences from the source are
> REJECTED: the public e-mail is `zlobek@ugstromiec.pl`. No emoji, no em dashes
> (source copy swept where needed). Visual language: tokens + contracts in UI-SPEC v1.2.

## Homepage (adopted in Phase 01.1)

- Perks, day plan, key facts, 4-step recruitment, footer structure: implemented, see UI-SPEC v1.2.
- `openingBanner` (banked, flag in site.ts, default false). Copy when enabled:
  "Wielkie otwarcie żłobka: 14 sierpnia 2026! Czytaj więcej" (accent bg + ink text, never danger).

## O nas (Phase 2)

Trzy akapity (draft):
1. "Publiczny Żłobek w Stromcu to pierwsza taka placówka w naszej gminie: nowoczesny, kolorowy budynek stworzony z myślą o najmłodszych mieszkańcach. Zapewniamy opiekę dzieciom w wieku od 10 miesięcy do 3 lat."
2. "Dysponujemy salami zabaw z sypialniami, własną kuchnią przygotowującą świeże posiłki oraz bezpiecznym placem zabaw. Kameralne grupy pozwalają nam na indywidualne podejście do każdego malucha: dbamy o poczucie bezpieczeństwa, samodzielność i radość odkrywania świata."
3. "Nasza kadra to wykwalifikowane opiekunki z sercem do pracy z dziećmi. Placówka powstała dzięki dofinansowaniu z rządowego programu „Aktywny Maluch 2022-2029"."

Values cards (tint surfaces): Bliskość (tint-yellow) / Samodzielność (tint-blue) / Radość (tint-pink), texts per source. Image slots: budynek (220px), sala zabaw + plac zabaw (2x150px).

## Dokumenty (Phase 2)

Six documents: Karta zgłoszenia dziecka, Regulamin rekrutacji, Statut żłobka, Regulamin organizacyjny, Upoważnienie do odbioru dziecka, Oświadczenia RODO. Meta pattern: "PDF · size · aktualizacja MM.YYYY" (real values when files land). Notes to carry: "Wypełnione dokumenty można złożyć w żłobku lub przez ePUAP." and "Wersje papierowe dostępne w sekretariacie. Dokumenty w wersji dostępnej cyfrowo: na życzenie, zlobek@ugstromiec.pl."

## Cennik (Phase 5)

STRUCK (05 D-02): Three cards: Opłata za pobyt 400 zł / miesięcznie ("Opłata stała za miejsce w żłobku, niezależna od frekwencji.") · Wyżywienie 14 zł / za dzień ("Śniadanie, dwudaniowy obiad i podwieczorek z własnej kuchni.") · Wpisowe 0 zł / jednorazowo ("Nie pobieramy opłaty wpisowej ani za wyprawkę."). Obowiązują od 1 września 2026 (PLACEHOLDER).
STRUCK (05 D-02): Dofinansowanie box: "Rodzice mogą skorzystać z dofinansowania ZUS do pobytu dziecka w żłobku: do 400 zł miesięcznie (przekazywane bezpośrednio do placówki, obniża opłatę za pobyt). Alternatywnie: Rodzinny Kapitał Opiekuńczy dla drugiego i kolejnego dziecka. Wniosek składa się elektronicznie przez PUE ZUS. Chętnie pomożemy w formalnościach!"
Odpisy note: "Odpisy za nieobecność dziecka dotyczą stawki żywieniowej (za każdy zgłoszony dzień nieobecności). Szczegóły w Regulaminie żłobka." The two struck sentences above stay readable as a record of what was drafted and are unusable as a source: the live fee copy is defined by `05-UI-SPEC.md` Contracts 3 and 4, and the ZUS explainer's own złoty amount is deliberately absent because no confirmed source replaces it, so `/cennik` says "w maksymalnej wysokości" and states that the benefit is paid directly to the żłobek.

## Galeria (Phase 5)

Nine slots: Sala zabaw (maluchy), Sypialnia, Plac zabaw, Kącik plastyczny, Jadalnia, Szatnia, Zajęcia muzyczne, Budynek żłobka, Ogród. All photos need documented wizerunek consent if any child is identifiable; prefer interiors without children. NOT STRUCK: the nine slots stay usable as a shot list (05 D-15), but that consent rule is OVERRIDDEN for the surface the gallery now renders on by `02-UI-SPEC.md:115` D-04, which is harder and admits zero identifiable people at all; loosening it is a future amendment made in the open at the Phase 6 gate, never an executor's call while placing a photo.

## Dojazd (Phase 4, likely inside Kontakt)

Coords: 51.64222, 21.09111 (PLACEHOLDER until address confirmed); OSM bbox 21.045,51.618,21.135,51.665. Static map image only, never an iframe. Direction cards:
- Samochodem: "Z Białobrzegów drogą powiatową w kierunku Stromca (ok. 10 km). Żłobek przy ul. Radomskiej 5, obok szkoły podstawowej. Bezpłatny parking dla rodziców przed budynkiem."
- Komunikacją: "Autobusy PKS z Białobrzegów i Radomia: przystanek „Stromiec centrum", ok. 3 minuty pieszo od żłobka."
- Rowerem i pieszo: "Przy wejściu stojak na rowery oraz miejsce na wózki. Wejście i budynek bez barier architektonicznych."

## Kontakt (Phase 4)

Cards: Adres (ul. Radomska 5, 26-804 Stromiec; powiat białobrzeski, woj. mazowieckie) · Telefon (48 619 10 25; sekretariat pon.-pt. 7:00-15:00) · E-mail (zlobek@ugstromiec.pl; "odpowiadamy do 2 dni roboczych") · Dyrektor (NAME BANKED, DO NOT SHIP without confirmation + consent; source draft: "mgr Anna Kowalczyk, przyjmuje: wtorki 9:00-11:00").
Organ prowadzący line: "Gmina Stromiec, ul. Piaski 4, 26-804 Stromiec · tel. 48 619 10 20 · www.ugstromiec.pl".

## RODO klauzula informacyjna (Phase 6, DRAFT, requires IOD review)

Seven sections from the source (administrator, IOD contact, cele i podstawy: art. 6 ust. 1 lit. c i e RODO + ustawa z 4 lutego 2011 o opiece nad dziećmi w wieku do lat 3, odbiorcy, okres przechowywania, prawa osób + skarga do PUODO, wymóg podania danych). CORRECTIONS NEEDED: administrator e-mail must be the confirmed inbox (source used the rejected domain); IOD address `iod@zlobekstromiec.pl` unverified; the whole text must be approved by the Gmina IOD before publication.

## Deklaracja dostępności (Phase 6, DRAFT, requires legal review)

Four sections from the source (wstęp: ustawa z 4 kwietnia 2019; status: częściowo zgodna, PDF caveat; informacje zwrotne: e-mail + tel; dostępność architektoniczna: budynek parterowy bez barier, dostosowana toaleta, miejsce parkingowe). Dates, conformance status, and the self-assessment claim must reflect the real audit at Phase 6 (do not copy the source's dates).

## Aktualności (Phase 3)

Launch post draft: "Wielkie otwarcie żłobka: 14 sierpnia!" (1 sierpnia 2026): "Z ogromną radością informujemy, że 14 sierpnia 2026 r. o godz. 11:00 odbędzie się uroczyste otwarcie Publicznego Żłobka w Stromcu, pierwszej takiej placówki w naszej gminie! W programie: zwiedzanie sal, spotkanie z kadrą, animacje i słodki poczęstunek dla najmłodszych. Serdecznie zapraszamy wszystkich rodziców i dzieci. Podczas dnia otwartego będzie można również złożyć kartę zgłoszenia dziecka i zapytać o szczegóły rekrutacji."
News-card visual: tint icon chip + title + date + arrow (see source; restyle to tokens, no emoji).

## Day plan (canonical, mirrors site.ts)

6:30–8:30 Przyjmowanie dzieci, swobodna zabawa · 8:30–9:00 Śniadanie · 9:00–11:00 Zajęcia i zabawy, spacer lub plac zabaw · 11:00–11:30 Obiad: zupa · 11:30–13:30 Leżakowanie, odpoczynek · 13:30–14:00 Obiad: drugie danie · 14:00–16:30 Podwieczorek, zabawy, odbiór dzieci. (PLACEHOLDER schedule.)

## Footer extras (later phases)

ePUAP external link (Phase 4, alongside forms) and real program logos (Herb gminy Stromiec, Aktywny Maluch) replacing the placeholder slots (Phase 6 assets).
