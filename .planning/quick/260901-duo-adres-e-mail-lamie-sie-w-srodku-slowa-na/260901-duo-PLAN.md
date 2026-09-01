---
quick_id: 260901-duo
phase: quick-260901-duo
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/components/AdresEmail.svelte
  - src/lib/components/ContactAndMap.svelte
  - src/routes/kontakt/+page.svelte
  - src/lib/components/Footer.svelte
  - src/lib/components/KontaktForm.svelte
  - src/lib/components/ZgloszenieForm.svelte
  - src/lib/components/FallbackPanel.svelte
  - tests/adres-email.spec.ts
  - .planning/STATE.md
autonomous: true
requirements: [CONTACT-01, HOME-02, SITE-02, A11Y-01]

estimate:
  tokens: 72000
  raw_tokens: 36000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "Adres e-mail nigdy nie łamie się w środku części lokalnej ani w środku domeny: jedyną dozwoloną granicą jest małpa (D-1)."
    - "Adres pozostaje kopiowalny jako jeden ciąg: `textContent` każdego wystąpienia jest bajt w bajt równy `contact.email`, bez spacji i bez dywizu (D-1)."
    - "Znacznik `<wbr>` po małpie powstaje w JEDNYM miejscu w repozytorium i wszystkie sześć powierzchni czyta to jedno miejsce (D-2)."
    - "Strona główna nadal ma DOKŁADNIE JEDEN odnośnik `mailto:`, a stopka nadal renderuje adres jako zwykły tekst (D-2)."
    - "Na stronie głównej adres mieści się w JEDNYM wierszu przy 1440 i przy 1024 px (D-3)."
    - "Żadna trasa nie zyskuje poziomego przewijania przy żadnej szerokości z macierzy `responsive.spec.ts` (WCAG 1.4.10)."
    - "Adres nie zmalał: rozmiar pisma odnośnika pozostaje 16 px, a cel dotknięcia 44 px jest nienaruszony."
    - "`TopBar.svelte` nie zyskuje adresu e-mail (D-4)."
  artifacts:
    - src/lib/components/AdresEmail.svelte
    - tests/adres-email.spec.ts
  key_links:
    - "`src/lib/content/site.ts` -> `AdresEmail.svelte` -> sześć powierzchni. Adres ma jedno źródło danych i jedno źródło znaczników (D-2)."
    - "`AdresEmail.svelte` renderuje POJEDYNCZY element opakowujący, bo `.item-link` i `.awaria-kontakt a` są `display: inline-flex`: gołe `<wbr>` w takim rodzicu stałoby się osobnym elementem elastycznym przy `flex-wrap: nowrap` i wypchnęłoby adres poza kontener."
    - "`.contact-grid` w `ContactAndMap.svelte` -> szerokość `.item-text` -> czy adres mieści się w jednym wierszu (D-3). Kolumna mapy nie jest dotykana."
    - "`tests/adres-email.spec.ts` mierzy prostokąty klienta na WĘZŁACH TEKSTOWYCH, nie na elemencie, bo element opakowujący jest zblokowany jako element elastyczny i zwróciłby jeden prostokąt niezależnie od zawijania."
---

<objective>
Adres `publicznyzlobek@ugstromiec.pl` łamie się na stronie głównej w środku domeny i zostawia
osierocone „ec.pl" w drugim wierszu. Ten plan wprowadza jedno miejsce renderujące adres ze
znacznikiem `<wbr>` po małpie, podłącza je do wszystkich sześciu powierzchni, poszerza kolumnę
kontaktową na stronie głównej i zostawia bramkę, która zapala się przy każdym kolejnym złamaniu
w środku słowa.

Purpose: rodzic KOPIUJE ten adres, więc żadne rozwiązanie wstawiające znak do tekstu nie wchodzi
w grę, a adres publiczny podmiotu publicznego nie może być drobniejszy niż otaczająca go treść.
Output: `AdresEmail.svelte`, sześć podłączonych powierzchni, szersza kolumna kontaktowa,
`tests/adres-email.spec.ts`.
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
@$HOME/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/quick/260901-duo-adres-e-mail-lamie-sie-w-srodku-slowa-na/260901-duo-CONTEXT.md
@.claude/CLAUDE.md
@src/lib/content/site.ts
@src/lib/components/ContactAndMap.svelte
@src/lib/components/Footer.svelte
</context>

