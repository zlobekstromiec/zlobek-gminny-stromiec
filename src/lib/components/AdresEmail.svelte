<script lang="ts">
	// JEDYNE miejsce w projekcie, które renderuje adres e-mail żłobka (quick 260901-duo,
	// D-2). Sześć powierzchni czyta stąd: karta kontaktowa na stronie głównej, karta na
	// /kontakt, stopka, panel awaryjny i furtki awaryjne obu wysp formularzy.
	//
	// Po co: adres `publicznyzlobek@ugstromiec.pl` łamał się w środku domeny i zostawiał
	// osierocone „ec.pl" w drugim wierszu, bo `.item-link` niesie `overflow-wrap: anywhere`,
	// czyli zgodę na złamanie w DOWOLNYM miejscu. Znacznik `<wbr>` po małpie wskazuje
	// przeglądarce jedyną sensowną granicę, a łamanie w granicy jawnie dozwolonej ma
	// pierwszeństwo przed łamaniem awaryjnym. `<wbr>` nie wstawia do tekstu żadnego znaku,
	// więc rodzic nadal kopiuje adres jako jeden ciąg. `&shy;` wklejałby dywiz, `<br>`
	// łamałby zawsze, a mniejszy stopień pisma jest wykluczony: to adres publiczny podmiotu
	// publicznego (D-1).
	//
	// Komponent nie przyjmuje żadnych własności i sam czyta stałą z `site.ts`, więc adres
	// nie może zostać przepisany ręcznie w miejscu wywołania ani podany z zewnątrz
	// (zagrożenia T-duo-01 i T-duo-02: widoczny tekst i `href` mają jedno źródło).
	//
	// Renderowany jest POJEDYNCZY element opakowujący, i to jest wiążące: `.item-link`
	// oraz `.awaria-kontakt a` są `display: inline-flex`, więc gołe `<wbr>` stałoby się
	// tam osobnym elementem elastycznym, przy domyślnym `flex-wrap: nowrap` trafiłoby z
	// tekstem do jednego nieprzełamywalnego wiersza i wypchnęłoby adres poza kontener,
	// czyli dałoby poziome przewijanie zakazane przez WCAG 1.4.10.
	//
	// Bez bloku `style`: klasa `adres-email` jest wyłącznie uchwytem dla bramki
	// tests/adres-email.spec.ts, a wygląd nadal należy do rodzica i dziedziczy się normalnie.
	import { contact } from '$lib/content/site';

	const malpa = contact.email.lastIndexOf('@');
	const przedMalpa = malpa === -1 ? contact.email : contact.email.slice(0, malpa + 1);
	const domena = malpa === -1 ? '' : contact.email.slice(malpa + 1);
</script>

<!-- Trzy części znacznika MUSZĄ stać w jednej linii pliku: nowa linia między nimi stanie
     się w Svelte spacją w tekście i adres przestanie być kopiowalny jako jeden ciąg. -->
{#if domena}
	<span class="adres-email">{przedMalpa}<wbr />{domena}</span>
{:else}
	<!-- Adres bez małpy jest niepodzielny, więc dzielenie go byłoby bez sensu. Ta gałąź
	     istnieje po to, żeby zmiana stałej nie mogła wywrócić strony. -->
	<span class="adres-email">{contact.email}</span>
{/if}
