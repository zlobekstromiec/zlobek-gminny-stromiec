// Hardened inline-Markdown renderer for CMS narrative fields (D-08).
// marked.parseInline does NOT sanitize: raw inline HTML passes straight
// through and link hrefs are not protocol-filtered. The public CSP
// (script-src 'self', svelte.config.js) keeps injected script inert, but the
// DOM boundary must not rely on CSP alone. This renderer therefore:
//   - escapes raw inline HTML instead of emitting it,
//   - drops links whose href is not http(s)/mailto/tel/relative (text stays),
//   - renders images as their alt text (no editor-controlled <img> src).
// Bold/italic/links keep marked's default (escaped) output, matching D-08's
// "bold + links only" editing contract.
import { Marked } from 'marked';

const escapeHtml = (value: string): string =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;');

// http(s), mailto, tel, same-site relative paths and fragments only — never
// javascript:, data:, or other schemes.
const SAFE_HREF = /^(?:https?:|mailto:|tel:|\/|#)/i;

/** Assemble one anchor, or fall back to its plain text when the href is not on the
 *  allow-list above. Extracted so the instrukcja renderer below decides „is this href
 *  safe?" with the same code as the two renderers that predate it, rather than with a
 *  second copy of the same three lines. */
function bezpiecznyOdnosnik(href: string, tekst: string, tytul?: string | null): string {
	if (!SAFE_HREF.test(href.trim())) return tekst;
	const atrybutTytulu = tytul ? ` title="${escapeHtml(tytul)}"` : '';
	return `<a href="${escapeHtml(href)}"${atrybutTytulu}>${tekst}</a>`;
}

const inlineMarked = new Marked({
	renderer: {
		html(token) {
			return escapeHtml(token.text);
		},
		image(token) {
			return escapeHtml(token.text);
		},
		link(token) {
			const text = this.parser.parseInline(token.tokens);
			if (!SAFE_HREF.test(token.href.trim())) return text;
			const title = token.title ? ` title="${escapeHtml(token.title)}"` : '';
			return `<a href="${escapeHtml(token.href)}"${title}>${text}</a>`;
		}
	}
});

/** Render a single-paragraph Markdown field to sanitized inline HTML.
 *  Cast is safe: parseInline is synchronous without an async extension. */
export function renderInline(source: string): string {
	return inlineMarked.parseInline(source) as string;
}

// Hardened FULL-BLOCK renderer for the post body (NEWS-02, D-08). Unlike
// renderInline it processes multi-paragraph Markdown, but it deliberately
// narrows the block grammar to protect the page contract and the stored-XSS
// boundary (T-03-01, high):
//   - raw HTML blocks are escaped to text (never emitted),
//   - images collapse to their alt text (no editor-controlled <img> src),
//   - links reuse the exact SAFE_HREF allow-list logic (unsafe schemes fall
//     back to plain text),
//   - headings are neutralized to paragraphs so the post's single <h1> (the
//     tytul in +page.svelte) is never rivalled by a body heading (a11y + XSS),
//   - GFM tables are dropped entirely.
// The public CSP (script-src 'self', svelte.config.js) is the second layer, not
// the only one.
const blockMarked = new Marked({
	gfm: true,
	renderer: {
		html(token) {
			return escapeHtml(token.text);
		},
		image(token) {
			return escapeHtml(token.text);
		},
		link(token) {
			const text = this.parser.parseInline(token.tokens);
			if (!SAFE_HREF.test(token.href.trim())) return text;
			const title = token.title ? ` title="${escapeHtml(token.title)}"` : '';
			return `<a href="${escapeHtml(token.href)}"${title}>${text}</a>`;
		},
		heading(token) {
			// No heading reaches the DOM: render as a paragraph so the post's
			// single h1 (the tytul) stays unrivalled.
			return `<p>${this.parser.parseInline(token.tokens)}</p>\n`;
		},
		table() {
			// GFM tables neutralized (out of the D-08 editing contract).
			return '';
		}
	}
});

/** Render the full post body Markdown to hardened, sanitized block HTML.
 *  Cast is safe: parse is synchronous without an async extension. */
export function renderPost(source: string): string {
	return blockMarked.parse(source) as string;
}

// Hardened renderer for the printable instrukcja shown at /admin/pomoc (04.1-10 P-27).
// It differs from renderPost in exactly one way, and the difference is the whole reason
// it exists: HEADINGS SURVIVE AS HEADINGS. renderPost flattens them to paragraphs so a
// post body can never rival the page's single h1; the instrukcja is a twelve-section
// document whose structure IS how a nervous reader finds the one section they need, and
// a screen-reader user navigating it by heading would otherwise meet one flat wall of
// text. Heading order is protected by construction instead: the page owns the h1 (the
// document's own title, removed before this runs) and every level below it is clamped
// into h2 to h4, so no rendered document can skip a level or emit a second h1.
//
// The sanitizing half is unchanged and is not relaxed anywhere: raw HTML is escaped to
// text, images collapse to their alt text, hrefs go through the same allow-list, and GFM
// tables are dropped. The source is a document committed to this repository rather than
// anything an editor types, so this is defence the input does not currently need; it is
// kept because the next person to edit that document should not have to know that.
const instrukcjaMarked = new Marked({
	gfm: true,
	renderer: {
		html(token) {
			return escapeHtml(token.text);
		},
		image(token) {
			return escapeHtml(token.text);
		},
		link(token) {
			return bezpiecznyOdnosnik(token.href, this.parser.parseInline(token.tokens), token.title);
		},
		heading(token) {
			const poziom = Math.min(Math.max(token.depth, 2), 4);
			return `<h${poziom}>${this.parser.parseInline(token.tokens)}</h${poziom}>\n`;
		},
		table() {
			return '';
		}
	}
});

/** Render the instrukcja body (everything below its own title) to sanitized block HTML
 *  with a heading structure that starts at h2. Cast is safe: parse is synchronous
 *  without an async extension. */
export function renderInstrukcja(source: string): string {
	return instrukcjaMarked.parse(source) as string;
}