<ustalenia_planisty>
Ustalone w kodzie przed napisaniem planu, żeby wykonawca nie musiał tego odkrywać ponownie.

**Zasada jednego `mailto:` na stronie głównej: ZWERYFIKOWANA, obowiązuje, i jest egzekwowana
testem.** `tests/home.spec.ts:249` żąda, żeby na `/` element `a[href="mailto:publicznyzlobek@ugstromiec.pl"]`
występował dokładnie raz. Zasada jest opisana w czterech komentarzach źródłowych, które się ze sobą
zgadzają: `ContactAndMap.svelte:4` („owns the homepage's ONLY mailto"), `Footer.svelte:4`,
`TopBar.svelte:4` i `Recruitment.svelte:8`, plus `site.ts:272`. Na `/kontakt` zasada świadomie NIE
obowiązuje (`kontakt/+page.svelte:62`: jest to reguła per strona, należąca do strony głównej), więc
tamtejsze dwa odnośniki `mailto:` są w porządku. Wniosek dla tego zadania: stopka musi zostać
zwykłym tekstem, `TopBar` nie dostaje adresu (D-4), a asercja w `home.spec.ts` przechodzi po zmianie
bez modyfikacji, bo zamiana dotyczy tylko zawartości odnośnika, nie jego liczby.

**Uwaga: `tests/home.spec.ts:249` ma adres wpisany na sztywno w selektorze.** To znany w tym
projekcie wzorzec „testy kodują dzisiejszą treść". Nie naprawiamy go tutaj (byłoby to poszerzenie
zakresu), ale wykonawca ma o nim wiedzieć, gdyby ten test zaczerwienił się z niezrozumiałego powodu.

**Model szerokości kolumny, wyprowadzony i zgodny z pomiarami z CONTEXT.** `.contact-inner`
ma `max-width: 72rem` i `padding-inline: 32px` od 1024 px. Zewnętrzna siatka `.grid` to
`1fr 1.15fr` z odstępem 40 px, więc kolumna kontaktowa dostaje `(W - 64 - 40) / 2.15`. Wewnętrzna
`.contact-grid` dzieli ją na `repeat(2, 1fr)` z odstępem kolumnowym 24 px, a `.item` zjada jeszcze
22 px ikony plus 12 px odstępu. Przy 1440 px daje to 198 px na `.item-text`, przy 1024 px z paskiem
przewijania 164 px. Obie liczby zgadzają się z pomiarem w CONTEXT co do piksela, więc model jest
poprawny i można na nim liczyć w zadaniu 3.

**Dlaczego `AdresEmail.svelte` renderuje sam tekst adresu, a nie cały odnośnik.** D-2 mówi o jednym
wspólnym komponencie i o wariancie dla stopki. Rozważono mocniejszy wariant, w którym komponent
przejmuje także element `<a>` i atrybut `href`, i został ODRZUCONY z powodu zakresowania stylów w
Svelte: klasa podana dziecku przez atrybut nie dostaje skrótu zakresu, więc `.item-link`,
`.fallback-tresc a`, `.awaria-kontakt a` oraz dwie ZŁĄCZONE reguły `:hover` w obu wyspach
formularzy musiałyby zostać przepisane na `:global()` w pięciu plikach. Dwie z tych reguł niosą
`min-height: 44px`, czyli cel dotknięcia, a powierzchnie, które je używają (`.awaria-kontakt`),
NIE MAJĄ ŻADNEGO testu w `tests/` i pojawiają się dopiero po nieudanej wysyłce. Cicha utrata celu
44 px na nietestowanej ścieżce jest gorsza niż pięć powtórzeń atrybutu `href`, które i tak są
stanem obecnym i nie są przyczyną usterki. Jedno źródło znaczników `<wbr>` jest osiągnięte tak czy
inaczej, bo to ono jest treścią D-2.
</ustalenia_planisty>

<tasks>

