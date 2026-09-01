---
quick_id: 260901-amq
phase: quick-260901-amq
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/components/Lightbox.svelte
  - src/routes/aktualnosci/[slug]/+page.svelte
  - src/lib/server/aktualnosci.ts
  - src/lib/components/AboutTeaser.svelte
  - src/lib/components/MapPanel.svelte
  - src/lib/components/NewsCard.svelte
  - src/lib/components/Hero.svelte
  - tests/galeria.spec.ts
  - tests/aktualnosci.spec.ts
  - tests/promienie-mediow.spec.ts
autonomous: true
requirements: [SITE-04, NEWS-02, GALLERY-01, A11Y-01]

estimate:
  tokens: 92000
  raw_tokens: 46000
  tasks: 4
  confidence: low

must_haves:
  truths:
    - "Podgląd zdjęcia otwiera się jako oprawiona fotografia: panel 24 px, wcięcie 16 px, zdjęcie 8 px (D-1, D-2)."
    - "Nigdzie w obudowie mediów nie ma koła ani kształtu pigułki; kontrolka zamknięcia jest kwadratem 40x40 o promieniu 8 px w stylu ghost (D-3)."
    - "Okno dialogowe ZAWSZE ma niepustą nazwę dostępną, także wtedy, gdy nie ma widocznego podpisu (D-4, WCAG 4.1.2)."
    - "Podpis zdjęcia widać wyłącznie na /o-nas; na stronie wpisu nie ma go ani pod kafelkiem, ani w podglądzie (D-4)."
    - "Na stronie wpisu h1, h2, proza i siatka zdjęć mają tę samą lewą i tę samą prawą krawędź (D-5)."
    - "Pionowe zdjęcie w kafelku 4:3 pokazuje górę kadru, nie środkowy pas (D-6)."
    - "Testy axe pozostają zielone na /o-nas i na stronie wpisu, także przy OTWARTYM podglądzie."
  artifacts:
    - src/lib/components/Lightbox.svelte
    - src/routes/aktualnosci/[slug]/+page.svelte
    - tests/promienie-mediow.spec.ts
  key_links:
    - "aria-labelledby -> widoczny h2 podpisu, ALBO aria-label -> stała polska etykieta; nigdy żadne z nich naraz i nigdy oba puste."
    - ".panel (24) - padding (16) = .obraz img (8): jedno miejsce, z którego wynika promień zdjęcia."
    - "Lightbox.svelte styluje .kafelek dla OBU stron (o-nas i wpis), więc każda zmiana kafelka jest zmianą na dwóch stronach."
---

<objective>
Jeden system prezentacji mediów: podgląd zdjęcia przestaje mieszać trzy geometrie i staje się
oprawioną fotografią (passe-partout), prawo koncentryczności obowiązuje każdą powierzchnię
medialną, z obudowy mediów znikają koła, podpisy zostają wyłącznie na /o-nas, a strona wpisu
dostaje jedną miarę kolumny.

Purpose: zgłoszenie użytkownika brzmiało „round buttons mixing with squares of different corner
sizes" oraz „pages render weirdly". Obie wady są zmierzone i rozstrzygnięte w
`260901-amq-CONTEXT.md` (D-1 do D-6, ZABLOKOWANE).
Output: przeprojektowany `Lightbox.svelte`, jedna miara na stronie wpisu, nowy test pinujący
prawo koncentryczności, i pisemny audyt każdej powierzchni medialnej w repozytorium.
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
@$HOME/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/quick/260901-amq-system-prezentacji-mediow-passe-partout-/260901-amq-CONTEXT.md
@.claude/CLAUDE.md
@.planning/phases/01-live-homepage-design-foundation/01-UI-SPEC.md

Kluczowe fakty ustalone przez planistę w kodzie, żeby wykonawca nie musiał ich odkrywać
drugi raz (każdy zweryfikowany 2026-09-01):

1. `src/app.css` importuje `tailwindcss`, więc preflight ustawia `box-sizing: border-box`
   globalnie. `max-width` LICZY padding. Bez tego liczby z D-5 nie wychodzą.
2. Tokeny promieni: `--radius-sm: 8px`, `--radius-md: 16px`, `--radius-lg: 24px`,
   `--radius-pill: 9999px` (`src/app.css:71-74`). Globalny `:focus-visible` istnieje
   (`src/app.css:85`), więc kontrolka ghost dziedziczy pierścień fokusu i nie deklaruje go sama.
   Tokeny D-3: `--color-surface-warm: #fbfaf7`, `--color-ink: #1e293b`,
   `--color-border-subtle: #e2e8f0`.
3. `.kafelek` mieszka w `Lightbox.svelte` i obsługuje OBIE strony (`/o-nas` i wpis). Zmiana
   kafelka jest zmianą na dwóch stronach naraz. Tak samo `.obraz` i `.zamknij`.
