<script lang="ts">
	// Daily schedule (UI-SPEC v1.2 §6, recomposed by Amendment v1.6 §4): a parent's
	// "what does a day look like" answer. Static content from the migrated single
	// source day-plan.json (D-03) so the homepage and /o-nas render byte-identical
	// rows. Times render at 19px Baloo 700 accent-active on tint-blue (3.97:1
	// large-text pass; never smaller). pokazLink adds the /o-nas link on the
	// homepage instance only (a self-link on /o-nas would be noise).
	//
	// DESKTOP IS STACKED, NOT SIDE BY SIDE, since 2026-08-18: a header row (h2 in a
	// left rail, intro and link in the right track) above a full-width panel whose
	// schedule runs in two columns. That reverses Amendment v1.6 §4, which put the
	// panel beside the heading. The reasoning, and the measurements behind it, are on
	// the `.inner` rule below; the short version is that v1.6 §4 was sized for a
	// seven-row placeholder and the real schedule has fourteen.
	//
	// THE CLOSING NOTE BELOW THE PANEL IS HARD-CODED HERE, NOT STORED, and that is a
	// constraint rather than a shortcut. `walidujPlanDnia` rebuilds day-plan.json key by
	// key from guarded locals (`placeholder`, `rows`) and never spreads the submitted
	// object, so a `note` key added to that store would be silently DELETED the first
	// time an editor saved the screen. The intro paragraph above it already lives here
	// for exactly that reason; the note joins it rather than inventing a second, fragile
	// home. Making it editable means teaching the panel about it: a field in
	// pola-strony.ts, a branch in the validator, a control on /admin/plan-dnia, Polish
	// copy in panel.ts and the four suites that pin all of those.
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
			<!-- The żłobek's own closing sentence about the schedule (2026-08-18). It sits
			     INSIDE the panel because it qualifies the rows above it: a parent reading
			     „11:00–13:00 sen" needs to know in the same breath that their own child is
			     not held to it. Placed outside, it would read as a separate claim. -->
			<p class="uwaga">
				Dla każdego dziecka przewidujemy indywidualny plan i harmonogram zajęć, dopasowany do jego
				potrzeb i własnego rytmu dnia. Chodzi o poczucie bezpieczeństwa i prawidłowy rozwój.
			</p>
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

	/* STACKED AT EVERY WIDTH SINCE 2026-08-18, which reverses Amendment v1.6 §4.
	   That amendment put the panel in a right-hand column beside the heading, and it
	   was the right shape for a SEVEN-row placeholder schedule. The żłobek's real
	   harmonogram has fourteen rows: measured live at 1280, 1440 and 1920px, the panel
	   stood 1213px tall next to 234px of heading and intro, so the layout produced
	   979px of dead space at every desktop width and a section 1341px tall, taller
	   than the viewport it renders in.

	   Two problems, not one. Filling the void (a photograph in the rail, say) would
	   have fixed the hole and left the section longer than a screen. Going full width
	   and splitting the schedule into two columns fixes both: roughly 880px, no void,
	   and the whole container width doing work. */
	@media (min-width: 1024px) {
		.inner {
			padding-inline: 32px;
			row-gap: 32px;
		}
	}

	/* The header row: h2 in a left rail, intro and link in the right track. Same
	   editorial split /o-nas already uses for its narrow prose sections, so the page
	   gains no new layout idea. Placement is EXPLICIT rather than auto, because auto
	   placement would drop the link into the rail under the heading. */
	@media (min-width: 1024px) {
		.opis {
			display: grid;
			grid-template-columns: minmax(220px, 300px) minmax(0, 1fr);
			column-gap: 48px;
			align-items: start;
		}

		.opis h2 {
			grid-column: 1;
			grid-row: 1 / span 2;
			margin-bottom: 0;
		}

		.opis .intro {
			grid-column: 2;
			grid-row: 1;
		}

		/* Absent on /o-nas, where pokazLink is false. An empty second row costs
		   nothing, so no separate rule is needed for that instance. */
		.opis .wiecej {
			grid-column: 2;
			grid-row: 2;
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

	/* 65ch, RAISED FROM 52ch with the layout change. The cap is a reading measure and
	   both values sit inside the comfortable 45 to 75 range, so this is a composition
	   decision: at 52ch the intro filled barely half of the header's right track and
	   simply moved the empty space from the left of the section to the right of the
	   paragraph. 65ch is also exactly what `.prose` uses on /o-nas, so the two
	   editorial-split headers on this site now set text to the same measure instead of
	   two arbitrary ones. Below 1024px the container is narrower than either value, so
	   nothing changes on a phone. */
	.intro {
		font-family: var(--font-body);
		font-size: 16px;
		font-weight: 400;
		line-height: 1.6;
		color: var(--color-muted);
		max-width: 65ch;
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

	/* The 44rem cap is GONE with the two-column layout it belonged to: the panel now
	   fills the container, which is the whole point of the change. */
	.panel {
		background: var(--color-tint-blue);
		border-radius: var(--radius-lg);
		padding: 28px 32px;
	}

	.panel ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	/* CSS MULTICOL, DELIBERATELY, AND NOT GRID. `grid-auto-flow: column` would need
	   `grid-template-rows: repeat(7, auto)`, and seven is not a fact about this list:
	   the schedule is editable from /admin/plan-dnia, so an editor adding a fifteenth
	   row would silently get a third column or an overflow. Multicol balances whatever
	   number of rows exists.

	   Its reading order is also the right one HERE, which is not usually true of
	   multicol. Columns flow top-to-bottom then across, and for a timeline that IS
	   chronological: a parent reads 6:30 to 10:45 down the left, then 10:45 to 16:30
	   down the right. DOM order is untouched either way, so a screen reader gets the
	   fourteen rows in sequence regardless.

	   `break-inside: avoid` keeps a row's hours and its description together; without
	   it a three-line description can be split across the column boundary from the
	   time it belongs to. */
	@media (min-width: 1024px) {
		/* NO `column-rule`. One was tried and removed on sight. Multicol balances by
		   HEIGHT, and `break-inside: avoid` stops it splitting a row, so with rows this
		   uneven (one line for „Podwieczorek", four for the 9:15 block) the two columns
		   land about a row apart, here 6 rows against 8. A rule is drawn down the full
		   column box, so it kept running past the shorter column's last row and pointed
		   straight at the ragged bottom. Without it the raggedness reads as ordinary
		   text setting, and the dashed row separators were already carrying the
		   structure the rule was meant to add. */
		.panel ul {
			columns: 2;
			column-gap: 56px;
		}

		.panel li {
			break-inside: avoid;
		}
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

	/* Footnote weight: regular, one step down, and separated by the same dashed rule the
	   rows use, so it reads as a qualifier on the list rather than a fifteenth row. Ink
	   rather than muted, because muted on tint-blue is the one pairing the v1.2 contrast
	   table does not clear at this size. */
	.uwaga {
		margin: 16px 0 0;
		padding-top: 16px;
		border-top: 1px dashed rgb(3 105 161 / 0.35);
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.55;
		color: var(--color-ink);
	}
</style>
