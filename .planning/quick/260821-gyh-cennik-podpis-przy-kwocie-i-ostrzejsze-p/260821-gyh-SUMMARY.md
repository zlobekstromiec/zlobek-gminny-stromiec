---
quick_id: 260821-gyh
slug: cennik-podpis-przy-kwocie-i-ostrzejsze-p
date: 2026-08-21
status: complete
commit: f02ed1e
files_changed: 7
tasks_completed: 4
---

# Podsumowanie: podpis przy kwocie i ostrzejsze podpowiedzi w panelu

## Co sie okazalo przed zmiana

Prosba dyrektorki („czesne to 2337 zl") nie byla zgloszeniem bledu w liczbie. Uchwala
XXIII.134.2026 ustala 2337 zl w par. 1 ust. 1, obniza o 837 zl w par. 2 ust. 1, wiec
rodzic placi 1500 zl. Strona pokazywala dokladnie to. Zrodlo:
`.planning/dane-bip-zlobek-stromiec.md:56-65`, znacznik `[BIP]`.

Potwierdzenie kierunku jest w jej wlasnym zalaczniku: par. 2 ust. 1 obniza „oplate, o
ktorej mowa par. 1 ust. 1". Jej cytat zaczyna sie od par. 1 ust. 2, wiec kwota bazowa w
mailu w ogole nie pada. 837 zl to dokladnie standardowa stawka dofinansowania Aktywny
Maluch na miejsce przez 36 miesiecy, a 2337 − 837 = 1500 to dokladnie sufit swiadczenia
ZUS. Gmina ustawila baze tak, zeby po obnizce trafic w maksimum ZUS.

## Czerwony przed zmiana

`npx playwright test tests/cennik.spec.ts` przed implementacja: **1 failed, 13 passed**,
`Expected: 1, Received: 0` na `locator('.ramka-oplaty').locator('.kwota-podpis')`.

## Rozbieznosc z planem, ktora kosztowalaby czerwona suite

Plan (i zatwierdzony plan wyzszego poziomu) twierdzil, ze zmiana podpowiedzi panelu jest
„test-safe", bo testy deferencjonuja stale symbolicznie. **To bylo nieprawdziwe dla
jednego testu.** `tests/instrukcja.unit.ts:362-366` pina `KOPIA_CENNIK.obliczonaPodpowiedz`
DOSLOWNIE w bajtach `docs/instrukcja-cms.md` (po normalizacji bialych znakow, stad grep po
surowym pliku niczego nie znajduje). Zmiana samej stalej dala **592 pass / 1 fail**.

Instrukcja nie jest notatka deweloperska: renderuje sie pod `/admin/pomoc` i jest omiatana
przez `tests/admin-polski.spec.ts`. Poprawiona w tym samym commicie, dwa miejsca w sekcji
„Cennik". Po poprawce 593 pass / 0 fail.

## Decyzje podjete na wyrenderowanej stronie

**Podpis stoi NAD kwota, nie pod nia**, i brzmi „Rodzic placi:", czyli co do znaku tyle co
etykieta dolnego wiersza rozbicia plus dwukropek. To jest mechanizm, nie ozdoba: czytelnik
laczy najglosniejsza liczbe z wierszem, ktory ja wyprowadza.

**Etykieta pola w panelu NIE zostala zmieniona.** Jest dostepna nazwa kontrolki i trescia
odnosnika w podsumowaniu bledow (WCAG 2.4.4) oraz cytatem w instrukcji. Doprecyzowanie
poszlo do podpowiedzi, na ktora wskazuje `aria-describedby`.

## Zmierzone po zmianie

| Miara (Chromium, zbudowana strona) | 375 px | 1280 px |
| --- | --- | --- |
| wiersz „Stawka z uchwaly (przed obnizka)" | 41 px | 41 px |
| etykieta i kwota w jednej linii | tak | tak |
| podpis bezposrednio nad kwota | tak, odstep 4 px | tak, odstep 4 px |

Dluzsza etykieta NIE lamie sie na telefonie, czyli ryzyko wskazane przy projektowaniu nie
zmaterializowalo sie.

## Bramki, ktore powstaly przy okazji

HARD RULE 1 i HARD RULE 3 modulu prozy byly do dzis wylacznie komentarzem, a to zadanie
dokladalo do tego modulu czwarty ciag. Sa teraz testem w `tests/cennik-reader.unit.ts`.

Grep po zrodle bylby ZLA bramka: z trzech trafien `\d+ zl` w `cennik.ts` dwa leza w jego
wlasnych komentarzach, ktore te regule opisuja. Bramka czyta wiec wyeksportowane WARTOSCI.
Obie sprawdzone mutacja: po wstawieniu kwoty do `KWOTA_PODPIS` i drugiej kwoty do
`przykladZus` obie zaswiecily na czerwono, pierwsza z nazwa winnego eksportu.

## Brama

```
npm run check      -> 4403 FILES 0 ERRORS 0 WARNINGS
npm run lint       -> All matched files use Prettier code style!
npm run test:unit  -> tests 595 | pass 595 | fail 0
npm run test       -> 429 passed (50.9s)
```

## Co zostaje otwarte

- **Kwota nadal czeka na potwierdzenie dyrektorki.** Zadana liczba sie nie zmienila i nie
  zmieni sie, dopoki nie odpowie, czy rodzic placi 1500 zl (obnizka obowiazuje), czy 2337 zl
  (obnizka nie jest stosowana). Oplaty ruszaja 1 wrzesnia 2026. Tresc maila w planie
  `~/.claude/plans/i-think-the-overall-stateful-chipmunk.md`.
- **Odpowiedz „2337" NIE jest zapisem jednego pola.** Szesc innych zdan na stronie zaklada,
  ze obnizka obowiazuje, i cztery z nich sa kodem, nie sklepem. Obietnica „0 zl" jest
  prawdziwa TYLKO dlatego, ze 2337 − 837 trafia w sufit ZUS. Rozpiska w planie.
- `placeholder: true` zostaje: regula odpisu za nieobecnosc dalej nie ma zrodla.
