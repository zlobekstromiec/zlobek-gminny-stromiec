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
