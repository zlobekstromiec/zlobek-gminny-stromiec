---
zadanie: 260929-ips
tytul: Ikona Facebooka w stopce i przy Aktualnosciach
type: quick
tasks: 3
autonomous: true
tryb: gsd-quick (planer + wykonawca, TDD tam gdzie test istnieje)
files_modified:
  - src/lib/content/site.ts
  - src/lib/icons/IconFacebook.svelte
  - src/lib/components/Footer.svelte
  - src/lib/components/NewsPreview.svelte
  - src/lib/components/TopBar.svelte
  - src/routes/aktualnosci/+page.svelte
  - tests/nav.spec.ts
  - tests/home.spec.ts
  - tests/aktualnosci.spec.ts
  - .planning/phases/01-live-homepage-design-foundation/01-UI-SPEC.md
must_haves:
  truths:
    - Rodzic na KAZDEJ trasie widzi w stopce odnosnik do profilu zlobka na Facebooku, z widoczna polska nazwa, i wie z niej, ze odnosnik otwiera nowa karte.
    - Rodzic czytajacy Aktualnosci (strona glowna i /aktualnosci) widzi obok naglowka odnosnik do profilu, nie wewnatrz naglowka.
    - Uzytkownik czytnika ekranu slyszy dla kazdego z trzech odnosnikow pelna polska nazwe mowiaca gdzie prowadzi i ze otwiera nowa karte.
    - Adres profilu istnieje w src/ dokladnie raz i kazda powierzchnia go interpoluje.
    - axe nie zglasza naruszen na /, /aktualnosci i /kontakt po zmianie.
  artifacts:
    - src/lib/icons/IconFacebook.svelte (wlasna jednokolorowa marka, bo Lucide 1.31.0 jej nie ma)
    - contact.facebookUrl w src/lib/content/site.ts z komentarzem zrodla (dyrektor, mail 2026-09-29)
    - Amendment v1.8 w 01-UI-SPEC.md (piaty wiersz kolumny Informacje, odnosniki przy Aktualnosciach, jawna decyzja o pasku gornym, wyjatek na marke)
  key_links:
    - contact.facebookUrl -> Footer.svelte, NewsPreview.svelte, aktualnosci/+page.svelte (zero literalow w znacznikach)
    - IconFacebook.svelte -> te same trzy powierzchnie, zawsze aria-hidden, nazwa dostepna na odnosniku
    - tests/nav.spec.ts wzorzec odnosnika zewnetrznego (href, target, rel, widoczna etykieta) jak przy BIP
---

# Ikona Facebooka: stopka na kazdej trasie i naglowki Aktualnosci

Zrodlo: mail dyrektor z 2026-09-29. Profil zlobka:
`https://www.facebook.com/profile.php?id=61593361692060` (bez koncowego `#`, ktory wkleil sie
w mailu). Prosba: ikona na wszystkich stronach i przy Aktualnosciach, latwa do znalezienia dla
rodzica i uzywalna dla osob z niepelnosprawnoscia wzroku.

## Dwie decyzje, ktore ten plan podejmuje jawnie

### 1. Pasek gorny NIE dostaje ikony

`TopBar.svelte` zostaje bez odnosnika. Powody, w kolejnosci wagi:

1. **„Na kazdej stronie" jest juz spelnione stopka.** `Footer.svelte` renderuje sie na kazdej
   trasie (dowodzi tego `tests/stopka-identyfikatory.spec.ts`, ktore probkuje piec tras), wiec
   pasek gorny nie dodaje ani jednej strony.
2. **Uklad paska jest zbudowany dokladnie pod dwa elementy** i jest to zapisane w komentarzu na
   gorze pliku: `justify-content: space-between` z dwoma dziecmi. Trzeci element przy 390 px
   laduje w trzecim wierszu `flex-wrap`, wyrownany do lewej, czyli jako osierocony glif pod
   telefonem.
3. **Cel 44x44 podniosl by pasek na kazdej stronie.** Dzisiejsze elementy maja `min-height: 36px`
   przy `padding-block: 4px`. Ikona z celem 44 px pogrubia pasek o 8 px na wszystkich trasach,
   czyli globalna zmiana ukladu za duplikat odnosnika, ktory jest w stopce.
