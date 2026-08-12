<script lang="ts">
	// Call-to-action button rendered as a link (UI-SPEC §Rekrutacja CTA).
	//
	// Colour hard rules (01-UI-SPEC §Color):
	//  • primary: amber fill `accent` with `ink` label by default + hover; the label
	//    switches to WHITE only on the darkest `active` state (the ONLY white-on-amber
	//    state — never white on the default/hover fill, which fails AA at 2.15:1).
	//  • secondary: transparent, 2px brand-blue border + brand-blue label; hover fills
	//    the `band` colour. NEVER amber.
	// Focus ring is inherited from the global :focus-visible base (3px focus-ring, 2px
	// offset) in app.css.
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	type Variant = 'primary' | 'secondary';

	let {
		href,
		variant = 'primary',
		icon = false,
		children
	}: {
		href: string;
		variant?: Variant;
		icon?: boolean;
		children: import('svelte').Snippet;
	} = $props();
</script>

<a {href} class="cta {variant}">
	<span class="label">{@render children()}</span>
	{#if icon}
		<ArrowRight class="cta-icon" size={18} aria-hidden="true" focusable="false" />
	{/if}
</a>

<style>
	.cta {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		box-sizing: border-box;
		min-height: 44px;
		padding: 12px 24px;
		border-radius: var(--radius-pill);
		font-family: var(--font-body);
		font-size: 16px;
		font-weight: 700;
		line-height: 1.4;
		text-decoration: none;
		cursor: pointer;
		transition:
			background-color 150ms ease,
			box-shadow 150ms ease,
			transform 150ms ease;
	}

	/* Primary — amber fill, ink label (AA 6.82:1). */
	.cta.primary {
		background: var(--color-accent);
		color: var(--color-ink);
		border: 2px solid transparent;
		box-shadow:
			0 1px 2px rgb(15 23 42 / 0.06),
			0 1px 3px rgb(15 23 42 / 0.08);
	}

	.cta.primary:hover {
		background: var(--color-accent-hover);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgb(15 23 42 / 0.08);
	}

	/* Active/pressed — darkest amber; label flips to WHITE to keep AA (4.6:1).
	   Mirrored on :focus-visible (Amendment v1.1) so keyboard users get the same
	   pressed appearance; the global 3px focus-ring outline still applies on top. */
	.cta.primary:active,
	.cta.primary:focus-visible {
		background: var(--color-accent-active);
		color: #ffffff;
		transform: translateY(0);
	}

	/* Secondary — blue outline, never amber. */
	.cta.secondary {
		background: transparent;
		color: var(--color-brand-blue);
		border: 2px solid var(--color-brand-blue);
	}

	.cta.secondary:hover {
		background: var(--color-band);
	}

	/* Reduced motion: no transform raise (WCAG 2.3.3). */
	@media (prefers-reduced-motion: reduce) {
		.cta,
		.cta:hover,
		.cta:active {
			transform: none;
		}
	}
</style>
