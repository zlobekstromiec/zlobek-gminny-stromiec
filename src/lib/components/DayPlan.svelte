<script lang="ts">
	// Daily schedule panel (UI-SPEC v1.2 §6): a parent's "what does a day look
	// like" answer, right after the recruitment module. Static content from the
	// migrated single source day-plan.json (D-03) so the homepage and /o-nas
	// render byte-identical rows. Times render at 19px Baloo 700 accent-active
	// on tint-blue (3.97:1 large-text pass; never smaller).
	import dayPlan from '$lib/content/day-plan.json';
</script>

<section class="dayplan" aria-labelledby="dayplan-heading">
	<div class="inner">
		<div class="panel">
			<h2 id="dayplan-heading">Nasz dzień w żłobku</h2>
			<ul>
				<!-- Keyed by POSITION, never by the hours. Phase 04.1 made this file editable
				     from the panel, and Svelte THROWS on a keyed each block with two equal
				     keys, in production as well as in development: two rows sharing a time
				     range would break this panel on the homepage AND on the O nas page the
				     moment it hydrated. The position is unique by construction, the list is
				     static within one build, and the rendered output is identical. -->
				{#each dayPlan.rows as row, i (i)}
					<li>
						<span class="time">{row.time}</span>
						<span class="what">{row.what}</span>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<style>
	.dayplan {
		background: var(--color-surface);
		padding-block: 48px;
	}

	@media (min-width: 1024px) {
		.dayplan {
			padding-block: 64px;
		}
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

	.panel {
		max-width: 44rem;
		margin-inline: auto;
		background: var(--color-tint-blue);
		border-radius: var(--radius-lg);
		padding: 28px 32px;
	}

	.panel h2 {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(1.5rem, 3vw, 1.75rem);
		line-height: 1.2;
		color: var(--color-ink);
		margin: 0 0 10px;
	}

	.panel ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.panel li {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 14px;
		align-items: baseline;
		padding: 8px 0;
		border-bottom: 1px dashed rgb(3 105 161 / 0.35);
	}

	.panel li:last-child {
		border-bottom: none;
	}

	/* 19px Baloo 700 accent-active on tint-blue: large-text 3.97:1 (v1.2 table). */
	.time {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 19px;
		color: var(--color-accent-active);
		min-width: 104px;
	}

	.what {
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 700;
		line-height: 1.5;
		color: var(--color-ink);
	}
</style>
