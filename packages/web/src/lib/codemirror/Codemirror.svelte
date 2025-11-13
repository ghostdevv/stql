<script lang="ts">
	import type { WorkerShape } from '@valtown/codemirror-ts/worker';
	import { autocompletion } from '@codemirror/autocomplete';
	import { javascript } from '@codemirror/lang-javascript';
	import { editorTheme, highlightTheme } from './theme';
	import { EditorState } from '@codemirror/state';
	import * as Comlink from 'comlink';
	import { untrack } from 'svelte';
	import {
		defaultKeymap,
		history,
		historyKeymap,
		indentWithTab,
	} from '@codemirror/commands';
	import {
		bracketMatching,
		foldGutter,
		foldKeymap,
		indentOnInput,
		syntaxHighlighting,
	} from '@codemirror/language';
	import {
		highlightSelectionMatches,
		searchKeymap,
	} from '@codemirror/search';
	import {
		keymap,
		EditorView,
		lineNumbers,
		crosshairCursor,
		highlightActiveLine,
		highlightActiveLineGutter,
	} from '@codemirror/view';
	import {
		tsLinterWorker,
		tsHoverWorker,
		tsAutocompleteWorker,
		tsSyncWorker,
		tsFacetWorker,
	} from '@valtown/codemirror-ts';

	interface Props {
		value?: string;
		onChange?: (value: string) => unknown;
	}

	let { value = $bindable(''), onChange }: Props = $props();

	async function initialiseTSWorker() {
		const workerModule = new URL('./ts-worker.ts', import.meta.url);
		const rawWorker = new Worker(workerModule, { type: 'module' });
		const worker = Comlink.wrap(rawWorker) as WorkerShape;
		await worker.initialize();
		return worker;
	}

	function codemirror(worker: WorkerShape) {
		return (root: HTMLDivElement) => {
			const initialValue = untrack(() => value);

			const editor = new EditorView({
				parent: root!,
				state: EditorState.create({
					doc: untrack(() => initialValue),
					extensions: [
						editorTheme,
						history(),
						indentOnInput(),
						crosshairCursor(),
						lineNumbers(),
						foldGutter(),
						bracketMatching(),
						highlightActiveLine(),
						highlightActiveLineGutter(),
						highlightSelectionMatches(),
						javascript(),
						tsFacetWorker.of({ worker, path: 'index.js' }),
						tsSyncWorker(),
						tsLinterWorker(),
						autocompletion({ override: [tsAutocompleteWorker()] }),
						tsHoverWorker(),
						syntaxHighlighting(highlightTheme),
						EditorView.updateListener.of((newValue) => {
							value = newValue.state.doc.toString();
							onChange?.(value);
						}),
						keymap.of([
							...defaultKeymap,
							...searchKeymap,
							...historyKeymap,
							...foldKeymap,
							indentWithTab,
						]),
					],
				}),
			});

			$effect(() => {
				if (value !== editor.state.doc.toString()) {
					editor.dispatch({
						changes: {
							from: 0,
							to: editor.state.doc.length,
							insert: value,
						},
					});
				}
			});

			return () => {
				editor.destroy();
			};
		};
	}
</script>

{#await initialiseTSWorker()}
	<p>Loading...</p>
{:then worker}
	<div class="root" {@attach codemirror(worker)}></div>
{:catch error}
	<p>Error: {error.message}</p>
{/await}

<style>
	.root {
		width: 100%;
		max-width: 100%;
		height: 100%;
		overflow: auto;
		position: relative;
		border-radius: 12px;
	}
</style>
