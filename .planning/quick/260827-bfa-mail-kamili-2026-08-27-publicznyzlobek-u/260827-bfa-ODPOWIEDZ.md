# Odpowiedź do Kamili

Temat: **Strona żłobka: adresy i polityka prywatności wprowadzone**

---

Dzień dobry Pani Kamilo,

proszę się nie przejmować tym, że informacje przychodzą partiami. Tak to zwykle
wygląda i wszystko udało się wprowadzić. Zrobione:

- adres **publicznyzlobek@ugstromiec.pl** jest teraz na stronie wszędzie tam,
  gdzie wcześniej był stary: w nagłówku, w stopce, w zakładce Kontakt i pod
  obydwoma formularzami,
- każda wiadomość z formularza idzie na ten adres, a **kopia trafia do Pani** na
  kamila.dobosz@ugstromiec.pl. Pani adres nie jest nigdzie opublikowany na
  stronie, celowo, żeby nie zbierały go roboty rozsyłające spam. Jest zapisany
  wyłącznie w kodzie wysyłki,
- w klauzuli informacyjnej pod formularzami dopisaliśmy zdanie, że kopię każdego
  zgłoszenia otrzymuje Urząd Gminy w Stromcu. To wymóg RODO: rodzic musi wiedzieć,
  kto dostaje jego dane,
- przesłana przez Panią klauzula administratora została opublikowana na stronie
  **Polityka prywatności (RODO)**, razem z adresem **iod@ugstromiec.pl**. Adres
  inspektora widnieje też pod każdym formularzem.

Strona Polityki prywatności ma teraz dwie osobne części, i to jest celowe.
Pierwsza to Pani tekst i dotyczy danych dziecka i rodziców przetwarzanych
w żłobku. Druga dotyczy wyłącznie tego, co ktoś sam wpisze w formularzu na
stronie. Okresy przechowywania są w obu częściach inne, więc gdyby stały obok
siebie bez podziału, wyglądałyby na sprzeczne.

W Pani tekście poprawiłem wyłącznie zapis, nie treść: dwie duże litery „I" na
„i", dwa myślniki na przecinki i zbędne spacje. Zmieniłem też „niniejszej umowy"
na „umowy o objęcie dziecka opieką", ponieważ na stronie internetowej nie ma
żadnej „niniejszej umowy" i takie sformułowanie odsyłałoby czytelnika do
dokumentu, którego tam nie widzi. Sens prawny jest nienaruszony.

**Mam dwa pytania.**

**Pierwsze: jak nazywa się inspektor ochrony danych?** Dostaliśmy sam adres
e-mail, a przepisy wymagają podania także imienia i nazwiska inspektora
(art. 11 ustawy z 10 maja 2018 r. o ochronie danych osobowych). Bez nazwiska
strona nie spełnia jeszcze tego wymogu. To jedno z dwóch nazwisk, na które
czekamy. Drugim jest koordynator do spraw dostępności.

**Drugie: kto jest administratorem danych?** W Pani tekście jest „podmiot
prowadzący Publiczny Żłobek w Stromcu", a w klauzuli, którą pisaliśmy wcześniej,
jest „Publiczny Żłobek w Stromcu, jednostka organizacyjna Gminy Stromiec".
Przy ustawie o opiece nad dziećmi w wieku do lat 3 podmiotem prowadzącym żłobek
publiczny jest gmina, więc te dwa zdania mogą wskazywać dwa różne podmioty.
Na razie obie wersje są opublikowane, każda w swojej części strony, i nie
rozstrzygamy tego sami, bo to decyzja administratora. Proszę o wskazanie, która
wersja jest właściwa, a ujednolicę obie.

Jeszcze jedna rzecz, o której warto wiedzieć. Nie mamy jeszcze **dowodu**, że
wiadomości rzeczywiście docierają na publicznyzlobek@ugstromiec.pl. Adres jest
wpisany, ale nikt nic na niego jeszcze nie wysłał przez formularz. Prosiłbym więc,
żeby po naszej rozmowie wysłać jedną testową wiadomość przez formularz kontaktowy
na stronie i sprawdzić, czy przyszła. Do tego czasu zostawiam włączoną zapasową
kopię wiadomości u nas, żeby żadne zgłoszenie od rodzica nie przepadło po cichu.

Pozdrawiam serdecznie

---

## Notatki (nie wysyłać)

- Adres kamila.dobosz@ugstromiec.pl jest stałą modułową w `mailer.ts` i nie
  występuje w żadnym publikowanym tekście ani w HTML strony. Pilnują tego dwie
  bramki testowe z kontrolą dodatnią.
- BCC devzlobekstromiec@gmail.com oraz akapit „Tymczasowa kopia zapasowa"
  w klauzuli zdejmujemy dopiero razem, po udowodnionym dostarczeniu. FORM-01
  pozostaje nieodhaczone do tego czasu.
- LEGAL-02 czeka wyłącznie na nazwisko inspektora. Znacznik PLACEHOLDER przy
  bloku IOD został zawężony do tego jednego braku, nie usunięty.
- Strona nadal jest `noindex` na każdym origin, zgodnie z ustaleniem z wątku
  260824-qqa. Nic w tym zadaniu tego nie zmienia.
