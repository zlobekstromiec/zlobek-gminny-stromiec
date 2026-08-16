<script lang="ts">
	// Logowanie. INTENTIONALLY MINIMAL in this plan: Plan 03 replaces this file with
	// the real two-step e-mail-code form of 04.1-UI-SPEC.md Component Contract 2.
	// What exists here now is the landing surface the gate redirects to, so an
	// unauthenticated visitor meets a Polish explanation rather than a bare 404.
	//
	// DOM order follows Contract 2: h1, lead, status region, then (from Plan 03) the
	// step form. The expired-session notice is a NEUTRAL band panel, not a danger
	// panel: an expired session is expected, not a failure, and colouring it as an
	// error would teach editors to distrust a normal event.
	//
	// Reading url.searchParams is safe here only because src/routes/admin/+layout.ts
	// opts the whole panel out of prerendering.
	import { page } from '$app/state';

	const wygasla = $derived(page.url.searchParams.get('powod') === 'wygasla');
</script>

<h1>Panel redakcyjny</h1>
<p>Zaloguj się, aby edytować treści na stronie żłobka.</p>

{#if wygasla}
	<p class="pasmo">Twoja sesja wygasła. Zaloguj się ponownie.</p>
{/if}

<style>
	/* Neutral band panel: ink on --color-band measures 12.77:1 (AAA), and the
	   message is carried by its words alone, never by the colour. */
	.pasmo {
		background: var(--color-band);
		color: var(--color-ink);
		border-radius: var(--radius-md);
		padding: 16px;
	}
</style>
