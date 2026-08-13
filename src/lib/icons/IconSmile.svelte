<script lang="ts">
	// Bespoke duotone icon (UI-SPEC v1.2 §7). KeyFacts: wiek dzieci.
	let { size = 24 }: { size?: number } = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
	focusable="false"
>
	<circle cx="12" cy="12" r="9" fill="var(--icon-fill, none)" />
	<circle cx="9" cy="10" r="0.75" fill="currentColor" stroke="none" />
	<circle cx="15" cy="10" r="0.75" fill="currentColor" stroke="none" />
	<path d="M8.5 14 Q12 17 15.5 14" />
</svg>
