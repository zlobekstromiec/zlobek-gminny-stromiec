---
quick_id: 260921-j9c
phase: quick-260921-j9c
plan: 01
status: complete
subsystem: content
tags: [rodo, dokumenty, a11y, cennik, kontakt, iod, deklaracja-dostepnosci]
date: 2026-09-21
requirements: [CONTACT-01, DOCS-01, FEES-01, LEGAL-02, A11Y-03, SITE-03]
key-files:
  created:
    - src/lib/content/rodo.ts
    - src/lib/content/dostepnosc.ts
    - tests/deklaracja-dostepnosci.spec.ts
    - src/lib/content/dokumenty/ (12 nowych wpisow JSON)
    - static/dokumenty/ (12 nowych plikow + podmieniony statut)
  modified:
    - src/lib/content/site.ts
    - src/lib/content/forms.ts
    - src/lib/content/polityka.ts
    - src/lib/content/cennik.ts
    - src/lib/content/cennik.json
    - src/lib/content/o-nas.json
    - src/lib/content/panel.ts
    - src/lib/kategorie-dokumentow.ts
    - src/lib/server/dokumenty.ts
    - src/lib/components/ContactAndMap.svelte
    - src/lib/components/TopBar.svelte
    - src/lib/components/Footer.svelte
    - src/lib/components/Hero.svelte
    - src/lib/components/FallbackPanel.svelte
    - src/lib/components/KontaktForm.svelte
    - src/lib/components/ZgloszenieForm.svelte
    - src/routes/kontakt/+page.svelte
    - src/routes/dokumenty/+page.svelte
    - src/routes/polityka-prywatnosci/+page.svelte
    - src/routes/deklaracja-dostepnosci/+page.svelte
    - src/routes/+page.server.ts
    - docs/instrukcja-cms.md
commits:
  - 87efbe4
  - 2e278e9
  - a0b7c06
  - 09b24c6
  - daffa06
actuals:
  tokens: 118000
  tasks: 5
  commits: 5
---

# Quick 260921-j9c: dane od dyrektor z 2026-09-21 na stronie

Komplet danych przekazanych 2026-09-21 przez dyrektor Kamilę Dobosz jest na stronie:
służbowy numer telefonu na dziewięciu powierzchniach, jawna kwota dopłaty ZUS, dwanaście
nowych dokumentów do pobrania z nowym pasmem RODO, inspektor ochrony danych z imienia i
nazwiska, jednolite brzmienie administratora, role całej kadry oraz koordynator
dostępności z obiema listami faktów o dostępności budynku.

Cały łańcuch weryfikacji zielony: `npm run check` (0 błędów, 0 ostrzeżeń, 4414 plików),
`npm run lint`, `npm run test:unit` (645/645), `npm run test` (489/489), `npm run build`
(kod wyjścia 0, więc czytniki cennika i dokumentów zwalidowały nowe sklepy przy budowaniu).

---

## Co się zmieniło, zadanie po zadaniu

### Zadanie 1: numer telefonu wraca na wszystkie powierzchnie (`87efbe4`)

Numer **500 051 228** jest wartością wyłącznie w `contact` w `src/lib/content/site.ts`.
Podnosi go dziewięć powierzchni, bo żadna nigdy nie trzymała literału: pasek górny, linia
w hero, karta kontaktowa na stronie głównej, stopka (tekstem, nie odnośnikiem), karta na
`/kontakt`, panel awaryjny wspólny dla obu formularzy, furtki awaryjne obu wysp formularzy
oraz kopia `noscript`.

To NIE jest numer zdjęty 2026-08-18 commitem `acd6497`. Tamten był prywatną komórką
dyrektor i bramka uruchomieniowa z D-08 odpowiedziała na niego „nie". Odwrócona została
wyłącznie telefoniczna połowa tamtego commita; połowa dotycząca stanu naboru jest
nietknięta.

