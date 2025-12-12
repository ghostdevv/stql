import { paint, g, hexToRgb } from '@braebo/ansi';

function ansiStart(hex: string) {
	const rgb = hexToRgb(hex)!;
	return `\x1b[38;2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
}

export function printAnsi(thing: unknown) {
	const painted =
		typeof thing === 'string'
			? g(`'${thing.replaceAll("'", "\\'")}'`)
			: paint(thing, { printWidth: 40 });

	return (
		painted
			// replace green (strings)
			.replaceAll('\x1b[38;2;87;171;87m', ansiStart('#f29e74'))
			// replace yellow (booleans)
			.replaceAll('\x1b[38;2;226;226;112m', ansiStart('#f06897'))
			// replace purple (numbers)
			.replaceAll('\x1b[38;2;149;66;231m', ansiStart('#f06897'))
	);
}
