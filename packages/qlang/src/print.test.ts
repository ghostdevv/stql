import { describe, it, expect } from 'vitest';
import { parse } from './parse';
import { print } from './print';

describe('print', () => {
	it('round‑trips simple text', () => {
		const source = 'hello-world';
		const ast = parse(source);
		const printed = print(ast);
		expect(printed).toBe(source);
	});

	it('round‑trips text with spaces and tabs', () => {
		const source = 'hello   world\tfine';
		const ast = parse(source);
		const printed = print(ast);
		expect(printed).toBe(source);
	});

	it('round‑trips quoted text', () => {
		const source = '"hello world"';
		const ast = parse(source);
		const printed = print(ast);
		expect(printed).toBe(source);
	});

	it('round‑trips tags with quoted values', () => {
		const source = 'foo:"bar" baz:qux';
		const ast = parse(source);
		const printed = print(ast);
		expect(printed).toBe(source);
	});

	it('round‑trips complex mixed content', () => {
		const source = '"hello"   world foo:bar   baz:"qux zap"  end';
		const ast = parse(source);
		const printed = print(ast);
		expect(printed).toBe(source);
	});
});