Wróciły też ciągi kopii przepisane wyłącznie dlatego, że numer zniknął: drugi przycisk
hero („Zadzwoń do nas"), nagłówek panelu awaryjnego („Wolisz zadzwonić?"), `KOPIA_NOSCRIPT`,
`KOPIA_FALLBACK`, trzy komunikaty błędu w `KOPIA_BLEDOW` oraz dwa zdania w `cennik.ts`.

**Testy odwrócone najpierw i zobaczone na czerwono.** `tests/home.spec.ts` znów liczy
odnośniki `tel:` i żąda dokładnie trzech, ale mocniej niż przed `acd6497`: każdy `href` i
każdy widoczny napis jest porównany z `site.ts`. Ta sama para asercji stoi na `/kontakt`,
tam bez sztywnej liczby, bo pasek górny i panel awaryjny występują na każdej trasie. Sweep
w `forms-copy.unit.ts` wrócił do postaci „każdy numer w kopii równa się temu z site.ts".

**Zrzuty ekranu obejrzane w 1280 px i 390 px.** Karta kontaktowa dostała czwarty wiersz:
na desktopie układa się w dwie kolumny (Adres/Telefon, E-mail/Godziny, NIP), na telefonie
w pięć wierszy. W obu wypadkach czyta się bez ścisku. **Układ karty nie wymagał poprawki**,
mimo notatki z pamięci projektu o jednokolumnowym układzie od 1024 px.

### Zadanie 2: jawna kwota dopłaty ZUS (`2e278e9`)

Pole `zus` w `cennik.json` podaje teraz kwotę: dopłata **do 1 500 zł miesięcznie**, o którą
rodzic wnioskuje w ZUS, i która razem z obniżką z „Aktywnego Malucha" pokrywa całą opłatę
za pobyt. Kwota pada DOKŁADNIE RAZ, w polu należącym do edytora, z którego czytają obie
powierzchnie: blok ZUS na `/cennik` i FeeBox na `/rekrutacji`.

`placeholder` w cenniku idzie na `false`. Znaczniki `// PLACEHOLDER:` o szczegółach
wyżywienia i o płatnościach w `cennik.ts` ZOSTAJĄ: to osobne, wciąż otwarte niewiadome.

HARD RULE 2 w module prozy została **przepisana, a nie usunięta**. Jej przesłanką był brak
potwierdzonego źródła kwoty świadczenia; źródło przyszło, więc w komentarzu stoi teraz
data, autor i powód, dla którego kwota mimo wszystko nie wraca do prozy: literał w module
rozjechałby się ze sklepem przy pierwszym zapisie edytora.

Test dopisany przed zmianą i zobaczony na czerwono nie przepisuje ani zdania, ani kwoty:
żąda, żeby zdanie ze sklepu nazywało kwotę równą `CENNIK.placiTekst`, czyli temu, co rodzic
faktycznie płaci po obniżce. To jest treść potwierdzenia dyrektor zapisana jako arytmetyka.

**Pułapka przyklejonej szyny sprawdzona pomiarem.** FeeBox urósł do 342 px. Przycisk
„Wyślij zgłoszenie" przy 1280x720 jest w całości widoczny poniżej nagłówka przy przewinięciu
1920 px (pomiar `boundingBox`), a test axe, który go klika, przechodzi.

### Zadanie 3: dokumenty, kategoria „Organizacja żłobka" i pasmo RODO (`a0b7c06`)

**Cztery kategorie na `/dokumenty`** w kolejności: Rekrutacja, Statut i uchwały,
Organizacja żłobka, RODO. Nowa kategoria `organizacja` stoi między `statut` a `rodo`, bo
regulamin organizacyjny, standardy ochrony małoletnich i zasady adaptacji nie są ani
papierami rekrutacyjnymi, ani uchwałami Rady Gminy.

**Dwanaście nowych plików do pobrania**, każdy zwraca 200 (istniejąca asercja je obejmuje),
plus podmieniony statut: prawdziwy PDF uchwały XXIII.133.2026 (2,8 MB) zamiast atrapy o 623
bajtach, `wersja: 26.03.2026`, `placeholder: false`, `zrodlo_bip` zachowane.

