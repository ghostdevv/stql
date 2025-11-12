import { HighlightStyle } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { tags } from '@lezer/highlight';

export const editorTheme = EditorView.theme(
	{
		'&': {
			height: '100%',
			color: 'var(--text)',
			backgroundColor: 'var(--background-secondary)',
		},
		'.cm-gutters': {
			background: 'var(--background-secondary)',
			borderRight: '1px solid var(--primary)',
		},
		'&.cm-focused .cm-selectionBackground, ::selection': {
			backgroundColor: 'rgba(var(--primary-rgb), 0.2)',
		},
		'.cm-activeLine': {
			backgroundColor: 'var(--background-tertiary)',
		},
		'.cm-selectionMatch': {
			backgroundColor: 'rgba(var(--primary-rgb), 0.4)',
		},
		'&.ctrl-hold .cm-link:hover span': {
			color: '#f06897 !important',
		},
	},
	{ dark: true },
);

export const highlightTheme = HighlightStyle.define([
	{
		tag: [tags.meta, tags.contentSeparator],
		color: 'rgba(var(--text-rgb), 0.5)',
	},
	{ tag: tags.link },
	{ tag: tags.heading, fontWeight: 'bold' },
	{ tag: tags.emphasis, fontStyle: 'italic' },
	{ tag: tags.strong, fontWeight: 'bold' },
	{ tag: tags.strikethrough, textDecoration: 'line-through' },
	{ tag: tags.keyword, color: '#be95ff' },
	{ tag: [tags.atom, tags.url], color: '#78a9ff' },
	{ tag: tags.labelName, color: '#fff' },
	{ tag: [tags.literal, tags.inserted, tags.bool], color: '#f06897' },
	{ tag: [tags.string, tags.deleted], color: '#f29e74' },
	{ tag: [tags.regexp, tags.escape], color: '#92e1c7' },
	{ tag: tags.special(tags.string), color: '#be95ff' },
	{ tag: tags.definition(tags.variableName), color: '#eee' },
	{
		tag: tags.function(tags.definition(tags.variableName)),
		color: '#9ef0f0',
	},
	{ tag: tags.function(tags.variableName), color: '#9ef0f0' },
	{ tag: tags.variableName, color: '#eee' },
	{ tag: [tags.definitionOperator, tags.operator], color: '#f29e74' },
	{ tag: [tags.typeName], color: '#78a9ff' },
	{ tag: [tags.className, tags.definition(tags.typeName)], color: '#73d0ff' },
	{ tag: tags.definition(tags.propertyName), color: '#eee' },
	{ tag: tags.comment, color: '#5c6773' },
	{ tag: tags.invalid, color: 'var(--red)' },
]);
