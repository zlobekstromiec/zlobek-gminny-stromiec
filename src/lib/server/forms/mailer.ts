// Resend send via plain fetch, no SDK (CONTACT-03, FORM-01, FORM-02;
// 04-RESEARCH.md Code Example 4, ROADMAP "Email Sending, Implementation Notes",
// threats T-04-02, T-04-06, T-04-07). Durability note: the sending identity is a
// set of module-level constants that no request can reach, and the send is awaited
// so the endpoint can tell the truth about whether the message left.
//
// Nothing here logs. A submission body may never reach a log (RODO, C-03).
import type { KontaktDane } from './validate.ts';

/** Hard-coded sender, never request-derived (FORM-02). The dedicated send.
 *  subdomain isolates sending reputation from the apex. The display name is kept
 *  ASCII deliberately: a From display name is the most-mangled header in practice,
 *  and the Polish wording that staff actually read lives in the subject and body. */
export const FROM = 'Formularz zlobka <formularz@send.zlobekstromiec.pl>';

/** Hard-coded recipient, never request-derived (FORM-02). Confirmed mailbox. */
export const TO = 'zlobek@ugstromiec.pl';

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

const RESEND = 'https://api.resend.com/emails';

/** The exact object sent to Resend. Text only: there is deliberately no markup
 *  field, so a submitted message can never render as markup in the staff mail
 *  client (T-04-07). */
export interface PayloadResend {
	from: string;
	to: string[];
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

/** Build the payload. Takes only a static subject, an already-sanitized body and
 *  an already-validated address: there is no parameter through which a request
 *  could influence from, to or bcc (T-04-02). */
export function zbudujPayload(temat: string, tresc: string, replyTo: string): PayloadResend {
	return {
		from: FROM,
		to: [TO],
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