**Kategoria RODO przestała być uśpiona.** Reguła D-13 jest nietknięta: grupa pojawia się
wtedy, gdy coś w niej jest. Test kolejności nagłówków czyta ją teraz z `KATEGORIE` i
`NAGLOWEK` zamiast wypisywać trzy literały, więc kategoria dopisana kiedyś dołączy do niego
sama.

**Pasmo RODO** otwiera się tekstem dokumentu 08 (`src/lib/content/rodo.ts`), zamyka zdaniem
„Materiały do pobrania:" i dopiero pod nim ma listę plików. Moduł NIE NIESIE ANI JEDNEGO
ADRESU: trasa wstawia je z `contact`, a adres żłobka przez `AdresEmail.svelte`. Moduł
wchodzi do sweepa w `forms-copy.unit.ts` razem z wynikiem funkcji składającej zdanie o
inspektorze.

**Filtry dokumentów na stronie głównej i `/rekrutacji` sprawdzone:** filtrują po
`kategoria === 'rekrutacja'`, więc nowe kategorie do nich nie wyciekają.

### Zadanie 4: IOD z nazwiska, klauzula 06, role kadry (`09b24c6`)

`iodEmail` idzie na `iod.zlobek@ugstromiec.pl`, obok stoi `iodName: 'Michał Paprocki'`.
Art. 11 ustawy z 10 maja 2018 r. wymaga imienia, nazwiska I kontaktu, więc sam adres
obowiązku nie wypełniał; znacznik PLACEHOLDER w bloku „Inspektor ochrony danych" zszedł.

**Administrator brzmi jednolicie**: „Publiczny Żłobek w Stromcu, ul. Radomska 72,
26-804 Stromiec", na trzech powierzchniach (klauzula formularzowa, `/polityka-prywatnosci`,
pasmo RODO), z nowego pola `contact.name`. Komentarz o „ONE DELIBERATE DISCREPANCY" nie
zniknął bez śladu: w jego miejscu stoi zapis, czym i kiedy sprawa została zamknięta.

`KLAUZULA_ADMINISTRATORA` to teraz **klauzula 06** inspektora, rozbita na jej własne
nagłówki (Administrator, Inspektor Ochrony Danych, Cele i podstawy przetwarzania, Odbiorcy
danych, Okres przechowywania, Prawa osoby, Podanie danych, Przekazywanie poza EOG,
Automatyzacja i profilowanie). Warstwa prawna nietknięta, poprawiona wyłącznie warstwa
pisarska. Dodane jedno zdanie NASZE, poza klauzulą, kierujące po klauzule szczegółowe do
`/dokumenty`.

**W prozie strony nie pada żaden okres przechowywania nagrań z monitoringu.**

**Kadra** ma cztery role w kolejności z e-maila: mgr Kamila Dobosz (Dyrektor), Agnieszka
Bernaciak (Opiekun), Justyna Kamińska (Opiekun), Renata Rumniak-Cyngot (Pomoc). Tytuł
„mgr" przeszedł przez walidator i przez test bez zmiany asercji, więc został tak, jak
napisała dyrektor. Grep potwierdził, że nigdzie w `src/` nie ma informacji o wakacjach,
liczbie grup ani przedziałach wiekowych grup.

### Zadanie 5: koordynator i fakty o dostępności (`daffa06`)

`src/lib/content/dostepnosc.ts` niesie koordynatorkę (Ewelina Remion, 664 784 676),
jedenaście faktów o dostępności architektonicznej i dwa o komunikacyjno-informacyjnej.
Stub `/deklaracja-dostepnosci` renderuje trzy prowizoryczne sekcje, pozostaje `noindex`,
axe czysty.

**Schemat deklaracji z Fazy 6 jest nietknięty:** nie powstał ani `deklaracja.json`, ani
`deklaracja.ts`. Znacznik PLACEHOLDER na trasie zwężony do tego, czego faktycznie jeszcze
nie ma.

