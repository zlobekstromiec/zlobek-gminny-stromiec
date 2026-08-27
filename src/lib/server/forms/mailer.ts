// Resend send via plain fetch, no SDK (CONTACT-03, FORM-01, FORM-02;
// 04-RESEARCH.md Code Example 4, ROADMAP "Email Sending, Implementation Notes",
// threats T-04-02, T-04-06, T-04-07). Durability note: the sending identity is a
// set of module-level constants that no request can reach, and the send is awaited
// so the endpoint can tell the truth about whether the message left.
//
// Nothing here logs. A submission body may never reach a log (RODO, C-03).
import type { KontaktDane, ZgloszenieDane } from './validate.ts';

/** Hard-coded sender, never request-derived (FORM-02). The dedicated send.
 *  subdomain isolates sending reputation from the apex. The display name is kept
 *  ASCII deliberately: a From display name is the most-mangled header in practice,
 *  and the Polish wording that staff actually read lives in the subject and body. */
export const FROM = 'Formularz zlobka <formularz@send.zlobekstromiec.pl>';

/** Hard-coded recipient, never request-derived (FORM-02). This is the institutional
 *  mailbox the placówka gave us in writing on 2026-08-27; it replaced `zlobek@`, which
 *  was never a real mailbox at all. Delivery to THIS address is NOT yet proven: nobody
 *  has sent a form to it and looked inside, which is why the BCC below still stands and
 *  FORM-01 is still unticked. */
export const TO = 'publicznyzlobek@ugstromiec.pl';

/** Hard-coded copy recipient, never request-derived, exactly like FROM, TO and BCC
 *  (FORM-02, D-2). Semantically the żłobek is the addressee and the Urząd Gminy, which
 *  runs the recruitment casework, is the copy, so this is `cc` and not a second `to`.
 *
 *  This recipient IS DISCLOSED in the „Odbiorcy danych" block of KLAUZULA in
 *  src/lib/content/forms.ts, and neither may exist without the other: a recipient the
 *  parent was never told about breaches art. 13 RODO, and a disclosed recipient that no
 *  longer receives anything is a false statement (04-RESEARCH Pitfall 8). The address is
 *  a named clerk's, so it lives here and never in published copy; tests/forms-copy.unit.ts
 *  imports this constant to prove its absence from every exported string. */
export const CC = 'kamila.dobosz@ugstromiec.pl';

/** TEMPORARY anti-silent-loss backup (D-13). Because nothing is stored, a filtered
 *  or bounced message is a lost application with no record anywhere.
 *  LAUNCH GATE: once delivery to the Gmina mailbox is proven reliable, remove this
 *  constant AND the klauzula informacyjna sentence describing the backup copy in
 *  the SAME commit. The mailbox holder is a processor and its provider a
 *  sub-processor, so the disclosure and the constant must never drift apart. */
export const BCC = 'devzlobekstromiec@gmail.com';

/** STATIC subject. No submitted value may ever reach a mail header (T-04-01), so
 *  this is a constant and the parent's name goes in the body instead. Resend
 *  encodes the UTF-8 subject per RFC 2047. */
export const TEMAT_KONTAKT = 'Nowa wiadomość z formularza kontaktowego';

/** STATIC subject for the enrollment form, deliberately different from the contact
 *  one so staff can filter the two flows into separate folders. Same hard rule: no
 *  submitted value may ever reach a mail header (T-04-27), so this is a constant and
 *  the parent's name goes in the body instead. */
// Neutral since 2026-08-18, with the form heading it mirrors: the nabór is open all year,
// so a subject line announcing a waiting list would mislabel every enquiry in the inbox.
export const TEMAT_ZGLOSZENIE = 'Nowe zgłoszenie z formularza rekrutacji';

const RESEND = 'https://api.resend.com/emails';

/** The exact object sent to Resend. Text only: there is deliberately no markup
 *  field, so a submitted message can never render as markup in the staff mail
 *  client (T-04-07). */
export interface PayloadResend {
	from: string;
	to: string[];
	cc: string[];
	bcc: string[];
	reply_to: string;
	subject: string;
	text: string;
}

/** Plain-text body with labelled lines. The address appears here, in the body,
 *  in addition to reply_to, so staff can still see it if a client hides headers. */
export function zbudujTrescKontakt(dane: KontaktDane): string {
	return [
		`Imię i nazwisko: ${dane.imie}`,
		`E-mail: ${dane.email}`,
		'',
		'Wiadomość:',
		dane.wiadomosc
	].join('\n');
}

/** Explicit Polish wording for an optional field the parent left blank. A bare
 *  label with nothing after it reads like a delivery bug; this reads like a choice,
 *  and staff can tell the two apart at a glance. */
const NIE_PODANO = 'nie podano';
const BRAK_WIADOMOSCI = 'brak wiadomości';

/** Plain-text enrollment body with labelled lines. There is NO line for a child's
 *  name: the validated type has no such field, so one cannot be rendered here
 *  (T-04-24).
 *
 *  The month NAME arrives as an injected lookup rather than a table declared in this
 *  module. A second month table in server code could drift from the one the select
 *  renders, and the mail would then disagree with what the parent actually chose. */
export function zbudujTrescZgloszenie(
	dane: ZgloszenieDane,
	nazwaMiesiaca: (miesiac: number) => string
): string {
	return [
		`Imię i nazwisko rodzica: ${dane.imie}`,
		`E-mail: ${dane.email}`,
		`Telefon: ${dane.telefon ?? NIE_PODANO}`,
		`Miesiąc i rok urodzenia dziecka: ${nazwaMiesiaca(dane.miesiac)} ${dane.rok}`,
		'',
		'Wiadomość:',
		dane.wiadomosc ?? BRAK_WIADOMOSCI
	].join('\n');
}

/** Build the payload. Takes only a static subject, an already-sanitized body and
 *  an already-validated address: there is no parameter through which a request
 *  could influence from, to, cc or bcc (T-04-02). */
export function zbudujPayload(temat: string, tresc: string, replyTo: string): PayloadResend {
	return {
		from: FROM,
		to: [TO],
		cc: [CC],
		bcc: [BCC],
		reply_to: replyTo,
		subject: temat,
		text: tresc
	};
}

/**
 * Send, and report the real outcome.
 *
 * The result is AWAITED and returned. Never defer the send to a background task
 * such as the execution context's post-response hook: returning 200 before the
 * send resolves turns a Resend failure into an invisible lost application and
 * makes the UI lie to a parent about their child's enrollment (D-12, T-04-06).
 * That hook's name is grep-banned across this directory precisely so the ban is
 * machine-checkable, which is why it is described rather than written here.
 */
export async function wyslij(
	apiKey: string,
	dryRun: boolean,
	temat: string,
	tresc: string,
	replyTo: string
): Promise<boolean> {
	// Test-only seam. Enabled only by the preview:test harness bindings, never as a
	// Cloudflare Pages variable, so production always sends.
	if (dryRun) return true;

	try {
		const res = await fetch(RESEND, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(zbudujPayload(temat, tresc, replyTo))
		});
		return res.ok;
	} catch {
		// A network error is a failed send, reported as such. Never swallowed into a
		// success, and never logged: the payload contains personal data.
		return false;
	}
}