4. **Odnosnik tylko z ikona jest najslabsza forma dostepnosci**, a rodzic czytajacy ekranem byl
   w prosbie dyrektor wskazany wprost. Trzy odnosniki z widocznym polskim tekstem sluza mu
   lepiej niz czwarty z samym `aria-label`.

Jesli uzytkownik bedzie chcial obecnosci w gornej czesci strony, wlasciwym miejscem jest naglowek
(`Header.svelte`), a to osobna zmiana z wlasna poprawka UI-SPEC: nawigacja ma dzis szesc chipow
od 1024 px i Amendment v1.7 paragraf 1 opisuje ten tier jako ciasny. Nie robimy tego tutaj.

Decyzja zostaje ZAPISANA w komentarzu `TopBar.svelte`, zeby nastepna osoba jej nie rozstrzygala
od nowa. Komentarz nie zawiera adresu profilu (patrz bramka jednego zrodla).

### 2. Ikona jest wlasna, nie z Lucide (korekta briefu)

Brief zaklada, ze „Lucide ships `Facebook`". W tym repozytorium to nieprawda i zostalo
sprawdzone: `@lucide/svelte` 1.31.0 ma 7586 plikow w `dist/icons/` i ani jednego znaku marki
(`facebook`, `instagram`, `twitter`, `youtube`, `github`, `linkedin` nie istnieja, aliasy tez ich
nie zawieraja). Lucide usunal ikony marek. Wniosek: powstaje `src/lib/icons/IconFacebook.svelte`,
a `@lucide/svelte` nie jest dotykany i zadna nowa zaleznosc nie wchodzi (brak instalacji pakietu
oznacza brak bramki legalnosci pakietu w tym zadaniu).

Marka lamie kontrakt duotone z UI-SPEC paragraf 7 (obrys 2 px, `fill="var(--icon-fill, none)"`)
i jest to swiadomy wyjatek: znak marki musi byc rozpoznawalny, a obrysowa litera f czyta sie jak
zwykla litera. Kontrakt wlasnej marki: `viewBox="0 0 24 24"`, `fill="currentColor"`,
`fill-rule="evenodd"`, plyta zaokraglonego kwadratu z WYCIETA litera f (tlo przeswieca), wiec
jeden kolor dziala i na brand-blue w stopce, i na bialym oraz cieplym tle przy Aktualnosciach.
Poza tym jak kazda ikona w `src/lib/icons/`: `aria-hidden="true"`, `focusable="false"`,
prop `size` z domyslna 24 (uzywamy 20).

## Powierzchnie i wzorzec

Wzorzec odnosnika zewnetrznego jest w projekcie jeden i zamkniety (UI-SPEC `:214`, siedem
istniejacych uzyc): `target="_blank" rel="noopener noreferrer"` plus sufiks
`<span class="visually-hidden"> (otwiera się w nowej karcie)</span>`. Trzymamy go bajtowo.

| Powierzchnia | Plik | Miejsce | Widoczna etykieta |
|---|---|---|---|
| Stopka, kazda trasa | `src/lib/components/Footer.svelte` | kolumna `Informacje`, nowy `<li>` po BIP, przed `Kontakt` | `Profil żłobka na Facebooku` |
| Aktualnosci na glownej | `src/lib/components/NewsPreview.svelte` | `.news-header`, obok `Cta`, NIE w `h2` | `Śledź nas na Facebooku` |
| Strona /aktualnosci | `src/routes/aktualnosci/+page.svelte` | `.page-head .inner`, pod akapitem `.lead` | `Śledź nas na Facebooku` |

