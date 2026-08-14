<script lang="ts">
	// Compact fee summary panel (D-15; 04-UI-SPEC.md Amendment v1.4 Component
	// Contract 11). No props: the copy is code-authored content and lives in
	// src/lib/content/rekrutacja.ts, so the /cennik page of Phase 5 and this panel
	// cannot end up quoting different amounts.
	//
	// HARD RULE (source document section 10.1): the ZUS condition is rendered in the
	// SAME block as the amount and is never separated from it by a layout change, a
	// responsive rule or a future refactor. An amount presented without the condition
	// under which the benefit is granted is exactly the fact the source document
	// forbids publishing, and this panel is the surface where that mistake would be
	// easiest to make.
	//
	// Surface treatment is the v1.2 Recruitment info-card, reused rather than
	// re-derived: tint-yellow with a 2px accent border, and ink text on it at 11.6:1.
	import { OPLATY } from '$lib/content/rekrutacja';
</script>

<div class="fee-box">
	<p class="kwota">{OPLATY.kwota}</p>
	<p class="linia">{OPLATY.kwotaOpis}</p>
	<p class="linia">{OPLATY.zus}</p>
	<p class="linia">{OPLATY.wyzywienie}</p>
	<p class="linia">{OPLATY.nieobecnosc}</p>
</div>

<style>
	.fee-box {
		max-width: 46rem;
		padding: 16px;
		border: 2px solid var(--color-accent);
		border-radius: var(--radius-md);
		background: var(--color-tint-yellow);
	}

	@media (min-width: 768px) {
		.fee-box {
			padding: 24px;
		}
	}

	.kwota {
		margin: 0;
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 700;
		line-height: 1.2;
		color: var(--color-ink);
	}

	.linia {
		margin: 8px 0 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-ink);
	}
</style>
