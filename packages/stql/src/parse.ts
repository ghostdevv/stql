/**
 * Represents text in the tree.
 */
export interface TextNode {
	/**
	 * This is a text node!
	 */
	type: 'text';

	/**
	 * The plain value of the text node. Will not
	 * include any quotes present in the original string,
	 * but will contain bookend-ed whitespace, if any.
	 */
	value: string;

	/**
	 * Whether or not the text is quoted when
	 * represented in the printed stql string.
	 *
	 * This is primarily useful for printing,
	 * so that strings can be properly represented
	 * or escaped. However, you could also use it
	 * to specify non-fuzzy search text. It's up
	 * to you.
	 */
	quoted: boolean;
}

/**
 * Represents a tag in the tree.
 */
export interface TagNode {
	/**
	 * This is a tag node!
	 */
	type: 'tag';

	/**
	 * The name/identifier of the tag.
	 * Must not contain any whitespace, or be quoted.
	 */
	key: string;

	/**
	 * The {@link TextNode} representing the tag's value
	 */
	value: TextNode;
}

/**
 * Any node
 */
export type Node = TextNode | TagNode;

/**
 * The result of parsing an stql query.
 */
export interface ParseResult {
	/**
	 * The node "tree" distilled from the stql query.
	 */
	nodes: Node[];
}

export const WHITESPACE = [' ', '\t', '\n', '\r'];

/**
 * Parse stql query into its parts.
 *
 * @param input query to parse
 * @returns parse result object
 */
export function parse(input: string): ParseResult {
	const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
	const segments = Array.from(segmenter.segment(input));
	const nodes: Node[] = [];

	let last: number | null = null;
	let quoted = false;
	let tag = false;

	function pushText(text: string, quoted: boolean) {
		const lastNode = nodes.at(-1);

		if (lastNode?.type === 'text' && !(quoted || lastNode.quoted)) {
			lastNode.value += text;
		} else {
			nodes.push({
				type: 'text',
				value: text,
				quoted,
			});
		}
	}

	function pushLast(current?: number, quoted = false) {
		if (last !== null) {
			const text = input.slice(last, current);
			const lastNode = nodes.at(-1);

			if (lastNode?.type === 'tag' && tag) {
				lastNode.value = { type: 'text', value: text, quoted };
				tag = false;
			} else {
				pushText(text, quoted);
			}

			last = null;
		}
	}

	for (let si = 0; si < segments.length; si++) {
		const s = segments[si];

		if (s.segment === '"') {
			// ending quote
			if (quoted) {
				pushLast(s.index, true);
				quoted = false;
				continue;
			}

			// starting quote
			pushLast(s.index);
			quoted = true;
			continue;
		}

		if (WHITESPACE.includes(s.segment) && !quoted) {
			// flush last, if it exists
			pushLast(s.index);

			// push the whitespace
			pushText(s.segment, false);

			continue;
		}

		if (s.segment === ':' && last !== null && !quoted) {
			const key = input.slice(last, s.index);
			nodes.push({
				type: 'tag',
				key,
				value: { type: 'text', value: '', quoted: false },
			});
			last = null;
			tag = true;
			continue;
		}

		last ??= s.index;
	}

	pushLast();

	return {
		nodes,
	};
}
