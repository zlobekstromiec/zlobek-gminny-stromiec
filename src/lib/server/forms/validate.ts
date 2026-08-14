// Kontakt form validator (CONTACT-03, FORM-01; 04-RESEARCH.md Code Example 6 and
// Security Domain V5). Pure and dependency-free apart from the sanitizers, so
// tests/forms.unit.ts drives it directly under `node --test`.
//
// This module is the ENFORCEMENT boundary. The island's own validation is a
// user-experience affordance only, so everything is re-checked here, including
// the consent checkbox (RECRUIT-04, CONTACT-03). Nothing here logs: a field value
// may never reach a log (RODO, C-03).
import { MAKS_EMAIL, bezpiecznyEmail, bezpiecznyTekst } from './sanitize.ts';

export type WynikWalidacji<T> =
	{ ok: true; dane: T } | { ok: false; code: 'walidacja' | 'zgoda'; pola?: Record<string, string> };

export interface KontaktDane {
	imie: string;
	email: string;
	wiadomosc: string;
}

// Length caps. 2000 is the limit stated to the parent in the UI-SPEC hint copy
// ("Maksymalnie 2000 znaków"), so the server and the visible promise agree.
const MAKS_IMIE = 100;
const MAKS_WIADOMOSC = 2000;

/** Short stable keys, never Polish prose: the island owns the copy, which keeps
 *  the long-prose rules and the em-dash ban out of server code. The distinction
 *  matters because the UI-SPEC error table has separate messages for a missing
 *  field, a malformed address and an over-long message. */
function kodPola(surowy: unknown, wynik: string | null, maks: number): string | null {
	if (wynik !== null) return null;
	if (typeof surowy !== 'string' || surowy.trim().length === 0) return 'brak';
	if (surowy.trim().length > maks) return 'zbyt-dlugi';
	return 'niepoprawny';
}

function dodajKod(
	pola: Record<string, string>,
	klucz: string,
	surowy: unknown,
	wynik: string | null,
	maks: number
): void {
	const kod = kodPola(surowy, wynik, maks);
	if (kod !== null) pola[klucz] = kod;
}

/** Validate and sanitize a contact submission. Returns ONLY the three whitelisted
 *  fields on success, which is what makes it impossible for a to/from/cc/bcc key
 *  in the request body to travel any further towards the mailer (T-04-02). */
export function walidujKontakt(dane: unknown): WynikWalidacji<KontaktDane> {
	if (typeof dane !== 'object' || dane === null || Array.isArray(dane)) {
		return { ok: false, code: 'walidacja' };
	}
	const surowe = dane as Record<string, unknown>;

	const imie = bezpiecznyTekst(surowe.imie, MAKS_IMIE);
	const email = bezpiecznyEmail(surowe.email);
	const wiadomosc = bezpiecznyTekst(surowe.wiadomosc, MAKS_WIADOMOSC);

	const pola: Record<string, string> = {};
	dodajKod(pola, 'imie', surowe.imie, imie, MAKS_IMIE);
	dodajKod(pola, 'email', surowe.email, email, MAKS_EMAIL);
	dodajKod(pola, 'wiadomosc', surowe.wiadomosc, wiadomosc, MAKS_WIADOMOSC);
	if (imie === null || email === null || wiadomosc === null) {
		return { ok: false, code: 'walidacja', pola };
	}

	// Strict identity against boolean true, so the string "true", the string "on"
	// and the number 1 all fail. An unchecked HTML checkbox simply omits the key,
	// and a forged body must not be able to imply consent by sending anything
	// truthy. RODO requires an affirmative act, not a coincidence of coercion.
	if (surowe.zgoda !== true) {
		return { ok: false, code: 'zgoda' };
	}

	return { ok: true, dane: { imie, email, wiadomosc } };
}