<task type="tracer" tdd="true">
  <name>Zadanie 1: jedno źródło adresu z `<wbr>`, podłączone do powierzchni, która łamie, plus bramka mierząca wiersze</name>
  <files>src/lib/components/AdresEmail.svelte, src/lib/components/ContactAndMap.svelte, tests/adres-email.spec.ts</files>
  <read_first>src/lib/content/site.ts (linia 78), src/lib/components/ContactAndMap.svelte (linie 39 do 45 oraz 168 do 178), tests/responsive.spec.ts (linie 11 do 32, wzorzec macierzy widoków), tests/kontakt.spec.ts (linie 1 do 4, wzorzec importu `contact` z `../src/lib/content/site`)</read_first>
  <behavior>
    Bramka `tests/adres-email.spec.ts` ma sprawdzać, dla tras `/`, `/kontakt` i `/rekrutacja`, przy
    widokach 1440x1000 i 1024x768, dla KAŻDEGO wystąpienia adresu:
    - Test 1: `textContent` wystąpienia jest identyczny z `contact.email` zaimportowanym z
      `../src/lib/content/site`. Zero spacji, zero dywizu, zero znaku niewidocznego. To jest
      dowód kopiowalności (D-1) i zarazem wykrywacz spacji wstrzykniętej przez formatowanie.
    - Test 2: wystąpienie ma dokładnie DWA niepuste węzły tekstowe (część przed małpą wraz z
      małpą, oraz domena). Węzły komentarza wstawiane przez hydratację Svelte są odfiltrowane
      po `nodeType`.
    - Test 3: `Range` rozpięty na każdym z tych dwóch węzłów daje DOKŁADNIE JEDEN prostokąt
      klienta. To jest właściwa asercja D-1: złamanie w środku części lokalnej lub w środku
      domeny dałoby dwa prostokąty na tym samym węźle.
    - Test 4: jeśli oba węzły mają tę samą współrzędną górną (tolerancja 1 px), adres jest w
      jednym wierszu; jeśli różną, to jest to dozwolone złamanie przy małpie i domena zaczyna
      nowy wiersz. Trzeciej możliwości nie ma, bo test 3 ją wyklucza.
    - Test 5 (reguła strukturalna, nie licznik dzisiejszej treści): każdy `a[href^="mailto:"]` w
      dokumencie zawiera dokładnie jedno wystąpienie adresu, a `footer p.org` zawiera dokładnie
      jedno. Liczba wystąpień na trasę NIE jest wpisana na sztywno.
    Przed zmianą testy 2 i 3 są czerwone na `/` (jeden węzeł tekstowy, dwa prostokąty przy 1024).
    Ten stan wykonawca ma zaobserwować i zapisać w SUMMARY, a nie commitować osobno: brama
    pre-commit uruchamia svelte-check na całym drzewie, więc commit RED jest w tym repozytorium
    niewykonalny (precedens z 04.1-02).
  </behavior>
  <action>
Utwórz `src/lib/components/AdresEmail.svelte`. Komponent nie przyjmuje żadnych własności i sam
importuje `contact` z `$lib/content/site`, żeby adres nie mógł zostać przepisany ręcznie w żadnym
miejscu wywołania. Wylicza pozycję OSTATNIEJ małpy w `contact.email`, dzieli ciąg na część przed
małpą wraz z małpą oraz na domenę, i renderuje POJEDYNCZY element `span` z klasą `adres-email`,
który zawiera kolejno: pierwszą część, znacznik `wbr`, drugą część. Gdy małpy w ciągu nie ma,
renderuje cały adres bez znacznika `wbr`, bo dzielenie ciągu bez małpy jest bez sensu i nie może
wywrócić strony.

Trzy wiązania, których nie wolno pominąć:
1. Ten `span` jest tam po to, żeby rodzic elastyczny widział DOKŁADNIE JEDNO dziecko. `.item-link`
   jest `display: inline-flex`, a `.awaria-kontakt a` również, więc znacznik `wbr` wstawiony wprost
   do takiego rodzica stałby się osobnym elementem elastycznym, przy domyślnym `flex-wrap: nowrap`
   trafiłby z tekstem do jednego nieprzełamywalnego wiersza i wypchnąłby adres poza kontener, co
   jest dokładnie tym poziomym przewijaniem, którego zakazuje WCAG 1.4.10. Wewnątrz `span` układ
   jest liniowy i znacznik działa zgodnie z przeznaczeniem.
