---
status: complete
phase: 05-gallery-fees
source: [05-VERIFICATION.md]
started: 2026-08-17T21:30:00Z
updated: 2026-08-17T22:53:53Z
---

## Current Test

[testing complete]

## Tests

### 1. Zapis cennika w panelu dociera na zywa strone (FEE-9)
expected: Zaloguj sie na /admin/cennik, zmien pola stawki, obnizki, ZUS, wyzywienia i nieobecnosci, kliknij „Zapisz", odczekaj okolo dwoch minut na przebudowe Cloudflare Pages, potwierdz zmiane na zywym /cennik. Kwoty maja byc policzone identycznie jak w echu panelu.
why_human: Panel zapisuje przez GitHub App, a tresc jest czytana w czasie BUDOWANIA. Zadne lokalne srodowisko testowe nie tworzy prawdziwego commita ani prawdziwej przebudowy Pages. 05-VALIDATION.md wprost oznacza to jako weryfikacje wylacznie reczna.
result: pass

### 2. Dodanie i usuniecie zdjecia w galerii dociera na zywa strone (GAL-11)
expected: Zaloguj sie na /admin/galeria, dodaj zdjecie zastepcze, „Zapisz", odczekaj na przebudowe, potwierdz zdjecie na zywym /o-nas#galeria. Nastepnie usun je, „Zapisz", odczekaj i potwierdz, ze znikneło. Oba zdjecia zasiane recznie maja przetrwac obie operacje.
why_human: To samo ograniczenie GitHub App plus budowanie co w FEE-9. Dodatkowo jest to jedyna sciezka, ktora sprawdza regule „dwa zasiane zdjecia sa nieusuwalne" wobec prawdziwego commita. Test jednostkowy GAL-10 tego nie potrafi, bo preview:test wiaze PANEL_DRY_RUN=1 i zaden zapis w przegladarce nie kasuje pliku.
result: pass

### 3. Podglad zdjecia na prawdziwym telefonie
expected: Otworz /o-nas#galeria na telefonie, stuknij kafelek zeby otworzyc podglad, zamknij go raz przyciskiem zamkniecia i raz stuknieciem w tlo. Podglad ma sie otwierac i zamykac poprawnie, a cele dotyku maja byc wygodne.
why_human: Playwright chromium nie jest telefonem. Wielkosc celow dotyku i gest stuknięcia w tlo to zachowania urzadzenia, wymienione w tabeli weryfikacji recznych w 05-VALIDATION.md.
result: pass

## Summary

total: 3
passed: 3
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
