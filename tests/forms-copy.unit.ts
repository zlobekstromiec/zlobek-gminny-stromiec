// Copy-contract unit test for src/lib/content/forms.ts (CONTACT-03, RECRUIT-04,
// D-03, D-12). Pins the obligations that are legal or accessibility requirements
// rather than stylistic preferences: the copy rules (no emoji, no em dash), the
// completeness of the failure-code map, the single-source rule for contact values,
// and every klauzula disclosure that 04-RESEARCH.md Pitfall 3 and Pitfall 8 make
// mandatory (the transfer to the United States and its legal mechanism, the
// processor's retention window, the temporary backup mailbox, the salted-hash
// measure, the supervisory authority).
//
// Do NOT weaken these assertions to make the suite pass. They are the executable
// acceptance criteria for the klauzula informacyjna, and a klauzula that omits one
// of them is a RODO defect, not a failing test. They change only alongside an
// approved amendment to the design contract.
//
// Uses Node's built-in runner (no new dependency): `node --test` strips types
// natively on the pinned Node 22.23.2. Named *.unit.ts so Playwright's spec|test
// matcher never collects it. The relative imports carry the `.ts` extension, which
// that type stripping requires.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	KLAUZULA,
	KOPIA_BLEDOW,
	KOPIA_FALLBACK,
	KOPIA_KONTAKT,
	KOPIA_NOSCRIPT,
	KOPIA_POL,
	KOPIA_ZGLOSZENIE,
	MIESIACE_WYBOR,
	TURNSTILE_SITEKEY,
	komunikatPola,
	nazwaMiesiaca,
	tekstBledu
} from '../src/lib/content/forms.ts';
import { contact, urzad } from '../src/lib/content/site.ts';
// The CC recipient is IMPORTED, never repeated as a literal here. Two literals could
// drift apart the day the address changes, and the drifted copy would be the one that
// silently stops being checked. The mailer module has a type-only import and executes
// nothing on load, so pulling it into a node:test file costs nothing (T-bfa-01).
import { CC } from '../src/lib/server/forms/mailer.ts';
import type { FormCode } from '../src/lib/forms/types.ts';

/** Every FormCode the server can return. Written out rather than derived from the
 *  copy map itself, so deleting a key from the map turns this suite red instead of
 *  shrinking the expectation with it. */
const KODY: FormCode[] = ['walidacja', 'zgoda', 'turnstile', 'limit', 'wysylka'];

/** Recursively collect every string reachable from the module's exports, so a new
 *  export cannot escape the copy rules by being added after this test was written. */
function zbierz(wartosc: unknown, zebrane: string[] = []): string[] {
	if (typeof wartosc === 'string') {
		zebrane.push(wartosc);
	} else if (Array.isArray(wartosc)) {
		for (const element of wartosc) zbierz(element, zebrane);
	} else if (typeof wartosc === 'object' && wartosc !== null) {
		for (const element of Object.values(wartosc)) zbierz(element, zebrane);
	}
	return zebrane;
}

const WSZYSTKIE_STRINGI = zbierz([
	KOPIA_BLEDOW,
	KOPIA_POL,
	KOPIA_KONTAKT,
	KOPIA_ZGLOSZENIE,
	KOPIA_FALLBACK,
	KOPIA_NOSCRIPT,
	MIESIACE_WYBOR,
	KLAUZULA
]);

const KLAUZULA_TEKST = zbierz(KLAUZULA).join('\n');

/** The one e-mail literal the copy is allowed to contain besides the institutional
 *  inbox: RFC 2606 reserves example.com for documentation, and the UI-SPEC error
 *  table specifies this illustration verbatim. Any other literal address means a
 *  contact value was pasted instead of interpolated from site.ts. */
const DOZWOLONY_PRZYKLAD = 'jan.kowalski@example.com';

test('no exported copy string contains an em dash (copy rules, C-11)', () => {
	const winne = WSZYSTKIE_STRINGI.filter((s) => s.includes('—'));
	assert.deepEqual(winne, []);
});

test('no exported copy string contains an emoji (copy rules, C-11)', () => {
	const emoji = /\p{Extended_Pictographic}/u;
	const winne = WSZYSTKIE_STRINGI.filter((s) => emoji.test(s));
	assert.deepEqual(winne, []);
});

test('KOPIA_BLEDOW has an entry for every one of the five FormCode values', () => {
	assert.deepEqual(Object.keys(KOPIA_BLEDOW).sort(), [...KODY].sort());
});

