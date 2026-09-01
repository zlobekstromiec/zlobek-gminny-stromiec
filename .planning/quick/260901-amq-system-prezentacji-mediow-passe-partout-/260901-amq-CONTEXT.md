# 260901-amq — CONTEXT (decyzje zablokowane przed planowaniem)

Data: 2026-09-01. Zgloszenie uzytkownika: „The pictures whenever clicked on look very
unprofessional, round buttons mixing with squares of different corner sizes... we need a UI
design for a new design for all media." Plus, po doprecyzowaniu: podpisy zdjec zostaja
WYLACZNIE na /o-nas, a strony ze zdjeciami „render weirdly and need to be fixed".

Skill `frontend-design` byl zaladowany przed projektowaniem, zgodnie z prosba uzytkownika.

## Dowody zmierzone na zywej stronie (nie oszacowane)

Chrome DevTools, viewport 1440, 2026-09-01.

**A. Strona wpisu ma TRZY rozne miary w jednej kolumnie.**

| Element | left | right | szerokosc |
|---|---|---|---|
| `h1` oraz `h2` | 329 | **1097** | 768 px |
| akapity tresci | 329 | **849** | 520 px |
| siatka zdjec | 329 | **1097** | 768 px |

Proza konczy sie 248 px przed fotografiami. Wszystkie elementy dziela lewa krawedz, ale
prawa skacze miedzy dwoma pozycjami. To jest widoczne na zrzucie ekranu uzytkownika i to
jest „renders weirdly". Miara 520 px to okolo 65 znakow, czyli DOBRA typografia; bledem
jest to, ze naglowki i media ja ignoruja, nie bedac przy tym swiadomym wyjsciem poza kolumne.

**B. Podglad miesza trzy geometrie.** `Lightbox.svelte`: panel `--radius-lg` 24 px z
`padding: 16px`, zdjecie w srodku rowniez `--radius-lg` 24 px, przycisk zamkniecia
`--radius-pill` 44x44 czyli PELNE KOLO, wypelniony `--color-brand-blue`, w osobnym pasku
`.pasek` nad zdjeciem.

**C. Zablokowana specyfikacja JUZ rozstrzyga promienie**, a podglad jej nie stosuje.
`01-UI-SPEC.md` §Radius & Elevation: `sm` 8 px „image placeholders", `md` 16 px „cards",
`lg` 24 px „hero image slot, large surfaces". Skala jest KONCENTRYCZNA z konstrukcji:
panel 24 px z wcieciem 16 px daje dokladnie 8 px w srodku, czyli `--radius-sm`.
`NewsCard` robi to poprawnie (okladka `--radius-sm`), podglad nie.

**D. Kafelki galerii uzywaja `--radius-lg` 24 px**, a okladki `NewsCard` `--radius-sm` 8 px.
Ta sama klasa tresci, promien rozny trzykrotnie.

**E. Cztery z szesciu zdjec na /o-nas sa PIONOWE.** Zmierzone `naturalWidth/Height`:
`szatnia` 475x267 (16:9), `sala-glowna` 475x844 (9:16), `sala-kacik-kuchenny` 475x844,
`sala-zabawki` 475x844, `plac-zabaw-hustawki` 475x844, `budynek-front` 475x267.
Kafelek wymusza `aspect-ratio: 4/3` z `object-fit: cover`, wiec pionowe zdjecie jest
przyciete do srodkowego pasa. Podglad pokazuje potem CALE zdjecie, `max-height: 70vh`,
`width: auto`. Kafelek i podglad pokazuja inne kadry tego samego zdjecia.

## D-1 (LOCKED) — kierunek: passe-partout

Uzytkownik wybral wariant „Passe-partout" sposrod trzech przedstawionych. Karta podgladu
zachowuje sie jak oprawiona fotografia: rowne wciecie wokol zdjecia, zdjecie koncentryczne
wzgledem panelu, kontrolka ustepuje fotografii. Wariant „od krawedzi do krawedzi" zostal
ODRZUCONY miedzy innymi dlatego, ze podpis na gradiencie nad fotografia uzaleznia kontrast
tekstu od zdjecia, a WCAG 2.1 AA jest tu prawnie wiazace.

## D-2 (LOCKED) — PRAWO KONCENTRYCZNOSCI dla wszystkich mediow

Jedna regula obowiazujaca kazda powierzchnie medialna w projekcie:

> **promien wewnetrzny = promien kontenera − wciecie**

Poniewaz skala to 8/16/24, a wciecia to 8/16, wynik ZAWSZE lada na istniejacym tokenie.
Zadna nowa wartosc promienia nie powstaje i `app.css` nie zyskuje nowego tokenu.

