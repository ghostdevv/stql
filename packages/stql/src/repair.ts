import { requiresQuotes } from './nodes';
import { WHITESPACE, type ParseResult } from './parse';

function startsWithWhitespace(str: string) {
	for (const char of WHITESPACE) {
		if (str.startsWith(char)) {
			return true;
		}
	}

	return false;
}

function endsWithWhitespace(str: string) {
	for (const char of WHITESPACE) {
		if (str.endsWith(char)) {
			return true;
		}
	}

	return false;
}

/**
 * Repair a, presumably, manually manipulated tree.
 *
 * There are cases when you manually edit the node tree where
 * you could accidentally end up in a place that is un-parsable
 * after printing. For example, if a tag node's value has
 * `quoted: false` when it should be true. Or if you're missing
 * whitespace around tag nodes.
 *
 * This assumes that TypeScript is happy, that is to say it won't
 * replace missing properties from node objects.
 *
 * @param result the tree to repair
 * @returns a copy of the repaired tree (no mutation of the input occurs)
 */
export function repair(result: ParseResult) {
	const nodes = structuredClone(result.nodes);

	for (let i = 0; i < nodes.length; i++) {
		const previous = i === 0 ? null : nodes.at(i - 1);
		const node = nodes[i];

		if (
			node.type === 'text' &&
			previous?.type === 'tag' &&
			!startsWithWhitespace(node.value)
		) {
			if (node.quoted) {
				nodes.splice(i, 0, { type: 'text', value: ' ', quoted: false });
			} else {
				node.value = ` ${node.value}`;
			}

			continue;
		}

		if (
			node.type === 'tag' &&
			previous?.type === 'text' &&
			!endsWithWhitespace(previous.value)
		) {
			if (previous.quoted) {
				nodes.splice(i, 0, { type: 'text', value: ' ', quoted: false });
			} else {
				previous.value += ' ';
			}

			continue;
		}

		if (
			node.type === 'tag' &&
			!node.value.quoted &&
			requiresQuotes(node.value.value)
		) {
			node.value.quoted = true;
		}

		if (node.type === 'tag' && previous?.type === 'tag') {
			nodes.splice(i, 0, { type: 'text', value: ' ', quoted: false });
		}
	}

	return { nodes };
}
