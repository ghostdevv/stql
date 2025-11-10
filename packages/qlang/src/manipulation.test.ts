import { pushTag, requiresQuotes } from './manipulation';
import { describe, it, expect } from 'vitest';
import { parse } from './parse';

describe('pushTag', () => {
	it('throws error when key contains whitespace', () => {
		const nodes = parse('hello world');
		expect(() => pushTag(nodes, 'my key', 'value')).toThrow(
			'Key cannot contain whitespace',
		);
	});

	it('adds a new tag with prepend behaviour', () => {
		const nodes = parse('foo:bar');
		const result = pushTag(nodes, 'new', 'val');
		expect(result.nodes[0]).toEqual({
			type: 'tag',
			key: { type: 'text', value: 'new' },
			value: { type: 'text', value: 'val', quoted: false },
		});
	});

	it('adds a new tag with append behaviour', () => {
		const nodes = parse('foo:bar');
		const result = pushTag(nodes, 'new', 'val', 'append');
		const last = result.nodes[result.nodes.length - 1];
		expect(last).toEqual({
			type: 'tag',
			key: { type: 'text', value: 'new' },
			value: { type: 'text', value: 'val', quoted: false },
		});
	});

	it('replaces existing tag when behaviour is replace', () => {
		const nodes = parse('foo:old');
		const result = pushTag(nodes, 'foo', 'new', 'replace');
		expect(result.nodes).toHaveLength(1);
		expect(result.nodes[0]).toEqual({
			type: 'tag',
			key: { type: 'text', value: 'foo' },
			value: { type: 'text', value: 'new', quoted: false },
		});
	});

	it('quotes the value when necessary', () => {
		const nodes = parse('');
		const result = pushTag(nodes, 'key', 'needs quote', 'prepend');
		// @ts-expect-error isn't narrowed
		expect(result.nodes[0].value?.quoted).toBe(true);
	});
});

describe('requiresQuotes', () => {
	it('returns false for strings without whitespace', () => {
		expect(requiresQuotes('hello')).toBe(false);
	});

	it('returns true for strings with space', () => {
		expect(requiresQuotes('hello world')).toBe(true);
	});

	it('returns true for strings with tab', () => {
		expect(requiresQuotes('hello\tworld')).toBe(true);
	});

	it('returns true for strings with newline', () => {
		expect(requiresQuotes('hello\nworld')).toBe(true);
	});
});
