---
quick_id: 260824-qqa
slug: aktualizacja-po-mailu-kamili-data-otwarc
date: 2026-08-24
status: in-progress
---

# Aktualizacja po mailu Kamili z 24 sierpnia 2026

Cztery rzeczy z jednej wiadomości: NIP, sprostowanie daty otwarcia, wpis
o spotkaniu z rodzicami i siedem fotografii z 19 sierpnia. Plus odpowiedź
na pytanie „czy stronę można już odszukać w przeglądarce".

## Źródło

Wiadomość od Kamili (dyrektor żłobka), 24 sierpnia 2026:

> Witam, strona bardzo mi się podoba. Jest bardzo przyjemna w odbiorze.
> Mogę dodać NIP 7981489629,
> Czy może Pan umieści informację o spotkaniu organizacyjnym z rodzicami
> w najbliższy czwartek o godzinie 17:00? Co do inspektora Danych osobowych
> to może już jutro będę mogła udzielić takich informacji. Jeden błąd się
> wkradł, uroczyste otwarcie żłobka było 19 sierpnia. Czy stronę już można
> odszukać w przeglądarce? Bo nie mogę jej znaleźć.

Siedem fotografii z dnia otwarcia dostarczonych osobno (katalog `pictures/`).

## Co jest do zrobienia

| # | Rzecz | Skąd wiadomo |
| - | ----- | ------------ |
| 1 | NIP `7981489629` na stronie | wprost z maila |
| 2 | Data otwarcia: 19, nie 14 sierpnia | wprost z maila |
| 3 | Wpis o spotkaniu z rodzicami, czwartek 27 sierpnia, 17:00 | wprost z maila |
| 4 | Siedem zdjęć z otwarcia opublikowanych | załączniki |
| 5 | Odpowiedź w sprawie indeksowania w wyszukiwarce | wprost z maila |