4. Galeria wpisu (`zdjecia`) NIE JEST edytowalna w panelu. Jest redagowana w pull requeście, a
   `zGaleria()` (`src/lib/server/admin/walidacja/aktualnosci.ts:182`) tylko przenosi ją przez
   zapis. Panel autoruje podpisy WYŁĄCZNIE na ekranie `/admin/galeria`, który zasila `/o-nas`,
   gdzie podpisy zostają. To ma bezpośredni skutek dla zadania 4: przesłanka D-4 o nieprawdzie
   w panelu prawdopodobnie NIE ZACHODZI i to trzeba sprawdzić, a nie założyć w żadną stronę.
5. Dokładnie JEDEN wpis ma dziś galerię: `2026-08-19-uroczyste-otwarcie-zlobka.json` (6 zdjęć),
   i NIE jest to wpis najnowszy, więc pomocnik `najnowszyWpis()` z `tests/aktualnosci.spec.ts`
   go nie znajdzie.
6. `tests/opisy-zdjec.unit.ts` przemiata wyłącznie pole `alt`, nigdy `podpis`. To zadanie go
   NIE dotyczy (wbrew liście podejrzanych). `tests/aktualnosci.spec.ts` nie ma dziś ANI JEDNEGO
   przypadku dotyczącego galerii wpisu ani dialogu.
7. `tests/galeria.spec.ts:707-711` pinuje kolejność DOM w dialogu jako
   `['button', 'img', 'h2']`, zapytaniem po potomkach dialogu. Usunięcie opakowania `.pasek`
   tej listy nie zmienia, a `/o-nas` zachowuje podpis, więc ten przypadek ma zostać ZIELONY
   bez modyfikacji. Jeśli zapali się na czerwono, coś poszło nie tak z DOM-em, a nie z testem.

