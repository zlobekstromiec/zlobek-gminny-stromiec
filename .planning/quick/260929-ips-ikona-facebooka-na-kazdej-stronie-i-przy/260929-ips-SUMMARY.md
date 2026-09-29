---
zadanie: 260929-ips
tytul: Ikona Facebooka w stopce i przy Aktualnosciach
type: quick
status: complete
data: 2026-09-29
tasks_planned: 3
tasks_completed: 3
commits:
  - d654cdd feat(quick-260929-ips) odnosnik do Facebooka w stopce kazdej strony
  - 418e15f feat(quick-260929-ips) odnosnik do Facebooka przy Aktualnosciach
  - 8cf2764 docs(quick-260929-ips) decyzja o pasku gornym i Amendment v1.8
files_created:
  - src/lib/icons/IconFacebook.svelte
files_modified:
  - src/lib/content/site.ts
  - src/lib/components/Footer.svelte
  - src/lib/components/NewsPreview.svelte
  - src/lib/components/TopBar.svelte
  - src/routes/aktualnosci/+page.svelte
  - tests/nav.spec.ts
  - tests/home.spec.ts
  - tests/aktualnosci.spec.ts
  - .planning/phases/01-live-homepage-design-foundation/01-UI-SPEC.md
weryfikacja:
  check: 4415 plikow, 0 bledow, 0 ostrzezen
  lint: czysty (prettier + eslint)
  test_unit: 645/645
  test: 492/492
---

# Ikona Facebooka: stopka na kazdej trasie i naglowki Aktualnosci

Prosba dyrektor z maila 2026-09-29: ikona Facebooka „na wszystkich stronach i przy
Aktualnosciach", latwa do znalezienia dla rodzica i uzywalna dla osob z niepelnosprawnoscia
wzroku. Zrobione w trzech zadaniach, kazde osobnym commitem, dwa pierwsze w cyklu
czerwone-zielone.

## Gdzie ikona JEST, a gdzie swiadomie jej NIE MA

**Jest w trzech miejscach:**

| Powierzchnia | Widoczna etykieta | Plik |
|---|---|---|
| Stopka, a wiec KAZDA trasa serwisu | `Profil żłobka na Facebooku` | `src/lib/components/Footer.svelte` |
| Sekcja Aktualnosci na stronie glownej | `Śledź nas na Facebooku` | `src/lib/components/NewsPreview.svelte` |
| Naglowek strony `/aktualnosci` | `Śledź nas na Facebooku` | `src/routes/aktualnosci/+page.svelte` |

**NIE MA jej w pasku gornym (`TopBar.svelte`) i to jest decyzja, nie przeoczenie.** Powody,
w kolejnosci wagi:

1. **„Na kazdej stronie" jest juz spelnione stopka.** Stopka renderuje sie na kazdej trasie
   (`tests/stopka-identyfikatory.spec.ts` probkuje piec tras i wszystkie sa zielone), wiec
   pasek nie dodalby ani jednej strony, tylko druga kopie odnosnika na kazdej.
2. **Uklad paska to para `space-between`** i jest to zapisane w komentarzu na gorze pliku od
   momentu jego powstania. Trzeci element przy 390 px laduje w trzecim wierszu zawijania,
   wyrownany do lewej, czyli jako osierocony glif pod telefonem.
3. **Cel dotykowy 44 px pogrubilby pasek o 8 px na wszystkich trasach.** Dzisiejsze elementy
   maja `min-height: 36px` przy `padding-block: 4px`, wiec byla by to globalna zmiana ukladu
   za duplikat odnosnika.
4. **Odnosnik tylko z ikona jest najslabsza forma dostepnosci**, a rodzic czytajacy ekranem
   byl w prosbie wskazany wprost. Trzy odnosniki z widocznym polskim tekstem sluza mu lepiej
   niz czwarty z samym `aria-label`.

Decyzja jest zapisana w dwoch miejscach, zeby nastepna osoba nie rozstrzygala jej od nowa:
w komentarzu naglowkowym `TopBar.svelte` i w Amendment v1.8 punkt 3. Jesli obecnosc w gornej
czesci strony bedzie kiedys potrzebna, wlasciwym miejscem jest `Header.svelte`, a to osobna
zmiana z wlasna poprawka specyfikacji.

## Korekta briefu: Lucide NIE MA ikony Facebooka

