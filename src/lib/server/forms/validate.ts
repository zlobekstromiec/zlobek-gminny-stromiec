// Form validators for both public forms: kontakt (CONTACT-03, FORM-01) and
// zgłoszenie na listę rezerwową (RECRUIT-03, RECRUIT-04; 04-RESEARCH.md Code
// Example 6 and Security Domain V5). Pure and dependency-free apart from the
// sanitizers, so tests/forms.unit.ts drives both directly under `node --test`.
//
// This module is the ENFORCEMENT boundary. The island's own validation is a
// user-experience affordance only, so everything is re-checked here, including
// the consent checkbox (RECRUIT-04, CONTACT-03). Nothing here logs: a field value
// may never reach a log (RODO, C-03).
import { MAKS_EMAIL, bezpiecznyEmail, bezpiecznyTekst, bezpiecznyTelefon } from './sanitize.ts';

export type WynikWalidacji<T> =
	{ ok: true; dane: T } | { ok: false; code: 'walidacja' | 'zgoda'; pola?: Record<string, string> };

export interface KontaktDane {
	imie: string;
	email: string;
	wiadomosc: string;
}

/**
 * The enrollment (zgłoszenie) shape: the smallest lawful data set (D-02).
 *
 * A child's given name and family name are DELIBERATELY absent from this type.
 * The form has no control for them, this validator drops any such key from the
 * request body, and the mail body has no line that could carry them, so the value
 * is structurally unable to reach staff, a log or a processor. The only datum about
 * the child is the month and the year of birth, needed for age eligibility against
 * the statut range. Adding a field here would be a RODO regression, not a feature
 * (T-04-24).
 */
export interface ZgloszenieDane {
	imie: string;
	email: string;
	/** Optional. Absent when the parent leaves the control alone, never an empty
	 *  string, so the mail body can render an explicit "not supplied" wording. */
	telefon?: string;
	/** 1 to 12. */
	miesiac: number;
	rok: number;
	/** Optional, same rule as telefon. */
	wiadomosc?: string;
}

// Length caps. 2000 is the limit stated to the parent in the UI-SPEC hint copy
// ("Maksymalnie 2000 znaków"), so the server and the visible promise agree.
const MAKS_IMIE = 100;
const MAKS_WIADOMOSC = 2000;

const MIN_MIESIAC = 1;
const MAKS_MIESIAC = 12;

/** Accepted birth-year window, relative to the current year. It follows from the
 *  statut age range (from the twentieth week of life to 3 years, exceptionally 4)
 *  plus slack for a sibling enquiry filed late or a baby not yet born. A wider
 *  window would accept a typo such as 1926 or 2226 as a real answer, and nobody
 *  would ever notice, so the narrowness is the point. */
const LAT_W_TYL = 6;
const LAT_W_PRZOD = 2;

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

/** True when the parent simply left an optional control alone. An absent key and a
 *  whitespace-only value both count, because an untouched `<select>` and an
 *  untouched `<input>` post an empty string rather than nothing at all. */
function pusty(surowy: unknown): boolean {
	if (surowy === undefined || surowy === null) return true;
	return typeof surowy === 'string' && surowy.trim().length === 0;
}

/** Base-ten integer parse with no coercion slack. A bare `Number.parseInt` accepts
 *  "12abc" and returns 12, and `Number()` accepts "12.0" and " 12 \n", so the digit
 *  shape is checked first and only then parsed with an explicit radix. */
function liczbaCalkowita(surowy: unknown): number | null {
	if (typeof surowy === 'number') return Number.isInteger(surowy) ? surowy : null;
	if (typeof surowy !== 'string') return null;
	const wartosc = surowy.trim();
	if (!/^[0-9]{1,4}$/.test(wartosc)) return null;
	return Number.parseInt(wartosc, 10);
}

/** Per-field reason for a numeric select, using the same short keys as the text
 *  fields: an untouched control is `brak`, anything else out of range is
 *  `niepoprawny`. `zbyt-dlugi` has no meaning for a bounded select. */
