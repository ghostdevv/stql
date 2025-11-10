import type { TextNode, Node } from './parse';

function printText(text: TextNode) {
	return text.quoted ? `"${text.value}"` : text.value;
}

export function print(nodes: Node[]) {
	return nodes.reduce(
		(result, node) =>
			`${result}${node.type === 'text' ? printText(node) : `${node.key.value}:${printText(node.value)}`}`,
		'',
	);
}
