export type TextToken = {
	type: 'text';
	literal: string;
	quoted: boolean;
};

export type TagToken = {
	type: 'tag';
	key: Omit<TextToken, 'quoted'>;
	value: TextToken;
};

export type Token = TextToken | TagToken;

export const WHITESPACE = [' ', '\t', '\n', '\r'];

export function parse(input: string) {
	const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
	const segments = Array.from(segmenter.segment(input));
	const tokens: Token[] = [];

	let last: number | null = null;
	let quoted = false;
	let tag = false;

	function pushText(text: string, quoted: boolean) {
		const lastToken = tokens.at(-1);

		if (lastToken?.type === 'text' && !(quoted || lastToken.quoted)) {
			lastToken.literal += text;
		} else {
			tokens.push({
				type: 'text',
				literal: text,
				quoted,
			});
		}
	}

	function pushLast(current?: number, quoted = false) {
		if (last !== null) {
			const text = input.slice(last, current);
			const lastToken = tokens.at(-1);

			if (lastToken?.type === 'tag' && tag) {
				lastToken.value = { type: 'text', literal: text, quoted };
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
			tokens.push({
				type: 'tag',
				key: { type: 'text', literal: key },
				value: { type: 'text', literal: '', quoted: false },
			});
			last = null;
			tag = true;
			continue;
		}

		last ??= s.index;
	}

	pushLast();

	return tokens;
}