Brief zakladal, ze „Lucide ships `Facebook`" i kazal jej uzyc. W tym repozytorium to
nieprawda: `@lucide/svelte` 1.31.0 nie ma ANI JEDNEJ ikony marki, bo Lucide je usunal.
Powstala wiec wlasna `src/lib/icons/IconFacebook.svelte`, napisana recznie. Zadna nowa
zaleznosc nie weszla, co oznacza tez, ze nie bylo w tym zadaniu zadnej instalacji pakietu
ani bramki legalnosci pakietu.

Marka lamie kontrakt duotone z paragrafu 7 specyfikacji (obrys 2 px, `fill="var(--icon-fill,
none)"`) i jest to swiadomy wyjatek: obrysowa litera f czyta sie jak zwykla litera, a znak
marki musi byc rozpoznawalny. Kontrakt tej jednej ikony: `viewBox="0 0 24 24"`,
`fill="currentColor"`, plyta zaokraglonego kwadratu z litera WYCIETA przez
`fill-rule="evenodd"`. Dzieki temu jeden plik i jeden kolor dzialaja na trzech roznych tlach:
na brand-blue w stopce litera jest niebieska, na bialym naglowku `/aktualnosci` biala, na
cieplym tle sekcji Aktualnosci kremowa. Zadnego nowego tokenu koloru, zadnego propa wariantu.

## Jedno zrodlo adresu

Adres profilu lezy w `contact.facebookUrl` w `src/lib/content/site.ts`, z komentarzem
nazywajacym dyrektor i date jako zrodlo. Koncowy `#`, ktory wklei sie w mailu, zostal
zdjety: to pusty fragment, nie czesc adresu.

Bramka sprawdzona po kazdym zadaniu i na koniec:

```
grep -ro '61593361692060' src/ | wc -l   ->  1
grep -rlo 'facebook.com' src/ | wc -l    ->  1
```

Zaden znacznik nie niesie literalu, wszystkie trzy powierzchnie interpoluja pole. Komentarz
`TopBar.svelte`, ktory zapisuje decyzje o pasku, CELOWO nie zawiera adresu ani identyfikatora
profilu, bo ta bramka liczy wystapienia w calym `src/`, razem z komentarzami.

## Dostepnosc

- Kazdy z trzech odnosnikow niesie wizualnie ukryty sufiks `(otwiera się w nowej karcie)`,
  w tej samej formie co istniejacy odnosnik BIP, wiec pelna nazwa dostepna brzmi
  `Profil żłobka na Facebooku (otwiera się w nowej karcie)` albo
  `Śledź nas na Facebooku (otwiera się w nowej karcie)`.
- Kazdy ma `target="_blank"` i `rel="noopener noreferrer"` (wzorzec odnosnika zewnetrznego
  z projektu, trzymany bajtowo).
- Ikona jest zawsze `aria-hidden="true"` i `focusable="false"`, i NIGDY nie jest jedyna nazwa
  odnosnika: obok niej stoi widoczny polski tekst.
- Cel dotykowy zmierzony w tescie i w zrzutach: stopka 44 px, `/aktualnosci` 44 px.
- Odnosnik nie jest potomkiem zadnego naglowka. Pinuja to liczniki `h2 a` w `section.news`
  i `h1 a` na `/aktualnosci`, oba wymagaja zera, a `/aktualnosci` nadal ma dokladnie jeden `h1`.
- Ikona nie jest jedynym nosnikiem informacji, kolor nie jest jedynym nosnikiem informacji.
- axe bez naruszen na `/`, `/aktualnosci` i `/kontakt` (istniejace przypadki, wszystkie zielone).
- Pierscien ogniskowania widoczny na klawiaturze, obejrzany na zrzucie (patrz nizej). Jest to
  globalna regula `:focus-visible` z `app.css`, dokladnie ta sama, ktora niesie odnosnik BIP
  obok; nic w niej nie zmieniano.

## Cykl czerwone-zielone

| Zadanie | Czerwone | Zielone |
|---|---|---|
| 1 (stopka) | `nav.spec.ts` nowy przypadek: `element(s) not found`, pozostale 6 zielonych | 15/15 (`nav` + `stopka-identyfikatory`) |
| 2 (Aktualnosci) | 2 nowe przypadki: `element(s) not found`, 34 pozostale zielone | 36/36 (`home` + `aktualnosci`) |

Czerwony byl za kazdym razem z wlasciwego powodu: brak odnosnika, nie literowka.

