<script lang="ts">
	import { javascript } from '@codemirror/lang-javascript';
	import { editorTheme, highlightTheme } from './theme';
	import { EditorState } from '@codemirror/state';
	import { ansiTheme } from './ansi-theme';
	import { untrack } from 'svelte';
	import { ansi } from './ansi';
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
		terminal?: boolean;
	}

	let { value = $bindable(''), ...props }: Props = $props();

	function codemirror(root: HTMLDivElement) {
		const terminal = untrack(() => props.terminal);
		const initialValue = untrack(() => value);

		const editor = new EditorView({
			parent: root!,
			scrollTo: terminal
				? EditorView.scrollIntoView(initialValue.length, { y: 'end' })
				: undefined,
			state: EditorState.create({
				doc: untrack(() => initialValue),
				extensions: terminal
					? [
							editorTheme,
							ansiTheme,
							ansi(),
							syntaxHighlighting(highlightTheme),
							EditorState.readOnly.of(true),
							EditorView.editable.of(false),
							EditorView.contentAttributes.of({ tabindex: '0' }),
						]
					: [
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
							syntaxHighlighting(highlightTheme),
							EditorView.updateListener.of((newValue) => {
								value = newValue.state.doc.toString();
								props.onChange?.(value);
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

				if (terminal) {
					editor.dispatch({
						effects: [
							EditorView.scrollIntoView(editor.state.doc.length, {
								y: 'end',
							}),
						],
					});
				}
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