@src/lib/components/Lightbox.svelte
@src/routes/aktualnosci/[slug]/+page.svelte
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Zadanie 1: Lightbox jako oprawiona fotografia (D-1, D-2, D-3, D-4, D-6)</name>
  <files>src/lib/components/Lightbox.svelte, tests/galeria.spec.ts</files>

  <read_first>
    `src/lib/components/Lightbox.svelte` w całości, ze szczególną uwagą na nagłówek pliku:
    wylicza cztery własności, które są nośne i mają przeżyć tę zmianę co do joty. Dalej
    `tests/galeria.spec.ts` linie 36-140 (pomocniki) oraz 462-760 (kontrakt dialogu).
  </read_first>

  <behavior>
    Testy do napisania PRZED zmianą komponentu, wszystkie w `tests/galeria.spec.ts`, w bloku
    kontraktu dialogu. Każdy ma być zaobserwowany na CZERWONO, zanim komponent się zmieni.

    - Nazwa dostępna dialogu nigdy nie jest pusta. Na `/o-nas` po otwarciu kafelka:
      `page.getByRole('dialog', { name: /\S/u })` ma dokładnie jedno trafienie. Ten przypadek
      jest bramką z D-4: gdyby widoczny nagłówek zniknął bez zamiennika, zapala się na czerwono.
      Zostaje w pliku na stałe, także dlatego, że drugi jego wariant na stronie wpisu powstaje
      w zadaniu 3.
    - Prawo koncentryczności, mierzone przez `getComputedStyle` przy otwartym podglądzie:
      panel ma promień 24px, obraz w panelu 8px, kontrolka zamknięcia 8px, a kafelek na stronie
      16px. Cztery asercje na wartościach obliczonych przez przeglądarkę, nie na źródle CSS.
    - Zero kół w obudowie mediów (D-3). Dla KAŻDEGO elementu wewnątrz dialogu oraz dla kafelka:
      obliczony `border-radius` nie jest ani wartością procentową, ani wartością większą niż
      100px. Asercja ma zapaść na wartości obliczonej, więc jest odporna na to, którym tokenem
      ktoś kiedyś tę wartość poda.
    - Kontrolka zamknięcia jest bezpośrednim dzieckiem dialogu (`parentElement` przycisku ma
      `role="dialog"`), ma 40x40 pikseli i jest wyrównana do prawej krawędzi obszaru zdjęcia.
      To jest test na zniknięcie osobnego paska nad fotografią, wyrażony przez strukturę i
      wymiar, a nie przez grep po nazwie klasy.
    - Kafelek kadruje od góry (D-6): obliczony `object-position` obrazu w kafelku to `50% 0%`.
    - Pozytywna kontrola dla nazwy dialogu, tym samym wzorcem, którym plik już się posługuje:
      dopasowanie do podpisu pierwszego zdjęcia z `galeria.json` ma nadal działać, więc zielona
      asercja `/\S/u` znaczy „nazwa jest", a nie „locator nic nie sprawdza".
  </behavior>

  <action>
    Przeprojektuj `src/lib/components/Lightbox.svelte`. Wszystko poniżej wynika z decyzji
    zablokowanych w CONTEXT i żadnej z nich nie wolno otwierać na nowo.

    NIE WOLNO ZMIENIĆ, wprost, bo są nośne i udowodnione: przywracanie fokusu w sprzątaniu
    `$effect`, atrybuty `role="dialog"` i `aria-modal="true"`, programowy `tabindex="-1"` na
    dialogu, obsługa klawiatury podpięta pod DIALOG a nie pod okno, ograniczona pułapka fokusu
    wraz z gałęzią dla pozycji -1, czas ruchu pobierany z funkcji, oba komentarze wyciszające
    kompilator nad scrimem (bez nich `npm run check` pada w pre-commit), kafelek pozostający
    `<a href>` z wąskim przechwyceniem kliku i ukryty wzrokowo przedrostek nad kafelkiem.

    1. Prop `podpis` staje się opcjonalny (D-4). Widoczny nagłówek renderuje się wyłącznie
       wtedy, gdy podpis jest niepustym łańcuchem po przycięciu białych znaków.
    2. Nazwa dostępna dialogu, i to jest sedno zadania, nie kosmetyka. Gdy podpis jest,
       nazwę daje `aria-labelledby` wskazujące na ten nagłówek, dokładnie jak dziś. Gdy podpisu
       nie ma, `aria-labelledby` NIE jest emitowane, a dialog dostaje `aria-label` ze stałej
       polskiej etykiety `Podgląd zdjęcia`, zadeklarowanej jako stała obok `PODPIS_ID`. Nigdy
       oba atrybuty naraz i nigdy żaden. Wybór stałej etykiety zamiast tekstu alternatywnego
       zdjęcia (D-4 dopuszcza obie drogi) jest świadomy z trzech powodów i zapisz je w
       komentarzu: tekst alternatywny jest już na obrazie WEWNĄTRZ tego dialogu, więc nazwa z
       niego zbudowana byłaby odczytana dwa razy pod rząd; stała nie musi być przewleczona
       propem przez dwie strony, więc nie ma jak zginąć po drodze; a etykieta „Podgląd" jest
       tym samym słowem, którego używa już nazwa przycisku „Zamknij podgląd".
    3. Kontrolka zamknięcia (D-3). Opakowanie paska znika i przycisk staje się bezpośrednim
       dzieckiem panelu, wyrównanym do prawej przez `margin-left: auto` na elemencie o stałej
       szerokości. Wymiar 40x40, promień `--radius-sm`, styl ghost: tło przezroczyste, ikona w
       kolorze `--color-ink`, obrys 1px `--color-border-subtle`, a na `:hover` i na
       `:focus-visible` wypełnienie `--color-surface-warm`. Nie deklaruj własnego pierścienia
       fokusu, bo globalny `:focus-visible` z `app.css` już go daje i podwójna deklaracja
       rozjedzie się z resztą strony. Przycisk ZOSTAJE WEWNĄTRZ panelu, a powód jest już
       zapisany w komentarzu przy DOM-ie i ma tam zostać: kontrolka, której jedynym tłem jest
       półprzezroczysta nakładka, nie ma gwarantowanego kontrastu wobec fotografii pod nią.
       Rozmiar 40 px spełnia WCAG 2.1 AA kryterium 2.5.8 (próg 24 px); próg 44 px należy do
       poziomu AAA i nie jest tu wiążący. Obrys jest dekoracją krawędzi, a nie jedynym
       wskaźnikiem istnienia kontrolki, bo tym jest ikona w `--color-ink` na białym tle, więc
       kryterium 1.4.11 spełnia ikona.
    4. Prawo koncentryczności (D-2). Panel zostaje bez zmian: `--radius-lg` z wcięciem 16 px,
       i to jest kotwica całej reguły. Obraz w panelu schodzi z `--radius-lg` na `--radius-sm`,
       bo 24 minus 16 daje 8. Kafelek schodzi z `--radius-lg` na `--radius-md`, bo
       `--radius-lg` jest w zablokowanej specyfikacji zarezerwowany dla dużych powierzchni, a
       kafelek w siatce nią nie jest. `app.css` NIE dostaje nowego tokenu.
    5. Kadr kafelka (D-6). Obraz w kafelku dostaje `object-position: center top`. Zapisz w
       komentarzu, dlaczego ta jedna reguła nie ma skutków ubocznych na stronie wpisu:
       zdjęcia szersze niż proporcja 4:3 przy `cover` przepełniają się poziomo, nie pionowo,
       więc składowa pionowa nic dla nich nie znaczy; zmiana dotyczy wyłącznie zdjęć wysokich,
       a te są dokładnie tymi z galerii żłobka. Zdjęcia wgrane przez panel są już przycięte do
       4:3 po stronie serwera, więc ich ta reguła również nie dotyczy.
    6. Zaktualizuj nagłówek pliku i komentarze przy propach o dwie rzeczy: że podpis jest
       opcjonalny, i skąd bierze się nazwa okna, gdy go nie ma. Nie usuwaj istniejącego
       akapitu o braku propa z opisem alternatywnym; ta decyzja nadal obowiązuje i ten
       komponent nadal nie przyjmuje tekstu alternatywnego żadnym propem.

    NIE dotykaj palety, typografii, kształtu CTA ani tagów. NIE zmieniaj nazwy dostępnej
    przycisku zamknięcia (`tests/galeria.spec.ts:84` pinuje ją dosłownie). NIE porządkuj pliku
    poza zakresem zadania.
  </action>

  <verify>
    <automated>npx playwright test tests/galeria.spec.ts</automated>
  </verify>

  <done>
    Nowe przypadki w `tests/galeria.spec.ts` były czerwone przed zmianą komponentu i są zielone
    po niej; wszystkie dotychczasowe przypadki tego pliku, w tym skan axe otwartego dialogu i
    kolejność DOM `['button','img','h2']`, pozostają zielone bez modyfikacji.
  </done>
