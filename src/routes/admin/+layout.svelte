<script lang="ts">
	// The panel shell: 04.1-UI-SPEC.md Component Contract 1 in full. This replaces the
	// deliberately minimal Plan 01 version.
	//
	// The four public chrome components (the announcement bar, the site header, the
	// site footer and the wave divider) are NOT imported, now or ever. The panel is a
	// tool, not a page of the website, and src/routes/+layout.svelte carves /admin out
	// of the public chrome for the same reason. Their identifiers are deliberately not
	// written anywhere in this directory, because the acceptance gate for that rule is
	// a literal grep and a comment naming them would make it permanently red, exactly
	// as the pre-launch gates already forced in 04-02 and 04.1-02.
	//
	// `SkipLink` and `Seo` are reused verbatim, and `Seo` keeps `noindex` at its
	// default of true (D-17, T-04.1-14).
	//
	// THE LOGIN ROUTE IS EXCLUDED FROM THE SHELL BY A PATHNAME BRANCH, which is the
	// first of the two options 04.1-03-PLAN.md offers, and it is chosen deliberately.
	// The other option, breaking /admin/logowanie out with a `+page@.svelte` layout
	// reset, would also detach it from src/routes/admin/+layout.ts, and that file is
	// the ONE line (`prerender = false`) that keeps the whole panel out of the static
	// build. Trading a prerendered login screen for a tidier layout tree is not a trade
	// worth making, and the branch below is four lines. Both branches render exactly
	// one SkipLink and exactly one <main id="main">, so the landmark contract holds on
	// either path.
	//
	// The publish-delay panel is rendered as the LAST CHILD OF <main> rather than as a
	// sibling after it. Visually and in reading order that is the same place the
	// contract puts it, at the bottom of the screen above the footer, and it keeps
	// every piece of content inside a landmark instead of orphaning a paragraph
	// between <main> and <footer>.
	//
	// Every visible string comes from src/lib/content/panel.ts. Nothing here is typed
	// inline, so the Polish-only sweep governs this file too.
	import type { Snippet } from 'svelte';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import LogOut from '@lucide/svelte/icons/log-out';
	import { page } from '$app/state';
	import Seo from '$lib/components/Seo.svelte';
	import SkipLink from '$lib/components/SkipLink.svelte';
	import PanelKomunikat from '$lib/components/admin/PanelKomunikat.svelte';
	import PanelNawigacja from '$lib/components/admin/PanelNawigacja.svelte';
	import PanelStopka from '$lib/components/admin/PanelStopka.svelte';
	import Przycisk from '$lib/components/admin/Przycisk.svelte';
	import { KOPIA_POWLOKA, tytulStrony, zalogowanoJako } from '$lib/content/panel';
	import logoMark from '$lib/assets/brand/logo-mark.png?enhanced';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	/** The login screen has no session, so it gets no header, no nav, no „Wyloguj" and
	 *  no footer. Contract 2 gives it its own centred card instead. */
	const logowanie = $derived(page.url.pathname === '/admin/logowanie');

	// Header gains shadow-sm once the page is scrolled, the same treatment and the
	// same mechanism as the public header. Without JavaScript the shadow simply never
	// appears, which costs nothing: it is decoration, and the 4px accent bottom border
	// is what actually separates the bar from the page.
	let scrollY = $state(0);
	const przewiniete = $derived(scrollY > 4);
</script>

<Seo
	title={tytulStrony(data.sekcja)}
	description="Panel redakcyjny strony Publicznego Żłobka w Stromcu. Dostęp wyłącznie dla osób upoważnionych."
	canonical="/admin"
/>

<!-- Must sit at the top level: a svelte:window tag cannot live inside an element or a
     block. Binding it on the login route as well costs nothing, because the login
     branch renders no sticky bar to shadow. -->
<svelte:window bind:scrollY />

<div class="powloka">
	<SkipLink />

	{#if logowanie}
		<main id="main" class="kolumna-logowania">{@render children()}</main>
	{:else}
		<header class="pasek" class:przewiniete>
			<div class="pasek-wnetrze">
				<a class="wordmark" href="/admin" aria-label={KOPIA_POWLOKA.wordmarkLink}>
					<span class="emblemat">
						<enhanced:img src={logoMark} alt="" sizes="40px" />
					</span>
					<span class="wordmark-tekst">{KOPIA_POWLOKA.wordmark}</span>
				</a>

				<div class="pasek-akcje">
					<span class="zalogowano">{zalogowanoJako(data.editor)}</span>

					<a class="odnosnik-strony" href="/" target="_blank" rel="noopener noreferrer">
						<ExternalLink size={18} aria-hidden="true" focusable="false" />
						<span>{KOPIA_POWLOKA.otworzStrone}</span>
						<span class="visually-hidden">{KOPIA_POWLOKA.nowaKarta}</span>
					</a>

					<!-- „Wyloguj" is a POST inside its own form, never a GET link (D-03,
					     Contract 12): a link can be prefetched by the browser and would end
					     the session without anybody asking for it. -->
					<form method="POST" action="/admin/wyloguj">
						<Przycisk wariant="secondary">
							<LogOut size={18} aria-hidden="true" focusable="false" />
							{KOPIA_POWLOKA.wyloguj}
						</Przycisk>
					</form>
				</div>
			</div>
		</header>

		<div class="uklad">
			<PanelNawigacja />

			<main id="main" class="kolumna">
				{@render children()}

				<div class="opoznienie">
					<PanelKomunikat rodzaj="info">
						{KOPIA_POWLOKA.opoznieniePublikacji}
					</PanelKomunikat>
				</div>
			</main>
		</div>

		<div class="uklad stopka-uklad">
			<PanelStopka />
		</div>
	{/if}
