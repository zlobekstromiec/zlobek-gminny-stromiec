<script lang="ts">
	// "Why parents choose us" band (UI-SPEC v1.2 §6): accent surface with four
	// white value-prop cards. Static, no hover transforms. Tint chips are
	// decorative; titles/body stay accessible-tier (ink on accent 6.82:1).
	import { perks } from '$lib/content/site';
	import IconShield from '$lib/icons/IconShield.svelte';
	import IconHeart from '$lib/icons/IconHeart.svelte';
	import IconBlocks from '$lib/icons/IconBlocks.svelte';
	import IconTree from '$lib/icons/IconTree.svelte';

	const icons = { shield: IconShield, heart: IconHeart, blocks: IconBlocks, tree: IconTree };
</script>

<section class="perks" aria-labelledby="perks-heading">
	<div class="inner">
		<h2 id="perks-heading">Dlaczego rodzice nas wybierają?</h2>
		<ul class="cards">
			{#each perks as perk (perk.title)}
				{@const Icon = icons[perk.icon]}
				<li class="perk-card">
					<span class="chip chip-{perk.tint}" aria-hidden="true">
						<Icon size={26} />
					</span>
					<h3>{perk.title}</h3>
					<p>{perk.body}</p>
				</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.perks {
		background: var(--color-accent);
		padding: 32px 0 52px;
	}

	.inner {
		max-width: 72rem;
		margin-inline: auto;
		padding-inline: 16px;
	}

	@media (min-width: 768px) {
		.inner {
			padding-inline: 24px;
		}
	}

	@media (min-width: 1024px) {
		.inner {
			padding-inline: 32px;
		}
	}

	/* Ink on accent: 6.82:1 (v1.2 pairing table). */
	.perks h2 {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(1.5rem, 3vw, 1.75rem);
		line-height: 1.2;
		color: var(--color-ink);
		text-align: center;
		margin: 0 0 24px;
	}

	.cards {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: 1fr;
		gap: 18px;
	}

	@media (min-width: 640px) {
		.cards {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.cards {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	.perk-card {
		background: var(--color-surface);
		border-radius: var(--radius-lg);
		box-shadow: 0 5px 0 rgb(15 23 42 / 0.12);
		padding: 26px 22px;
		text-align: center;
	}

	.chip {
		width: 46px;
		height: 46px;
		border-radius: var(--radius-md);
		display: inline-grid;
		place-items: center;
		color: var(--color-brand-blue);
		--icon-fill: #ffffff;
		margin-bottom: 10px;
	}

	.chip-blue {
		background: var(--color-tint-blue);
	}

	.chip-pink {
		background: var(--color-tint-pink);
	}

	.chip-yellow {
		background: var(--color-tint-yellow);
	}

	.chip-green {
		background: var(--color-tint-green);
	}

	.perk-card h3 {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 20px;
		color: var(--color-ink);
		margin: 0 0 6px;
	}

	.perk-card p {
		font-family: var(--font-body);
		font-size: 15px;
		line-height: 1.55;
		color: var(--color-muted);
		margin: 0;
	}
</style>
