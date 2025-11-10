import { pushTag, requiresQuotes } from './manipulation';
import { describe, it, expect } from 'vitest';
import { parse } from './parse';

describe('pushTag', () => {
	it('throws error when key contains whitespace', () => {
		const tokens = parse('hello world');
		expect(() => pushTag(tokens, 'my key', 'value')).toThrow(
			'Key cannot contain whitespace',
		);
	});

	it('adds a new tag with prepend behaviour', () => {
		const tokens = parse('foo:bar');
		const result = pushTag(tokens, 'new', 'val');
		expect(result[0]).toEqual({
			type: 'tag',
			key: { type: 'text', literal: 'new' },
			value: { type: 'text', literal: 'val', quoted: false },
		});
	});

	it('adds a new tag with append behaviour', () => {
		const tokens = parse('foo:bar');
		const result = pushTag(tokens, 'new', 'val', 'append');
		const last = result[result.length - 1];
		expect(last).toEqual({
			type: 'tag',
			key: { type: 'text', literal: 'new' },
			value: { type: 'text', literal: 'val', quoted: false },
		});
	});

	it('replaces existing tag when behaviour is replace', () => {
		const tokens = parse('foo:old');
		const result = pushTag(tokens, 'foo', 'new', 'replace');
		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			type: 'tag',
			key: { type: 'text', literal: 'foo' },
			value: { type: 'text', literal: 'new', quoted: false },
		});
	});

	it('quotes the value when necessary', () => {
		const tokens = parse('');
		const result = pushTag(tokens, 'key', 'needs quote', 'prepend');
		// @ts-expect-error isn't narrowed
		expect(result[0].value?.quoted).toBe(true);
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