Jedno zrodlo adresu: nowe pole `facebookUrl` w obiekcie `contact`
(`src/lib/content/site.ts`), obok telefonu i e-maila, z komentarzem nazywajacym date i dyrektor
jako zrodlo. Zadnego literalu w znacznikach. Pola `contact` nie sweepuje zaden test na zamkniety
zbior kluczy: `tests/forms-copy.unit.ts` zamyka zbior adresow E-MAIL w eksportach kopii z
`forms.ts` (URL nie jest adresem e-mail i nie trafia do `forms.ts`), a `tests/zastepcze.unit.ts`
czyta znaczniki logiczne z plikow JSON w `src/lib/content/`, nie z `site.ts`. Nowe pole jest wiec
bezpieczne.

## Testy, ktore pinuja stary stan

| Test | Co pinuje | Co z nim robimy |
|---|---|---|
| `tests/nav.spec.ts:47-57` | odnosnik BIP: href, `target`, `noopener`, `noreferrer` | WZORZEC do skopiowania: nowy test o tym samym ksztalcie dla Facebooka, href czytany z `contact.facebookUrl` |
| `tests/nav.spec.ts:75-107` | kolumna `Na skróty`, szesc etykiet | bez zmian, nowy wiersz laduje w `Informacje` |
| `tests/nav.spec.ts:109-139` | kotwice czytane z kolumny `Na skróty` | bez zmian, ta kolumna nietkniete |
| `tests/nav.spec.ts:21-45` | szesc odnosnikow GLOWNEJ nawigacji | bez zmian, nie dotykamy naglowka |
| `tests/home.spec.ts:65-92` | `section.news`: `a.news-card` w liczbie 1-3, `Zobacz wszystkie` z `exact: true` | bez zmian (nowy odnosnik nie jest `a.news-card` ani `Zobacz wszystkie`), DOKLADAMY nowy przypadek |
| `tests/home.spec.ts` liczba `tel:` = 3, jeden `mailto` | nasz odnosnik nie jest ani `tel:` ani `mailto:` | bez zmian, ale suita musi zostac zielona |
| `tests/aktualnosci.spec.ts:29-33` | dokladnie jeden `h1` o tresci `Aktualności` | bez zmian, odnosnik idzie POD `.lead`, nie w naglowek |
| `tests/aktualnosci.spec.ts:70-76` | axe na `/aktualnosci` | musi zostac zielony, DOKLADAMY przypadek na odnosnik |
| `tests/home.spec.ts:317-322`, `tests/kontakt.spec.ts` | axe na `/` i `/kontakt` | musza zostac zielone (stopka jest na obu) |
| `tests/admin-polski.spec.ts`, `docs/instrukcja-cms.md` | tylko ekrany panelu | poza zakresem, panel nietkniety |

## Bramka jednego zrodla

Adres profilu i identyfikator profilu wystepuja w `src/` DOKLADNIE RAZ, w polu `contact.facebookUrl`.
Zadnego drugiego wystapienia, w szczegolnosci w komentarzu (w tym w komentarzu `TopBar.svelte`
zapisujacym decyzje numer 1): komentarz z adresem jest jedna kopia od tego, by byc wysylana kopia,
i wywraca te bramke.

## Zadania

<tasks>

<task type="tracer" tdd="true">
  <name>Zadanie 1: jedno zrodlo adresu, wlasna marka i odnosnik w stopce (cala sciezka, jedna trasa)</name>
  <files>tests/nav.spec.ts, src/lib/content/site.ts, src/lib/icons/IconFacebook.svelte, src/lib/components/Footer.svelte</files>
  <behavior>
    - `tests/nav.spec.ts`: odnosnik o nazwie dostepnej `Profil żłobka na Facebooku (otwiera się w nowej karcie)` istnieje w `contentinfo`, ma `href` rowny `contact.facebookUrl`, `target="_blank"`, `rel` zawierajace `noopener` i `noreferrer`.
    - Ten sam test sprawdza, ze WIDOCZNA etykieta to `Profil żłobka na Facebooku`, czyli ze ikona nie jest jedyna nazwa odnosnika.
    - Ten sam test sprawdza, ze wysokosc prostokata odnosnika jest nie mniejsza niz 44 px (cel dotykowy z UI-SPEC `:68`).
    - Trzy pozostale odnosniki kolumny `Informacje` (Deklaracja dostępności, Polityka prywatności (RODO), Kontakt) nadal odpowiadaja swoim adresom, czyli istniejacy przypadek zostaje zielony.
  </behavior>
  <read_first>src/lib/components/Footer.svelte (linie 90-104: wzorzec BIP, oraz 271-281 i 314-325: `.footer-link` i `.visually-hidden`), tests/nav.spec.ts (linie 47-57: ksztalt asercji do skopiowania), src/lib/icons/IconClock.svelte (kontrakt wlasnej ikony)</read_first>
  <action>
