<script lang="ts">
	import Codemirror from '$lib/codemirror/Codemirror.svelte';
	import Terminal from './Terminal.svelte';
	import { Runner } from './runner.svelte';
	import { onDestroy } from 'svelte';
	import { Debounced } from 'runed';

	interface Props {
		defaultCode: string;
	}

	const props: Props = $props();
	const runner = new Runner();

	let code = $state(props.defaultCode);
	const debouncedCode = new Debounced(() => code, 500);

	$effect(() => {
		runner.run(debouncedCode.current);
	});

	onDestroy(() => {
		runner.cleanup();
	});
</script>

<div class="playground">
	<Codemirror bind:value={code} />
	<!-- <Codemirror terminal value={terminalContent} /> -->
	<Terminal stream={runner.terminalStream} />
</div>

<style>
	.playground {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr;
		gap: 12px;

		height: 100%;
		max-height: 500px;
	}
</style>
