export interface TextNode {
	type: 'text';
	value: string;
	quoted: boolean;
}

export interface TagNode {
	type: 'tag';
	key: string;
	value: TextNode;
}

export type Node = TextNode | TagNode;

export interface ParseResult {
	nodes: Node[];
}

export const WHITESPACE = [' ', '\t', '\n', '\r'];

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