Poza zakresem, bo czeka na Gminę: **inspektor ochrony danych** („może jutro
będę mogła udzielić"). To jedno z dwóch nazwisk, na które czeka LEGAL-02
i cała faza 7. Pytanie ponowione w odpowiedzi.

## Decyzje

**D-1. Spotkanie z rodzicami to WPIS w aktualnościach, nie baner.**
Rozważany był baner na każdej stronie (`openingBanner` w `site.ts` stoi
zabankowany na `false` od fazy 1). Odrzucony z trzech powodów. Wpis jest
mechanizmem, który już istnieje i który **Kamila sama edytuje i kasuje
z panelu** — baner byłby kodem, więc każda zmiana terminu to pull request.
Baner trzeba ZDJĄĆ ręcznie po czwartku, a nieusunięty zostaje na każdej
podstronie jako nieaktualna treść; wpis po prostu schodzi w dół listy.
I wreszcie strona główna i tak wyciąga najnowsze wpisy, więc zasięg jest
ten sam przy zerowym nowym kodzie.

**D-2. Wpis o otwarciu zmienia nazwę pliku na `2026-08-19-uroczyste-otwarcie-zlobka.json`.**
Slug to nazwa pliku, a nazwa pliku to URL (`src/lib/server/aktualnosci.ts`
wywodzi go z dysku, nigdy z pól). Strona jest `noindex` i nie jest jeszcze
ogłoszona, więc zmiana adresu nie zostawia długu w postaci przekierowań.
Przy okazji znika rozjazd między nazwą pliku a prawdziwą datą wydarzenia.

**D-3. Wpis o otwarciu przechodzi z czasu przyszłego w przeszły.**
To nie jest sama korekta cyfry. Dziś, 24 sierpnia, wpis zapowiada wydarzenie
sprzed pięciu dni („odbędzie się", „zapraszamy"). Poprawienie wyłącznie daty
zostawiłoby zaproszenie na termin, który minął. Wpis jest przepisany jako
relacja.

**D-4. Okładką jest fotografia wstęgi, galerią pozostałe sześć.**
Zdjęcie `48.jpg` (biało-czerwona wstęga, balony, tabliczka „ŻŁOBEK w Stromcu,
ul. Radomska 72") nie niesie żadnej rozpoznawalnej osoby i czyta się
natychmiast jako otwarcie. Pozostałe sześć trafia do galerii wpisu.

**D-5. Galeria wpisu jest w panelu TYLKO DO ODCZYTU, ale jest przy zapisie ZACHOWYWANA.**
To jest sedno tego zadania i pułapka, na którą repozytorium ma już nazwę
(zadanie 260818-i5t, D-4/D-5). `walidacja/aktualnosci.ts` odbudowuje zapisany
JSON **klucz po kluczu** z lokalnych zmiennych i nigdy nie rozprasza
przesłanego obiektu. Nieznany klucz nie jest odrzucany ani zgłaszany, tylko
po cichu kasowany przy pierwszym zapisie redaktora. Gdyby dopisać `zdjecia`
do JSON-a bez tknięcia walidatora, galeria zniknęłaby w chwili, w której
Kamila poprawi w tym wpisie choćby literówkę w tytule — bez błędu i bez
ostrzeżenia.

Dlatego zakres obejmuje przeniesienie `zdjecia` przez zapis. Trasa edycji ma
pod ręką istniejący wpis (`readAktualnosci().find(...)`), więc tablica jest
przenoszona PO STRONIE SERWERA, a nie odsyłana przez ukryte pole formularza:
galeria i tak nie jest edytowalna, więc round-trip przez klienta byłby tylko
dodatkową powierzchnią ataku.

Pełna edycja galerii wpisu z panelu (dodawanie, kasowanie, kolejność) zostaje
**świadomie poza zakresem** — to prefiks i pola w `pola-wpisu.ts`, gałąź
w walidatorze, kontrolki na ekranie wpisu, polskie etykiety w `panel.ts`
i cztery zestawy testów. Zadanie do fazy 6 lub 7, zapisane w podsumowaniu.

**D-6. Zdjęcia są zmniejszane przed commitem.**
`48.jpg` waży 5,5 MB przy 4096 px. enhanced-img generuje pochodne przy
kompilacji, ale ŹRÓDŁO zostaje w gicie na zawsze i to ono jest klonowane.
Wszystkie schodzą do maks. 2048 px.

**D-7. NIP ląduje w `contact` w `site.ts` i renderuje się na `/kontakt`.**
Jedno źródło, ten sam obiekt, który już trzyma adres, e-mail i godziny, więc
żadna powierzchnia nie może się rozjechać.

**D-8. Zgoda na wizerunek: publikujemy wszystkie siedem, pytanie idzie mailem.**
Zgłoszone użytkownikowi: `2244.jpg` pokazuje dziecko na rękach jako temat
zdjęcia, `2249.jpg` ma dziecko w tle. CLAUDE.md wymaga udokumentowanej zgody
na wizerunek przed startem. **Użytkownik zdecydował o publikacji całej
siódemki.** Decyzja przyjęta i wykonana; prośba o pisemne potwierdzenie zgody
rodziców trafia do odpowiedzi do Kamili, a pozycja zostaje odnotowana
w podsumowaniu jako niesiona do fazy 7.

**D-9. Indeksowanie: bez zmian w kodzie, decyzja wraca do Kamili.**
Strona zostaje `noindex` + `robots`-disallow. Odpowiedź tłumaczy dlaczego
(brak deklaracji dostępności i danych IOD to braki, za które organ publiczny
odpowiada z ustawy, a wyszukiwarka zapamiętuje pierwszą wersję, którą zobaczy)
i wprost oferuje natychmiastowe odsłonięcie, jeśli Kamila tak zdecyduje.

## Zadania

1. Siedem fotografii zmniejszonych i wstawionych do `src/lib/assets/uploads/`
2. Czytnik: `zdjecia` w `PostEntry` + walidacja klucz po kluczu
3. `/aktualnosci/[slug]`: galeria zdjęć wpisu na istniejącym `Lightbox`
4. Panel: `zdjecia` przenoszone przez zapis (`WpisDane` + trasa edycji)
5. Wpis o otwarciu: nowa nazwa, relacja, okładka, galeria, `placeholder: false`
6. Nowy wpis: spotkanie organizacyjne, czwartek 27 sierpnia 2026, 17:00
7. NIP na `/kontakt`
8. Odpowiedź do Kamili (`ODPOWIEDZ.md`)

## Bramki

`npm run check` · `npm run lint` · `npm run test:unit` · `npm run test`

Uwaga środowiskowa: `playwright.config.ts` ma lokalnie `reuseExistingServer:
true`, więc żywy wrangler na :4173 potrafi podać starą kompilację i dać
fałszywe czerwone. `lsof -ti :4173 | xargs kill -9` przed pełnym przebiegiem.
