<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import 'ghostsui';

	const { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>stql</title>
</svelte:head>

<main>
	{@render children()}
</main>

<style>
	main {
		height: 100dvh;
		max-width: 1400px;
		margin: 0px auto;
		overflow: auto;

		@media only screen and (max-width: 1400px) {
			padding: 0px 16px;
		}
	}
</style>