Nowy `tests/deklaracja-dostepnosci.spec.ts` jest **pierwszym testem tej trasy w ogóle**.

---

## Odstępstwa od planu

Rules 1-3 stosowane automatycznie, bez pytania. Każde odstępstwo poniżej jest udokumentowane
także w komentarzu w kodzie albo w wiadomości commita.

### 1. [Reguła 3] `KOPIA_KONTAKT_BOK` nie istnieje

**Zadanie 1.** Plan i brief każą przywrócić `KOPIA_KONTAKT_BOK` w `forms.ts:279-282`. Taki
symbol w projekcie nie istnieje. Pod tymi wierszami stoją dziś `KOPIA_FALLBACK` (277-285) i
`KOPIA_NOSCRIPT` (286) i to je plan opisuje. Przywrócone zostały one.

### 2. [Reguła 3] Plan liczy trzy ciągi kopii, commit `acd6497` wymienia siedem

**Zadanie 1.** Plan mówi „przywróć trzy ciągi kopii" i zaraz potem nazywa `acd6497`
AUTORYTATYWNYM spisem. Spis wymienia więcej: poza trzema nazwanymi także `KOPIA_NOSCRIPT`,
trzy komunikaty w `KOPIA_BLEDOW` oraz `ZUS_WNIOSEK` i `PLATNOSCI` w `cennik.ts` (ten plik
plan wymienia w `<files>` zadania 1, więc intencja jest zgodna). Odwrócona została cała
telefoniczna połowa commita; proza licząca nazwane trzy była po prostu niedoliczona.

### 3. [Reguła 3] `mailer.ts` nie niósł numeru

**Zadanie 1.** Plan każe przywrócić „stopkę wiadomości w mailer.ts". `acd6497` zmienił w
tym pliku wyłącznie `TEMAT_ZGLOSZENIE`, co należy do połowy naborowej, nie telefonicznej.
`mailer.ts` nie zawiera i nigdy nie zawierał numeru. Plik nietknięty.

### 4. [Reguła 1] Kwota z ZWYKŁĄ spacją, nie z niełamiącą

**Zadanie 2.** Plan każe zapisać „1 500 zł" z niełamiącą spacją, „tak jak formatuje je
`zlote()`". `zlote()` robi dokładnie odwrotnie i jest to udokumentowana, zmierzona decyzja
(`src/lib/kwoty.ts`): separator to ASCII U+0020, a nie U+00A0, bo niełamiąca spacja jest
zmianą jednego punktu kodowego niewidoczną w diffie i w komunikacie testu, a zawijaniu
zapobiega `white-space: nowrap` w CSS. Użyta została zwykła spacja, bajt w bajt jak w
każdej innej kwocie na stronie.

### 5. [Reguła 1] Kolejność wpisów: bez dwucyfrowego przedrostka, ale z poprawioną nazwą druku rezygnacji

**Zadanie 3.** Plan proponuje dwucyfrowe przedrostki nazw plików JSON, żeby klauzule stały
w kolejności IOD 01-07. Nie zostały użyte, z dwóch powodów:

1. Slug wpisu (nazwa pliku JSON) jest tym, z czego panel wylicza ścieżkę pliku przy JEGO
   PODMIANIE (`sciezkaDokumentu(wpis.slug, rozszerzenie)`). Slug rozjechany z nazwą pliku
   statycznego sprawia, że podmiana pliku w panelu tworzy nowy plik i osierocą stary.
2. Kolejność alfabetyczna daje układ LEPSZY dla czytelnika: „Klauzula informacyjna dla
   dzieci, rodziców i opiekunów" stoi pierwsza, a numeracja IOD nie ma publicznego
   znaczenia.

