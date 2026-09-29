---
zadanie: 260929-klv
tytul: Przycisk Facebooka w hero i naprawa lamania nazw dokumentow na telefonie
type: quick
tasks: 2
autonomous: true
tryb: gsd-fast (edycja bezposrednia, bez planera i wykonawcy)
---

# Przycisk Facebooka w hero i wiersze dokumentów na telefonie (2026-09-29)

Prośba użytkownika po wdrożeniu 260929-ips: (1) trzeci przycisk w hero strony głównej
prowadzący do profilu na Facebooku; (2) błąd zgłoszony ze zrzutu z iPhone'a: w kaflu
„Dokumenty do pobrania" na stronie głównej nazwa dokumentu łamie się sylaba po sylabie.

## Zadanie 1: trzeci przycisk w hero

`Cta.svelte` dostaje `external` (target, rel, ukryty sufiks „(otwiera się w nowej karcie)")
oraz opcjonalny snippet `ikona` przed etykietą. `Hero.svelte` renderuje trzeci `Cta`
(secondary, external) „Odwiedź nas na Facebooku" z `IconFacebook`, href z
`contact.facebookUrl`. Test: `tests/home.spec.ts`, nazwa dostępna, href, target, rel oraz
kolejność trzech przycisków.

## Zadanie 2: wiersze dokumentów poniżej 640 px

`Recruitment.svelte` `.doc-row` przechodzi w kolumnę (nazwa nad metą) w `@media (max-width: 639px)`,
tak jak `/dokumenty` (260921-j9c) i `/rekrutacja` (260923-mb0). Test: przy 390 px nazwa ma
ponad 220 px szerokości, a meta stoi pod nią, dla obu wierszy.

Weryfikacja: zrzuty hero i kafla przy 390 i 1280 px obejrzane;
`npm run check && npm run lint && npm run test:unit && npm run test`.
