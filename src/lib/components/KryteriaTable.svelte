<script lang="ts">
	// Kryteria i punktacja table (RECRUIT-01; 04-UI-SPEC.md Amendment v1.4 Component
	// Contract 10). A REAL table, because the content is a real two-dimensional data
	// set: a criterion and the number of points it awards. A styled list would look
	// the same and tell a screen-reader user nothing about the relationship.
	//
	// Accessibility contract, all three parts mandatory:
	//  1. a VISIBLE caption, so the table has a name for everyone and not only for
	//     assistive technology;
	//  2. one `th scope="col"` per column in the head;
	//  3. one `th scope="row"` per criterion, so the points cell is announced with the
	//     criterion it belongs to.
	//
	// The table is deliberately NOT wrapped in a horizontally scrolling container.
	// Two columns fit a small viewport as long as the criterion column wraps, and a
	// scrolling wrapper without `tabindex="0"` plus a labelled region role would be
	// unreachable by keyboard, which trades one problem for a worse one. If a third
	// column is ever added, the wrapper AND its focusable labelled region must be
	// added together.
	//
	// Colours come from the locked contract and are not re-derived here: the criterion
	// text is `ink` (14.65:1 on white), the points value is `accent-active` (5.02:1 on
	// white, the only accessible amber), and the zebra stripe is a decorative warm
	// surface that carries no information.
	import type { Kryterium } from '$lib/content/rekrutacja';
	import { REMIS } from '$lib/content/rekrutacja';

	let { kryteria, caption }: { kryteria: Kryterium[]; caption: string } = $props();
</script>

<div class="tabela-blok">
	<table>
		<caption>{caption}</caption>
		<thead>
			<tr>
				<th scope="col">Kryterium</th>
				<th scope="col" class="punkty">Liczba punktów</th>
			</tr>
		</thead>
		<tbody>
			{#each kryteria as wiersz (wiersz.kryterium)}
				<tr>
					<th scope="row">{wiersz.kryterium}</th>
					<td class="punkty">{wiersz.punkty}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<!-- The tie-break rule applies to the whole table rather than to any one row, so
	     it is ordinary prose beneath it and not an extra column or a footer row. -->
	<p class="remis">{REMIS}</p>
</div>

<style>
	.tabela-blok {
		max-width: 46rem;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	caption {
		margin-bottom: 8px;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 700;
		line-height: 1.5;
		color: var(--color-muted);
		text-align: left;
	}

	th,
	td {
		padding: 12px 16px;
		border-bottom: 1px solid var(--color-border-subtle);
		text-align: left;
		vertical-align: top;
	}

	thead th {
		font-family: var(--font-body);
		font-size: 14px;
		font-weight: 700;
		line-height: 1.4;
		color: var(--color-ink);
	}

	tbody th {
		font-family: var(--font-body);
		font-size: 16px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-ink);
	}

	/* Points column: display face, right aligned so the numbers line up, and never
	   wrapped, because a value split across two lines stops reading as one number. */
	.punkty {
		text-align: right;
		white-space: nowrap;
	}

	tbody td.punkty {
		font-family: var(--font-display);
		font-size: 17px;
		font-weight: 700;
		line-height: 1.2;
		color: var(--color-accent-active);
	}

	/* Decorative only: the stripe carries no information, so nothing is lost when it
	   is not perceived. */
	tbody tr:nth-child(odd) {
		background: var(--color-surface-warm);
	}

	.remis {
		margin: 16px 0 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-muted);
	}
</style>
