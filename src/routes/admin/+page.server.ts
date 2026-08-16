// The pulpit (04.1-UI-SPEC Component Contract 3). Read only: nothing on this screen
// writes anything, and it exports no action, permanently.
//
// EVERY NUMBER COMES FROM THE READER THE MATCHING SCREEN ALREADY USES, never from a
// count of its own. A card claiming „Liczba wpisów: 3" beside a list showing two rows is
// worse than a card with no number at all, because it is the first thing an editor sees
// and it teaches them not to trust the panel. So:
//
//  • the aktualności count comes from `readAktualnosci`, the PUBLIC reader, which is what
//    /aktualnosci and /admin/aktualnosci both read;
//  • the dokumenty count comes from `readDokumentyPanelu`, the PANEL reader, which is what
//    /admin/dokumenty reads. It deliberately differs from the public page in two ways
//    (it keeps empty categories and it keeps an entry whose file is missing), and the
//    pulpit must agree with the screen the editor is about to open. The public reader is
//    not an option here for a harder reason anyway: it imports node:fs to stat each file
//    at build time, and this route is the Cloudflare Worker, which has no filesystem
//    (04.1-08);
//  • the recruitment state comes from `recruitmentOpen` in src/lib/content/site.ts, the
//    same export /rekrutacja derives its banner from, so the card and the parent's page
//    can never disagree about whether the nabór is open.
//
// CONSEQUENCE WORTH STATING PLAINLY, and it is the same one every panel reader carries:
// both readers glob the content folder at BUILD time, so these counts describe the last
// Cloudflare build rather than the repository this second. An entry saved a minute ago is
// not counted yet. That is the two-minute delay the lead paragraph on this very screen
// promises out loud (D-18).
//
// Nothing here logs. No secret is read: this route needs none.
import { recruitmentOpen } from '$lib/content/site';
import { readAktualnosci } from '$lib/server/aktualnosci';
import { readDokumentyPanelu } from '$lib/server/admin/dokumenty';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	return {
		/** Number of posts the aktualności list will show. */
		liczbaWpisow: readAktualnosci().length,
		/** Number of documents the dokumenty list will show, across all categories. */
		liczbaDokumentow: readDokumentyPanelu().length,
		/** Committed recruitment state, rendered as a neutral sentence and never as a
		 *  colour (UI-SPEC Color hard rule 1). */
		naborOtwarty: recruitmentOpen
	};
};