Tabela obowiazujaca (planista weryfikuje kazdy wiersz w kodzie przed zmiana):

| Powierzchnia | Kontener | Wciecie | Promien obrazu |
|---|---|---|---|
| Panel podgladu (`Lightbox .panel`) | `--radius-lg` 24 | 16 | `--radius-sm` 8 |
| Kafelek galerii (`.kafelek`, stoi samodzielnie) | brak | brak | `--radius-md` 16 |
| Okladka `NewsCard` | karta `--radius-md` | 16 | `--radius-sm` 8 (JUZ poprawne, nie ruszac) |
| Slot zdjecia w `Hero` | brak, duza powierzchnia | brak | `--radius-lg` 24 (bez zmian) |
| `MapPanel`, `AboutTeaser` | sprawdzic i doprowadzic do reguly | | |

Kafelek schodzi z 24 na 16, bo `--radius-lg` jest w specyfikacji zarezerwowany dla „hero
image slot, large surfaces", a kafelek 372 px w siatce nia nie jest.

## D-3 (LOCKED) — ZERO KOL w obudowie mediow

Przycisk zamkniecia przestaje byc kolem i przestaje byc niebieski. Staje sie kontrolka
40x40 o promieniu `--radius-sm` 8 px, czyli TYM SAMYM co fotografia obok, w stylu ghost:
tlo przezroczyste, ikona `--color-ink`, obrys `--color-border-subtle`, a na hover i focus
wypelnienie `--color-surface-warm`. Cala kompozycja ma wtedy jeden jezyk ksztaltu:
panel 24, zdjecie 8, przycisk 8. Znika `.pasek` jako osobny 44-pikselowy pas, wiec znika
tez pusty bialy pasek nad fotografia.

**To jest SWIADOME odstepstwo od zablokowanej specyfikacji** i musi zostac odnotowane
w SUMMARY jako kandydat na poprawke `01-UI-SPEC.md`. Specyfikacja przypisuje `--radius-pill`
do „Buttons (CTA + secondary), tags". Ikonowa kontrolka zamkniecia nie jest ani CTA, ani
przyciskiem drugorzednym, ani tagiem, wiec specyfikacja jej NIE nazywa; to nowa regula,
nie zlamanie istniejacej. Nie wolno przy okazji ruszac zadnego CTA ani taga.

Przycisk ZOSTAJE WEWNATRZ panelu. Powod jest juz zapisany w komentarzu komponentu i nadal
obowiazuje: kontrolka, ktorej jedynym tlem jest polprzezroczysta nakladka, nie ma
gwarantowanego kontrastu wobec fotografii pod nia.

## D-4 (LOCKED) — podpisy TYLKO na /o-nas

Uzytkownik zmienil wczesniejsza odpowiedz i rozstrzygnal: „only the o-nas page can have
podpis". Uzasadnienie: pod wpisem proza i tak opisuje scene, wiec zdjecie broni sie samo;
na /o-nas podpis niesie nazwe pomieszczenia, ktorej nie powtarza zaden sasiedni tekst.

- `/o-nas`: `<figcaption>` pod kafelkiem ZOSTAJE, podpis w podgladzie ZOSTAJE.
- Wpisy `/aktualnosci/[slug]`: `<figcaption>` (dzis linia 134) ZNIKA i podpis w podgladzie
  ZNIKA.
- `podpis` staje sie w `Lightbox.svelte` propem OPCJONALNYM. Gdy go nie ma, widoczny `<h2>`
  nie jest renderowany.

**Pulapka dostepnosci, ktora trzeba obsluzyc, a nie przeoczyc.** Dzis `podpis` nadaje oknu
nazwe przez `aria-labelledby={PODPIS_ID}` wskazujace na ten `<h2>`. Usuniecie naglowka bez
zamiany zostawiloby `role="dialog" aria-modal="true"` BEZ NAZWY DOSTEPNEJ. Okno musi wiec
zawsze miec nazwe: gdy podpisu nie ma, `aria-label` budowany z tekstu alternatywnego
zdjecia albo ze stalej polskiej etykiety. Tekst alternatywny zostaje na obrazie zawsze
i nic go nie dotyczy.

**Panel redakcyjny mowi dzis nieprawde i to trzeba naprawic.** `podpis` jest polem
WYMAGANYM (`podpisEtykieta: 'Podpis zdjecia *'`, blad `podpisBrak`), a podpowiedz
`podpisPodgladu: 'Tak zdjecie pojawi sie na stronie.'` przestaje byc prawdziwa dla zdjec
we wpisie. Pole ZOSTAJE wymagane, bo niesie nazwe okna podgladu, ale copy panelu dla sekcji
aktualnosci musi powiedziec wprost, ze podpis nie jest pokazywany przy zdjeciu we wpisie.
UWAGA: copy panelu jest przypiete przez `tests/instrukcja.unit.ts` oraz
`docs/instrukcja-cms.md`, a test skleja biale znaki, wiec zwykly grep po frazie w
dokumentacji moze niczego nie znalezc. Zmiana copy bez zmiany obu tych miejsc zapali testy.