2. Trzy części znacznika muszą stać w JEDNEJ linii pliku źródłowego. Nowa linia między nimi stanie
   się w Svelte spacją w tekście, adres przestanie być kopiowalny jako jeden ciąg i test 1 to
   złapie. Prettier ma `printWidth: 100` i `useTabs`, więc krótka linia nie zostanie zawinięta.
   Po edycji uruchom `npm run format` i sprawdź, czy plik nadal ma tę linię w całości.
3. Komponent nie ma bloku `style`. Klasa `adres-email` jest wyłącznie uchwytem dla bramki
   testowej, a wygląd nadal należy do rodzica, który dziedziczy się do `span` normalnie.

W `ContactAndMap.svelte` zaimportuj komponent i podmień treść odnośnika w wierszu 43: element `<a>`,
jego klasa i jego `href` ZOSTAJĄ na miejscu, zmienia się wyłącznie zawartość, z interpolacji
`contact.email` na wywołanie komponentu. Deklaracja `overflow-wrap: anywhere` w `.item-link`
ZOSTAJE nietknięta: jest ostatnią deską ratunku dla ekranów, na których sama domena się nie mieści,
a przeglądarka i tak wybierze najpierw jawnie wskazaną szansę na złamanie przy małpie (D-1). Nie
dodawaj `white-space: nowrap`, nie zmieniaj `font-size`, nie ruszaj `min-height: 44px`.

Napisz `tests/adres-email.spec.ts` zgodnie z blokiem `behavior`. Pomiar rób w `page.evaluate` na
WĘZŁACH TEKSTOWYCH przez `document.createRange()` i `getClientRects()`, nigdy przez
`getClientRects()` na samym elemencie `span`: wewnątrz `.item-link` ten `span` jest zblokowanym
elementem elastycznym, a element blokowy zwraca jeden prostokąt obejmujący oba wiersze, więc
pomiar na elemencie nie wykryłby zawinięcia w ogóle. Nazwy testów i komentarze po polsku, jak w
`tests/kontakt.spec.ts`. Zero emoji, zero myślników.
  </action>
  <verify>
    <automated>lsof -ti tcp:4173 | xargs kill 2>/dev/null; npx playwright test tests/adres-email.spec.ts --reporter=list</automated>
    <automated>npm run check</automated>
  </verify>
  <done>
    `AdresEmail.svelte` istnieje, nie przyjmuje własności i czyta `contact.email` sam. Na `/` przy
    1440 i 1024 px adres ma dwa węzły tekstowe, każdy o dokładnie jednym prostokącie klienta, a
    jego `textContent` jest równy `contact.email`. `npm run check` zgłasza 0 błędów i 0 ostrzeżeń
    (ostrzeżenie o nieużywanym selektorze CSS byłoby sygnałem, że zakresowanie stylów się rozjechało).
    Stan czerwony sprzed zmiany jest zaobserwowany i opisany w SUMMARY.
  </done>
</task>

<task type="auto">
  <name>Zadanie 2: pozostałe pięć powierzchni czyta to samo źródło, w tym wariant zwykłego tekstu w stopce</name>
  <files>src/routes/kontakt/+page.svelte, src/lib/components/FallbackPanel.svelte, src/lib/components/KontaktForm.svelte, src/lib/components/ZgloszenieForm.svelte, src/lib/components/Footer.svelte</files>
  <read_first>src/routes/kontakt/+page.svelte (linia 85), src/lib/components/FallbackPanel.svelte (linia 21), src/lib/components/KontaktForm.svelte (linia 275), src/lib/components/ZgloszenieForm.svelte (linia 339), src/lib/components/Footer.svelte (linie 26 do 34)</read_first>
  <action>