test('every KOPIA_BLEDOW entry has a non-empty heading and a non-empty body', () => {
	for (const kod of KODY) {
		assert.ok(KOPIA_BLEDOW[kod].naglowek.length > 0, `brak nagłówka dla ${kod}`);
		assert.ok(tekstBledu(kod).length > 0, `brak treści dla ${kod}`);
	}
});

test('the wysylka body states plainly that the message was not sent (D-12)', () => {
	assert.match(tekstBledu('wysylka'), /nie została wysłana/);
});

test('the wysylka emphasis is a strong fragment, never capitals (UI-SPEC 7c)', () => {
	const mocne = KOPIA_BLEDOW.wysylka.tresc.filter((f) => typeof f !== 'string');
	assert.equal(mocne.length, 1);
	assert.equal((mocne[0] as { mocne: string }).mocne, 'nie została wysłana');
});

// THIS TEST INVERTED ON 2026-08-18 and is stronger for it. It used to prove that every
// phone-shaped literal in the copy equalled `contact.phoneDisplay`, which is the right
// assertion while a phone exists. The żłobek asked for the number to come off the site
// until it has a line of its own, so `contact` no longer has the field, and the property
// worth defending changed with it: not „the number here is the right number" but „there
// is no number here at all". The same sweep answers both questions, and this direction
// is the one that catches somebody pasting a number straight into a copy string.
test('no phone number survives anywhere in the exported copy (2026-08-18)', () => {
	const telefony = new Set<string>();
	for (const s of WSZYSTKIE_STRINGI) {
		for (const trafienie of s.matchAll(/\d[\d\s-]{7,}\d/g)) telefony.add(trafienie[0]);
	}
	assert.deepEqual(
		[...telefony].sort(),
		[],
		'numer telefonu wrocil do kopii formularzy; jesli zlobek ma juz wlasna linie, dodaj ja do contact w site.ts zamiast wpisywac w tekst'
	);
});

test('every e-mail address in the exported copy is the value from site.ts', () => {
	const adresy = new Set<string>();
	for (const s of WSZYSTKIE_STRINGI) {
		for (const trafienie of s.matchAll(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g)) adresy.add(trafienie[0]);
	}
	adresy.delete(DOZWOLONY_PRZYKLAD);
	assert.deepEqual([...adresy].sort(), [contact.email]);
});

// D-2 / T-bfa-04. The Urząd Gminy receives a copy of every submission, so art. 13 RODO
// obliges the klauzula to say so. The constant in mailer.ts and this sentence are a pair:
// a recipient nobody was told about is exactly the defect 04-RESEARCH Pitfall 8 names.
test('the klauzula discloses the copy sent to the Urząd Gminy (D-2, Pitfall 8)', () => {
	assert.match(
		KLAUZULA_TEKST,
		/Kopię każdej wiadomości i każdego zgłoszenia z formularza otrzymuje/
	);
	assert.ok(KLAUZULA_TEKST.includes(urzad.name));
});

// D-2 / T-bfa-01. The named clerk's address is a server-side constant and must never be
// published. The positive control is not decoration: without it a broken detector would
// report an empty sweep as a pass forever.
test('the copy recipient address is published nowhere in the exported copy (D-2)', () => {
	const zawiera = (s: string) => s.includes(CC);
	assert.deepEqual(WSZYSTKIE_STRINGI.filter(zawiera), []);
	assert.equal(zawiera(`Napisz na ${CC}, odpowiemy.`), true, 'kontrola dodatnia detektora');
});

// Copy rules v1.2 §8. An en dash is legal ONLY inside a numeric range, which is why the
// digit boundary is part of the expression: contact.hours legitimately carries 6:30–16:30.
// This gate exists so a client's text pasted in without editing turns red.
test('no exported copy string carries an en dash outside a numeric range (copy rules)', () => {
	const polpauza = /(?<!\d)–|–(?!\d)/u;
	assert.deepEqual(
		WSZYSTKIE_STRINGI.filter((s) => polpauza.test(s)),
		[]
	);
	assert.equal(
		polpauza.test('rozliczania opłat – na podstawie'),
		true,
		'kontrola dodatnia detektora'
	);
});

test('the klauzula names the administrator', () => {
	assert.match(KLAUZULA_TEKST, /Publiczny Żłobek w Stromcu/);
});

