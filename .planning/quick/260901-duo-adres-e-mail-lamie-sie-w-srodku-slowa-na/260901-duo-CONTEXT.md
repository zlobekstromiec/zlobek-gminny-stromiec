# 260901-duo — CONTEXT (decyzje zablokowane przed planowaniem)

Data: 2026-09-01. Zgloszenie uzytkownika: „i dont like how the email is dropping down by some
letters fix that, also check all the places we had the email before I believe it was also in
the top right banner and an option to email in on the homepage".

Bezposrednia przyczyna jest znana: quick 260827-bfa zamienil `zlobek@ugstromiec.pl` (20 znakow)
na `publicznyzlobek@ugstromiec.pl` (29 znakow). Adres urosl o 9 znakow i przestal miescic sie
w kolumnie, ktora byla pod niego zwymiarowana.

## Dowody zmierzone na ZYWEJ stronie (Chrome DevTools, 2026-09-01)

Pomiar przez `Range.getClientRects()` na wezle tekstowym adresu: liczba prostokatow > 1
oznacza zlamanie wiersza.

| Powierzchnia | Viewport | Szerokosc kontenera | Potrzeba | Wynik |
|---|---|---|---|---|
| Strona glowna, `a.item-link` w `ContactAndMap` | 1024 | **164 px** | 227 px | **LAMIE, 2 wiersze** |
| Strona glowna, `a.item-link` w `ContactAndMap` | 1440 | **198 px** | 227 px | **LAMIE, 2 wiersze** |
| Strona glowna, `a.item-link` | 500 | 227 px | 227 px | miesci sie, z zapasem 0 px |
| `/kontakt`, `a.item-link` oraz drugi odnosnik | 500 | 213-227 px | 227 px | miesci sie |
| Stopka, `p.org` | 500-1440 | 252-453 px | 199 px | miesci sie |

Uwaga do wiersza „500 px": zapas wynosi ZERO. To nie jest stan zdrowy, tylko przypadek.

**Mechanizm zlamania.** Na `a.item-link` obowiazuje `overflow-wrap: anywhere`. Ta wartosc
pozwala przegladarce zlamac wiersz w DOWOLNYM miejscu, takze w srodku domeny, wiec na stronie
glownej adres renderuje sie jako `publicznyzlobek@ugstromi` / `ec.pl`. Osierocone „ec.pl"
w drugim wierszu jest dokladnie tym, co uzytkownik nazwal „dropping down by some letters".

## D-1 (LOCKED) — lamanie wylacznie na granicy sensownej, nigdy w srodku slowa

Adres e-mail lamie sie TYLKO przy malpie, czyli `publicznyzlobek@` w pierwszym wierszu
i `ugstromiec.pl` w drugim. Nigdy w srodku czesci lokalnej ani w srodku domeny.

Mechanizm: znacznik `<wbr>` bezposrednio PO malpie, czyli jawnie wskazana dozwolona
szansa na lamanie, zamiast `overflow-wrap: anywhere`, ktore zezwala na kazda pozycje.
`<wbr>` nie wstawia zadnego znaku do tekstu: kopiowanie adresu i `mailto:` pozostaja nietkniete,
co jest tu warunkiem koniecznym, bo rodzic ten adres KOPIUJE.

ZAKAZANE rozwiazania i powody: dzielenie adresu na dwa wezly tekstowe z `<br>` (lamie sie
zawsze, takze gdy jest miejsce); `&shy;` (wstawia dywiz, ktory rodzic skopiuje razem z adresem);
zmniejszenie stopnia pisma (adres publiczny podmiotu publicznego nie moze byc drobniejszy niz
otaczajaca go tresc); `white-space: nowrap` bez niczego wiecej (adres wyjdzie poza kontener
i na waskim ekranie spowoduje poziome przewijanie strony, ktore jest naruszeniem WCAG 1.4.10).

`overflow-wrap: anywhere` ZOSTAJE jako ostatnia deska ratunku dla ekranow, na ktorych nawet
`ugstromiec.pl` sie nie miesci, ale po wstawieniu `<wbr>` przegladarka wybierze granice przy
malpie, bo lamanie w dozwolonym punkcie ma pierwszenstwo przed lamaniem awaryjnym.

## D-2 (LOCKED) — jedno zrodlo renderowania adresu, nie szesc kopii

Adres jest dzis renderowany na SZESCIU powierzchniach i kazda robi to wlasnym kawalkiem
znacznikow:

