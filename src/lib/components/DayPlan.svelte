<script lang="ts">
	// Daily schedule (UI-SPEC v1.2 §6, recomposed by Amendment v1.6 §4): a parent's
	// "what does a day look like" answer. Static content from the migrated single
	// source day-plan.json (D-03) so the homepage and /o-nas render byte-identical
	// rows. Desktop is a two-column grid: heading + intro left, tint-blue panel
	// right. Times render at 19px Baloo 700 accent-active on tint-blue (3.97:1
	// large-text pass; never smaller). pokazLink adds the /o-nas link on the
	// homepage instance only (a self-link on /o-nas would be noise).
	import dayPlan from '$lib/content/day-plan.json';

	let { pokazLink = false }: { pokazLink?: boolean } = $props();
</script>

<section class="dayplan" aria-labelledby="dayplan-heading">
	<div class="inner">
		<div class="opis">
			<h2 id="dayplan-heading">Nasz dzień w żłobku</h2>
			<p class="intro">
				Dzień w naszym żłobku ma stały, przewidywalny rytm. Zabawa, posiłki, spacer i odpoczynek
				następują po sobie o znanych porach, dzięki czemu dzieci czują się bezpiecznie, a rodzice
				wiedzą, co dzieje się w każdej chwili dnia. Ten sam plan realizujemy od poniedziałku do
				piątku.
			</p>
			{#if pokazLink}
				<a class="wiecej" href="/o-nas">Poznaj nas bliżej</a>
			{/if}
		</div>
		<div class="panel">
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
		display: grid;
		gap: 24px;
	}

	@media (min-width: 768px) {
		.inner {
			padding-inline: 24px;
		}
	}

	@media (min-width: 1024px) {
		.inner {
			padding-inline: 32px;
			grid-template-columns: minmax(260px, 1fr) minmax(0, 1.4fr);
			gap: 48px;
			align-items: start;
		}
	}

	.opis h2 {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(1.5rem, 3vw, 1.75rem);
		line-height: 1.2;
		color: var(--color-ink);
		margin: 0 0 12px;
	}

	.intro {
		font-family: var(--font-body);
		font-size: 16px;
		font-weight: 400;
		line-height: 1.6;
		color: var(--color-muted);
		max-width: 52ch;
		margin: 0 0 16px;
	}

	.wiecej {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 700;
		color: var(--color-brand-blue);
		text-decoration: underline;
	}

	.wiecej:hover {
		color: var(--color-brand-blue-hover);
	}

	/* Left-aligned (not centered) so the panel tracks the heading column at
	   every width; the 44rem cap only bites on wide tablets and desktop. */
	.panel {
		max-width: 44rem;
		background: var(--color-tint-blue);
		border-radius: var(--radius-lg);
		padding: 28px 32px;
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