</task>

<task type="auto">
  <name>Zadanie 2: prawo koncentryczności na wszystkich powierzchniach medialnych, z audytem (D-2)</name>
  <files>tests/promienie-mediow.spec.ts, src/routes/aktualnosci/[slug]/+page.svelte, src/lib/components/AboutTeaser.svelte, src/lib/components/MapPanel.svelte, src/lib/components/NewsCard.svelte, src/lib/components/Hero.svelte</files>

  <read_first>
    Miejsca zidentyfikowane przez planistę, każde do potwierdzenia przed dotknięciem:
    `Hero.svelte` około 195, `AboutTeaser.svelte` około 96, `MapPanel.svelte` około 78,
    `NewsCard.svelte` około 108 oraz 126, `aktualnosci/[slug]/+page.svelte` około 235.
  </read_first>

  <action>
    Tabela z D-2 kończy się wierszem „sprawdzić i doprowadzić do reguły". To zadanie ten wiersz
    zamyka i domyka tabelę o powierzchnię, której tam nie ma. Wyniki przeszukania repozytorium
    z 2026-09-01 są poniżej; potwierdź każdy, zanim cokolwiek zmienisz, i zapisz werdykt w
    komentarzu przy regule, żeby następna osoba nie wyprowadzała go od zera.

    a) `Hero.svelte`, slot zdjęcia: `--radius-lg`, powierzchnia samodzielna, duża. D-2 mówi
       wprost „bez zmian". BEZ ZMIAN. Zwróć uwagę, że element niesie 6-pikselowy biały obrys;
       promień dotyczy pudełka z obrysem i tak ma zostać.
    b) `AboutTeaser.svelte`, blok mediów obok cytatu: `--radius-lg`. Werdykt: ZOSTAJE. To panel
       na pół szerokości układu dwukolumnowego, a poniżej 1024 px na całą szerokość kontenera,
       czyli „duża powierzchnia" w rozumieniu zablokowanej specyfikacji. Nie jest kafelkiem w
       siatce. Zapisz werdykt w komentarzu przy regule.
    c) `MapPanel.svelte`, obraz mapy: `--radius-md`, brak wcięcia, brak kontenera z promieniem.
       Werdykt: JUŻ ZGODNE z regułą, powierzchnia w skali karty, nie hero. BEZ ZMIAN, werdykt
       do komentarza.
    d) `NewsCard.svelte`, okładka pionowa: `--radius-sm`. D-2 mówi „już poprawne, nie ruszać"
       i tak zostaje: BEZ ZMIAN. Ale UZASADNIENIE z tabeli D-2 w kodzie się nie potwierdza i
       audyt ma zapisać prawdziwe. Tabela wyprowadza 8 px z „karta 16 minus wcięcie 16", a
       wcięcia 16 px wokół okładki NIE MA: padding niesie wyłącznie blok tekstu karty, okładka
       przylega do krawędzi. Wartość 8 px jest tu wyborem z tabeli użycia zablokowanej
       specyfikacji („image placeholders"), a nie wynikiem odejmowania. Potwierdź to sam i
       zapisz w komentarzu przy regule w tej postaci, bo powtórzenie wyprowadzenia, które nie
       zachodzi, jest gorsze niż brak komentarza. Wartości NIE ZMIENIAJ: D-2 jest zablokowane,
       a zmiana promienia okładki dotknęłaby listy aktualności i strony głównej naraz.
    e) `NewsCard.svelte`, wariant poziomy, okładka bez promienia w zapytaniu medialnym. To była
       otwarta wątpliwość i ma rozstrzygnięcie: jest ŚWIADOME i zgodne z regułą. W tym wariancie
       okładka wypełnia całą kolumnę siatki, przylega do krawędzi karty i jest przycinana przez
       własne `overflow: hidden` karty, więc jej narożniki zewnętrzne dostają promień karty, a
       narożniki wewnętrzne są proste, bo wcięcie wynosi zero. Wpisanie tam jakiegokolwiek
       promienia dałoby narożnik w narożniku. BEZ ZMIAN, werdykt do komentarza przy regule.
    f) POWIERZCHNIA, KTÓREJ W TABELI D-2 NIE MA i to jedyne prawdziwe znalezisko audytu:
       okładka wpisu na `/aktualnosci/[slug]`, `--radius-lg`, obraz na pełną miarę kolumny.
       Werdykt: ZOSTAJE `--radius-lg`. To jest slot zdjęcia wiodącego tej strony, czyli
       najbliższy odpowiednik slotu w `Hero`, któremu D-2 wprost zostawia 24 px; jest też
       jedyną powierzchnią medialną na tej stronie, która ma pełną miarę kolumny, więc odróżnia
       się od kafelków galerii wpisu (16 px) świadomą hierarchią, a nie przypadkiem. Zapisz to
       jako uzupełnienie tabeli D-2 w komentarzu i wymień w SUMMARY.
    g) Przeszukanie repozytorium potwierdza, że NIE MA żadnej powierzchni medialnej z promieniem
       podanym liczbą pikseli zamiast tokenem. Jedyne wartości niebędące tokenami w całym
       `src/` to zero, wartość procentowa na dekoracyjnym kółku w cenniku i wartość pigułki na
       dekoracyjnych plamach w `Hero`; żadna z nich nie jest obudową zdjęcia. Powtórz to
       przeszukanie i potwierdź w SUMMARY.
    h) Powierzchnie z promieniem 24 px, które NIE SĄ mediami i pozostają poza zakresem:
       karta korzyści, karta rekrutacji, panel planu dnia, karty obu formularzy oraz ekran
       logowania panelu. Nie ruszać.

    Następnie napisz `tests/promienie-mediow.spec.ts`: jeden plik, który pinuje prawo
    koncentryczności na wszystkich powierzchniach naraz, żeby żadna nie mogła cicho odjechać.
    Dla każdej powierzchni z listy powyżej odwiedź stronę, na której ona żyje, i sprawdź
    obliczony `border-radius`: slot zdjęcia wiodącego 24, blok mediów przy cytacie 24, okładka
    kafelka aktualności 8, obraz mapy 16, kafelek galerii 16, okładka wpisu 24, kafelek galerii
    wpisu 16. Do tego jedna asercja przekrojowa: żadna z tych powierzchni nie ma promienia
    procentowego ani większego niż 100 px, czyli żadna nie jest kołem ani pigułką (D-3).
    Wpis z galerią wyszukaj z dysku, tak jak robi to `tests/opisy-zdjec.unit.ts`, czytając
    `src/lib/content/aktualnosci/*.json` i biorąc pierwszy wpis z niepustą listą zdjęć; slug
    powstaje z nazwy pliku. Nie wpisuj slugu na sztywno: dziś galerię ma dokładnie jeden wpis i
    NIE jest to wpis najnowszy, a w tym repozytorium testy potrafiły już zamienić dzisiejszą
    treść w kontrakt.
  </action>

  <verify>
    <automated>npx playwright test tests/promienie-mediow.spec.ts tests/home.spec.ts</automated>
  </verify>

  <done>
    `tests/promienie-mediow.spec.ts` istnieje i przechodzi; każdy z siedmiu wierszy audytu ma
    werdykt zapisany w komentarzu w kodzie; okładka wpisu jest jawnie odnotowana jako
    powierzchnia brakująca w tabeli D-2; żadna powierzchnia medialna nie ma promienia podanego
    liczbą pikseli ani kształtu koła.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Zadanie 3: jedna miara kolumny na stronie wpisu i podpisy tylko na /o-nas (D-5, D-4)</name>
  <files>src/routes/aktualnosci/[slug]/+page.svelte, tests/aktualnosci.spec.ts</files>

  <read_first>
    `src/routes/aktualnosci/[slug]/+page.svelte` w całości. `tests/responsive.spec.ts` linie
    85-115, bo tam jest zapisana reguła tego repozytorium dla asercji o szerokości: porównuje
    się DWA ELEMENTY ZE SOBĄ, nigdy element z liczbą pikseli. Nowe przypadki mają ją zachować.
  </read_first>

  <behavior>
    Testy do dopisania w `tests/aktualnosci.spec.ts`, każdy zaobserwowany na czerwono przed
    zmianą strony. Wpis z galerią wyszukiwany z dysku, nie po slugu wpisanym na sztywno, i nie
    przez pomocnik `najnowszyWpis()`, bo wpis z galerią nie jest dziś najnowszy.

    - Jedna miara (D-5): przy szerokości okna 1280 px `h1`, nagłówek sekcji zdjęć, blok prozy
      i lista kafelków mają tę samą lewą krawędź i tę samą prawą krawędź, z tolerancją jednego
      piksela. Porównanie element z elementem, nigdy z liczbą.
    - Brak podpisów pod kafelkami na stronie wpisu (D-4): w liście zdjęć wpisu nie ma ani
      jednego elementu podpisu figury. Asercja nieobecności, więc obok niej pozytywna kontrola:
      ta sama asercja na `/o-nas` ma znaleźć podpis pod każdym kafelkiem. Bez tej pary zielony
      wynik znaczyłby tylko tyle, że locator nic nie widzi.
    - Brak podpisu w podglądzie na stronie wpisu i nazwa okna mimo to (D-4): po otwarciu
      kafelka we wpisie dialog nie zawiera nagłówka drugiego poziomu, a mimo to
      `page.getByRole('dialog', { name: /\S/u })` ma dokładnie jedno trafienie. To jest bramka
      dostępności z D-4 po stronie wpisu; jej odpowiednik na `/o-nas` powstał w zadaniu 1.
    - Skan axe przy OTWARTYM podglądzie na stronie wpisu, tymi samymi czterema znacznikami,
      których używa reszta pakietu. Istniejący skan strony wpisu bada tylko stan zamknięty.
  </behavior>

  <action>
    1. Jedna miara (D-5). Wąska odmiana kontenera schodzi z 52rem na 46.5rem, a blok prozy
       traci własne ograniczenie szerokości wyrażone w jednostce `ch`. Wynik przy 1024 px i
       wyżej: 744 minus dwa razy 32 daje 680 px miary, czyli około 68 znaków, a dwukolumnowa
       siatka z odstępem 24 px daje kafelki po 328 px. Dokładnie te liczby zapisuje D-5.
       Ograniczenie w `ch` musi zniknąć, a nie zostać podniesione: to ono jest źródłem trzeciej
       miary na stronie i zostawienie go z inną liczbą odtworzyłoby ten sam błąd za pół roku.
       Zapisz w komentarzu, że 46.5rem jest liczone razem z paddingiem, bo preflight Tailwinda
       ustawia `box-sizing: border-box`, i że wąskiej odmiany używają trzy bloki tej strony
       (nagłówek, okładka i treść), co jest właśnie tym, co daje wspólne krawędzie.
    2. Odrzucone świadomie, do komentarza obok reguły, żeby nikt nie wracał: rozciągnięcie prozy
       do pełnych 768 px daje około 96 znaków w wierszu; zwężenie samej siatki do 520 px zbija
       kafelek do około 248 px; zostawienie wyjścia poza kolumnę wymagałoby symetrii po obu
       stronach, a obecne rozszerza się wyłącznie w prawo.
    3. Atrybut `sizes` obu obrazów musi pójść za nową miarą, inaczej przeglądarka pobiera plik
       o złej wielkości. Okładka wpisu: górna granica z 52rem na 44rem. Kafelek galerii wpisu:
       z 25rem na 21rem, bo kafelek ma teraz 328 px. Nie zmieniaj `sizes` obrazu w podglądzie,
       bo dialog nadal wypełnia okno.
    4. Podpisy znikają ze strony wpisu (D-4). Usuń element podpisu figury pod kafelkiem, usuń
       przekazywanie podpisu do wyspy podglądu, i usuń obie reguły CSS, które ten element
       stylowały, razem z regułą podkreślającą go przy najechaniu na kafelek. Nie zostawiaj
       martwej reguły: `npm run check` zgłasza nieużywany selektor jako ostrzeżenie i to jest
       właściwe zachowanie tego projektu.
    5. `/o-nas` NIE ZMIENIA SIĘ ani o linijkę. Pomiar z 2026-09-01 pokazał, że sekcja galerii
       jest tam spójna (nagłówek sekcji w lewej szynie układu redakcyjnego, tekst w prawej,
       siatka przez obie), więc D-5 jej nie dotyczy. Nie „przy okazji".
    6. Zaktualizuj nagłówkowy komentarz strony o dwie rzeczy: że galeria wpisu nie pokazuje
       podpisów i dlaczego (proza wpisu opisuje scenę, więc zdjęcie broni się samo, a na
       `/o-nas` podpis niesie nazwę pomieszczenia, której nie powtarza żaden sąsiedni tekst),
       oraz skąd bierze się nazwa okna podglądu, kiedy podpisu nie ma. Komentarz przy okładce
       wpisu doprowadź do stanu zgodnego z werdyktem zadania 2.
  </action>

  <verify>
    <automated>npx playwright test tests/aktualnosci.spec.ts tests/responsive.spec.ts</automated>
  </verify>

  <done>
    Nowe przypadki były czerwone przed zmianą strony i są zielone po niej; `h1`, nagłówek sekcji
    zdjęć, proza i siatka mają jedną wspólną lewą i jedną wspólną prawą krawędź; na stronie
    wpisu nie ma podpisu ani pod kafelkiem, ani w podglądzie, a okno podglądu mimo to ma
    niepustą nazwę dostępną; skan axe otwartego podglądu na stronie wpisu przechodzi;
    `tests/responsive.spec.ts` pozostaje zielony bez modyfikacji.
  </done>
