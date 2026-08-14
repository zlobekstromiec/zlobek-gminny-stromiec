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
	TURNSTILE_SITEKEY,
	komunikatPola,
	tekstBledu
} from '../src/lib/content/forms.ts';
import { contact } from '../src/lib/content/site.ts';
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
	KOPIA_FALLBACK,
	KOPIA_NOSCRIPT,
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

test('every phone number in the exported copy is the value from site.ts', () => {
	const telefony = new Set<string>();
	for (const s of WSZYSTKIE_STRINGI) {
		for (const trafienie of s.matchAll(/\d[\d\s-]{7,}\d/g)) telefony.add(trafienie[0]);
	}
	assert.deepEqual([...telefony].sort(), [contact.phoneDisplay]);
});

test('every e-mail address in the exported copy is the value from site.ts', () => {
	const adresy = new Set<string>();
	for (const s of WSZYSTKIE_STRINGI) {
		for (const trafienie of s.matchAll(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g)) adresy.add(trafienie[0]);
	}
	adresy.delete(DOZWOLONY_PRZYKLAD);
	assert.deepEqual([...adresy].sort(), [contact.email]);
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

test('the static fallback and noscript copy carry the phone and the e-mail', () => {
	assert.match(KOPIA_FALLBACK.tresc, new RegExp(contact.phoneDisplay));
	assert.match(KOPIA_FALLBACK.tresc, new RegExp(contact.email));
	assert.match(KOPIA_NOSCRIPT, new RegExp(contact.phoneDisplay));
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
