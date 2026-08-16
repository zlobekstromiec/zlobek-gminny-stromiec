<script lang="ts">
	// The panel footer (04.1-UI-SPEC Component Contract 1): ONE line, 13px muted, on
	// the warm background. No columns, no logos, no BIP link, no contact block. The
	// panel is a tool, not a page of the website, and every extra link here is another
	// thing an editor can click by mistake while looking for the save button.
	//
	// Both strings come from src/lib/content/panel.ts.
	import { KOPIA_POWLOKA } from '$lib/content/panel';
</script>

<footer class="stopka">
	<p>
		{KOPIA_POWLOKA.stopka}
		<a href="/admin/pomoc">{KOPIA_POWLOKA.stopkaLink}</a>
	</p>
</footer>

<style>
	.stopka {
		padding: 24px 0;
	}

	.stopka p {
		margin: 0;
		font-family: var(--font-body);
		font-size: 13px;
		font-weight: 400;
		line-height: 1.4;
		color: var(--color-muted);
	}

	/* brand-blue at 5.93:1 on white and about 5.5:1 on the warm background, AND
	   underlined: a link is never signalled by colour alone. */
	.stopka a {
		color: var(--color-brand-blue);
		text-decoration: underline;
	}

	.stopka a:hover {
		color: var(--color-brand-blue-hover);
	}
</style>
