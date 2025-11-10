import { createTagNode, createTextNode } from './nodes';
import { parse, type ParseResult } from './parse';
import { describe, it, expect } from 'vitest';
import { print } from './print';

describe('print', () => {
	it('round‑trips simple text', () => {
		const source = 'hello-world';
		const result = parse(source);
		const printed = print(result);
		expect(printed).toBe(source);
	});

	it('round‑trips text with spaces and tabs', () => {
		const source = 'hello   world\tfine';
		const result = parse(source);
		const printed = print(result);
		expect(printed).toBe(source);
	});

	it('round‑trips quoted text', () => {
		const source = '"hello world"';
		const result = parse(source);
		const printed = print(result);
		expect(printed).toBe(source);
	});

	it('round‑trips tags with quoted values', () => {
		const source = 'foo:"bar" baz:qux';
		const result = parse(source);
		const printed = print(result);
		expect(printed).toBe(source);
	});

	it('round‑trips complex mixed content', () => {
		const source = '"hello"   world foo:bar   baz:"qux zap"  end';
		const result = parse(source);
		const printed = print(result);
		expect(printed).toBe(source);
	});

	it('prints adjacent tags with missing whitespace node correctly', () => {
		const result: ParseResult = {
			nodes: [createTagNode('foo', 'bar'), createTagNode('baz', 'qux')],
		};

		const printed = print(result);
		expect(printed).toBe('foo:bar baz:qux');
	});

	it('printed adjacent tags with missing whitespace in previous text node correctly', () => {
		const result: ParseResult = {
			nodes: [
				createTagNode('foo', 'bar'),
				// createTextNode('hello world'),
				createTextNode('hello'),
				createTagNode('baz', 'qux'),
			],
		};

		const printed = print(result);
		expect(printed).toBe('foo:bar hello baz:qux');
	});
});
