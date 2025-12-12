import { inspect } from 'node-inspect-extracted';

inspect.styles.bigint = 'magenta';
inspect.styles.boolean = 'magenta';
inspect.styles.string = 'yellow';

export function printAnsi(thing: unknown) {
	return inspect(thing, { depth: null, colors: true, breakLength: 32 });
}