test('the klauzula names both processors, Resend and Cloudflare', () => {
	assert.match(KLAUZULA_TEKST, /Resend/);
	assert.match(KLAUZULA_TEKST, /Cloudflare/);
});

test('the klauzula discloses the transfer to the United States (Pitfall 3)', () => {
	assert.match(KLAUZULA_TEKST, /Stanach Zjednoczonych/);
});

test('the klauzula names the legal mechanism for that transfer (Pitfall 3)', () => {
	assert.match(KLAUZULA_TEKST, /standardowe klauzule umowne/);
});

test('the klauzula states the approximately thirty day copy at the processor', () => {
	assert.match(KLAUZULA_TEKST, /około trzydzieści dni/);
});

test('the klauzula states that nothing is stored in the zlobek own systems', () => {
	assert.match(KLAUZULA_TEKST, /nie prowadzimy bazy danych/);
});

test('the klauzula discloses the temporary backup mailbox (D-13, Pitfall 8)', () => {
	assert.match(KLAUZULA_TEKST, /ukrytej kopii/);
	assert.match(KLAUZULA_TEKST, /pomocniczą skrzynkę pocztową/);
});

test('the klauzula describes the salted-hash abuse counter (Pattern 4)', () => {
	assert.match(KLAUZULA_TEKST, /skrót \(hash\)/);
	assert.match(KLAUZULA_TEKST, /soli/);
	assert.match(KLAUZULA_TEKST, /przez jedną godzinę/);
});

test('the klauzula names the supervisory authority', () => {
	assert.match(KLAUZULA_TEKST, /Prezes Urzędu Ochrony Danych Osobowych/);
});

test('the klauzula states the legal basis as consent under art. 6 ust. 1 lit. a', () => {
	assert.match(KLAUZULA_TEKST, /art\. 6 ust\. 1 lit\. a/);
});

test('the klauzula states that the child name is never asked for', () => {
	assert.match(KLAUZULA_TEKST, /miesiąc i rok urodzenia dziecka/);
	assert.match(KLAUZULA_TEKST, /Nie pytamy o imię ani nazwisko dziecka/);
});

test('the klauzula states that withdrawing consent does not affect prior processing', () => {
	assert.match(KLAUZULA_TEKST, /przed jej wycofaniem/);
});

test('every klauzula block carries at least one paragraph', () => {
	assert.ok(KLAUZULA.length > 0);
	for (const blok of KLAUZULA) {
		assert.ok(blok.akapity.length > 0, `pusty blok: ${blok.naglowek ?? '(bez nagłówka)'}`);
		for (const akapit of blok.akapity) assert.ok(akapit.trim().length > 0);
	}
});

test('TURNSTILE_SITEKEY is a non-empty string', () => {
	assert.equal(typeof TURNSTILE_SITEKEY, 'string');
	assert.ok(TURNSTILE_SITEKEY.length > 0);
});

test('komunikatPola maps every server field and reason to a Polish instruction', () => {
	assert.equal(komunikatPola('imie', 'brak'), 'Podaj imię i nazwisko.');
	assert.match(komunikatPola('email', 'niepoprawny') ?? '', /poprawny adres e-mail/);
	assert.match(komunikatPola('wiadomosc', 'zbyt-dlugi') ?? '', /2000 znaków/);
});

test('komunikatPola falls back rather than returning an empty error for a new reason', () => {
	const wynik = komunikatPola('imie', 'kod-ktorego-jeszcze-nie-ma');
	assert.equal(wynik, 'Podaj imię i nazwisko.');
});

test('komunikatPola returns undefined for a field the copy does not know', () => {
	assert.equal(komunikatPola('nieznane-pole', 'brak'), undefined);
});

// Both panels exist to give a visitor a route that works when the form does not, so the
// assertion is that each one still names a reachable route. Since 2026-08-18 there is
// exactly one, and the phone half of this test went with the number (site.ts).
test('the static fallback and noscript copy carry the e-mail', () => {
	assert.match(KOPIA_FALLBACK.tresc, new RegExp(contact.email));
	assert.match(KOPIA_NOSCRIPT, new RegExp(contact.email));
});

