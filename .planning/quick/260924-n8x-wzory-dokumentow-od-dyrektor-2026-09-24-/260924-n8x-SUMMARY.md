---
quick_id: 260924-n8x
phase: quick-260924-n8x
plan: 01
status: complete
subsystem: content
tags: [dokumenty, rekrutacja, rodo]
date: 2026-09-24
requirements: [DOCS-01, RECRUIT-02, RECRUIT-05]
key-files:
  created:
    - src/lib/content/dokumenty/klauzula-rekrutacja.json
    - src/lib/content/dokumenty/klauzula-opieka-nad-dzieckiem.json
    - static/dokumenty/ (10 nowych .docx)
  modified:
    - src/lib/content/dokumenty/rekrutacja-wniosek.json
    - src/lib/content/dokumenty/rekrutacja-zalacznik-1..6.json
    - src/lib/content/dokumenty/rezygnacja-z-miejsca.json
  deleted:
    - static/dokumenty/wniosek-o-przyjecie-dziecka.doc
    - static/dokumenty/rekrutacja-zalacznik-6.doc
    - static/dokumenty/rezygnacja-z-miejsca.doc
---

# Quick 260924-n8x: wzory dokumentów od dyrektor (2026-09-24)

Dziesięć plików z `zmianawdokumentach.zip` jest na stronie. Osiem to nowe wersje formularzy
opublikowanych 23.09 (wniosek na rok 2026/2027, załączniki 1 do 6, oświadczenie o rezygnacji),
każdy w .docx i z wbudowaną informacją RODO, więc trzy stare pliki .doc zostały usunięte, a
ścieżki wyrównane do slugów sklepu (`/dokumenty/<slug>.docx`), co domyka rozjazd zapisany w
260921-j9c § 5 dla wniosku. Dwa pliki to nowe klauzule w kategorii RODO: „rekrutacja do żłobka"
i „opieka nad dzieckiem w żłobku". Wersja wszystkich dziesięciu wpisów: 24.09.2026.

Każdy .docx sprawdzony jako poprawne archiwum z poprawnym XML we wszystkich częściach, bez
„Błotnica" i bez „2025/2026". Każda ścieżka `plik` ze sklepu wskazuje istniejący plik (23 wpisy,
23 pliki). Kategoria Rekrutacja nadal ma dziewięć wpisów, dwa pierwsze alfabetycznie to
`rekrutacja-regulamin` i `rekrutacja-wniosek`, więc kafel na stronie głównej się nie zmienił.

Łańcuch weryfikacji: `npm run check` 4414 plików, 0 błędów, 0 ostrzeżeń; `npm run lint` czysty;
`npm run test:unit` 645/645; `npm run test` 489/489.

Tryb gsd-fast: edycja bezpośrednia bez planera i wykonawcy, bo zadanie jest mechaniczną
podmianą plików i wpisów sklepu.

## Do zgłoszenia użytkownikowi

1. **Klauzula 06 z 21.09 (dzieci, rodzice i opiekunowie) została na stronie.** Nowe klauzule
   09 (rekrutacja) i 10 (opieka) pokrywają ten sam zakres w dwóch częściach, ale dyrektor nie
   napisała, że ją zastępują, a `/polityka-prywatnosci` cytuje 06 w całości. Do zapytania:
   czy 06 ma zostać obok 09 i 10, czy zniknąć (wtedy polityka prywatności musi przejść na
   treść 10).
2. Nowy wniosek jest przypisany do roku 2026/2027 (poprzedni miał puste pole roku). Przy
   następnym naborze trzeba będzie go podmienić w panelu.
3. Pytania z 260923-mb0 (gospodarstwo rolne vs działalność gospodarcza, numer zarządzenia,
   okres przechowywania nagrań, termin naboru) pozostają otwarte; nowy załącznik 3 nadal
   mówi o działalności gospodarczej.
