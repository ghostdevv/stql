import { createTagNode, createTextNode } from './nodes';
import { describe, it, expect } from 'vitest';
import type { ParseResult } from './parse';
import { repair } from './repair';

describe('repair', () => {
	it('tag with text to right but missing left side whitespace', () => {
		const parsed: ParseResult = {
			nodes: [createTagNode('foo', 'bar'), createTextNode('hello')],
		};

		const repaired = repair(parsed);

		expect(repaired).toMatchObject({
			nodes: [
				createTagNode('foo', 'bar'),
				{ type: 'text', value: ' hello', quoted: false },
			],
		});
	});

	it('tag with quoted text to right but missing left side whitespace', () => {
		const parsed: ParseResult = {
			nodes: [createTagNode('foo', 'bar'), createTextNode('hello world')],
		};

		const repaired = repair(parsed);

		expect(repaired).toMatchObject({
			nodes: [
				createTagNode('foo', 'bar'),
				{ type: 'text', value: ' ', quoted: false },
				createTextNode('hello world'),
			],
		});
	});

	it('tag with text to left but missing right side whitespace', () => {
		const parsed: ParseResult = {
			nodes: [createTextNode('hello'), createTagNode('foo', 'bar')],
		};

		const repaired = repair(parsed);

		expect(repaired).toMatchObject({
			nodes: [
				{ type: 'text', value: 'hello ', quoted: false },
				createTagNode('foo', 'bar'),
			],
		});
	});

	it('tag with quoted text to left but missing right side whitespace', () => {
		const parsed: ParseResult = {
			nodes: [createTextNode('hello world'), createTagNode('foo', 'bar')],
		};

		const repaired = repair(parsed);

		expect(repaired).toMatchObject({
			nodes: [
				createTextNode('hello world'),
				{ type: 'text', value: ' ', quoted: false },
				createTagNode('foo', 'bar'),
			],
		});
	});

	it('adjacent tags with missing whitespace node', () => {
		const parsed: ParseResult = {
			nodes: [createTagNode('foo', 'bar'), createTagNode('baz', 'qux')],
		};

		const repaired = repair(parsed);

		expect(repaired).toMatchObject({
			nodes: [
				createTagNode('foo', 'bar'),
				{ type: 'text', value: ' ', quoted: false },
				createTagNode('baz', 'qux'),
			],
		});
	});

	it('adjacent tags with missing whitespace in previous text node', () => {
		const parsed: ParseResult = {
			nodes: [
				createTagNode('foo', 'bar'),
				createTextNode('hello'),
				createTagNode('baz', 'qux'),
			],
		};

		const repaired = repair(parsed);

		expect(repaired).toMatchObject({
			nodes: [
				createTagNode('foo', 'bar'),
				{ type: 'text', value: ' hello ', quoted: false },
				createTagNode('baz', 'qux'),
			],
		});
	});

	it('adjacent tags with quoted text node between', () => {
		const parsed: ParseResult = {
			nodes: [
				createTagNode('foo', 'bar'),
				createTextNode('hello world'),
				createTagNode('baz', 'qux'),
			],
		};

		const repaired = repair(parsed);

		expect(repaired).toMatchObject({
			nodes: [
				createTagNode('foo', 'bar'),
				{ type: 'text', value: ' ', quoted: false },
				createTextNode('hello world'),
				{ type: 'text', value: ' ', quoted: false },
				createTagNode('baz', 'qux'),
			],
		});
	});

	it('sets quoted to true if a tag node is missing it', () => {
		const parsed: ParseResult = {
			nodes: [
				{
					type: 'tag',
					key: 'foo',
					value: {
						type: 'text',
						value: 'hello world',
						quoted: false,
					},
				},
			],
		};

		const repaired = repair(parsed);

		expect(repaired).toMatchObject({
			nodes: [createTagNode('foo', 'hello world')],
		});
	});
});