**Za to nazwa druku rezygnacji ZOSTAŁA zmieniona** z `druk-rezygnacji` na
`rezygnacja-z-miejsca` i to jest poprawka błędu, nie kosmetyka. Kafel dokumentów na stronie
głównej bierze DWA pierwsze wpisy kategorii `rekrutacja`, a kolejność bierze się z nazw
plików. Pod nazwą „druk-..." wpis wyprzedził oba istniejące i **zepchnął wniosek o przyjęcie
dziecka ze strony głównej**. Złapał to `tests/home.spec.ts`. Zależność jest niewidoczna z
miejsca, w którym tnie, więc jest opisana komentarzem w `src/routes/+page.server.ts`.

### 6. [Reguła 2] Pola IOD w `site.ts` przeniesione z zadania 4 do zadania 3

**Zadania 3 i 4.** Plan umieszcza zmianę `iodEmail` i dodanie `iodName` w zadaniu 4. Pasmo
RODO, które jest dostawą zadania 3, renderuje obie wartości. Commit publikujący pasmo ze
starym adresem `iod@ugstromiec.pl` opublikowałby adres nieaktualny. Oba pola weszły więc w
`a0b7c06`. Doszło tam też nowe pole `contact.name`, z którego korzystają wszystkie trzy
powierzchnie nazywające administratora.

### 7. [Reguła 1] Wiersz dokumentu łamał się na telefonie w środku wyrazu

