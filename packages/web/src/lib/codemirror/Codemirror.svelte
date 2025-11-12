<script lang="ts">
	import { autocompletion } from '@codemirror/autocomplete';
	import { javascript } from '@codemirror/lang-javascript';
	import { editorTheme, highlightTheme } from './theme';
	import { EditorState } from '@codemirror/state';
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

	interface Props {
		value?: string;
		onChange?: (value: string) => unknown;
	}

	let { value = $bindable(''), onChange }: Props = $props();

	function codemirror(root: HTMLDivElement) {
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
					autocompletion(),
					javascript(),
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
	}
</script>

<div class="root" {@attach codemirror}></div>

<style>
	.root {
		width: 100%;
		max-width: 100%;
		height: 100%;
		overflow: auto;
		position: relative;
	}
</style>