</div>

<style>
	/* Two surfaces, everywhere, always (UI-SPEC Color): the app background is warm and
	   content sits on white cards. Set here rather than on <body>, because the public
	   site deliberately has no global background and must keep its own. */
	.powloka {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background: var(--color-surface-warm);
	}

	/* The login screen is a single centred card, offset 48px from the top rather than
	   centred in the viewport: a vertically centred card JUMPS the moment an error
	   panel appears above it (Contract 2). */
	.kolumna-logowania {
		box-sizing: border-box;
		width: 100%;
		padding: 48px 16px 64px;
	}

	@media (min-width: 768px) {
		.kolumna-logowania {
			padding: 48px 24px 64px;
		}
	}

	/* Header bar: white, sticky, 64px, with the 4px accent bottom border that is the
	   strongest single „same product" cue the panel inherits from the public header. */
	.pasek {
		position: sticky;
		top: 0;
		z-index: 50;
		background: var(--color-surface);
		border-bottom: 4px solid var(--color-accent);
		transition: box-shadow 150ms ease;
	}

	.pasek.przewiniete {
		box-shadow:
			0 1px 2px rgb(15 23 42 / 0.06),
			0 1px 3px rgb(15 23 42 / 0.08);
	}

	.pasek-wnetrze {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		box-sizing: border-box;
		min-height: 64px;
		padding: 0 16px;
	}

	@media (min-width: 768px) {
		.pasek-wnetrze {
			padding: 0 24px;
		}
	}

	@media (min-width: 1024px) {
		.pasek-wnetrze {
			padding: 0 32px;
		}
	}

	.wordmark {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		min-height: 44px;
		text-decoration: none;
		color: var(--color-ink);
	}

	.emblemat {
		flex: none;
		display: flex;
	}

	.emblemat :global(img) {
		display: block;
		height: 40px;
		width: auto;
	}

	.wordmark-tekst {
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 700;
		line-height: 1.2;
	}

	.pasek-akcje {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	/* „Zalogowano jako" is hidden below sm, where the bar has no room for it. It is
	   the short handle and never the full address (D-04). */
	.zalogowano {
		display: none;
		font-family: var(--font-body);
		font-size: 13px;
		font-weight: 400;
		line-height: 1.4;
		color: var(--color-muted);
	}

	@media (min-width: 640px) {
		.zalogowano {
			display: inline;
		}
	}

	.odnosnik-strony {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		padding: 12px 8px;
		font-family: var(--font-body);
		font-size: 14px;
		font-weight: 700;
		line-height: 1.4;
		color: var(--color-brand-blue);
		text-decoration: underline;
	}

	.odnosnik-strony:hover {
		color: var(--color-brand-blue-hover);
	}

	/* The site link's own label is enough below sm; only the icon and the wordmark
	   compete for the bar there, so nothing is hidden. */

	.uklad {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 16px;
		box-sizing: border-box;
		padding: 24px 16px;
	}

	@media (min-width: 768px) {
		.uklad {
			padding: 24px;
		}
	}

	@media (min-width: 1024px) {
		.uklad {
			flex-direction: row;
			align-items: flex-start;
			gap: 32px;
			padding: 32px;
		}
	}

	/* Content column: left aligned inside the column, never centred on a wide screen,
	   and never wider than the reading measure the forms need. 64px of bottom padding
	   so a save row never sits flush with the viewport edge. */
	.kolumna {
		display: flex;
		flex-direction: column;
		gap: 24px;
		min-width: 0;
		flex: 1;
		max-width: 60rem;
		padding-bottom: 64px;
	}

	.opoznienie {
		margin-top: auto;
		padding-top: 24px;
	}

	/* The footer sits in its own row so it is not pushed sideways by the sidebar, and
	   the content row takes the slack so the footer stays at the bottom on a short
	   screen without ever floating over the content on a tall one. */
	.stopka-uklad {
		display: block;
		flex: none;
		padding-top: 0;
		padding-bottom: 0;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		border: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.pasek {
			transition: none;
		}
	}
</style>
