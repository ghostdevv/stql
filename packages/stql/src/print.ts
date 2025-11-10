import type { TextNode, ParseResult } from './parse';

function printText(text: TextNode) {
	return text.quoted ? `"${text.value}"` : text.value;
}

/**
 * Print (turn into a string) parsed stql nodes.
 *
 * stql was designed such that you can recursively parse/print
 * without loosing/gaining any information. That means that the
 * printed string can be parsed back into the same AST.
 *
 * NOTE: If you manually manipulate the tree, you may end up with
 * something that once printed can't be parsed back correctly. To
 * prevent this, you can pass the tree through stql's `repair` fn
 * before printing. Print will, however, not do this for you.
 *
 * @param result the stql parse result
 * @returns the string-ified tree
 */
export function print(result: ParseResult): string {
	return result.nodes.reduce((result, node) => {
		return `${result}${node.type === 'text' ? printText(node) : `${node.key}:${printText(node.value)}`}`;
	}, '');
}
