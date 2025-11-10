import type { TextToken, Token } from './parse';

function printText(text: TextToken) {
	return text.quoted ? `"${text.literal}"` : text.literal;
}

export function print(tokens: Token[]) {
	return tokens.reduce(
		(result, token) =>
			`${result}${token.type === 'text' ? printText(token) : `${token.key.literal}:${printText(token.value)}`}`,
		'',
	);
}
