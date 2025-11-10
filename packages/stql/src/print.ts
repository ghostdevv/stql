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

export function print(result: ParseResult) {
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
