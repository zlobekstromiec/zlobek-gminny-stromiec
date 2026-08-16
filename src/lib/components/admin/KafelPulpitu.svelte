<script lang="ts">
	// One entry card on the pulpit (04.1-UI-SPEC Component Contract 3).
	//
	// THE WHOLE CARD IS ONE LINK, and everything the card says lives inside that link, so
	// a screen-reader user who arrives on it hears the description and the current state
	// as part of the card rather than having to hunt for them. That is the same „meta
	// inside the link" rule the collection rows already follow.
	//
	// ITS ACCESSIBLE NAME IS THE HEADING AND NOTHING ELSE. Without `aria-labelledby` the
	// name would be the heading plus the description plus the count, which turns a list of
	// six cards into six sentences to listen through before choosing one. The description
	// stays inside the anchor and is still read as its content; only the NAME is narrowed.
	//
	// NO HOVER RAISE AND NO SHADOW CHANGE, deliberately, and this is the density half of
	// D-19: the public site's cards lift because they are an invitation, and a tool that
	// bounces under the cursor is a tool that distracts. Hover darkens the border and
	// underlines the heading; focus is the global ring on the link.
	//
	// This file carries NO visible string. Every word arrives as a prop from a page that
	// read it out of src/lib/content/panel.ts, so the Polish-only sweep governs it.
	let {
		cel,
		tytul,
		opis,
		stan
	}: {
		/** Destination path, for example `/admin/aktualnosci`. */
		cel: string;
		/** Card heading, and the card link's whole accessible name. */
		tytul: string;
		/** One Polish sentence saying what this section is for. */
		opis: string;
		/** Optional count or current-state line, for the three cards where one is
		 *  meaningful. Absent on the other three rather than rendered empty: a card
		 *  showing a blank line reads as a card that failed to load something. */
		stan?: string;
	} = $props();

	// Generated per instance, so six cards on one screen cannot collide on an id and no
	// caller has to invent one.
	const idNaglowka = $props.id();
</script>

<li class="kafel">
	<a class="link" href={cel} aria-labelledby={idNaglowka}>
		<h2 class="tytul" id={idNaglowka}>{tytul}</h2>
		<p class="opis">{opis}</p>
		{#if stan}
			<p class="stan">{stan}</p>
		{/if}
	</a>
</li>

<style>
	/* The list item is only a grid cell. The card itself is the link, so the whole card
	   area is the target and hover and focus need no forwarding. */
	.kafel {
		display: flex;
	}

	.link {
		display: flex;
		flex-direction: column;
		gap: 8px;
		box-sizing: border-box;
		width: 100%;
		padding: 16px;
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		text-decoration: none;
		transition: border-color 150ms ease;
	}

	@media (min-width: 768px) {
		.link {
			padding: 24px;
		}
	}

	.link:hover {
		border-color: var(--color-border-strong);
	}

	.link:hover .tytul {
		text-decoration: underline;
	}

	/* 20px Baloo, the inherited card-title sub-step, in brand-blue at 5.93:1 on white. */
	.tytul {
		margin: 0;
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 700;
		line-height: 1.2;
		color: var(--color-brand-blue);
	}

	.opis {
		margin: 0;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-muted);
	}

	/* Ink rather than muted: a count or a current state is the answer to a question the
	   editor came with, not a caption. Never colour-coded, so „nabór zamknięty" cannot
	   read as a failure (UI-SPEC Color hard rule 1). */
	.stan {
		margin: 0;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-ink);
	}

	@media (prefers-reduced-motion: reduce) {
		.link {
			transition: none;
		}
	}
</style>