</task>

<task type="auto">
  <name>Zadanie 4: prawdomówność panelu, komentarze źródłowe i dokumentacja (D-4)</name>
  <files>src/lib/server/aktualnosci.ts, src/lib/content/panel.ts, docs/instrukcja-cms.md, tests/instrukcja.unit.ts</files>

  <read_first>
    `src/lib/content/panel.ts` w okolicach 472-487 (pola ekranu galerii) i 739-756 (wyspa
    zdjęcia), `docs/instrukcja-cms.md` sekcje 5 i 8, `tests/instrukcja.unit.ts` linie 225-270
    oraz 375-390, `src/lib/server/aktualnosci.ts` w okolicach 30-45 i 115-140.
  </read_first>

  <action>
    D-4 zakłada, że panel mówi dziś nieprawdę o podpisach zdjęć we wpisie. To zadanie ma tę
    przesłankę SPRAWDZIĆ, a nie przyjąć, i zapisać wynik w każdą stronę. Ustalenie planisty,
    do potwierdzenia: galeria wpisu nie jest edytowalna w panelu, jest redagowana w pull
    requeście, a `zGaleria()` tylko przenosi ją przez zapis. Panel autoruje podpisy wyłącznie
    na ekranie galerii, który zasila `/o-nas`, gdzie podpisy zostają. Jeśli to się potwierdzi,
    ŻADEN łańcuch w panelu nie stał się nieprawdziwy i nie wolno wtedy wymyślać nowej kopii do
    pola, którego panel nie ma.

    1. Sprawdź, przeszukując `src/lib/content/panel.ts` oraz `docs/instrukcja-cms.md`, czy
       istnieje zdanie twierdzące, że podpis zdjęcia WE WPISIE pojawia się na stronie. Jeśli
       istnieje, popraw je i w tym samym zadaniu popraw `tests/instrukcja.unit.ts`; pamiętaj,
       że ten test skleja białe znaki, więc szukaj w dokumentacji fragmentu frazy, nie całego
       zdania, bo grep po całym zdaniu nic nie znajdzie i wywoła fałszywy wniosek. Jeśli takiego
       zdania nie ma, nie zmieniaj ani jednego łańcucha i zapisz to jako ustalenie w SUMMARY,
       razem z powodem.
    2. Sprawdź osobno podpowiedź wyspy zdjęcia, tę o tym, jak zdjęcie pojawi się na stronie.
       Ona dotyczy MINIATURY W PANELU, a nie podpisu publikowanego, więc D-4 jej nie dotyczy.
       Potwierdź też, że pozostaje prawdziwa po D-6: panel przycina wgrywane zdjęcie do
       proporcji docelowej po stronie serwera, więc dla plików wgranych przez panel proporcja
       źródła równa się proporcji kafelka i nowe kadrowanie od góry nie zmienia dla nich niczego.
       Zmiana kadru dotyczy wyłącznie plików wysokich, umieszczonych w repozytorium ręcznie.
       Odnotuj to w SUMMARY; jeśli przeszukanie da inny wynik, ZATRZYMAJ SIĘ i zgłoś zamiast
       poprawiać instrukcję na wyczucie.
    3. Zmiana, która jest potrzebna niezależnie od powyższego: deklaracja pola podpisu w typie
       zdjęcia wpisu w `src/lib/server/aktualnosci.ts` dostaje komentarz mówiący wprost, że od
       tego zadania podpis nie jest renderowany na stronie wpisu ani w podglądzie, że pozostaje
       w danych jako oznaczenie pozycji dla osoby redagującej galerię w pull requeście, i że
       nazwę okna podglądu daje tam stała etykieta, a nie to pole. Bez tego komentarza następna
       osoba napisze podpis, licząc, że będzie widoczny.
    4. Nie dodawaj ekranu do panelu i nie ruszaj listy tras w `tests/fixtures/trasy-panelu.ts`.
       To zadanie nie tworzy żadnego nowego ekranu panelu.
  </action>

  <verify>
    <automated>npm run test:unit</automated>
  </verify>

  <done>
    Przesłanka D-4 o kopii panelu jest sprawdzona i rozstrzygnięta pisemnie w jedną albo w drugą
    stronę; deklaracja pola podpisu w czytniku wpisów niesie komentarz o tym, że podpis nie jest
    już renderowany na stronie wpisu; `npm run test:unit` przechodzi w całości, w tym kontrakt
    instrukcji, przemiatanie kopii panelu i strażnik opisów zdjęć.
  </done>
