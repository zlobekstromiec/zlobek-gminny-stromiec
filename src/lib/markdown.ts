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
