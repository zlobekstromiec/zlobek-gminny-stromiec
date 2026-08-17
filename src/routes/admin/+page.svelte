<script lang="ts">
	// The pulpit: the landing screen after login (04.1-UI-SPEC Component Contract 3).
	//
	// ITS JOB IS ONE QUESTION, answered for somebody who opens this twice a month and is
	// afraid of breaking the website: what can I change here, and what state is it in
	// right now? Hence one card per editable area, each with a plain sentence, and a count
	// or a current state on the three where one exists.
	//
	// THE CARDS ARE WRITTEN OUT, not looped over a list. A loop would need a list of
	// objects pairing a label with a path with an optional value, and the three cards that
	// carry a value each carry a DIFFERENT KIND of value: two counts and one state
	// sentence. Written out, each card names its own destination beside its own words and
	// a reader can check any single one of them without holding the others in mind.
	//
	// CENNIK DELIBERATELY CARRIES NO STATE LINE (05-UI-SPEC Contract 12). A fee amount
	// rendered here would be a third place the same number has to stay correct, and this
	// is the one screen nobody would think to check after changing it.
	//
	// Every visible string comes from src/lib/content/panel.ts. Not one is typed here, and
	// the two counts and the state sentence are built by that module's own functions, so
	// no page ever concatenates copy inline.
	import KafelPulpitu from '$lib/components/admin/KafelPulpitu.svelte';
	import { KOPIA_PULPIT, liczbaDokumentow, liczbaWpisow, obecnieNabor } from '$lib/content/panel';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="naglowek-strony">
	<h1 class="naglowek">{KOPIA_PULPIT.naglowek}</h1>
	<p class="lead">{KOPIA_PULPIT.lead}</p>
</div>

<ul class="kafle">
	<KafelPulpitu
		cel="/admin/aktualnosci"
		tytul={KOPIA_PULPIT.aktualnosciTytul}
		opis={KOPIA_PULPIT.aktualnosciOpis}
		stan={liczbaWpisow(data.liczbaWpisow)}
	/>
	<KafelPulpitu cel="/admin/o-nas" tytul={KOPIA_PULPIT.oNasTytul} opis={KOPIA_PULPIT.oNasOpis} />
	<KafelPulpitu
		cel="/admin/plan-dnia"
		tytul={KOPIA_PULPIT.planDniaTytul}
		opis={KOPIA_PULPIT.planDniaOpis}
	/>
	<KafelPulpitu
		cel="/admin/cennik"
		tytul={KOPIA_PULPIT.cennikTytul}
		opis={KOPIA_PULPIT.cennikOpis}
	/>
	<KafelPulpitu
		cel="/admin/dokumenty"
		tytul={KOPIA_PULPIT.dokumentyTytul}
		opis={KOPIA_PULPIT.dokumentyOpis}
		stan={liczbaDokumentow(data.liczbaDokumentow)}
	/>
	<KafelPulpitu
		cel="/admin/nabor"
		tytul={KOPIA_PULPIT.naborTytul}
		opis={KOPIA_PULPIT.naborOpis}
		stan={obecnieNabor(data.naborOtwarty)}
	/>
	<KafelPulpitu cel="/admin/pomoc" tytul={KOPIA_PULPIT.pomocTytul} opis={KOPIA_PULPIT.pomocOpis} />
</ul>

<style>
	/* Title and lead are one block, 8px apart. The 24px that separates the block from the
	   card grid belongs to the column, not to the heading. */
	.naglowek-strony {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	/* The panel h1 reuses the LOCKED h2 clamp, one step down the inherited scale. A
	   role reassignment inside the scale, never a fifth size (UI-SPEC Typography). */
	.naglowek {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 3vw, 1.75rem);
		font-weight: 700;
		line-height: 1.2;
		color: var(--color-ink);
	}

	/* 24px from the page header to the first thing under it, the panel's density step
	   down from the public site's 32px. */
	.lead {
		margin: 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 16px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-ink);
	}

	/* One column, two at the medium breakpoint, three at the large one, 24px gap. A list
	   rather than a bare grid of anchors: these navigation choices are a set, and a screen
	   reader announcing how many items the list holds tells the editor how much there is to
	   choose between before they start listening to it. */
	.kafle {
		display: grid;
		grid-template-columns: 1fr;
		gap: 24px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	@media (min-width: 768px) {
		.kafle {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.kafle {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