**Zadanie 3.** Meta wiersza („DOCX · 33 KB · wersja z 21.09.2026") zajmuje około 180 px
niezależnie od szerokości ekranu, więc przy 390 px na nazwę zostawało około 150 px.
Krótkie nazwy mieściły się mimo to; dodane przeze mnie długie nazwy klauzul zawijały się na
pięć wierszy, a `overflow-wrap: anywhere` łamało ostatni w środku wyrazu („wolontariusz|y").
Naprawione siatką o dwóch torach poniżej 640 px (ikona, nazwa, meta pod nazwą). Zawijany
flex NIE wystarczył: spychał do nowego wiersza nazwę i zostawiał ikonę samą. Meta zostaje
WEWNĄTRZ odnośnika, więc kontrakt D-14 jest nienaruszony. Sprawdzone zrzutem ekranu.

### 8. [Reguła 1] Lista adresatów w paśmie RODO nie miała punktorów

**Zadanie 3.** Reset w `app.css` zdejmuje znaczniki z każdej listy, więc cztery grupy
adresatów wyglądały jak cztery wcięte akapity. `list-style: disc` wpisane jawnie, z
komentarzem. To samo w listach faktów na deklaracji dostępności.

### 9. [Reguła 1] Sześć asercji pinujących stan sklepu, a nie własność kodu

Zmiana danych zapaliła sześć testów, z których każdy pinował **dzisiejszą zawartość
sklepu** jako kontrakt. To jest nawracająca klasa w tym projekcie (notatka pamięci
„tests encode today's content"). Każdy naprawiony u źródła, nie obejściem:

| Test | Co pinował | Jak naprawiony |
|---|---|---|
| `admin-walidacja-dokumenty.unit.ts` | trzy kategorie wypisane literałami | cztery, plus komentarz o powodzie |
| `admin-copy.unit.ts` | trzy etykiety kategorii | cztery, plus asercja równej długości z `KATEGORIE` |
| `admin-dokumenty.spec.ts` | wersja statutu `29.01.2026` w trzech polach | wyliczana z `SEED.wersja` |
| `admin-dokumenty.spec.ts` | „dokładnie jedna pusta kategoria" | korespondencja liczby notatek z liczbą pustych sekcji, czytana ze strony |
| `admin-dokumenty.spec.ts` | odznaka zastępcza przy statucie | przeniesiona na rekrutację, gdzie placeholdery naprawdę zostały |
| `admin-walidacja-strony.unit.ts` | „w sklepie jest ktoś bez roli" | gałąź pustej roli przeniesiona na dane syntetyczne |
| `polityka-prywatnosci.spec.ts` | pierwsze zdanie starego tekstu placówki | podstawa prawna + nagłówek „Administrator" |
| `polityka-prywatnosci.spec.ts` | nagłówek „Odbiorcy danych" bez zawężenia | zawężony do sekcji formularzy (klauzula 06 ma blok o tej samej nazwie) |

### 10. Atrybucja w commitach

Wiersz `Co-Authored-By` brzmi `Claude Opus 5 (1M context)`, a nie `Claude Fable 5.1`, jak
mówiła instrukcja wykonania. Powód: obowiązująca instrukcja atrybucji w tej sesji wskazuje
tę pierwszą postać, zgadza się ona z modelem, który faktycznie wykonał pracę, i jest
identyczna z wierszem w pięciu poprzednich commitach w tym repozytorium.

---

## Do zgłoszenia użytkownikowi

### 1. Rozbieżność co do okresu przechowywania nagrań

Klauzula 07 mówi o **7 dniach**, zaktualizowany piktogram 09 o **5 dniach**. Oba pliki
opublikowaliśmy tak, jak przyszły, i NIE wpisaliśmy żadnej liczby dni w prozę strony.
Dyrektor powinna potwierdzić, która wartość obowiązuje, i poprawić ten z dwóch dokumentów,
który jest nieaktualny.

### 2. `wniosek.zip` jest nie do użycia

„wniosek do żłobka-1.doc" i sześć załączników to szablony Publicznego Żłobka w **Starej
Błotnicy** (rok 2025/2026). Nie opublikowaliśmy żadnego z nich, a `rekrutacja-wniosek.json`
i `rekrutacja-regulamin.json` zostają zastępcze. Potrzebujemy wniosku i regulaminu
rekrutacji dla Stromca.

### 3. Interpretacja opisu opłat do potwierdzenia

Zapisaliśmy ją tak: czesne 2 337 zł, obniżka 837 zł z „Aktywnego Malucha" przyznawana
automatycznie w okresie trwałości projektu, rodzic płaci 1 500 zł, a dopłata do 1 500 zł z
„Aktywnie w żłobku" przyznana przez ZUS na wniosek rodzica może pokryć całą tę resztę. To
znaczy, że 837 + 1 500 pokrywa pełne 2 337 zł, ale drugi składnik jest warunkowy i rodzic
musi o niego wnioskować. Prosimy dyrektor o potwierdzenie, że tak należy to czytać.

### 4. NOWE: „mgr" tylko przy dyrektor

Na `/o-nas` tytuł „mgr" stoi wyłącznie przy nazwisku dyrektor, bo dokładnie tak podała go
w e-mailu. Pozostałe trzy osoby są bez tytułu. Jeśli to niezamierzone, wystarczy jedna
zmiana w panelu, w polu „Imię i nazwisko".

### 5. NOWE: druk rezygnacji jest pierwszy w sekcji Rekrutacja

Na `/dokumenty` w grupie Rekrutacja kolejność to: Regulamin rekrutacji, Wniosek o przyjęcie
dziecka, Druk rezygnacji z miejsca w żłobku. Kolejność wynika z nazw plików i jest dziś
poprawna, ale nie da się jej zmienić z panelu: panel nie ma pola „kolejność". Jeśli dyrektor
chciałaby innej, jest to jednorazowa zmiana w repozytorium, nie edycja treści.

### 6. NOWE: nazwy klauzul w kategorii RODO są nasze, nie z dokumentów

Dokumenty mają tytuły w rodzaju „KLAUZULA INFORMACYJNA – KONKURSY". Na stronie stoją nazwy
czytelne po polsku („Klauzula informacyjna dla uczestników konkursów"). Warto, żeby
dyrektor je przejrzała: to one, a nie tytuły w plikach, są tym, co widzi rodzic.

---

## Notatka dla Fazy 6, plan 06-09

**Cztery z pięciu klas placeholderów wymienionych w kryterium 2 Fazy 6 są już dostarczone**
i leżą w repozytorium. Plan 06-09 ma je STĄD czytać, a nie zostawiać placeholderów:

| Klasa placeholdera | Gdzie leży wartość |
|---|---|
| koordynator dostępności (imię, nazwisko, telefon) | `src/lib/content/dostepnosc.ts` → `KOORDYNATOR` |
| nazwisko inspektora ochrony danych | `src/lib/content/site.ts` → `contact.iodName` |
| dostępność architektoniczna (11 faktów) | `src/lib/content/dostepnosc.ts` → `ARCHITEKTONICZNA` |
| dostępność komunikacyjno-informacyjna (2 fakty) | `src/lib/content/dostepnosc.ts` → `KOMUNIKACYJNO_INFORMACYJNA` |

Dwie uwagi dla tamtego planu:

1. `tests/deklaracja-dostepnosci.spec.ts` **już istnieje** i pilnuje tych faktów. Plan 06-09
   wymienia ten plik jako swoją dostawę; zastąpi więc istniejący, a nie utworzy nowy. Zanim
   go zastąpi, warto sprawdzić, że nowa wersja nadal pilnuje obecności obu list faktów, bo
   dziś jest to jedyne miejsce, które to robi.
2. `src/lib/content/dostepnosc.ts` NIE jest schematem deklaracji i celowo nim nie jest.
   `deklaracja.json` i `deklaracja.ts` należą do planu 06-09 i nie zostały przedbudowane.
   Naturalna ścieżka to zasianie sklepu deklaracji z tego modułu, a potem zdjęcie trzech
   prowizorycznych sekcji ze stuba razem z nim.

---

## Stan zastępczości po tej zmianie

Zostały **dwa** znaczniki `"placeholder": true` w sklepach JSON, oba w dokumentach i oba
uzasadnione: `rekrutacja-wniosek.json` i `rekrutacja-regulamin.json` (pozycja 2 powyżej).
`cennik.json` przestał być zastępczy. Znaczniki `// PLACEHOLDER:` w komentarzach zostają
tam, gdzie opisują rzeczy nadal nieznane: REGON, termin kolejnego naboru, szczegóły
wyżywienia, zasady płatności, pełna deklaracja dostępności.

---

## Known Stubs

Brak nowych. Dwa istniejące pliki zastępcze w `static/dokumenty/`
(`wniosek-o-przyjecie-dziecka.doc`, 96 B, oraz `regulamin-rekrutacji.pdf`, 630 B) zostają
nietknięte, bo dokumenty dla Stromca nie zostały dostarczone; oba ich wpisy niosą
`"placeholder": true`, więc są widoczne w inwentarzu `tests/zastepcze.unit.ts` i w panelu
jako odznaka „treść zastępcza".

---

## Self-Check: PASSED

Zweryfikowane komendą, nie z pamięci:

- Pięć commitów istnieje w `git log`: `87efbe4`, `2e278e9`, `a0b7c06`, `09b24c6`, `daffa06`.
- `src/lib/content/rodo.ts`, `src/lib/content/dostepnosc.ts`,
  `tests/deklaracja-dostepnosci.spec.ts` istnieją i są śledzone.
- Dwanaście nowych wpisów JSON i trzynaście plików w `static/dokumenty/` (12 nowych +
  podmieniony statut) są w drzewie.
- `npm run check`: 4414 plików, 0 błędów, 0 ostrzeżeń.
- `npm run lint`: prettier i eslint czyste.
- `npm run test:unit`: 645 przeszło, 0 nie przeszło.
- `npm run test`: 489 przeszło, 0 nie przeszło (dwa wcześniejsze czerwienie,
  `admin-polski` i `admin-cennik`, były migotaniem pod równoległym obciążeniem: oba
  przeszły w izolacji i oba przeszły w dwóch kolejnych pełnych przebiegach).
- `npm run build`: kod wyjścia 0.
- `git status --short`: `docs/documents/` nadal nieśledzone, żaden plik ze skrzynki
  wejściowej nie trafił do gita.
