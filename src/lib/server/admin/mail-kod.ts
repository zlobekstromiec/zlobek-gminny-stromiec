// Login code delivery through Resend (CMS-01, CMS-03; threats T-04.1-07, T-04.1-16).
//
// THIS IS A SIBLING of src/lib/server/forms/mailer.ts, deliberately NOT an extension
// of it. Three facts, all load bearing:
//
// 1. The payload builder in that module hard-codes its recipient and its hidden copy,
//    and the FORM-02 threat model depends on there being no parameter through which a
//    request can influence them. It therefore does not gain one, and this file is what
//    exists instead.
// 2. That builder is not imported here either, because importing it would mean either
//    parameterising it or inheriting a recipient that has nothing to do with a login.
// 3. The send helper next to it is not reused, because it wires that same builder in
//    internally, so calling it would smuggle the forms recipient into the code e-mail.
//
// What IS shared is the sending identity: FROM comes from that module, so the two
// flows can never drift onto different sender addresses or different domains.
//
// Nothing here logs. The recipient is a staff e-mail address, which is personal data
// on a public body's system (RODO, C-03), and the body carries a live login code.
import { KOPIA_MAIL_KOD } from '../../content/panel.ts';
import { FROM } from '../forms/mailer.ts';

const RESEND = 'https://api.resend.com/emails';

/** The exact object sent to Resend. Text only, no markup field, and deliberately no
 *  hidden copy: a login code must reach exactly one mailbox, the one that asked for
 *  it. There is no reply_to either, because nobody is meant to reply to this. */
export interface PayloadKod {
	from: string;
	to: string[];
	subject: string;
	text: string;
}

/** Plain-text body, assembled from the panel copy module so every sentence is swept
 *  by tests/admin-copy.unit.ts like the rest of the panel's Polish. The code sits on
 *  its own line so it can be selected and copied on a phone without catching the
 *  surrounding words. */
export function zbudujTrescKodu(kod: string): string {
	return [
		KOPIA_MAIL_KOD.powitanie,
		'',
		KOPIA_MAIL_KOD.wstep,
		'',
		kod,
		'',
		KOPIA_MAIL_KOD.waznosc,
		KOPIA_MAIL_KOD.bezpieczenstwo,
		'',
		KOPIA_MAIL_KOD.podpis
	].join('\n');
}

/** Build the payload. The address arrives already validated by bezpiecznyEmail and
 *  already confirmed to be on the allowlist, and the subject is a constant: no value
 *  from a request can reach a mail header. */
export function zbudujPayloadKod(adres: string, kod: string): PayloadKod {
	return {
		from: FROM,
		to: [adres],
		subject: KOPIA_MAIL_KOD.temat,
		text: zbudujTrescKodu(kod)
	};
}

/**
 * Send the code and report the real outcome.
 *
 * The result is AWAITED and returned, for the same reason the forms sender states at
 * length: a login screen that says a code is waiting when the send failed leaves an
 * editor staring at an empty inbox with no way to tell why. A false here surfaces the
 * „Nie udało się wysłać kodu" panel.
 */
export async function wyslijKod(
	apiKey: string,
	dryRun: boolean,
	adres: string,
	kod: string
): Promise<boolean> {
	// Test-only seam, enabled only by the preview:test harness bindings, never as a
	// Cloudflare Pages variable, so a real deployment always sends.
	if (dryRun) return true;

	try {
		const res = await fetch(RESEND, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(zbudujPayloadKod(adres, kod))
		});
		return res.ok;
	} catch {
		// A network error is a failed send, reported as such. Never swallowed into a
		// success, and never logged: the payload carries both the address and the code.
		return false;
	}
}
