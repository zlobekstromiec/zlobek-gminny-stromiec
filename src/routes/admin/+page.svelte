<script lang="ts">
	// Pulpit. Still deliberately minimal: Plan 09 turns it into the UI-SPEC Component
	// Contract 3 card grid with its per-collection counts and the nabór state line.
	// What is binding already is the heading structure (exactly one h1, correct order,
	// no colour-only signalling) and the lead, which carries the D-18 publish-delay
	// promise on the first screen an editor ever sees.
	//
	// Both strings now come from src/lib/content/panel.ts rather than being typed
	// here, so the Polish-only sweep governs this screen too.
	import { KOPIA_PULPIT } from '$lib/content/panel';
</script>

<div class="naglowek-strony">
	<h1 class="naglowek">{KOPIA_PULPIT.naglowek}</h1>
	<p class="lead">{KOPIA_PULPIT.lead}</p>
</div>

<style>
	/* Title and lead are one block, 8px apart. The 24px that separates the block from
	   whatever a later plan puts under it belongs to the column, not to the heading. */
	.naglowek-strony {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	/* The panel h1 reuses the LOCKED h2 clamp, one step down the inherited scale. A
	   role reassignment inside the scale, never a fifth size (UI-SPEC Typography). */
	.naglowek {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 3vw, 1.75rem);
		font-weight: 700;
		line-height: 1.2;
		color: var(--color-ink);
	}

	/* 24px from the page header to the first thing under it, the panel's density step
	   down from the public site's 32px. */
	.lead {
		margin: 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 16px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-ink);
	}
</style>
