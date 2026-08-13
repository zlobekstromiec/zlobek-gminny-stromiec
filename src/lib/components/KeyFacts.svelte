<script lang="ts">
	// Key-facts strip (UI-SPEC v1.2 §6): answers a parent's arrival questions
	// (age range, hours, fee, capacity) at a glance, directly under the hero.
	// Values come from src/lib/content/site.ts (PLACEHOLDER markers live there).
	// Tint chips are decorative surfaces; icon strokes and all text stay
	// accessible-tier (brand-blue stroke, ink value, muted label).
	import { keyFacts } from '$lib/content/site';
	import IconSmile from '$lib/icons/IconSmile.svelte';
	import IconClock from '$lib/icons/IconClock.svelte';
	import IconCoins from '$lib/icons/IconCoins.svelte';
	import IconHouse from '$lib/icons/IconHouse.svelte';

	const icons = { smile: IconSmile, clock: IconClock, coins: IconCoins, house: IconHouse };
</script>

<section class="facts" aria-label="Najważniejsze informacje">
	<dl class="facts-grid">
		{#each keyFacts as fact (fact.label)}
			{@const Icon = icons[fact.icon]}
			<div class="fact">
				<span class="chip chip-{fact.tint}" aria-hidden="true">
					<Icon size={26} />
				</span>
				<div class="fact-text">
					<dt class="fact-label">{fact.label}</dt>
					<dd class="fact-value">
						{fact.value}
						{#if fact.suffix}<span class="fact-suffix">{fact.suffix}</span>{/if}
					</dd>
				</div>
			</div>
		{/each}
	</dl>
</section>

<style>
	.facts {
		background: var(--color-surface-warm);
		border-top: 1px solid var(--color-border-subtle);
		padding-block: 40px;
	}

	.facts-grid {
		max-width: 72rem;
		margin-inline: auto;
		padding-inline: 16px;
		margin-block: 0;
		display: grid;
		grid-template-columns: 1fr;
		gap: 24px;
	}

	@media (min-width: 640px) {
		.facts-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 32px;
		}
	}

	@media (min-width: 768px) {
		.facts-grid {
			padding-inline: 24px;
		}
	}

	@media (min-width: 1024px) {
		.facts-grid {
			grid-template-columns: repeat(4, 1fr);
			padding-inline: 32px;
		}
	}

	.fact {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	/* Decorative tint chips: surfaces only; the duotone plate is white, the
	   stroke is brand-blue (>= 3:1 on every tint, see v1.2 pairing table). */
	.chip {
		flex: none;
		width: 46px;
		height: 46px;
		border-radius: var(--radius-md);
		display: grid;
		place-items: center;
		color: var(--color-brand-blue);
		--icon-fill: #ffffff;
	}

	.chip-yellow {
		background: var(--color-tint-yellow);
	}

	.chip-blue {
		background: var(--color-tint-blue);
	}

	.chip-orange {
		background: var(--color-tint-orange);
	}

	.chip-green {
		background: var(--color-tint-green);
	}

	.fact-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.fact-label {
		font-family: var(--font-body);
		font-size: 13px;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	.fact-value {
		font-family: var(--font-display);
		font-size: 26px;
		font-weight: 700;
		line-height: 1.2;
		color: var(--color-ink);
		margin: 0;
	}

	.fact-suffix {
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		color: var(--color-muted);
	}
</style>