Podmień pozostałe pięć wystąpień na komponent z zadania 1. Wzorzec jest wszędzie ten sam co w
`ContactAndMap`: element `<a>`, jego klasa i jego atrybut `href` zostają dokładnie takie, jakie są,
zmienia się wyłącznie interpolacja `contact.email` w treści odnośnika. Dotyczy to czterech
powierzchni odnośnikowych: karty kontaktowej na `/kontakt`, panelu awaryjnego oraz furtki
awaryjnej w obu wyspach formularzy. Zdanie w `FallbackPanel.svelte` ma po adresie kropkę i dalszy
ciąg o godzinach, więc uważaj, żeby nie zjeść ani nie zdublować interpunkcji.

Stopka jest wariantem zwykłego tekstu i to jest jej cechą, nie przeoczeniem. W `Footer.svelte`
adres stoi jako goła interpolacja w `p.org`, po elemencie `br`. Podmień samą interpolację na
wywołanie komponentu i NIE otaczaj go odnośnikiem. Komentarz stojący nad tym miejscem opisuje
powód (linkowane wersje żyją w `ContactAndMap` i na `/kontakt`, a od tego zależy zasada jednego
odnośnika `mailto:` na stronie głównej). Zaktualizuj ten komentarz tak, żeby mówił także, skąd
teraz bierze się sam adres, i zostaw w nim zapis, że stopka celowo nie linkuje. Deklaracja
`overflow-wrap: anywhere` w `.org` zostaje.

Nie ruszaj `src/lib/content/forms.ts`. Adres występuje tam w środku zdań prozy, łamie się na
spacjach jak każde inne słowo i nie tworzy sieroty, a są to zwykłe ciągi znaków, nie znaczniki
(D-2). `TopBar.svelte` nie jest w tym zadaniu w ogóle dotykany: adresu tam nigdy nie było i jego
dodanie byłoby nową funkcją, nie naprawą (D-4).

Po podmianie sprawdź, że `contact` jest nadal używany w każdym z pięciu plików do czegoś innego
(godziny, adres pocztowy, `href`), a tam gdzie przestał być używany, usuń martwy import, bo eslint
to zgłosi.
  </action>
  <verify>
    <automated>lsof -ti tcp:4173 | xargs kill 2>/dev/null; npx playwright test tests/adres-email.spec.ts tests/kontakt.spec.ts tests/home.spec.ts tests/rekrutacja.spec.ts tests/stopka-identyfikatory.spec.ts --reporter=list</automated>
    <automated>npm run check && npm run lint</automated>
  </verify>
  <done>
    Wszystkie sześć powierzchni renderuje adres przez `AdresEmail.svelte`. Test strukturalny z
    zadania 1 (każdy odnośnik `mailto:` zawiera dokładnie jedno wystąpienie, `footer p.org` zawiera
    dokładnie jedno) jest zielony na trzech trasach. `tests/home.spec.ts` nadal potwierdza dokładnie
    jeden odnośnik `mailto:` na stronie głównej, a `tests/kontakt.spec.ts` nadal potwierdza, że
    tekst odnośnika jest równy `contact.email`. `npm run check` i `npm run lint` czyste.
  </done>
</task>

<task type="auto">
  <name>Zadanie 3: kolumna kontaktowa na stronie głównej mieści adres w jednym wierszu, bramka zacieśniona, STATE zaktualizowany</name>
  <files>src/lib/components/ContactAndMap.svelte, tests/adres-email.spec.ts, .planning/STATE.md</files>
  <read_first>src/lib/components/ContactAndMap.svelte (linie 103 do 178), tests/responsive.spec.ts (linie 44 do 66, lista tras i widoków bez poziomego przewijania)</read_first>
  <action>
Realizacja D-3. Adres potrzebuje 227 px, a dostaje 198 px przy 1440 i 164 px przy 1024, bo
`.contact-grid` dzieli kolumnę kontaktową na dwie kolumny od 640 px. Ta siatka została
zwymiarowana wtedy, gdy pozycji było CZTERY i układały się w równe dwa na dwa; dziś są TRZY
(wiersz Telefon zniknął razem z numerem 2026-08-18), więc druga kolumna drugiego wiersza jest i
tak pusta.

