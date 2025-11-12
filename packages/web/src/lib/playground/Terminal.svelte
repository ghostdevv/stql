<script lang="ts" module>
	export const ClearTerminal = Symbol.for('ClearTerminal');
	export type TerminalStreamValue = string | typeof ClearTerminal;
</script>

<script lang="ts">
	import type { FitAddon } from '@xterm/addon-fit';
	import type { Terminal } from '@xterm/xterm';
	import { browser } from '$app/environment';
	import '@xterm/xterm/css/xterm.css';

	interface Props {
		stream: ReadableStream<TerminalStreamValue>;
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
			fitAddon.fit();

			function resize() {
				fitAddon.fit();
			}

			const resizeObserver = new ResizeObserver(resize);
			resizeObserver.observe(node);

			const ABORT_REASON = 'terminal component destroyed';
			const abortController = new AbortController();

			const writer = new WritableStream<TerminalStreamValue>({
				write(data) {
					if (data === ClearTerminal) {
						// workaround due to this not being released yet
						// https://github.com/xtermjs/xterm.js/pull/5224
						// terminal.write(`\x1b[${terminal.rows};1H`);
						// terminal.write('\n'.repeat(terminal.rows));
						// terminal.write('\x1b[2J\x1b[H');
						terminal.writeln(
							'\x1b[3m\x1b[90mTerminal "cleared"\x1b[0m\n',
						);
					} else {
						terminal.write(data);
					}
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
				resizeObserver.disconnect();
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
		<div {@attach terminal(mod)}></div>
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
