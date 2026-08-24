---
quick_id: 260824-t8n
slug: opisy-zdjec-bez-etykiet-osob
date: 2026-08-24
status: complete
---

# Opisy zdjęć opisują wydarzenie, nie osoby

Zgłoszenie użytkownika: pod fotografią z otwarcia widniał publicznie napis
„Kobieta przemawia przy mównicy". Osoba na zdjęciu może być dyrektorką
placówki, a etykieta jest i nietrafna, i nieuprzejma.

## Dwie sprawy, nie jedna

**1. Pole `alt` NIE jest tylko dla czytnika ekranu.**
`Lightbox.svelte:209` renderuje je drugi raz jako WIDOCZNY `<p class="opis">`
pod podpisem (05-UI-SPEC Kontrakt 2). To celowe i dobre: widzący
i niewidzący czytają dokładnie to samo zdanie. Ale znaczy też, że pole jest
publikowaną prozą, a nawyki z pisania alt-tekstu są dla niego wprost błędne.

**2. Nawyk, który trzeba było wyłączyć.**
Alt-tekst konwencjonalnie opisuje ludzi z wyglądu, bo ktoś, kto nie widzi
zdjęcia, nie ma innej drogi. Wydrukowane pod fotografią na stronie WŁASNEJ
instytucji tej osoby to samo zdanie sprowadza rozpoznawalnego człowieka do
etykiety demograficznej.

Błąd nie był jednostkowy: **wszystkie sześć** opisów galerii tak robiło
(„Kobieta", „Mężczyzna w jasnoszarym garniturze", „Dwie kobiety").

## Decyzje

**D-1. Opisujemy ROLĘ i CZYNNOŚĆ, nie ciało.**
„Przemówienie przy mównicy" jest zarazem bardziej informatywne i mniej
zuchwałe niż „Kobieta przemawia". Rola wykonywana na uroczystości („ksiądz"
odczytujący modlitwę) zostaje: niesie informację i wynika z samej czynności,
a nie z domysłu o osobie.

**D-2. Nazwa pliku `otwarcie-dyrektor.jpg` też była domysłem.**
Nie wiemy, kto jest na zdjęciu. Nazwa idzie do publicznego URL-a, więc
zmieniona na `otwarcie-przemowienie-maskotka.jpg`, opisującą scenę.

**D-3. Guard, bo błąd powtórzył się sześć razy w jednym pliku.**
`tests/opisy-zdjec.unit.ts` przemiata wszystkie publikowane opisy w drzewie
treści i czerwieni się na gołych etykietach płci. Z kontrolą pozytywną, bo
guard na regexie umiera właśnie na zepsutym wzorcu, nie na brudnej treści.

## Bramki

`check` 0 błędów · `lint` czysty · `test:unit` 640/640 · `test` 442/442.

## Uzupełnienie: opis znika z ekranu w całości

Po pierwszej poprawce użytkownik zgłosił, że tekst nadal jest widoczny i że
zdjęcia bronią się same. Wiersz opisu usunięty z `Lightbox.svelte`.

**Co zostaje, a co znika.** Znika powielenie: `<p class="opis">` pod
podpisem. Zostaje `alt` na samym obrazie, renderowany przez STRONĘ
w snippetach, więc czytnik ekranu nadal dostaje pełny opis. Podpis zostaje,
bo nazywa dialog przez `aria-labelledby`.

**Nie było `aria-describedby` wskazującego na ten akapit**, więc usunięcie go
nie zostawia wiszącej referencji. Sprawdzone przed zmianą, bo to byłby cichy
błąd dostępności, który axe zgłosiłby dopiero na innej stronie.

**Prop `opis` usunięty z komponentu i z obu miejsc wywołania**, zamiast
zostawienia martwego API.

**To ZMIENIA 05-UI-SPEC Kontrakt 2**, który wprost przewidywał wiersz opisu.
Test kontraktu w `galeria.spec.ts` przepisany na asercję NIEOBECNOŚCI, żeby
przywrócenie wiersza było świadomym aktem, który czerwieni test, a nie cichym
powrotem.

**Guard zostaje, z węższym uzasadnieniem.** Opisy nie są już drukowane, ale
dotyczą realnych, rozpoznawalnych osób i są czytane na głos. „Co się dzieje"
jest lepszym alt-tekstem niż „kto stoi", niezależnie od widoczności.
