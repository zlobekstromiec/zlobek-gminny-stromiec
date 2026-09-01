---
quick_id: 260901-amq
phase: quick-260901-amq
plan: 01
type: execute
status: complete
subsystem: frontend
tags: [media, lightbox, a11y, layout, design-system]
requirements: [SITE-04, NEWS-02, GALLERY-01, A11Y-01]
completed: 2026-09-01
duration_min: 40

dependency_graph:
  requires:
    - .planning/phases/01-live-homepage-design-foundation/01-UI-SPEC.md
    - .planning/quick/260901-amq-system-prezentacji-mediow-passe-partout-/260901-amq-CONTEXT.md
  provides:
    - "Prawo koncentrycznosci mediow, pinowane testem na siedmiu powierzchniach"
    - "Nazwa dostepna okna podgladu niezalezna od podpisu"
    - "Jedna miara kolumny na stronie wpisu"
  affects:
    - src/lib/components/Lightbox.svelte
    - src/routes/aktualnosci/[slug]/+page.svelte

tech_stack:
  added: []
  patterns:
    - "Asercje na wartosci obliczonej przez przegladarke, nie na zrodle CSS"
    - "Porownanie element z elementem zamiast elementu z liczba pikseli"
    - "Wpis z galeria wyszukiwany z dysku, nigdy po slugu na sztywno"

key_files:
  created:
    - tests/promienie-mediow.spec.ts
  modified:
    - src/lib/components/Lightbox.svelte
    - src/routes/aktualnosci/[slug]/+page.svelte
    - src/lib/server/aktualnosci.ts
    - src/lib/components/Hero.svelte
    - src/lib/components/AboutTeaser.svelte
    - src/lib/components/MapPanel.svelte
    - src/lib/components/NewsCard.svelte
    - tests/galeria.spec.ts
    - tests/aktualnosci.spec.ts

decisions:
  - "Nazwe okna bez podpisu daje stala etykieta `Podglad zdjecia`, nie tekst alternatywny zdjecia"
  - "Okladka wpisu zostaje na 24 px jako zdjecie wiodace strony, rowna randze slotowi Hero"
  - "Zadnego lancucha panelu nie zmieniono: przeslanka D-4 o nieprawdzie panelu NIE ZACHODZI"

actuals:
  tokens: 41000
  tasks: 4
  commits: 4

metrics:
  tests_added: 10
  tests_total_playwright: 464
  tests_total_unit: 644
---

# Quick 260901-amq: system prezentacji mediow (passe-partout) - podsumowanie

Podglad zdjecia przestal mieszac trzy geometrie i otwiera sie jako oprawiona fotografia:
panel 24, wciecie 16, zdjecie 8, kontrolka 8. Z obudowy mediow zniknelo kolo, podpisy zostaly
wylacznie na `/o-nas`, a strona wpisu dostala jedna miare kolumny zamiast trzech.

## Commity

| Zadanie | SHA | Opis |
|---|---|---|
| 1 | `6d9974a` | `feat` podglad zdjecia jako oprawiona fotografia (D-1, D-2, D-3, D-4, D-6) |
| 2 | `a0eb871` | `test` prawo koncentrycznosci pinowane na wszystkich mediach, z audytem |
| 3 | `b9dfde5` | `fix` jedna miara wpisu i podpisy tylko na /o-nas (D-5, D-4) |
| 4 | `085c01c` | `docs` podpis we wpisie nie jest juz renderowany (D-4) |

## Co sie zmienilo

**`Lightbox.svelte`.** Prop `podpis` jest opcjonalny; widoczny `h2` renderuje sie tylko dla
niepustego lancucha po przycieciu bialych znakow. Okno emituje DOKLADNIE JEDEN atrybut nazwy:
`aria-labelledby` gdy podpis jest, `aria-label="Podglad zdjecia"` gdy go nie ma. Kontrolka
zamkniecia przestala byc niebieskim kolem 44x44 w osobnym pasku i jest ghostowym kwadratem
40x40 o promieniu 8 px, bezposrednim dzieckiem panelu, dosunietym w prawo wlasnym marginesem.
Zdjecie w panelu zeszlo z 24 na 8 px, kafelek z 24 na 16 px, a obraz w kafelku kadruje od gory.