NAJPIERW TEST, POTEM KOD. Dopisz w `tests/nav.spec.ts` przypadek `stopka prowadzi do profilu
zlobka na Facebooku wzorcem odnosnika zewnetrznego`, zbudowany dokladnie jak istniejacy przypadek
BIP obok niego, z jedna roznica: `href` NIE jest literalem, jest czytany z `contact` zaimportowanego
z `../src/lib/content/site` (wzorzec juz uzywany w `tests/home.spec.ts`, `tests/adres-email.spec.ts`
i `tests/stopka-identyfikatory.spec.ts`, wiec import jest tanszy niz wpisanie adresu drugi raz).
Lokalizuj odnosnik przez `getByRole('link', { name: ... })` w `getByRole('contentinfo')`. Dodaj
asercje widocznej etykiety (`toHaveText` bez sufiksu wizualnie ukrytego, ktory nie wchodzi do
`textContent` wizualnego, wiec porownuj przez `toContainText` na widocznym fragmencie) oraz
pomiar `boundingBox()` z progiem 44. Uruchom suite i ZOBACZ CZERWONE.

Potem, w kolejnosci:

1. `src/lib/content/site.ts`: dodaj do obiektu `contact` pole `facebookUrl` z adresem
   `https://www.facebook.com/profile.php?id=61593361692060` (bez koncowego `#`). Umiesc je za
   polem `email`, przed `iodName`. Komentarz doc nad polem po polsku, w stylu sasiednich pol:
   zrodlem jest mail dyrektor z 2026-09-29, pole istnieje raz i kazda powierzchnia je
   interpoluje, wiec zmiana profilu jest edycja w jednym miejscu. To nie jest tresc zastepcza,
   wiec bez znacznika tresci zastepczej.
2. `src/lib/icons/IconFacebook.svelte`: nowa ikona po kontrakcie z sekcji „Ikona jest wlasna"
   powyzej. Napisz ja recznie, bez nowej zaleznosci i bez kopiowania z sieci: plyta zaokraglonego
   kwadratu 24x24 (`rx` okolo 5) plus druga podsciezka rysujaca litere f, razem z
   `fill-rule="evenodd"`, tak by litera byla WYCIETA i przeswiecalo przez nia tlo. Naglowkowy
   komentarz pliku mowi, ze marka jest swiadomym wyjatkiem od kontraktu duotone i dlaczego
   (Amendment v1.8), oraz ze Lucide 1.31.0 nie ma ikon marek.
3. `src/lib/components/Footer.svelte`: nowy `<li>` w kolumnie `Informacje`, po BIP i przed
   `Kontakt`. Klasa `footer-link`, `href={contact.facebookUrl}`, `target="_blank"`,
   `rel="noopener noreferrer"`, w srodku `<IconFacebook size={20} />` i tekst
   `Profil żłobka na Facebooku`, a na koncu ten sam wizualnie ukryty sufiks o nowej karcie, ktory
   nosi BIP. Do reguly `.footer-link` dodaj `gap: 8px` (regula jest juz `inline-flex` z
   `align-items: center`, a odnosnik z ikona jest jedynym z dwoma dziecmi, wiec deklaracja jest
   bezpieczna dla pozostalych) i dopisz jednolinijkowy komentarz, ze odstep dotyczy odnosnika z
   marka. Kolor bierze `.footer-link`, czyli `--color-band` na brand-blue, para juz zmierzona na
   AA w tabeli UI-SPEC, i `currentColor` niesie go do ikony bez nowego tokenu.
