import { WHITESPACE, type TagNode, type TextNode } from './parse';

export function requiresQuotes(text: string) {
	for (const char of WHITESPACE) {
		if (text.includes(char)) {
			return true;
		}
	}

	return false;
}

export function createTextNode(value: string): TextNode {
	return {
		type: 'text',
		value,
		quoted: requiresQuotes(value),
	};
}

export function createTagNode(key: string, value: string): TagNode {
	if (requiresQuotes(key)) {
		throw new Error('Tag keys cannot contain whitespace');
	}

	return {
		type: 'tag',
		key: { type: 'text', value: key },
		value: createTextNode(value),
	};
}