**Strona wpisu.** Waska odmiana kontenera zeszla z 52rem na 46.5rem, a blok prozy stracil
wlasny limit `65ch`. `sizes` poszly za miara: okladka 52rem na 44rem, kafelek 25rem na 21rem.
Podpis zniknal spod kafelka i z podgladu, razem z dwiema regulami CSS, ktore go stylowaly.

**Audyt.** Kazda powierzchnia medialna w repozytorium ma teraz werdykt zapisany w komentarzu
przy swojej regule, a nowy `tests/promienie-mediow.spec.ts` pinuje siedem z nich naraz.

## Obserwacje czerwieni (TDD)

Kazdy przypadek byl uruchomiony i zaobserwowany na czerwono ZANIM kod sie zmienil.

| Przypadek | Czerwien, ktora zaobserwowano |
|---|---|
| prawo koncentrycznosci (D-2) | `kafelek galerii: Expected "16px", Received "24px"` |
| zero kol (D-3) | `promien 9999px czyta sie jako pigulka` |
| kontrolka wprost w dialogu (D-3) | `Expected "dialog", Received null` (siedziala w `.pasek`) |
| kadr od gory (D-6) | `Expected "50% 0%", Received "50% 50%"` |
| jedna miara (D-5) | `blok prozy: prawa krawedz Expected <= 1, Received 248` |
| brak podpisow we wpisie (D-4) | `.galeria-wpisu figcaption Expected 0, Received 6` |
| brak naglowka w podgladzie wpisu (D-4) | `dialog h2 Expected 0, Received 1` |
| sweep promieni (zadanie 2) | Hero tymczasowo na `--radius-md`: `Expected 24px, Received 16px` |

**Dwa przypadki byly ZIELONE od poczatku i to jest ich wlasciwy stan**, bo sa bramkami, a nie
zmianami: nazwa dostepna dialogu na `/o-nas` i skan axe otwartego podgladu we wpisie. Bramka
nazwy zostala mimo to udowodniona: po tymczasowym usunieciu `aria-labelledby` i `h2`
z komponentu przypadek zapalil sie na czerwono na SWOJEJ WLASNEJ asercji
(`getByRole('dialog', { name: /\S/u })` daje 0), po czym komponent przywrocono. Przy okazji
kolejnosc asercji w tym przypadku zostala odwrocona, zeby bramka pekala przed kontrola dodatnia,
a nie po niej; w pierwotnej kolejnosci wynik ukrywal, ktora regula wlasnie przestala obowiazywac.

## Werdykt audytu D-2, powierzchnia po powierzchni

| # | Powierzchnia | Werdykt | Uzasadnienie zapisane w kodzie |
|---|---|---|---|
| a | `Hero.svelte` slot zdjecia | 24 px, BEZ ZMIAN | Zdjecie wiodace, „large surfaces" w specyfikacji, D-2 mowi „bez zmian" |
| b | `AboutTeaser.svelte` blok mediow | 24 px, ZOSTAJE | Pol szerokosci ukladu, ponizej 1024 px pelna szerokosc; nie kafelek w siatce |
| c | `MapPanel.svelte` obraz mapy | 16 px, JUZ ZGODNE | Skala karty; brak kontenera i wciecia, wiec regula nie daje liczby |
| d | `NewsCard.svelte` okladka pionowa | 8 px, BEZ ZMIAN | Wartosc z tabeli uzycia specyfikacji, NIE z odejmowania (patrz sprostowanie) |
| e | `NewsCard.svelte` okladka pozioma | 0, SWIADOME | Okladka przylega do krawedzi karty i jest przycinana jej `overflow`; wciecie zero |
| f | Okladka wpisu `/aktualnosci/[slug]` | 24 px, ZOSTAJE | **Powierzchnia, ktorej w tabeli D-2 NIE BYLO** (nizej) |
| g | Promienie podane liczba pikseli | BRAK w mediach | Potwierdzone ponizej |
| h | Powierzchnie 24 px niebedace mediami | POZA ZAKRESEM | Nie ruszone |