test('the kontakt copy carries every string the island needs', () => {
	for (const [klucz, wartosc] of Object.entries(KOPIA_KONTAKT)) {
		assert.equal(typeof wartosc, 'string', `${klucz} nie jest tekstem`);
		assert.ok((wartosc as string).trim().length > 0, `${klucz} jest puste`);
	}
	assert.equal(KOPIA_KONTAKT.wyslij, 'Wyślij wiadomość');
	assert.equal(KOPIA_KONTAKT.wysylanie, 'Wysyłanie...');
});

test('the zgłoszenie copy carries every string the enrollment island needs', () => {
	for (const [klucz, wartosc] of Object.entries(KOPIA_ZGLOSZENIE)) {
		assert.equal(typeof wartosc, 'string', `${klucz} nie jest tekstem`);
		assert.ok((wartosc as string).trim().length > 0, `${klucz} jest puste`);
	}
	assert.equal(KOPIA_ZGLOSZENIE.wyslij, 'Wyślij zgłoszenie');
	assert.equal(KOPIA_ZGLOSZENIE.wysylanie, 'Wysyłanie...');
	assert.equal(KOPIA_ZGLOSZENIE.naglowek, 'Zgłoszenie zainteresowania');
});

// D-01. The form is a waiting-list enquiry, and the copy has to say so: recruitment
// wnioski are accepted in person only, so a parent who mistakes this for an
// application would believe a filing exists when none does.
test('the zgłoszenie intro frames the form as an enquiry, not a formal wniosek (D-01)', () => {
	assert.match(KOPIA_ZGLOSZENIE.intro, /zgłoszenie zainteresowania, a nie formalny wniosek/);
	assert.match(KOPIA_ZGLOSZENIE.intro, /osobiście/);
	assert.ok(KOPIA_ZGLOSZENIE.intro.includes(urzad.name));
	assert.ok(KOPIA_ZGLOSZENIE.intro.includes(urzad.room));
	assert.ok(KOPIA_ZGLOSZENIE.intro.includes(urzad.wnioskiHours));
});

test('the zgłoszenie success body repeats where the formal wniosek goes (D-01)', () => {
	assert.match(KOPIA_ZGLOSZENIE.sukcesTresc, /osobiście/);
	assert.ok(KOPIA_ZGLOSZENIE.sukcesTresc.includes(urzad.name));
	assert.ok(KOPIA_ZGLOSZENIE.sukcesTresc.includes(urzad.room));
});

// D-02 / T-04-24. The instruction not to supply the child's name is part of the
// data-minimisation contract, not decoration, so its absence must fail the suite.
test('the birth-date hint tells the parent not to supply the child name (D-02)', () => {
	assert.match(KOPIA_ZGLOSZENIE.urodzeniePodpowiedz, /Nie podawaj jego imienia ani nazwiska/);
	assert.match(KOPIA_ZGLOSZENIE.urodzenieLegenda, /Miesiąc i rok urodzenia dziecka/);
});

test('the enrollment copy asks for no child name anywhere', () => {
	const wszystkie = zbierz(KOPIA_ZGLOSZENIE).join('\n');
	assert.equal(/imię dziecka|nazwisko dziecka|imie dziecka/i.test(wszystkie), false);
});

test('MIESIACE_WYBOR lists the twelve Polish months in order, values 1 to 12', () => {
	assert.equal(MIESIACE_WYBOR.length, 12);
	assert.deepEqual(
		MIESIACE_WYBOR.map((pozycja) => pozycja.wartosc),
		[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
	);
	for (const { nazwa } of MIESIACE_WYBOR) {
		assert.ok(nazwa.trim().length > 0);
	}
	assert.equal(MIESIACE_WYBOR[0].nazwa, 'styczeń');
	assert.equal(MIESIACE_WYBOR[11].nazwa, 'grudzień');
});

test('nazwaMiesiaca maps a valid month to its Polish name and never renders undefined', () => {
	assert.equal(nazwaMiesiaca(3), 'marzec');
	assert.equal(nazwaMiesiaca(12), 'grudzień');
	assert.equal(nazwaMiesiaca(0), '0');
	assert.equal(nazwaMiesiaca(13).includes('undefined'), false);
});

test('komunikatPola answers for the two birth-date keys the server returns', () => {
	assert.equal(komunikatPola('miesiac', 'brak'), 'Wybierz miesiąc i rok urodzenia dziecka.');
	assert.equal(komunikatPola('rok', 'niepoprawny'), 'Wybierz miesiąc i rok urodzenia dziecka.');
	assert.ok((komunikatPola('telefon', 'niepoprawny') ?? '').length > 0);
});
