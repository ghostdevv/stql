import type { TextNode, ParseResult } from './parse';

function printText(text: TextNode) {
	return text.quoted ? `"${text.value}"` : text.value;
}

export function print(result: ParseResult) {
	return result.nodes.reduce(
		(result, node) =>
			`${result}${node.type === 'text' ? printText(node) : `${node.key.value}:${printText(node.value)}`}`,
		'',
	);
}
