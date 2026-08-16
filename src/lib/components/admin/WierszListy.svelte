<script lang="ts">
	// One row of a collection list (04.1-UI-SPEC Component Contract 4, Interaction and
	// States table).
	//
	// THE PRIMARY LINK'S TEXT IS THE ENTRY TITLE, never the word „Edytuj". A list of eight
	// links all called „Edytuj" gives a screen-reader user, who can pull up a list of the
	// links on a page, eight identical entries and no way to tell them apart, which is a
	// WCAG 2.4.4 failure. The meta line sits INSIDE the same anchor so it is announced
	// with the title, which is the rule the public document rows already follow.
	//
	// The two row actions carry a VISUALLY HIDDEN suffix naming the entry, for the same
	// reason, because „Edytuj" and „Usuń" repeat on every row and their visible label
	// cannot carry the name without shouting it eight times down the page.
	//
	// „USUŃ" IS A LINK TO A CONFIRMATION PAGE AND NEVER A CONTROL THAT DELETES. This file
	// contains no submit control and no posting element at all, deliberately and
	// permanently: a destructive control sitting in a list is one mis-tap from a lost
	// post, and a destructive control a browser may prefetch is the same thing without
	// even the mis-tap. The deletion itself is a POST on the confirmation page
	// (Contract 11), which nothing can follow by accident.
	//
	// The two element names that rule bans are deliberately NOT spelled out above: the
	// acceptance gate for this file is a literal grep, and a comment naming them would
	// make it permanently red. The same wording problem was already solved this way in
	// 04-02, 04.1-02 and 04.1-03.
	//
	// This file carries NO visible string. Every label, the badge word and the hidden
	// suffix arrive from a page that read them out of src/lib/content/panel.ts.
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import OdznakaZastepcza from './OdznakaZastepcza.svelte';

	let {
		tytul,
		meta,
		celEdycji,
		celUsuniecia,
		etykietaEdytuj,
		etykietaUsun,
		dopowiedzenie,
		zastepcza = false,
		etykietaOdznaki
	}: {
		tytul: string;
		/** Polish date, or the document meta line. Rendered inside the primary link. */
		meta: string;
		celEdycji: string;
		celUsuniecia: string;
		etykietaEdytuj: string;
		etykietaUsun: string;
		/** Visually hidden suffix naming this entry, for example „ wpis: Dzień otwarty". */
		dopowiedzenie: string;
		zastepcza?: boolean;
		/** Required whenever `zastepcza` is set; the badge carries no word of its own. */
		etykietaOdznaki?: string;
	} = $props();
</script>

<li class="wiersz">
	<a class="glowny" href={celEdycji}>
		<span class="tytul">{tytul}</span>
		<span class="meta">{meta}</span>
	</a>

	{#if zastepcza && etykietaOdznaki}
		<OdznakaZastepcza etykieta={etykietaOdznaki} />
	{/if}

	<span class="akcje">
		<a class="akcja edytuj" href={celEdycji}>
			<Pencil size={18} aria-hidden="true" focusable="false" />
			<span>{etykietaEdytuj}</span><span class="visually-hidden">{dopowiedzenie}</span>
		</a>
		<a class="akcja usun" href={celUsuniecia}>
			<Trash2 size={18} aria-hidden="true" focusable="false" />
			<span>{etykietaUsun}</span><span class="visually-hidden">{dopowiedzenie}</span>
		</a>
	</span>
</li>

<style>
	/* 48px minimum height and 12px by 16px padding, the panel density row. Wraps below the
	   small breakpoint so the actions drop under the title instead of squeezing it to one
	   word per line on a phone. */
	.wiersz {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px;
		box-sizing: border-box;
		min-height: 48px;
		padding: 12px 16px;
	}

	/* The 1px separator BETWEEN rows is declared by the list, not here. Two instances of
	   this component are never siblings inside its own stylesheet, so a rule written here
	   would be scoped away and silently do nothing; the compiler says so out loud. The
	   separator is a property of the list anyway, which is why it belongs to the page that
	   owns the list element. */

	/* The title and its meta are one link and one accessible name. `flex: 1` makes it take
	   the free width so the actions sit at the right edge on a wide screen. */
	.glowny {
		display: flex;
		flex: 1 1 16rem;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
		min-height: 44px;
		justify-content: center;
		text-decoration: none;
	}

	.tytul {
		font-family: var(--font-body);
		font-size: 16px;
		font-weight: 700;
		line-height: 1.5;
		color: var(--color-brand-blue);
		text-decoration: underline;
	}

	.glowny:hover .tytul {
		color: var(--color-brand-blue-hover);
	}

	/* Nunito 400 15px muted, 7.58:1 on white. Not a link colour of its own: it is part of
	   the same link and must not look like a second target. */
	.meta {
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-muted);
	}

	.akcje {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px;
	}

	/* Each action is its own 44 by 44 target, which is why the padding is here and not on
	   the container: a finger aiming at „Usuń" must not be able to land on „Edytuj". */
	.akcja {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		box-sizing: border-box;
		min-width: 44px;
		min-height: 44px;
		padding: 12px;
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: 14px;
		font-weight: 700;
		line-height: 1.4;
		text-decoration: underline;
	}

	.akcja.edytuj {
		color: var(--color-brand-blue);
	}

	.akcja.edytuj:hover {
		color: var(--color-brand-blue-hover);
	}

	/* Danger text, 6.47:1 on white. The row action is NOT a danger button: it opens a
	   page, and painting it as a filled destructive control would promise an action it
	   does not perform. */
	.akcja.usun {
		color: var(--color-danger);
	}

	.akcja.usun:hover {
		background: var(--color-danger-surface);
	}

	/* Local utility, copied per component exactly as every other component in this repo
	   does (there is no global utility layer for it). */
	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		border: 0;
	}
</style>
