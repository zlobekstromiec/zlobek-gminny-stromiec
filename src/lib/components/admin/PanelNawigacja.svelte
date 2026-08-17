<script lang="ts">
	// The panel's section navigation (04.1-UI-SPEC Component Contract 1).
	//
	// ONE markup tree, two layouts. Below 1024px the chips wrap into a row directly
	// under the header bar; at 1024px and above the same list becomes a 240px sticky
	// sidebar on the band colour. The difference is a media query, never a second
	// markup tree: two trees mean two tab orders, two sets of aria-current and two
	// places for a later plan to add a link to only one of them.
	//
	// The chip treatment is the v1.2 section-nav chip verbatim: radius-sm, 12px by 16px
	// padding, 44px minimum target, Nunito 700 14px ink, hover tint-yellow, active
	// accent fill. Active state is signalled by aria-current="page" AND the fill, never
	// by colour alone.
	//
	// The active section is derived from the page rune rather than taken as a prop.
	// A prop would be one more thing every screen in this phase has to remember to
	// pass, and the screen that forgets shows no current section at all.
	//
	// The LABELS come from src/lib/content/panel.ts and the ORDER is the UI-SPEC order.
	// The PATHS are wiring rather than copy, so they live in their own module under
	// $lib (imported below) rather than in the copy module, and they are index-aligned
	// with NAWIGACJA: the two lists are the same sections and must stay the same length.
	// They were moved OUT of this file by plan 05-05 for one reason: while they sat
	// here nothing could import them, so nothing could assert that alignment, and a
	// missing entry silently produced an `undefined` href. That assertion now lives in
	// tests/admin-enumeracja.spec.ts.
	//
	// The `aria-label` is written as a literal on purpose. It is the one string in this
	// phase whose exact bytes are an acceptance gate of 04.1-03-PLAN.md, and reading it
	// through a module would make that gate unverifiable.
	import { page } from '$app/state';
	import { NAWIGACJA } from '$lib/content/panel';
	import { SCIEZKA_STARTOWA, SCIEZKI_PANELU } from '$lib/sciezki-panelu';

	const pozycje = NAWIGACJA.map((etykieta, i) => ({ etykieta, href: SCIEZKI_PANELU[i] }));

	const sciezka = $derived(page.url.pathname);

	/** The pulpit is matched exactly, because every other panel path starts with
	 *  `/admin` and a prefix match would light up Pulpit on every screen. */
	function biezaca(href: string): boolean {
		if (href === SCIEZKA_STARTOWA) return sciezka === SCIEZKA_STARTOWA;
		return sciezka === href || sciezka.startsWith(`${href}/`);
	}
</script>

<nav class="nawigacja" aria-label="Sekcje panelu">
	<ul>
		{#each pozycje as pozycja (pozycja.href)}
			<li>
				<a
					href={pozycja.href}
					class="chip"
					class:aktywna={biezaca(pozycja.href)}
					aria-current={biezaca(pozycja.href) ? 'page' : undefined}
				>
					{pozycja.etykieta}
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.nawigacja ul {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		box-sizing: border-box;
		min-height: 44px;
		padding: 12px 16px;
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: 14px;
		font-weight: 700;
		line-height: 1.4;
		color: var(--color-ink);
		text-decoration: none;
		transition: background-color 150ms ease;
	}

	.chip:hover {
		background: var(--color-tint-yellow);
	}

	/* Active: accent fill with an ink label (6.82:1). Paired with aria-current on the
	   element itself, so the state is never carried by the fill alone. */
	.chip.aktywna {
		background: var(--color-accent);
		color: var(--color-ink);
	}

	/* At lg the same list becomes the sidebar: full-width chips, left aligned, on the
	   band colour, sticky below the 64px header bar. */
	@media (min-width: 1024px) {
		.nawigacja {
			position: sticky;
			top: 64px;
			align-self: start;
			width: 240px;
			flex: none;
			box-sizing: border-box;
			padding: 16px;
			background: var(--color-band);
			border-radius: var(--radius-md);
		}

		.nawigacja ul {
			flex-direction: column;
			flex-wrap: nowrap;
		}

		.chip {
			width: 100%;
			justify-content: flex-start;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.chip {
			transition: none;
		}
	}
</style>
