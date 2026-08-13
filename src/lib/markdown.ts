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
