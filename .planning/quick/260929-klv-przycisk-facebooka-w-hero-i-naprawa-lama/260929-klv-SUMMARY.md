---
quick_id: 260929-klv
phase: quick-260929-klv
plan: 01
status: complete
subsystem: ui
tags: [hero, facebook, dokumenty, mobile]
date: 2026-09-29
requirements: [HOME-02, RECRUIT-05, SITE-04]
key-files:
  modified:
    - src/lib/components/Cta.svelte
    - src/lib/components/Hero.svelte
    - src/lib/components/Recruitment.svelte
    - tests/home.spec.ts
---

# Quick 260929-klv: przycisk Facebooka w hero i wiersze dokumentów

## Zadanie 1: trzecia akcja w hero

`Cta.svelte` ma dwie nowe opcje: `external` (target `_blank`, `rel="noopener noreferrer"`,
ukryty wizualnie sufiks „(otwiera się w nowej karcie)" jako część nazwy dostępnej, ten sam
wzorzec co odnośnik do BIP i do Facebooka w stopce) oraz snippet `ikona` renderowany przed
etykietą. Strzałka `icon` pozostaje zarezerwowana dla akcji głównej. `Hero.svelte` dodaje
trzeci przycisk „Odwiedź nas na Facebooku" (secondary, external, `IconFacebook`), href z
`contact.facebookUrl`; `grep -ro '61593361692060' src/ | wc -l` nadal daje 1.

Na 1280 px trzeci przycisk schodzi do drugiego wiersza pod dwoma pierwszymi (kolumna hero ma
około 430 px), na 390 px trzy przyciski stoją w kolumnie. Oba zrzuty obejrzane.

## Zadanie 2: wiersze „Dokumenty do pobrania" na stronie głównej

Błąd ze zrzutu z iPhone'a: meta wiersza („PDF · 305 KB · wersja z 01.04.2026") ma `flex: none`,
więc obok niej nazwa dostawała około 100 px i `overflow-wrap: anywhere` łamał „Regulamin
rekrutacji" sylaba po sylabie. Ten sam wiersz na `/dokumenty` (260921-j9c) i `/rekrutacja`
(260923-mb0) dostał już regułę mobilną; kafel na stronie głównej był trzecią kopią i jedyną
bez niej. Poprawka: `.doc-row` w `Recruitment.svelte` jest kolumną (nazwa nad metą) BEZ
warunku szerokości, bo ten kafel jest paskiem bocznym o około 400 px także na desktopie,
gdzie nazwa regulaminu zajmowała cztery wiersze obok mety. Po zmianie: dwa wiersze na 1280 px,
dwa na 390 px. Oba zrzuty obejrzane.

## Testy

Dwa nowe w `tests/home.spec.ts`: hero (nazwa dostępna, href z site.ts, target, rel, kolejność
trzech przycisków) oraz kafel na 390 px (nazwa szersza niż 220 px, meta poniżej nazwy, dla obu
wierszy). Drugi test był czerwony przed poprawką (193 px). Pierwsza wersja poprawki z
`align-items: flex-start` też go nie przeszła: element nazwy kurczył się do swojego tekstu;
`stretch` daje nazwie całą szerokość kafla.

## Weryfikacja

`npm run check` 4415 plików, 0 błędów, 0 ostrzeżeń; `npm run lint` czysty; `npm run test:unit`
645/645; `npm run test` 493/494 w pełnym biegu, jedyny czerwony to
`tests/admin-strony.spec.ts` (zapis planu dnia w panelu), obszar nietknięty tą zmianą,
zielony w izolacji, więc flake pod obciążeniem równoległym, znany w tym repo.

Tryb gsd-fast, bez planera i wykonawcy.

## Do zgłoszenia użytkownikowi

Brak nowych pytań do dyrektor. Plakat i włączenie indeksowania nadal czekają na jej odpowiedź.