**Wynik przeszukania (g), powtorzony po zmianach.** W calym `src/` sa dokladnie trzy wartosci
promienia niebedace tokenem i zadna nie jest obudowa zdjecia:
`Hero.svelte:212` (`9999px`, dekoracyjne rozmyte plamy, `aria-hidden`), `NewsCard.svelte:147`
(`0`, czyli wiersz (e)) i `cennik/+page.svelte:417` (`50%`, kropka punktora o boku 6 px).

## Cztery pozycje wymagane przez plan

### 1. Kandydat na poprawke `01-UI-SPEC.md` (D-3) - do decyzji uzytkownika

`01-UI-SPEC.md` §Radius & Elevation przypisuje `--radius-pill` do „Buttons (CTA + secondary),
tags". **Ikonowa kontrolka zamkniecia podgladu nie jest zadnym z tych trzech**, wiec
specyfikacja jej NIE NAZYWA. Regula „zero kol w obudowie mediow" jest zatem NOWA regula, a nie
zlamaniem istniejacej, i jest kandydatem do dopisania w zablokowanej specyfikacji.

**Specyfikacji nie edytowano w tym zadaniu** i wymaga to podpisu uzytkownika. Proponowane
brzmienie do wklejenia:

> Kontrolki ikonowe w obudowie mediow (podglad zdjecia) uzywaja `--radius-sm`, nigdy
> `--radius-pill`. Ksztalt pigulki pozostaje zarezerwowany dla CTA, przyciskow drugorzednych
> i tagow. Powod: w oprawie fotografii kontrolka dzieli jezyk ksztaltu ze zdjeciem obok niej.

Zadne CTA ani tag nie zostaly przy okazji dotkniete; przemiatanie `tests/promienie-mediow.spec.ts`
obejmuje wylacznie powierzchnie medialne.

### 2. Uzupelnienie tabeli D-2: okladka wpisu

Tabela D-2 wylicza panel podgladu, kafelek galerii, okladke `NewsCard`, slot `Hero`, `MapPanel`
i `AboutTeaser` - i sie konczy. **Okladki wpisu na `/aktualnosci/[slug]` w niej nie ma**, a jest
to powierzchnia medialna z promieniem 24 px.

Werdykt: **ZOSTAJE `--radius-lg`**. To zdjecie wiodace tej strony, najblizszy odpowiednik slotu
w `Hero`, ktoremu D-2 wprost zostawia 24 px, i jedyna powierzchnia medialna tej strony o pelnej
miarze kolumny. Kafelki galerii wpisu stoja pod nia na 16 px, wiec obie czytaja sie jako dwie
rangi jednego systemu, a nie jako niezgodnosc. Werdykt zapisany w komentarzu przy regule
`.cover-band :global(img)`.

### 3. Znany, zaakceptowany kompromis (D-6)

Kafelek pokazuje GORE kadru wysokiego zdjecia, a podglad pokazuje CALA fotografie
(`max-height: 70vh`, `width: auto`). **Kafelek i podglad pokazuja wiec inne kadry tego samego
pliku.** Jest to swiadomie przyjete: jednolita siatka 4:3 jest wartoscia sama w sobie i cala
reszta strony na niej stoi, a srodkowy pas wysokiego zdjecia ucina to, po co sie na nie patrzy.
Plikow zrodlowych nie przycinano i kadrowania w panelu nie dodawano; to zadanie dotyczy
prezentacji, nie zasobow.

Pomiar potwierdza, ze regula dziala tam, gdzie miala: cztery z szesciu fotografii na `/o-nas` to
`475x844` (pionowe), dwie to `475x267` (poziome). Dla poziomych `object-position` pionowo nic
nie znaczy, bo pod `cover` przepelniaja sie w poziomie.

