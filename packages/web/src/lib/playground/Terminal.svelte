<script lang="ts">
	import type { FitAddon } from '@xterm/addon-fit';
	import type { Terminal } from '@xterm/xterm';
	import { browser } from '$app/environment';
	import '@xterm/xterm/css/xterm.css';

	interface Props {
		stream: ReadableStream<string>;
	}

	const { stream }: Props = $props();

	interface Mod {
		Terminal: typeof Terminal;
		FitAddon: typeof FitAddon;
	}

	async function importXterm() {
		if (!browser) {
			return Promise.reject('continue in browser');
		}

		const [xterm, fit] = await Promise.all([
			import('@xterm/xterm'),
			import('@xterm/addon-fit'),
		]);

		return {
			Terminal: xterm.Terminal,
			FitAddon: fit.FitAddon,
		};
	}

	function terminal(mod: Mod) {
		return (node: HTMLDivElement) => {
			const terminal = new mod.Terminal({
				convertEol: true,
				theme: {
					background: '#212123',
					yellow: '#f29e74',
					magenta: '#f06897',
					red: '#f26c4b',
				},
			});

			const fitAddon = new mod.FitAddon();
			terminal.loadAddon(fitAddon);

			terminal.open(node);
			resize();

			function resize() {
				fitAddon.fit();
			}

			node.addEventListener('resize', resize);

			const ABORT_REASON = 'terminal component destroyed';
			const abortController = new AbortController();

			const writer = new WritableStream<string>({
				write(data) {
					console.log('writing', data);
					terminal.write(data);
				},
			});

			stream
				.pipeTo(writer, { signal: abortController.signal })
				.catch((error) => {
					if (!`${error}`.includes(ABORT_REASON)) {
						console.error('Stream pipe error:', error);
					}
				});

			return () => {
				node.removeEventListener('resize', resize);
				terminal.dispose();
				fitAddon.dispose();
				abortController.abort(ABORT_REASON);
			};
		};
	}
</script>

<div class="terminal-wrapper">
	{#await importXterm()}
		<p>Loading terminal...</p>
	{:then mod}
		<div style="display: contents;" {@attach terminal(mod)}></div>
	{:catch error}
		<div>Error loading terminal: {error.message}</div>
	{/await}
</div>

<style>
	.terminal-wrapper {
		background-color: var(--background-secondary);
		border-radius: 12px;
		padding: 12px;
	}
</style>
