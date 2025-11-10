import { WHITESPACE, type TagNode, type TextNode } from './parse';

export function requiresQuotes(text: string) {
	for (const char of WHITESPACE) {
		if (text.includes(char)) {
			return true;
		}
	}

	return false;
}

/**
 * Creates a text node with the given value.
 *
 * Currently the value will be considered quoted if it
 * contains any whitespace. This may not be ideal, and so
 * may be changed in the future.
 *
 * @param value value for the text node
 * @returns a text node
 */
export function createTextNode(value: string): TextNode {
	return {
		type: 'text',
		value,
		quoted: requiresQuotes(value),
	};
}

/**
 * Creates a tag node with the given key and value.
 *
 * The key must not contain whitespace.
 *
 * The value is of course a text node, and will be passed
 * to {@link createTextNode} to be converted.
 *
 * @param key key/name for the tag
 * @param value value for the tag
 * @returns a tag node
 */
export function createTagNode(key: string, value: string): TagNode {
	if (requiresQuotes(key)) {
		throw new Error('Tag keys cannot contain whitespace');
	}

	return {
		type: 'tag',
		key,
		value: createTextNode(value),
	};
}
