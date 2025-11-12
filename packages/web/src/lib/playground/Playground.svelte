<script lang="ts">
	import Codemirror from '$lib/codemirror/Codemirror.svelte';
	import { PaneGroup, Pane, PaneResizer } from 'paneforge';
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
	<PaneGroup direction="horizontal">
		<Pane defaultSize={50} collapsible minSize={10}>
			<Codemirror bind:value={code} />
		</Pane>
		<PaneResizer />
		<Pane defaultSize={50} collapsible minSize={10}>
			<Terminal stream={runner.terminalStream} />
		</Pane>
	</PaneGroup>
</div>

<style>
	.playground {
		display: contents;

		:global([data-pane-resizer]) {
			width: 12px;
			position: relative;

			&:after {
				content: '';
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);

				display: block;
				width: 6px;
				height: 32px;

				border-radius: 12px;
				background-color: var(--background-tertiary);
			}
		}

		:global([data-pane]) {
			max-height: 500px;
		}
	}
</style>