## D-5 (LOCKED) — jedna miara kolumny na stronie wpisu

Strona wpisu dostaje JEDNA miare tresci. Proza, `h1`, `h2` oraz siatka zdjec dziela
te sama lewa i te sama prawa krawedz. Docelowa miara to okolo 680 px, czyli okolo 68 znakow
przy obecnym stopniu pisma: proza pozostaje czytelna, a dwukolumnowa siatka daje kafelki
okolo 328 px, wiec fotografie nie malaja w sposob odczuwalny.

Odrzucone swiadomie: (a) rozciagniecie prozy do 768 px, bo daje okolo 96 znakow w wierszu;
(b) zwezenie samej siatki do 520 px, bo kafelek spada wtedy do okolo 248 px; (c) zostawienie
wyjscia poza kolumne, bo zeby czytac sie jako zamierzone, musialoby byc symetryczne po obu
stronach, a obecne rozszerza sie wylacznie w prawo.

Planista MUSI sprawdzic, czy /o-nas ma ten sam problem. Pomiar z 2026-09-01 pokazuje, ze
sekcja galerii na /o-nas jest spojna (naglowek sekcji w lewej kolumnie, tekst w prawej,
siatka na pelna szerokosc), wiec prawdopodobnie zmiany NIE wymaga. Nie zmieniac jej
„przy okazji" bez pomiaru.

## D-6 (LOCKED) — pionowe zdjecia na /o-nas

Kafelek zostaje przy `aspect-ratio: 4/3` z `object-fit: cover`, bo jednolita siatka jest
wartoscia sama w sobie i cala reszta strony na niej stoi. Zmienia sie natomiast
`object-position` na `center top` dla kafelka, poniewaz w fotografii wnetrza i placu zabaw
tresc jest u gory kadru, a srodkowy pas wysokiego zdjecia ucina to, po co sie na nie patrzy.

NIE przycinamy plikow zrodlowych i nie dodajemy kadrowania w panelu. To zadanie dotyczy
prezentacji, nie zasobow. Rozbieznosc miedzy kadrem kafelka a pelnym zdjeciem w podgladzie
zostaje odnotowana w SUMMARY jako znany, zaakceptowany kompromis.

## Ograniczenia wiazace dla wykonania

- **Zablokowana specyfikacja `01-UI-SPEC.md` obowiazuje.** Paleta, typografia i skala
  promieni pozostaja nietkniete. `app.css` NIE zyskuje nowego tokenu.
- **WCAG 2.1 AA jest prawnie wiazace** (podmiot publiczny): widoczny focus, obsluga
  klawiatura, `prefers-reduced-motion`, kontrast z warstwy `accessible`. Okno dialogowe
  musi zawsze miec nazwe dostepna. Testy axe musza pozostac zielone.
- **Polski w calosci, zero emoji, zero myslnikow**, poltrapez tylko w zakresach liczbowych.
- **Nie ruszac zachowania podgladu**, ktore jest juz udowodnione: przywracanie focusu
  w sprzataniu `$effect`, `role="dialog"`, `aria-modal`, obsluga klawiatury na DIALOGU,
  czas animacji z funkcji (obsluga `prefers-reduced-motion` w JS, nie tylko w CSS),
  dwa komentarze wyciszajace kompilator nad scrimem (bez nich `npm run check` pada),
  kafelek jako `<a href>` dzialajacy bez JavaScriptu i waskie przechwycenie kliku.
- **Testy sa czescia dostawy.** Ruszane sa `tests/galeria.spec.ts`, `tests/o-nas.spec.ts`,
  `tests/aktualnosci.spec.ts`, `tests/opisy-zdjec.unit.ts`, byc moze `tests/responsive.spec.ts`
  i `tests/instrukcja.unit.ts`. Kazdy z nich moze przypinac dzisiejsza tresc jako kontrakt.
- **Weryfikacja przed commitem:** `npm run check && npm run lint && npm run test:unit && npm run test`.
  Pre-commit uruchamia tylko dwa pierwsze, `test:unit` nie ma CI.
- Przed pelnym `npm run test` zabic proces na porcie 4173, inaczej Playwright mierzy stary build.
- Bash to zsh: cytowac zmienne i globy.
