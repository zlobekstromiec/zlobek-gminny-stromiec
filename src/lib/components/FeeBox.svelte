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
	//
	// Quick 260823-pmv: the box LEADS with the uchwała's rate, matching /cennik, at the
	// client's request. The captions and the reduction sentence are imported from the
	// /cennik prose module rather than restated, so the two surfaces cannot word the same
	// distinction differently. No cycle: that module imports nothing from rekrutacja.
	import { OPLATY } from '$lib/content/rekrutacja';
	import { KWOTA_PODPIS, notaObnizkiZwiezle } from '$lib/content/cennik';
</script>

<div class="fee-box">
	<p class="kwota-podpis">{KWOTA_PODPIS}</p>
	<p class="kwota">{OPLATY.stawka}</p>
	<!-- The condition that makes leading with the rate honest, in ONE LINE. It renders INSIDE
	     .fee-box and may never be moved out of it: without it the panel implies a parent pays
	     the uchwała rate, which no parent does while the reduction runs. It is one line and not
	     the panel /cennik uses because this box sits in a STICKY rail with the submit button
	     below it; see notaObnizkiZwiezle for the measured reason. -->
	<p class="linia">{notaObnizkiZwiezle(OPLATY.obnizkaTekst, OPLATY.kwota)}</p>
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

	/* Label role, same treatment as /cennik so the two fee surfaces read as one family. */
	.kwota-podpis {
		margin: 0 0 4px;
		font-family: var(--font-body);
		font-size: 14px;
		font-weight: 700;
		line-height: 1.4;
		color: var(--color-muted);
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