</task>

</tasks>

<verification>
Pełna weryfikacja przed commitem, w tej kolejności i w całości:

```
lsof -ti :4173 | xargs -r kill
npm run check && npm run lint && npm run test:unit && npm run test
```

Port 4173 trzeba zwolnić PRZED pełnym pakietem, bo żywy `wrangler` jest przez Playwrighta
ponownie użyty i pakiet zmierzyłby stary build, co w tym repozytorium już raz dało czerwień
na kodzie, który był poprawny. Jeśli katalog `.playwright-mcp/` albo zrzuty ekranu w katalogu
głównym pojawią się w trakcie pracy, usuń je przed `npm run lint`, bo `prettier --check .`
je widzi.

Pre-commit uruchamia tylko dwa pierwsze polecenia, a `test:unit` nie ma żadnej bramki
automatycznej, więc trzeba je uruchomić ręcznie.

Ręcznie, jednym spojrzeniem na `/o-nas` i na wpis z galerią przy szerokości 1440 px: podgląd
czyta się jako oprawiona fotografia, nad zdjęciem nie ma pustego białego pasa, nigdzie w
obudowie zdjęcia nie ma koła, a na stronie wpisu proza kończy się w tej samej pionowej linii
co fotografie.
</verification>

<success_criteria>
- Podgląd: panel 24, wcięcie 16, zdjęcie 8, kontrolka 8, zero kół (D-1, D-2, D-3).
- Okno dialogowe ma niepustą nazwę dostępną w OBU stanach, z podpisem i bez (D-4).
- Podpisy wyłącznie na `/o-nas`; strona wpisu nie ma ich ani pod kafelkiem, ani w podglądzie.
- Strona wpisu: jedna miara, jedna lewa i jedna prawa krawędź dla nagłówków, prozy i siatki.
- Kafelek kadruje od góry; siatka 4:3 pozostaje nienaruszona (D-6).
- Każda powierzchnia medialna w repozytorium ma zapisany werdykt wobec prawa koncentryczności,
  łącznie z okładką wpisu, której w tabeli D-2 nie było.