- `src/lib/components/ContactAndMap.svelte:43` (strona glowna, TA lamie)
- `src/routes/kontakt/+page.svelte:85`
- `src/lib/components/Footer.svelte:32` (tekst zwykly, bez odnosnika, celowo)
- `src/lib/components/KontaktForm.svelte:275`
- `src/lib/components/ZgloszenieForm.svelte:339`
- `src/lib/components/FallbackPanel.svelte:21`

Powstaje jeden wspolny komponent renderujacy adres z `<wbr>` po malpie, uzywany wszedzie tam,
gdzie adres jest ODNOSNIKIEM, oraz wariant dla stopki, gdzie adres jest celowo zwyklym tekstem
(patrz komentarz w `Footer.svelte`: linkowane wersje zyja w `ContactAndMap` i na `/kontakt`,
a „the homepage's single-mailto rule depends on it"). **Ta zasada jednego `mailto:` na stronie
glownej MUSI przetrwac zmiane** i planista ma ja zweryfikowac w kodzie, a nie zalozyc.

Ciagi w `src/lib/content/forms.ts` (komunikaty bledow, `KOPIA_NOSCRIPT`, klauzula) NIE sa
objete: adres wystepuje tam w srodku zdania prozy, wiec lamie sie na spacjach jak kazde inne
slowo i nie tworzy sieroty. Nie wstawiac tam znacznikow, bo to zwykle stringi, nie znaczniki.

## D-3 (LOCKED) — kolumna kontaktu na stronie glownej dostaje wiecej miejsca

Samo `<wbr>` naprawia estetyke lamania, ale nie zmienia faktu, ze kolumna o szerokosci 164 px
przy 1024 px viewportu jest za waska na adres publiczny placowki. Planista ma zbadac siatke
w `ContactAndMap.svelte` i poszerzyc kolumne pozycji kontaktowych na tyle, by adres miescil sie
w JEDNYM wierszu przy 1440 px, o ile nie wymaga to przebudowy ukladu z mapa. Jesli wymaga,
zostaje samo `<wbr>` i decyzja jest odnotowana w SUMMARY z pomiarem.

## D-4 (LOCKED) — audyt: co uzytkownik pamieta, a czego nie ma

Uzytkownik prosil o sprawdzenie „all the places we had the email before" i wymienil dwa
miejsca. Wynik audytu kodu i zywej strony:

1. **„top right banner" — adresu tam NIGDY NIE BYLO.** `src/lib/components/TopBar.svelte`
   importuje `contact`, ale renderuje wylacznie `contact.hours` („Czynne: ..."). Pasek uzywa
   `justify-content: space-between` przy JEDNYM dziecku, wiec prawa polowa jest pusta i pasek
   wyglada, jakby czegos w nim brakowalo. **NIE dodawac tam adresu w tym zadaniu.** To nowa
   funkcja, nie naprawa; idzie do raportu jako pytanie do uzytkownika.
2. **„an option to email in on the homepage" — ISTNIEJE** i to wlasnie ona sie lamie. To
   pozycja „E-mail" w `ContactAndMap.svelte`, odnosnik `mailto:`. Naprawiana przez D-1 i D-3.

## Ograniczenia wiazace

- **WCAG 2.1 AA.** Zadna zmiana nie moze wywolac poziomego przewijania strony (1.4.10) ani
  zmniejszyc adresu wzgledem otaczajacej tresci. Cel dotkniecia 44 px dla odnosnika `mailto:`
  pozostaje spelniony.
- Adres musi pozostac KOPIOWALNY jako jeden ciag: `<wbr>` tego nie psuje, `&shy;` psuje.
- Polski w calosci, zero emoji, zero myslnikow, poltrapez tylko w zakresach liczbowych.
- Zablokowana specyfikacja `01-UI-SPEC.md` obowiazuje: bez nowych tokenow, bez zmian palety
  i typografii.
- **Testy sa czescia dostawy.** Potrzebna jest bramka, ktora zapala sie, gdy adres znowu zlamie
  sie w srodku slowa. Naturalna forma: przypadek Playwrighta liczacy `getClientRects()` na
  wezle adresu i sprawdzajacy, ze przy 1440 i 1024 adres ma JEDEN prostokat, a gdyby mial dwa,
  to pierwszy konczy sie na malpie. Ten test jest jedynym, ktory to zlapie: `npm run check`,
  eslint i axe przechodza przy kazdym lamaniu.
- Weryfikacja: `npm run check && npm run lint && npm run test:unit && npm run test`.
  Przed pelnym `npm run test` zabic proces na porcie 4173.
- **Zmiana jest wizualna, wiec zielone testy nie sa dowodem.** Po wdrozeniu obejrzec
  wyrenderowana strone glowna przy 1440 i 1024, tak jak wymusil to blad kadrowania w 260901-amq.