### 4. Wynik sprawdzenia przeslanki D-4 o kopii panelu: PRZESLANKA NIE ZACHODZI

D-4 zakladalo, ze „panel mowi dzis nieprawde" o podpisach zdjec we wpisie. **Sprawdzenie
pokazuje, ze nie mowi, wiec ZADNEGO lancucha nie zmieniono.** Dowody:

- `POLA_GALERIA.podpisPodpowiedz` („Pojawi sie pod zdjeciem na stronie.") i
  `KOMUNIKATY.podpisBrak` naleza do ekranu `/admin/galeria`, ktory zasila `/o-nas`, gdzie
  podpisy ZOSTAJA. Oba pozostaja prawdziwe.
- `docs/instrukcja-cms.md` §8 (wiersze 307-308) to jawnie sekcja o ekranie Galeria.
- `docs/instrukcja-cms.md` §5 wiersz 149 mowi wprost: „Zdjecie dodaje sie na ekranie wpisu
  (jedno zdjecie naglowkowe) oraz na ekranie Galeria". Ekran wpisu ma JEDNO zdjecie naglowkowe
  i zadnego pola podpisu galerii.
- `zGaleria()` przenosi tablice `zdjecia` przez zapis nietknieta, a jej wlasny komentarz
  naglowkowy mowi, ze galeria wpisu „is authored in a pull request and has no control on the
  edit screen".

Zgodnie z poleceniem planu nie wymyslano nowej kopii do pola, ktorego panel nie ma, i nie
dodawano ekranu ani trasy do `tests/fixtures/trasy-panelu.ts`.

**Podpowiedz wyspy zdjecia** (`podpisPodgladu: 'Tak zdjecie pojawi sie na stronie.'`) dotyczy
MINIATURY W PANELU, a nie podpisu publikowanego, wiec D-4 jej nie dotyczy. Pozostaje prawdziwa
takze po D-6, bo wyspa kadruje wybrany plik do proporcji docelowej (4:3 dla galerii, 16:9 dla
okladki wpisu), wiec dla plikow z panelu proporcja zrodla rowna sie proporcji kafelka i nowe
kadrowanie od gory nic dla nich nie zmienia. Zmiana kadru dotyczy wylacznie plikow wysokich,
umieszczonych w repozytorium recznie.

### 5. Sprostowanie do tabeli D-2: wiersz okladki `NewsCard`

Tabela D-2 wyprowadza 8 px okladki `NewsCard` z „karta 16 minus wciecie 16". **Wciecia 16 px
wokol tej okladki NIE MA.** `.news-card` nie deklaruje wlasnego paddingu, caly padding niesie
`.body`, a `.cover` jest bezposrednim dzieckiem karty przylegajacym do jej krawedzi. Prawo
koncentrycznosci nie produkuje tu zadnej liczby; 8 px to odczyt z tabeli uzycia zablokowanej
specyfikacji („sm 8px, image placeholders"), czyli inne i rownie wazne uzasadnienie.

Wartosci NIE ZMIENIONO, zgodnie z D-2. Sprostowanie zapisane w komentarzu przy regule `.cover`,
zeby prawo koncentrycznosci nie bylo pozniej stosowane przez analogie do wiersza, ktory go nie
ilustruje.

## Odstepstwa od planu

**1. [Regula 1 - blad] `margin-left: auto` na `inline-flex` nie dosuwa w prawo.**
Znalezione w zadaniu 1. Plan mowil „dosuniety w prawo przez `margin-left: auto` na elemencie
o stalej szerokosci", ale przycisk odziedziczyl `display: inline-flex` po starej wersji, a
element inline ignoruje automatyczny margines poziomy: kontrolka stala przy LEWEJ krawedzi
panelu, o 856 px od miejsca, w ktorym miala byc. Wykryte przez wlasny przypadek
(`kontrolka nie konczy sie tam, gdzie obszar zdjecia: Received 856`), naprawione zmiana na
`display: flex`. Powod zapisany w komentarzu przy regule. Commit `6d9974a`.

**2. [Ustalenie] Kadrowanie plikow z panelu dzieje sie W PRZEGLADARCE, nie na serwerze.**
Plan (zadanie 4 punkt 2) opisal je jako „po stronie serwera". W kodzie kadruje
`src/lib/components/admin/ZdjecieIsland.svelte` (kadr ze srodka do proporcji docelowej,
`drawImage` na canvasie), a `src/lib/server/admin/obraz.ts` jedynie re-eksportuje stala
proporcji i sprawdza ksztalt oraz rozmiar ladunku. **Wniosek sie nie zmienia**: plik z panelu
i tak dociera juz w proporcji docelowej, wiec `object-position` nic dla niego nie znaczy, a
podpowiedz panelu pozostaje prawdziwa. Odnotowane zamiast poprawiania instrukcji na wyczucie.

**3. [Odnotowanie] Pas nad fotografia ma 40 px, a nie zero.**
D-3 uzasadnia usuniecie `.pasek` miedzy innymi tym, ze „znika tez pusty bialy pasek nad
fotografia". Zmierzone po zmianie: od gornej krawedzi panelu do gornej krawedzi zdjecia jest
64 px, czyli 16 (wciecie) + 40 (kontrolka) + 8 (odstep). Ten wiersz **nie jest juz pusty** -
zajmuje go sama kontrolka - ale nie jest tez zerowy, i nie moze byc, bo D-3 rozstrzyga, ze
przycisk ZOSTAJE WEWNATRZ panelu. Zapisane, zeby nikt nie czytal D-3 jako obietnicy zera.

Zadne inne odstepstwo nie wystapilo. Bramek uwierzytelnienia nie bylo. Zadnego zakazu
z listy `hard_prohibitions` nie naruszono: `app.css` nie zyskal tokenu, paleta i typografia sa
nietkniete, ksztalt CTA i tagow nietkniety, podpisy `/o-nas` nietkniete, wlasnosci nosne
`Lightboxa` (przywracanie fokusu w sprzataniu `$effect`, `role`/`aria-modal`/`tabindex`,
klawiatura na dialogu, czas ruchu z funkcji, dwa komentarze wyciszajace nad scrimem, kafelek
jako `<a href>` z waskim przechwyceniem kliku) przetrwaly co do joty i sa pod dotychczasowymi
testami, ktore pozostaly zielone bez modyfikacji.

## Wynik pelnej bramy

Uruchomione w calosci po zwolnieniu portu 4173, na swiezym buildzie:

```
lsof -ti tcp:4173 | while read -r p; do kill "$p"; done
npm run check && npm run lint && npm run test:unit && npm run test
```

| Krok | Wynik |
|---|---|
| `npm run check` | `4409 FILES 0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS` |
| `npm run lint` | `All matched files use Prettier code style`, eslint bez uwag |
| `npm run test:unit` | **644 / 644 pass, 0 fail** (uruchomione recznie; nie ma CI ani hooka) |
| `npm run test` | **464 / 464 passed** (56,9 s) |

Nowych przypadkow: 5 w `tests/galeria.spec.ts`, 4 w `tests/aktualnosci.spec.ts`,
8 w nowym `tests/promienie-mediow.spec.ts`. `tests/responsive.spec.ts`,
`tests/o-nas.spec.ts`, `tests/opisy-zdjec.unit.ts` i `tests/instrukcja.unit.ts` NIE BYLY
modyfikowane i pozostaly zielone; kolejnosc DOM w dialogu `['button','img','h2']`
(`tests/galeria.spec.ts`) rowniez, dokladnie tak, jak przewidzial plan.

## Weryfikacja zmierzona zamiast obejrzanej

W tej sesji nie bylo dostepnego narzedzia przegladarkowego (MCP Chrome DevTools nie jest
podlaczony), wiec zamiast „jednego spojrzenia" wykonano rownowazny POMIAR skryptem Playwrighta
na zbudowanym podgladzie przy 1440 px. Surowe liczby:

**Strona wpisu, lewa i prawa krawedz kazdego bloku:**

| Element | lewa | prawa |
|---|---|---|
| `h1` | 380 | 1060 |
| naglowek sekcji zdjec | 380 | 1060 |
| blok prozy | 380 | 1060 |
| siatka zdjec | 380 | 1060 |
| okladka wpisu | 380 | 1060 |

Jedna miara 680 px, piec blokow, zero rozjazdu. Przed zmiana proza konczyla sie 248 px przed
fotografiami. Podpisow pod kafelkami: `0`.

**Podglad na `/o-nas`:** panel `24px`, wciecie `16px`, zdjecie `8px`, kontrolka `8px` o wymiarze
`40x40` i tle `rgba(0, 0, 0, 0)` (przezroczyste, styl ghost), nazwa okna przez `aria-labelledby`.

**Podglad we wpisie:** `aria-labelledby: null`, `aria-label: "Podglad zdjecia"`, `h2` w dialogu:
`0`, dzieci dialogu: `[button, div]`, a silnik rol widzi `1` okno o niepustej nazwie.

## Znane zaslepki

Brak. To zadanie nie wprowadzilo ani jednej zaslepki, ani jednego pominietego testu, ani
jednego nieuruchomionego `<verify>`.

## Self-Check: PASSED

- `tests/promienie-mediow.spec.ts` - FOUND
- `src/lib/components/Lightbox.svelte` - FOUND
- `src/routes/aktualnosci/[slug]/+page.svelte` - FOUND
- commit `6d9974a` - FOUND
- commit `a0eb871` - FOUND
- commit `b9dfde5` - FOUND
- commit `085c01c` - FOUND

---

## Uzupelnienie po weryfikacji wzrokowej: D-6 ODWROCONE (2026-09-01, commit ee4eb4c)

Zadanie 1 wdrozylo D-6 wiernie, a **decyzja D-6 byla bledna** i zostala cofnieta po
obejrzeniu wyrenderowanych kafelkow na lokalnym podgladzie.

D-6 zakladalo, ze „w fotografii wnetrza i placu zabaw tresc jest u gory kadru", i na tej
podstawie ustawilo `object-position: center top`. Przy szesciu prawdziwych fotografiach
zlobka zalozenie jest odwrotne: cztery z nich sa pionowymi zdjeciami telefonem, ktorych
gorna trzecia to sufit albo niebo. Efekt `center top` na zywym kafelku:

| Kafelek | Co pokazywal po zmianie | Co powinien pokazywac |
|---|---|---|
| Sala zabaw | plyty sufitowe i lampy | wnetrze sali |
| Kacik kuchenny | okno i pudla pod sufitem | kuchnie do zabawy |
| Zabawki edukacyjne | pusta zolta sciana | zabawki na stole |
| Plac zabaw | niebo i korony drzew | hustawki i niebieska nawierzchnia |

Kafelek wraca do domyslnego srodka. Reszta zadania (passe-partout, prawo koncentrycznosci,
brak kol, jedna miara wpisu, podpisy tylko na /o-nas) pozostaje bez zmian i bez zwiazku
z tym bledem.

**Wniosek metodyczny, wazniejszy od samej poprawki.** Pelna bramka byla ZIELONA z blednym
kadrowaniem: 4409 plikow bez bledow, 644 testy jednostkowe, 464 testy Playwrighta, w tym
osiem nowych asercji promieni i axe z otwartym oknem podgladu. Zaden z nich nie moze
rozstrzygnac, czy w kadrze zostal temat zdjecia, a jeden z nich wrecz PRZYPINAL bledna
wartosc jako kontrakt. Zmiana dotyczaca tego, co widac, wymaga spojrzenia na to, co widac.
Asercja w `tests/galeria.spec.ts` przypina teraz srodek jako bramke przeciw powtorzeniu
tego bledu, z komentarzem mowiacym wprost, ze zielone testy nie sa tu dowodem.
