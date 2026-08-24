---
quick_id: 260824-r4c
slug: nip-i-regon-w-stopce
date: 2026-08-24
status: complete
---

# NIP i REGON w stopce

Polskie strony instytucji publicznych noszą identyfikatory w stopce, na
każdej podstronie, nie tylko na stronie kontaktu.

## Stan wyjściowy

NIP wjechał na stronę godzinę wcześniej (zadanie 260824-qqa) i stał
wyłącznie w karcie „Dane kontaktowe" na `/kontakt`. REGON-u nie ma nigdzie:
`.planning/dane-bip-zlobek-stromiec.md` notuje „NIP / REGON: [BRAK] jeszcze
nieprzyznane", a mail Kamili z 24 sierpnia przyniósł sam NIP.

## Decyzje

**D-1. Grupowanie NIP-u przenosi się do wspólnego modułu.**
Formatowanie stało jako lokalna stała w `/kontakt/+page.svelte`, co było
poprawne, dopóki `/kontakt` był jedyną powierzchnią z NIP-em. Stopka renderuje
się na KAŻDEJ stronie, więc druga kopia grupowania byłaby drugą odpowiedzią na
jedno pytanie. Nowy `src/lib/identyfikatory.ts`, ta sama zasada, którą już
niosą godziny w `$lib/godziny.ts`.

**D-2. Sklep trzyma gołe cyfry, separatory dokłada się przy renderze.**
Identyfikator zapisany z separatorami trzeba je zdejmować przy każdym
porównaniu, wstawieniu do URL-a czy odpytaniu rejestru, a każde takie
zdejmowanie to miejsce na pomyłkę.

**D-3. Funkcje NIE walidują, ale też nie kaleczą.**
Wartość, której nie da się sformatować, wraca NIETKNIĘTA. Dziewięć cyfr
pogrupowanych jak NIP czytałoby się jak prawdziwy numer z literówką, a to na
stronie organu publicznego jest gorsze niż numer widocznie surowy: rodzic
przepisuje go do wniosku ZUS bez drugiego spojrzenia.

**D-4. REGON: pusty ciąg, wiersz pomijany w całości.**
Nie wymyślamy numeru i nie publikujemy „REGON: brak". Napis „brak" ogłasza
nieobecność jako fakt na każdej stronie serwisu; brak wiersza nie ogłasza
niczego. Znacznik `// PLACEHOLDER:` stoi przy polu w `site.ts`, więc pozycja
dołącza do bramki uruchomieniowej fazy 6. Uzupełnienie to edycja JEDNEGO pola:
wpisać cyfry między cudzysłowy, a stopka i `/kontakt` podchwycą je same, bo
żadna z nich nie trzyma literału.

**D-5. Kolor identyfikatorów to `--color-band`, ten sam co adres wyżej.**
Tekst leży na bloku brand-blue. Ta para jest już przebadana pod kątem
kontrastu AA, a nowy przygaszony odcień wymyślony pod dwie linijki drobnego
druku to dokładnie miejsce, w którym wprowadza się awarię 4.5:1. Odróżnienie
robi rozmiar i odstęp.

**D-6. Testy czytają ze sklepu, nie z literałów.**
„Na stronie nie ma REGON-u" to fakt o tym tygodniu, nie wymaganie. Asercja
wzięta z literału zaczerwieniłaby się w dniu, w którym żłobek poda numer,
czyli w najgorszym możliwym momencie. Oczekiwanie jest więc wyprowadzone:
cokolwiek niesie sklep, to musi pokazać stopka.

## Zrobione

- `src/lib/identyfikatory.ts`: `nipDoWyswietlenia`, `regonDoWyswietlenia`
- `site.ts`: `regon: ''` ze znacznikiem `// PLACEHOLDER:`
- `Footer.svelte`: blok identyfikatorów pod adresem, REGON warunkowo
- `/kontakt`: korzysta ze wspólnego modułu, wiersz REGON warunkowy
- `tests/identyfikatory.unit.ts` (17 przypadków), `tests/stopka-identyfikatory.spec.ts` (8)

## Bramki

`check` 0 błędów · `lint` czysty · `test:unit` 637/637 · `test` 442/442.
Weryfikacja wzrokowa stopki przy 1280 px i 390 px.

## Do potwierdzenia z placówką

**REGON.** Dopisać do listy pytań w odpowiedzi do Kamili.
