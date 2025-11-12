<script lang="ts">
	import Codemirror from '$lib/codemirror/Codemirror.svelte';
	import { printAnsi } from './print-ansi';
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
	let { messages } = $derived(runner.run(debouncedCode.current));

	let terminalContent = $derived(
		messages
			.map((message) => {
				if (message.type === 'console') {
					return message.args.map(printAnsi).join(' ');
				}

				return `\x1B[41m${message.message}\x1B[0m`;
			})
			.join('\n\n'),
	);

	onDestroy(() => {
		runner.cleanup();
	});
</script>

<div class="playground">
	<Codemirror bind:value={code} />
	<Codemirror terminal value={terminalContent} />
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