Preferowana zmiana, minimalna i nietykająca mapy: dodaj w `ContactAndMap.svelte` blok
`@media (min-width: 1024px)` dla `.contact-grid`, ustawiający jedną kolumnę i odstęp 24 px. Blok
musi stać w pliku PO istniejącym bloku `@media (min-width: 640px)`, inaczej reguła dwukolumnowa go
przykryje. Z modelu szerokości wynika wtedy 453 px na `.item-text` przy 1440 px i 387 px przy
1024 px, czyli oba z zapasem ponad 227 px. Zewnętrzna siatka `.grid` i jej proporcja `1fr 1.15fr`
zostają nietknięte, `MapPanel.svelte` nie jest otwierany, kolumna mapy nie zmienia szerokości.

Jeżeli pomiar po zmianie nie potwierdzi jednego wiersza, wariantem zapasowym jest odwrócenie
proporcji zewnętrznej siatki na `1.15fr 1fr`, co daje kolumnie kontaktowej 560 px. Ten wariant
zwęża mapę, więc sięgaj po niego dopiero, gdy pierwszy zawiedzie. Jeżeli oba zawiodą, zostaje samo
`<wbr>` z zadania 1, a decyzja wraz z pomiarem idzie do SUMMARY, tak jak przewiduje D-3.

Zacieśnij `tests/adres-email.spec.ts`: dodaj przypadek, który na `/` przy 1440 px ORAZ przy 1024 px
żąda, żeby oba węzły tekstowe adresu w sekcji kontaktowej miały tę samą współrzędną górną, czyli
żeby adres stał w jednym wierszu. Przypadek celuj selektorem w sekcję kontaktową strony głównej,
nie w dowolne wystąpienie, bo w stopce tej samej strony adres ma inną szerokość i inne prawo do
zawijania. Uruchom ten przypadek PRZED zmianą stylu i zaobserwuj czerwień, potem po zmianie zieleń,
i zapisz obie obserwacje w SUMMARY.

Na końcu dopisz w `.planning/STATE.md` jedną pozycję w `last_activity_desc` i krótką notatkę o tym
zadaniu, zgodnie z formatem, którego używają wcześniejsze wpisy szybkich zadań.
  </action>
  <verify>
    <automated>lsof -ti tcp:4173 | xargs kill 2>/dev/null; npx playwright test tests/adres-email.spec.ts tests/responsive.spec.ts --reporter=list</automated>
    <automated>lsof -ti tcp:4173 | xargs kill 2>/dev/null; npm run check && npm run lint && npm run test:unit && npm run test</automated>
    <human-check>Obejrzeć wyrenderowaną stronę główną przy 1440 i przy 1024 px: adres stoi w jednym wierszu, sekcja kontaktowa nie wygląda na rozjechaną wobec mapy, trzy pozycje kontaktowe czytają się jako lista. Zaznaczyć adres myszą, skopiować i wkleić do pola tekstowego: ma się wkleić dokładnie `publicznyzlobek@ugstromiec.pl`, bez spacji i bez dywizu. Zielone testy nie są dowodem, bo zmiana jest wizualna.</human-check>
  </verify>
  <done>
    Adres na stronie głównej stoi w jednym wierszu przy 1440 i przy 1024 px, potwierdzone przez
    nowy przypadek widziany najpierw na czerwono. `tests/responsive.spec.ts` nadal zielony na całej
    macierzy, czyli żadna trasa nie zyskała poziomego przewijania. Pełna weryfikacja
    `npm run check && npm run lint && npm run test:unit && npm run test` przechodzi. Kolumna mapy ma
    tę samą szerokość co przed zmianą. Kontrola wzrokowa i próba skopiowania adresu wykonane.
    `.planning/STATE.md` zaktualizowany.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| `src/lib/content/site.ts` -> znaczniki Svelte | Adres jest stałą w repozytorium, nie danymi od użytkownika i nie treścią z panelu redakcyjnego. Granica jest z definicji zaufana. |
