<script lang="ts">
	// Friendly Polish error page (D-08). Renders for any thrown error/404, most
	// importantly an unknown /aktualnosci/[slug] (a deleted or mistyped post). Reads
	// the status/message from the `page` rune ($app/state — NOT the deprecated
	// $app/stores, consistent with the nav shell). Prerender-friendly and zero-JS:
	// no client fetch, only static links back into the site. Copy rules: no emoji,
	// no em dashes; Polish only.
	import { page } from '$app/state';

	const is404 = $derived(page.status === 404);
	const heading = $derived(is404 ? 'Nie znaleziono strony' : 'Wystąpił błąd');
	const body = $derived(
		is404
			? 'Strona, której szukasz, nie istnieje lub została przeniesiona. Sprawdź adres albo wróć na stronę główną.'
			: 'Coś poszło nie tak podczas ładowania strony. Spróbuj ponownie za chwilę lub wróć na stronę główną.'
	);
</script>

<header class="page-head">
	<div class="inner narrow">
		<p class="status">Błąd {page.status}</p>
		<h1>{heading}</h1>
		<p class="lead">{body}</p>
		<p class="links">
			<a href="/">Strona główna</a>
			<a href="/aktualnosci">Aktualności</a>
		</p>
	</div>
</header>

<style>
	.page-head {
		background: var(--color-surface);
		padding-block: 48px;
	}

	@media (min-width: 1024px) {
		.page-head {
			padding-block: 64px;
		}
	}

	.inner {
		max-width: 72rem;
		margin-inline: auto;
		padding-inline: 16px;
	}

	.inner.narrow {
		max-width: 52rem;
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

	.status {
		font-family: var(--font-body);
		font-size: 14px;
		font-weight: 700;
		line-height: 1.4;
		color: var(--color-muted);
		margin: 0 0 8px;
	}

	h1 {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(2rem, 5vw, 2.75rem);
		line-height: 1.1;
		color: var(--color-ink);
		margin: 0 0 16px;
	}

	.lead {
		font-family: var(--font-body);
		font-size: 19px;
		line-height: 1.55;
		color: var(--color-muted);
		max-width: 56ch;
		margin: 0 0 24px;
	}

	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 24px;
		margin: 0;
	}

	.links a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		font-family: var(--font-body);
		font-size: 16px;
		font-weight: 700;
		color: var(--color-brand-blue);
		text-decoration: underline;
	}

	.links a:hover {
		color: var(--color-brand-blue-hover);
	}
</style>
