// „Wyloguj" (D-03; 04.1-UI-SPEC Component Contract 12; threat T-04.1-17).
//
// A DEFAULT FORM ACTION AND NOTHING ELSE. There is deliberately no GET handler and no
// load function, so a GET of this path keeps the framework's own refusal and cannot end
// a session. That is not tidiness: a link can be prefetched by the browser, followed by
// a link checker or fetched by a preview crawler, and any of those would log an editor
// out of a shared computer without anybody asking. The control in the header bar is a
// <button> inside its own <form method="POST"> for the same reason.
//
// CSRF is covered without a token: the session cookie is SameSite=Lax, so it is not
// sent on a cross-site POST at all, and kit.csp already restricts form-action to 'self'.
//
// Nothing here logs, and nothing here reads the session: clearing a cookie needs to
// know nothing about who owned it.
import { redirect, type Actions } from '@sveltejs/kit';
import { wyczyscCiastko } from '$lib/server/admin/sesja';

export const actions: Actions = {
	default: ({ cookies }) => {
		// Every flag is repeated inside wyczyscCiastko, because a browser refuses a
		// clearing Set-Cookie for a __Host- cookie when it omits Secure or Path=/, and a
		// refused clear is a session that quietly survives „Wyloguj".
		wyczyscCiastko(cookies);
		// 303, so the browser turns the POST into a GET and a refresh of the login
		// screen does not repost the logout.
		redirect(303, '/admin/logowanie?powod=wylogowano');
	}
};