- `app.css` nie zyskał nowego tokenu; paleta, typografia, kształt CTA i tagów nietknięte.
- `npm run check && npm run lint && npm run test:unit && npm run test` przechodzi w całości.
</success_criteria>

<output>
Utwórz `.planning/quick/260901-amq-system-prezentacji-mediow-passe-partout-/260901-amq-SUMMARY.md`.

Musi zawierać, poza standardową treścią, cztery pozycje wprost:
1. **Kandydat na poprawkę `01-UI-SPEC.md`** (D-3): specyfikacja przypisuje kształt pigułki
   przyciskom CTA, drugorzędnym i tagom, i NIE nazywa ikonowej kontrolki zamknięcia. Reguła
   „zero kół w obudowie mediów" jest nową regułą, a nie złamaniem istniejącej, i jest
   kandydatem do dopisania w zablokowanej specyfikacji. Specyfikacji NIE edytujemy w tym
   zadaniu.
2. **Uzupełnienie tabeli D-2**: okładka wpisu na `/aktualnosci/[slug]` jest powierzchnią
   medialną, której w tabeli nie było, z werdyktem i uzasadnieniem z zadania 2.
3. **Znany, zaakceptowany kompromis** (D-6): kafelek pokazuje górę kadru wysokiego zdjęcia, a
   podgląd pokazuje całą fotografię, więc kafelek i podgląd pokazują inne kadry tego samego
   pliku. Nie przycinamy plików źródłowych i nie dodajemy kadrowania w panelu.
4. **Wynik sprawdzenia przesłanki D-4 o kopii panelu** z zadania 4, w jedną albo w drugą stronę,
   z powodem.
5. **Sprostowanie do tabeli D-2**: wiersz okładki `NewsCard` wyprowadza 8 px z wcięcia 16 px,
   którego wokół okładki nie ma (padding niesie wyłącznie blok tekstu karty). Wartość zostaje
   nietknięta, zgodnie z D-2, ale jej uzasadnieniem jest tabela użycia specyfikacji, a nie
   odejmowanie. Zapisz to, żeby prawo koncentryczności nie było później stosowane przez analogię
   do wiersza, który go nie ilustruje.
</output>
