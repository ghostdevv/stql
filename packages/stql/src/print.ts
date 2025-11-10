import { type TextNode, type ParseResult, WHITESPACE } from './parse';

function printText(text: TextNode) {
	return text.quoted ? `"${text.value}"` : text.value;
}

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
 * Print (turn into a string) parsed stql nodes.
 *
 * stql was designed such that you can recursively parse/print
 * without loosing/gaining any information. That means that the
 * printed string can be parsed back into the same AST.
 *
 * There is only one exception to this currently. If you manually
 * construct/manipulate the tree, you may end up in an un-parsable
 * case. For example, if you have two adjacent tag nodes without
 * a whitespace bookend-ed node between them.
 *
 * @param result the stql parse result
 * @returns the string-ified tree
 */
export function print(result: ParseResult): string {
	return result.nodes.reduce((result, node, index, nodes) => {
		const previousNode = index === 0 ? null : nodes.at(index - 1);

		const requiresExtraWhitespace =
			(node.type === 'text' &&
				previousNode?.type === 'tag' &&
				!startsWithWhitespace(node.value)) ||
			(node.type === 'tag' && previousNode?.type === 'tag') ||
			(node.type === 'tag' &&
				previousNode?.type === 'text' &&
				!endsWithWhitespace(previousNode.value));

		return `${result}${requiresExtraWhitespace ? ' ' : ''}${node.type === 'text' ? printText(node) : `${node.key}:${printText(node.value)}`}`;
	}, '');
}
