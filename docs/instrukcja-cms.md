# Instrukcja obsługi systemu redakcyjnego (CMS)

Żłobek Gminny w Stromcu, panel redakcyjny pod adresem `/admin`

Ten dokument jest przeznaczony do wydruku. Prowadzi krok po kroku przez logowanie,
edycję treści strony O nas, edycję planu dnia oraz dodawanie, zamianę i usuwanie
dokumentów. Na końcu znajduje się lista kontrolna weryfikacji.

Uwaga o języku: wszystkie etykiety pól i podpowiedzi w panelu są po polsku.
Same przyciski i menu edytora (paski narzędzi programu Sveltia) są po angielsku,
ponieważ program nie ma jeszcze polskiej wersji interfejsu. Poniżej podajemy
tłumaczenia najważniejszych przycisków. Zobacz sekcję "Przyciski edytora po angielsku".

---

## 1. Logowanie

1. Otwórz w przeglądarce adres strony i dopisz na końcu `/admin`, na przykład
   `https://zlobek-gminny-stromiec.pages.dev/admin`.
2. Kliknij przycisk logowania. Otworzy się okienko serwisu GitHub.
3. Zaloguj się swoim kontem GitHub (każda osoba redagująca ma własne konto,
   dzięki czemu widać, kto wprowadził daną zmianę).
4. Zezwól aplikacji na dostęp. Po chwili wróci widok panelu z listą sekcji:
   O nas, Plan dnia oraz Dokumenty.

Jeśli logowanie się nie powiedzie, zamknij okienko i spróbuj ponownie. Gdy problem
się powtarza, zgłoś to osobie technicznej (konto musi mieć dostęp do repozytorium).

<!-- PLACEHOLDER: screenshot - ekran logowania i okno GitHub (do wykonania w Zadaniu 3) -->

---

## 2. Edycja strony O nas

W panelu wybierz sekcję "O nas". Możesz edytować następujące pola:

- Wprowadzenie: krótki tekst na górze strony.
- Misja: opis misji żłobka. Dozwolone jest pogrubienie i wstawianie odnośników.
- Wartości: lista wartości. Każda pozycja ma tytuł i krótki opis. Nowy wiersz
  dodajesz przyciskiem dodawania na dole listy.
- Kadra: opis: ciepły opis zespołu (kwalifikacje, podejście). Bez nazwisk.
- Liczba opiekunek oraz Personel pomocniczy (liczba): wpisz liczby.
- O budynku: opis budynku, sali i placu zabaw.
- Zdjęcia (budynek, sala, plac zabaw): dodaj zdjęcia obiektu. Do każdego zdjęcia
  wpisz krótki opis alternatywny (alt) dla osób korzystających z czytników ekranu.

Ważne: zdjęcia nie mogą przedstawiać osób (dzieci ani personelu). Publikujemy
wyłącznie zdjęcia budynku, sal i placu zabaw, bez wizerunku osób.

Po zakończeniu edycji zapisz zmiany (przycisk "Save", po polsku Zapisz).

<!-- PLACEHOLDER: screenshot - formularz O nas z polskimi etykietami -->

---

## 3. Plan dnia

W sekcji "Plan dnia" edytujesz wspólny plan dnia (te same dane pokazują się na
stronie O nas). Każdy wiersz ma dwie kolumny:

- Godziny: na przykład `8:00 - 9:00`.
- Opis: co dzieje się w tym czasie.

Aby dodać nowy punkt, użyj przycisku dodawania wiersza. Aby zmienić kolejność,
przeciągnij wiersz. Po zakończeniu zapisz zmiany.

<!-- PLACEHOLDER: screenshot - lista wierszy planu dnia -->

---

## 4. Dokumenty

Sekcja "Dokumenty" to lista plików do pobrania (regulaminy, statut, karty zapisu,
klauzule RODO). Każdy dokument to osobny wpis.

### Dodawanie nowego dokumentu

1. W sekcji "Dokumenty" kliknij przycisk tworzenia nowego wpisu (New / Nowy).
2. Wypełnij pola:
   - Nazwa dokumentu: czytelna nazwa po polsku (nie nazwa pliku).
   - Kategoria: wybierz z listy (Rekrutacja, Statut i uchwały, RODO). Lista jest
     stała, nie da się wpisać własnej kategorii.
   - Plik: prześlij plik PDF, DOC lub DOCX.
   - Wersja z dnia: wybierz datę wersji dokumentu (format DD.MM.RRRR).
   - Źródło (BIP), opcjonalnie: odnośnik do dokumentu w BIP, jeśli istnieje.
3. Zapisz wpis.

### Zamiana pliku w istniejącym dokumencie

1. Otwórz wpis dokumentu z listy.
2. W polu Plik usuń dotychczasowy plik i prześlij nowy.
3. Zaktualizuj pole "Wersja z dnia", aby odzwierciedlało datę nowej wersji.
4. Zapisz wpis.

### Usuwanie dokumentu