## Zrzuty ekranu, obejrzane

Zapisane w katalogu sesji (poza repozytorium), do obejrzenia przez uzytkownika:

```
/private/tmp/claude-501/-Users-devopsdom-src-client-zlobekstromiec/05755785-08c0-4237-b2ae-1262c490eef2/scratchpad/
```

| Plik | Co pokazuje | Werdykt |
|---|---|---|
| `stopka-390.png` | stopka na telefonie | wiersz Facebooka miedzy BIP a Kontakt, ikona w jednej linii z etykieta, nic sie nie zawija |
| `stopka-1280.png` | stopka na desktopie | to samo, kolumna Informacje ma piec wierszy |
| `glowna-news-390.png` | naglowek Aktualnosci na telefonie | `Zobacz wszystkie` i odnosnik jeden pod drugim, oba wyrownane do lewej krawedzi siatki |
| `glowna-news-1280.png` | naglowek Aktualnosci na desktopie | naglowek po lewej, obie akcje po prawej w jednej linii |
| `glowna-news-sekcja-1280.png` | ta sama sekcja w pelnej szerokosci okna | odnosnik konczy sie na prawej krawedzi siatki kafelkow, nic nie jest uciete |
| `aktualnosci-head-390.png` | naglowek `/aktualnosci` na telefonie | odnosnik pod akapitem wiodacym, poza `h1` |
| `aktualnosci-head-1280.png` | naglowek `/aktualnosci` na desktopie | to samo |
| `focus-stopka-1280.png` | odnosnik w stopce z ogniskiem klawiatury | pierscien ogniskowania widoczny dookola calego odnosnika |
| `glyph-icon.png` | sama marka, powiekszona | plyta zaokraglonego kwadratu, litera f WYCIETA, tlo przeswieca, marka rozpoznawalna |
| `glyph-link.png` | marka razem z etykieta | ikona i tekst w jednej linii bazowej, odstep 8 px |

Wszystkie dziesiec zostalo obejrzanych, nie tylko wygenerowanych. Zielona suita nie widzi
ucietej grafiki, wiec to jest osobny dowod, nie powtorzenie testow.

## Odstepstwa od planu

Zadnych merytorycznych. Trzy drobne rzeczy warte odnotowania:

1. **Dziesiec zrzutow zamiast szesciu.** Plan prosil o szesc. Doszly: powiekszenie samej marki
   (zeby sprawdzic, ze litera jest wycieta, a nie zalana, zanim cokolwiek zostalo
   zacommitowane), marka z etykieta, sekcja Aktualnosci w pelnej szerokosci okna (zeby
   wykluczyc uciecie przy prawej krawedzi) oraz zrzut z ogniskiem klawiatury.
2. **Bramka „drzewo bez plikow PNG" jest spelniona co do mojej pracy, ale `git status` PNG
   pokazuje.** Sa to `logo.png` i `updated-logo.png`, pliki nieledzone, ktore lezaly w
   korzeniu przed rozpoczeciem zadania i ktorych regula zadania zabrania dotykac. Zaden plik
   ze scratchpada ani zaden zrzut z tego zadania nie trafil do repozytorium.
   `.playwright-mcp/` i `test-results/` usuniete przed lintem.
3. **Polozenie odnosnika w kolumnie stopki.** Plan mowil „po BIP, przed Kontakt" i tak jest.

## Bramki, wynik rzeczywisty

```
npm run check      ->  4415 FILES 0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS
npm run lint       ->  All matched files use Prettier code style! (eslint bez wyjscia)
npm run test:unit  ->  tests 645 | pass 645 | fail 0
npm run test       ->  492 passed (1.3m)
```

Port 4173 ubijany przed kazdym uruchomieniem Playwrighta, bo lokalnie `reuseExistingServer`
jest wlaczone i stary podglad dalby falszywy wynik.

## Do wiadomosci uzytkownika

- Ikona pojawi sie publicznie dopiero po wypchnieciu i przebudowie Pages, jak kazda zmiana
  w kodzie. Tresc czytana jest przy budowaniu.
- Serwis jest nadal `noindex` do fazy 6, wiec odnosnik bedzie widoczny, ale strona nie
  zacznie sie przez to indeksowac.
- Jesli zlobek dostanie kiedys ladniejszy adres profilu (vanity URL zamiast `profile.php?id=`),
  podmiana jest edycja jednego pola w `src/lib/content/site.ts`.
