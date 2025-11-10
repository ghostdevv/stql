import { WHITESPACE, type TagNode, type Node } from './parse';

type PushBehaviour = 'replace' | 'append' | 'prepend';

export function pushTag(
	nodes: Node[],
	key: string,
	value: string,
	behaviour: PushBehaviour = 'prepend',
) {
	if (requiresQuotes(key)) {
		throw new Error('Key cannot contain whitespace');
	}

	const newNode: TagNode = {
		type: 'tag',
		key: { type: 'text', value: key },
		value: { type: 'text', value: value, quoted: requiresQuotes(value) },
	};

	switch (behaviour) {
		case 'replace': {
			const current = nodes.findIndex(
				(node) => node.type === 'tag' && node.key.value === key,
			);

			nodes[current] = newNode;
			break;
		}

		case 'append':
			nodes.push(newNode);
			break;

		case 'prepend':
			nodes.unshift(newNode);
			break;
	}

	return nodes;
}

export function requiresQuotes(text: string) {
	for (const char of WHITESPACE) {
		if (text.includes(char)) {
			return true;
		}
	}

	return false;
}