| przeglądarka -> schowek | Rodzic kopiuje adres i wkleja go do klienta poczty. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-duo-01 | Tampering | `AdresEmail.svelte` | low | mitigate | Adres nie jest ani propem, ani treścią wstawianą przez `@html`: komponent czyta stałą z `site.ts` sam, więc nie da się podać mu innego adresu z miejsca wywołania. |
| T-duo-02 | Spoofing | tekst odnośnika kontra `href` | medium | mitigate | Widoczny tekst i `href` biorą się z tej samej stałej. Bramka sprawdza, że `textContent` jest bajt w bajt równy `contact.email`, więc rozjazd tekst kontra cel odnośnika (klasyczny nośnik phishingu) jest wykrywalny automatycznie. |
| T-duo-03 | Information disclosure | znacznik `wbr` a zbieracze adresów | low | accept | Adres jest publiczną skrzynką podmiotu publicznego, opublikowaną w BIP. Rozbicie na dwa węzły tekstowe nie jest i nie ma być zaciemnieniem. |
| T-duo-04 | Denial of service | poziome przewijanie po zmianie układu | medium | mitigate | `tests/responsive.spec.ts` sprawdza brak poziomego przewijania na siedmiu trasach i pięciu szerokościach i jest częścią weryfikacji zadania 3. Element opakowujący z zadania 1 istnieje właśnie po to, żeby `wbr` nie stał się elementem elastycznym w rodzicu `inline-flex`. |

Brak instalacji pakietów w tym zadaniu, więc bramka legalności pakietów nie ma zastosowania.
</threat_model>

<verification>
1. `lsof -ti tcp:4173 | xargs kill 2>/dev/null` przed pełnym przebiegiem, inaczej Playwright podepnie
   się do żywego podglądu ze starej wersji i czerwienie będą mierzyć nie to, co trzeba.
   Uwaga: narzędzie Bash uruchamia zsh, więc nie polegaj na dzieleniu na słowa niecytowanej zmiennej.
2. `npm run check && npm run lint && npm run test:unit && npm run test`. Ostrzeżenia svelte-check
   traktuj jak błędy: 0 i 0 jest tu standardem, a ostrzeżenie o nieużywanym selektorze byłoby
   jedynym sygnałem, że zakresowanie stylów przestało trafiać w element.
3. Kontrola wzrokowa strony głównej przy 1440 i 1024 px oraz próba skopiowania adresu.
4. Sprzątanie przed `npm run lint`: jeżeli w trakcie pracy powstały katalogi zrzutów przeglądarki
   albo pliki obrazów w korzeniu repozytorium, usuń je, bo `prettier --check .` je zgłosi.
</verification>

<success_criteria>
- Adres nie łamie się w środku części lokalnej ani w środku domeny na żadnej z sześciu
  powierzchni, przy 1440 i 1024 px (D-1).
- Jedynym dozwolonym miejscem złamania jest małpa, a domena po złamaniu zaczyna nowy wiersz (D-1).
- `textContent` każdego wystąpienia jest równy `contact.email`, więc adres wkleja się jako jeden
  ciąg (D-1).
- Znacznik `wbr` powstaje w jednym pliku, a sześć powierzchni go współdzieli (D-2).
- Strona główna ma dokładnie jeden odnośnik `mailto:`, stopka pozostaje zwykłym tekstem (D-2).
- Adres mieści się w jednym wierszu na stronie głównej przy 1440 i 1024 px (D-3).
- `TopBar.svelte` bez zmian (D-4), a pytanie o pusta prawą połowę paska idzie do raportu, nie do
  kodu.
- Bez nowych żetonów, bez zmiany palety, bez zmiany typografii, bez zmniejszenia adresu.
- Brak poziomego przewijania na całej macierzy `responsive.spec.ts` (WCAG 1.4.10).
</success_criteria>

<output>
Utwórz `.planning/quick/260901-duo-adres-e-mail-lamie-sie-w-srodku-slowa-na/260901-duo-SUMMARY.md` po zakończeniu.
W SUMMARY zapisz obowiązkowo: zaobserwowany stan czerwony przed zmianą (zadania 1 i 3), zmierzone
szerokości `.item-text` po zmianie przy 1440 i 1024 px, oraz który wariant D-3 został użyty.
</output>