4. Naglowkowy komentarz `Footer.svelte` mowi dzis, ze BIP jest jedynym odnosnikiem zewnetrznym w
   stopce. Popraw to zdanie: sa dwa i oba trzymaja ten sam wzorzec.

Uruchom suite i ZOBACZ ZIELONE.
  </action>
  <verify>
    <automated>lsof -ti:4173 | xargs kill 2>/dev/null; npx playwright test tests/nav.spec.ts tests/stopka-identyfikatory.spec.ts</automated>
    <automated>test "$(grep -ro '61593361692060' src/ | wc -l | tr -d ' ')" = "1"</automated>
  </verify>
  <done>Nowy przypadek w `tests/nav.spec.ts` byl czerwony przed kodem i jest zielony po nim, `tests/stopka-identyfikatory.spec.ts` nadal zielone, identyfikator profilu wystepuje w `src/` dokladnie raz.</done>
</task>

<task type="auto" tdd="true">
  <name>Zadanie 2: odnosnik przy obu naglowkach Aktualnosci</name>
  <files>tests/home.spec.ts, tests/aktualnosci.spec.ts, src/lib/components/NewsPreview.svelte, src/routes/aktualnosci/+page.svelte</files>
  <behavior>
    - `tests/home.spec.ts`: w `section.news` istnieje odnosnik o nazwie dostepnej `Śledź nas na Facebooku (otwiera się w nowej karcie)`, z `href` z `contact.facebookUrl`, `target="_blank"`, `rel` z `noopener` i `noreferrer`, i NIE jest on potomkiem elementu `h2`.
    - `tests/home.spec.ts`: liczba `a.news-card` w sekcji nadal miesci sie w 1-3, czyli nowy odnosnik nie zostal policzony jako kafelek.
    - `tests/aktualnosci.spec.ts`: ten sam odnosnik istnieje w naglowku strony `/aktualnosci`, nadal jest dokladnie jeden `h1`, i odnosnik nie jest potomkiem `h1`.
    - axe zostaje bez naruszen na `/` i na `/aktualnosci`.
  </behavior>
  <read_first>src/lib/components/NewsPreview.svelte (linie 16-21 naglowek sekcji, 83-99 style `.news-header`), src/routes/aktualnosci/+page.svelte (linie 26-33 naglowek strony, 174-184 lokalna klasa `.visually-hidden`)</read_first>
  <action>
NAJPIERW TESTY, POTEM KOD, w obu plikach testowych. Asercje „nie jest potomkiem naglowka" napisz
jako zliczenie `h2 a` w `section.news` oraz `h1 a` na `/aktualnosci` i porownanie z zerem, bo to
mierzy strukture, a nie kolejnosc zapisu w pliku. Uruchom oba pliki i ZOBACZ CZERWONE.

`NewsPreview.svelte`: w `.news-header` owin istniejacy `Cta` i nowy odnosnik we wspolny
`<div class="news-akcje">` z `display: flex`, `flex-wrap: wrap`, `align-items: center`,
`gap: 16px`. To zachowuje dzisiejszy zamysl `space-between` (naglowek po lewej, akcje po prawej),
zamiast dodawac trzecie dziecko, ktore rozjechaloby sie na wezszych szerokosciach. `Cta` zostaje
NIETKNIETY, w szczegolnosci jego tekst `Zobacz wszystkie`, bo `tests/home.spec.ts` pinuje go z
`exact: true`. Nowy odnosnik: klasa `link-facebook`, `href={contact.facebookUrl}` (zaimportuj
`contact` z `$lib/content/site`, plik importuje z tego modulu juz typ `Post`), `target="_blank"`,
`rel="noopener noreferrer"`, `<IconFacebook size={20} />` plus tekst `Śledź nas na Facebooku`
plus wizualnie ukryty sufiks o nowej karcie. Styl `.link-facebook`: `inline-flex`,
`align-items: center`, `gap: 8px`, `min-height: 44px`, `font-family: var(--font-body)`,
16 px, 700, `color: var(--color-brand-blue)`, `text-decoration: underline`. `--color-brand-blue`
to warstwa dostepna i ten sam token, ktorym plik maluje juz `.empty-icon`, wiec zaden nowy kolor
nie wchodzi. UWAGA: ten plik NIE MA lokalnej klasy `.visually-hidden`, a style w Svelte sa
zakresowe, wiec dopisz ja tu tak samo, jak stoi w `Footer.svelte`, bo inaczej sufiks bedzie
widoczny.

