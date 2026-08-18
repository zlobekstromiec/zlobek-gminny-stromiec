<script lang="ts">
	// The "wolisz napisać wprost?" panel, extracted from the two form islands
	// (Amendment v1.6 §9) so the form routes can place it in their desktop grid
	// areas. Rendered by the ROUTE, exactly once per page. The <noscript> twins
	// stay inside the form islands, which is why those keep their own .fallback
	// styles. Static content only: prerendered, never revealed or hidden by script.
	import Info from '@lucide/svelte/icons/info';
	import { contact } from '$lib/content/site';
	import { KOPIA_FALLBACK } from '$lib/content/forms';
</script>

<!-- One block serves three cases at once: the D-12 failure fallback, the visitor
     without JavaScript, and the visitor whose Turnstile widget cannot load
     (04-RESEARCH Pitfall 7). Its title is a paragraph, not a heading, so the page
     heading order stays unbroken. -->
<div class="fallback">
	<Info class="fallback-ikona" size={22} aria-hidden="true" focusable="false" />
	<div>
		<p class="fallback-tytul">{KOPIA_FALLBACK.naglowek}</p>
		<p class="fallback-tresc">
			E-mail: <a href={`mailto:${contact.email}`}>{contact.email}</a>. Czynne {contact.hours}.
		</p>
	</div>
</div>

<style>
	/* Tint-blue surface, radius-md, 16 -> 24px padding, brand-blue info icon,
	   ink 15px text (UI-SPEC Contract 8). Vertical spacing is the parent's job
	   (the routes stack it in a 24px grid gap). */
	.fallback {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		max-width: 46rem;
		margin-inline: auto;
		padding: 16px;
		border-radius: var(--radius-md);
		background: var(--color-tint-blue);
	}

	@media (min-width: 768px) {
		.fallback {
			padding: 24px;
		}
	}

	.fallback :global(.fallback-ikona) {
		flex: none;
		margin-top: 2px;
		color: var(--color-brand-blue);
	}

	.fallback-tytul {
		margin: 0 0 4px;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 700;
		line-height: 1.5;
		color: var(--color-ink);
	}

	.fallback-tresc {
		margin: 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-ink);
	}

	.fallback-tresc a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		color: var(--color-brand-blue);
		text-decoration: underline;
	}

	.fallback-tresc a:hover {
		color: var(--color-brand-blue-hover);
	}
</style>
