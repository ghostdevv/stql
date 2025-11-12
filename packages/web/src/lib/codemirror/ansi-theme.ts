import { EditorView } from '@codemirror/view';

export const ansiTheme = EditorView.theme(
	{
		'.cm-ansi-yellow': {
			color: '#f29e74',
		},
		'.cm-ansi-magenta': {
			color: '#f06897',
		},
	},
	{ dark: true },
);