`src/routes/aktualnosci/+page.svelte`: identyczny odnosnik POD akapitem `.lead`, wewnatrz
`.page-head .inner`, we wlasnym akapicie z `margin-top: 16px`. Klasa i style jak wyzej; lokalna
`.visually-hidden` w tym pliku JUZ JEST, wiec jej nie duplikuj. Kolejnosc naglowkow bez zmian:
`h1 Aktualności`, potem wizualnie ukryty `h2 Wszystkie wpisy` w sekcji ponizej.

Dwa razy ten sam odnosnik to swiadomy duplikat znacznikow, nie brakujacy komponent: obie
powierzchnie roznia sie kontenerem i tlem, a wspolny komponent na dwa uzycia dodalby plik i
warstwe propow bez zmniejszenia liczby miejsc do edycji, bo adres i tak jest juz jeden.

Uruchom oba pliki i ZOBACZ ZIELONE.
  </action>
  <verify>
    <automated>lsof -ti:4173 | xargs kill 2>/dev/null; npx playwright test tests/home.spec.ts tests/aktualnosci.spec.ts</automated>
  </verify>
  <done>Nowe przypadki byly czerwone przed kodem i sa zielone po nim, axe bez naruszen na `/` i `/aktualnosci`, liczba kafelkow i przypadek `Zobacz wszystkie` nietkniete.</done>
</task>

<task type="auto">
  <name>Zadanie 3: zapis decyzji o pasku gornym, poprawka UI-SPEC, zrzuty ekranu i pelny lancuch weryfikacji</name>
  <files>src/lib/components/TopBar.svelte, .planning/phases/01-live-homepage-design-foundation/01-UI-SPEC.md</files>
  <action>
1. `TopBar.svelte`: dopisz do naglowkowego komentarza akapit zapisujacy decyzje numer 1 z tego
   planu, wraz z czterema powodami w skrocie, i nazwij zadanie `quick 260929-ips` jako miejsce,
   gdzie decyzja padla. Znaczniki i style pliku BEZ ZMIAN: to jest wylacznie komentarz.
   Komentarz NIE zawiera adresu ani identyfikatora profilu, bo bramka jednego zrodla liczy
   wystapienia w calym `src/`, razem z komentarzami.
2. `01-UI-SPEC.md`: dopisz na koncu `## Amendment v1.8 (2026-09-29): odnosnik do profilu na
   Facebooku`. Cztery punkty: (a) kolumna `Informacje` stopki dostaje PIATY wiersz, `Profil
   żłobka na Facebooku`, wzorcem odnosnika zewnetrznego identycznym z BIP, wiec wyliczenie
   kolumny z Amendment v1.2 jest tu poprawione; (b) oba naglowki Aktualnosci dostaja odnosnik
   `Śledź nas na Facebooku` OBOK naglowka, nigdy w nim, brand-blue podkreslony, cel 44 px;
   (c) pasek gorny zostaje dwuelementowy, z powodami; (d) `IconFacebook` jest jednokolorowa
   marka z wycieta litera, swiadomym wyjatkiem od kontraktu duotone z paragrafu 7, bo Lucide
   1.31.0 nie ma ikon marek. Nic w istniejacych sekcjach nie jest przepisywane poza tym jednym
   wyliczeniem kolumny stopki.
3. ZRZUTY EKRANU, bo zielona suita nie widzi ucietej ani rozjechanej grafiki. Napisz jednorazowy
   skrypt Playwrighta W KATALOGU SCRATCHPAD (`/private/tmp/claude-501/-Users-devopsdom-src-client-zlobekstromiec/`),
   nigdy w repozytorium, i zapisz do niego szesc plikow PNG: stopka, naglowek Aktualnosci na `/`
   i naglowek `/aktualnosci`, kazde przy 390 px i 1280 px. OTWORZ kazdy z nich i potwierdz cztery
   rzeczy: marka jest rozpoznawalna jako znak Facebooka, litera jest wycieta a nie zalana,
   ikona jest w jednej linii bazowej z tekstem, i nic sie nie zawija ani nie ucina. Sciezki
   plikow wpisz do SUMMARY, zeby uzytkownik mogl na nie spojrzec.