1. Otwórz wpis dokumentu z listy.
2. Użyj funkcji usuwania wpisu edytora (przycisk "Delete", po polsku Usuń).
3. Potwierdź w oknie, które pokaże program. Dokument zniknie ze strony po
   opublikowaniu (zobacz sekcję o opóźnieniu publikacji).

<!-- PLACEHOLDER: screenshot - lista dokumentów oraz formularz dokumentu -->

---

## 5. Treść zastępcza (do potwierdzenia)

Każda sekcja ma pole "Treść zastępcza (do potwierdzenia)" w postaci przełącznika.
Gdy jest zaznaczone, oznacza to, że treść jest tymczasowa i czeka na potwierdzenie.

- Zostaw zaznaczone, dopóki treść nie została ostatecznie potwierdzona.
- Odznacz je dopiero wtedy, gdy treść jest gotowa do publikacji jako ostateczna.

---

## 6. Publikowanie i opóźnienie

Po zapisaniu zmiany trafiają automatycznie na stronę internetową. Publikacja nie
jest natychmiastowa: strona przebudowuje się w tle. Zwykle trwa to około 2 minut.

Kolejność jest zawsze taka sama: zapisz, poczekaj ok. 2 min, odśwież stronę.
Dopiero po odświeżeniu zobaczysz zmianę na żywo. Jeśli zmiana nie pojawia się po
kilku minutach, odśwież stronę jeszcze raz (przytrzymaj klawisz i odśwież, aby
pominąć pamięć podręczną przeglądarki).

---

## 7. Przyciski edytora po angielsku

Interfejs edytora (paski narzędzi programu Sveltia) jest po angielsku, natomiast
wszystkie etykiety pól i podpowiedzi są po polsku. Najważniejsze przyciski:

| Przycisk (po angielsku) | Znaczenie (po polsku) |
| ----------------------- | --------------------- |
| Save                    | Zapisz                |
| Publish                 | Opublikuj             |
| Delete                  | Usuń                  |

To jest znane i zaakceptowane ograniczenie (CMS-03, "w zakresie, w jakim jest to
wspierane"): pola są po polsku, sam szkielet edytora pozostaje po angielsku,
ponieważ program nie oferuje jeszcze polskiej wersji interfejsu.

<!-- PLACEHOLDER: screenshot - przyciski Save, Publish, Delete z opisami po polsku -->

---

## 8. Weryfikacja (lista kontrolna, wykonywana na żywo)

Ta lista służy do jednorazowej weryfikacji pełnego obiegu na działającej stronie
(nie lokalnie). Przejdź kolejno przez wszystkie kroki i wykonaj zrzuty ekranu,
które wklejasz w miejsca oznaczone powyżej jako "PLACEHOLDER: screenshot".

1. Otwórz `/admin` na działającej stronie i zaloguj się kontem GitHub będącym
   członkiem organizacji `zlobekstromiec`. Potwierdź, że okno logowania GitHub
   kończy się powodzeniem i wczytuje się edytor (CMS-01).
2. Potwierdź, że etykiety sekcji i pól oraz podpowiedzi są po polsku (CMS-03).
   Wykonaj zrzut ekranu angielskich przycisków (Save, Publish, Delete) do
   instrukcji.
3. Zmień tekst misji w sekcji O nas, zapisz i opublikuj. Potwierdź, że powstał
   zapis (commit) w repozytorium `zlobekstromiec/zlobek-gminny-stromiec` na
   gałęzi `main` (CMS-02).
4. Poczekaj ok. 2 min na przebudowę strony w Cloudflare, odśwież stronę `/o-nas`
   na żywo i potwierdź, że zmiana jest widoczna publicznie (CMS-02, na żywo, nie
   lokalnie).
5. Dodaj lub zamień dokument w sekcji Dokumenty i potwierdź, że pojawia się on na
   żywo na stronie `/dokumenty` po przebudowie (DOCS-02).
6. Wklej polskie zrzuty ekranu z opisami w miejsca oznaczone w tej instrukcji
   (zastępując znaczniki "PLACEHOLDER: screenshot").
7. Ponownie sprawdź listę dostępnych języków interfejsu edytora w używanej,
   przypiętej wersji programu i zanotuj, czy pojawiła się polska wersja
   interfejsu.
8. Potwierdź akceptację ograniczenia CMS-03 (angielski szkielet edytora
   zaakceptowany "w zakresie, w jakim jest to wspierane") oraz przyjęcie do
   wiadomości uwagi o zależnościach: pakiety zostały zainstalowane w przypiętych
   wersjach.

Uwaga techniczna: warunki możliwe do sprawdzenia automatycznie (strona `/admin`
serwowana na żywo, `base_url` w pliku konfiguracji wskazuje na działający Worker,
reguła `/admin/*` w nagłówkach wskazuje pochodzenie Workera, brak sekretu w
repozytorium) są sprawdzane osobno. Powyższa lista obejmuje kroki, których nie da
się zautomatyzować (logowanie OAuth).