function kodLiczby(
	surowy: unknown,
	wartosc: number | null,
	min: number,
	maks: number
): string | null {
	if (wartosc !== null && wartosc >= min && wartosc <= maks) return null;
	return pusty(surowy) ? 'brak' : 'niepoprawny';
}

/** Validate and sanitize an enrollment submission. Returns ONLY the whitelisted
 *  fields on success, built as an explicit object literal and never as a spread of
 *  the request body: a to/from/cc/bcc key cannot travel towards the mailer
 *  (T-04-02), and a child-name key cannot travel anywhere at all (T-04-24). */
export function walidujZgloszenie(dane: unknown): WynikWalidacji<ZgloszenieDane> {
	if (typeof dane !== 'object' || dane === null || Array.isArray(dane)) {
		return { ok: false, code: 'walidacja' };
	}
	const surowe = dane as Record<string, unknown>;

	const imie = bezpiecznyTekst(surowe.imie, MAKS_IMIE);
	const email = bezpiecznyEmail(surowe.email);

	// The two optional fields: an untouched control is valid and becomes undefined,
	// but a PRESENT malformed value is a failure rather than something to repair.
	// A silently corrected number is a different number, and dialling it reaches the
	// wrong household.
	const telefonPodany = !pusty(surowe.telefon);
	const telefon = telefonPodany ? bezpiecznyTelefon(surowe.telefon) : undefined;
	const wiadomoscPodana = !pusty(surowe.wiadomosc);
	const wiadomosc = wiadomoscPodana ? bezpiecznyTekst(surowe.wiadomosc, MAKS_WIADOMOSC) : undefined;

	const biezacyRok = new Date().getUTCFullYear();
	const miesiac = liczbaCalkowita(surowe.miesiac);
	const rok = liczbaCalkowita(surowe.rok);

	const pola: Record<string, string> = {};
	dodajKod(pola, 'imie', surowe.imie, imie, MAKS_IMIE);
	dodajKod(pola, 'email', surowe.email, email, MAKS_EMAIL);
	if (telefon === null) pola.telefon = 'niepoprawny';
	const kodMiesiaca = kodLiczby(surowe.miesiac, miesiac, MIN_MIESIAC, MAKS_MIESIAC);
	if (kodMiesiaca !== null) pola.miesiac = kodMiesiaca;
	const kodRoku = kodLiczby(surowe.rok, rok, biezacyRok - LAT_W_TYL, biezacyRok + LAT_W_PRZOD);
	if (kodRoku !== null) pola.rok = kodRoku;
	if (wiadomoscPodana) {
		dodajKod(pola, 'wiadomosc', surowe.wiadomosc, wiadomosc ?? null, MAKS_WIADOMOSC);
	}

	// The null comparisons repeat what `pola` already proves, so the compiler can
	// narrow the four required values. They are not dead code to a reader either:
	// they state that no branch below can be reached with a rejected value.
	if (
		Object.keys(pola).length > 0 ||
		imie === null ||
		email === null ||
		telefon === null ||
		wiadomosc === null ||
		miesiac === null ||
		rok === null
	) {
		return { ok: false, code: 'walidacja', pola };
	}

	// Consent is checked AFTER the fields, so a parent who both mistyped a field and
	// forgot the tick sees every correction at once instead of one per round trip.
	// Strict identity against boolean true, exactly as the contact form: the string
	// "true", the string "on" and the number 1 all fail, because RODO requires an
	// affirmative act and not a coincidence of type coercion.
	if (surowe.zgoda !== true) {
		return { ok: false, code: 'zgoda' };
	}

	const wynik: ZgloszenieDane = { imie, email, miesiac, rok };
	if (telefon !== undefined) wynik.telefon = telefon;
	if (wiadomosc !== undefined) wynik.wiadomosc = wiadomosc;
	return { ok: true, dane: wynik };
}