4. Przed lintem sprzatnij: `rm -rf .playwright-mcp` oraz zadnych PNG w korzeniu repozytorium.
   `git status --porcelain` nie pokazuje ani jednego pliku PNG i ani jednego pliku ze
   scratchpada.
5. Pelny lancuch weryfikacji, w calosci, z ubitym portem 4173 na wejsciu, bo lokalnie
   `reuseExistingServer` jest wlaczone i stary podglad da falszywe wyniki.
6. Commit: podmiot po polsku bez znakow diakrytycznych, `type(quick-260929-ips): subject`,
   do 72 znakow, z wymaganym trailerem. Do commitu wchodza WYLACZNIE pliki z `files_modified`
   tego planu plus dokumenty zadania. NIE commituj `docs/documents/`, `.planning/config.json`,
   `.claude/settings.local.json`, `logo.png`, `updated-logo.png`, dwoch archiwow `.zip` z
   projektami graficznymi ani `.planning/quick/260827-*/260827-bfa-ODPOWIEDZ-2.md`.
  </action>
  <verify>
    <automated>lsof -ti:4173 | xargs kill 2>/dev/null; npm run check && npm run lint && npm run test:unit && npm run test</automated>
    <automated>test "$(grep -ro '61593361692060' src/ | wc -l | tr -d ' ')" = "1" && test "$(grep -rlo 'facebook.com' src/ | wc -l | tr -d ' ')" = "1"</automated>
    <automated>test -z "$(git status --porcelain | grep -iE '\.png$|\.playwright-mcp')"</automated>
  </verify>
  <done>Caly lancuch zielony, szesc zrzutow obejrzanych i opisanych w SUMMARY, decyzja o pasku gornym zapisana w `TopBar.svelte`, Amendment v1.8 dopisany, adres profilu i domena wystepuja w `src/` dokladnie raz, drzewo bez plikow PNG.</done>
</task>

</tasks>

## Kryteria ukonczenia

1. Rodzic na kazdej trasie ma w stopce odnosnik z widoczna polska nazwa `Profil żłobka na
   Facebooku`, prowadzacy do `contact.facebookUrl`, otwierajacy nowa karte, z `noopener` i
   `noreferrer`, z celem co najmniej 44 px.
2. Oba naglowki Aktualnosci maja odnosnik `Śledź nas na Facebooku` obok naglowka, nie w nim, i
   `/aktualnosci` nadal ma dokladnie jeden `h1`.
3. Kazdy z trzech odnosnikow niesie sufiks `(otwiera się w nowej karcie)` w tej samej wizualnie
   ukrytej formie, ktora niesie BIP, wiec czytnik ekranu slyszy pelna nazwe i kierunek.
4. Ikona jest zawsze `aria-hidden` i nigdy nie jest jedyna nazwa odnosnika.
5. axe bez naruszen na `/`, `/aktualnosci` i `/kontakt`.
6. `npm run check && npm run lint && npm run test:unit && npm run test` zielone.
7. Adres profilu wystepuje w `src/` dokladnie raz, w `contact.facebookUrl`.
8. Pasek gorny bez zmian w znacznikach i stylach, decyzja zapisana w komentarzu i w Amendment v1.8.
9. Zadne zdjecie ekranu ani plik ze scratchpada nie trafia do repozytorium.

## Wyjscie

`SUMMARY` zadania w
`.planning/quick/260929-ips-ikona-facebooka-na-kazdej-stronie-i-przy/260929-ips-SUMMARY.md`,
z sekcja o zrzutach ekranu (sciezki), korekta briefu w sprawie Lucide i decyzja o pasku gornym.
Wpis w `.planning/STATE.md`.
