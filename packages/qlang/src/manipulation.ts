import { WHITESPACE, type TagToken, type Token } from './parse';

type PushBehaviour = 'replace' | 'append' | 'prepend';

export function pushTag(
	tokens: Token[],
	key: string,
	value: string,
	behaviour: PushBehaviour = 'prepend',
) {
	if (requiresQuotes(key)) {
		throw new Error('Key cannot contain whitespace');
	}

	const newToken: TagToken = {
		type: 'tag',
		key: { type: 'text', literal: key },
		value: { type: 'text', literal: value, quoted: requiresQuotes(value) },
	};

	switch (behaviour) {
		case 'replace': {
			const current = tokens.findIndex(
				(token) => token.type === 'tag' && token.key.literal === key,
			);

			tokens[current] = newToken;
			break;
		}

		case 'append':
			tokens.push(newToken);
			break;

		case 'prepend':
			tokens.unshift(newToken);
			break;
	}

	return tokens;
}

export function requiresQuotes(text: string) {
	for (const char of WHITESPACE) {
		if (text.includes(char)) {
			return true;
		}
	}

	return false;
}
