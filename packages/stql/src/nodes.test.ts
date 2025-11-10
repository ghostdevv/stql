import { createTagNode, createTextNode, requiresQuotes } from './nodes';
import { describe, it, expect } from 'vitest';

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

describe('createTextNode', () => {
	it('creates a text node with quoted false when no whitespace', () => {
		const node = createTextNode('hello');
		expect(node).toEqual({ type: 'text', value: 'hello', quoted: false });
	});

	it('creates a text node with quoted true when whitespace present', () => {
		const node = createTextNode('hello world');
		expect(node).toEqual({
			type: 'text',
			value: 'hello world',
			quoted: true,
		});
	});
});

describe('createTagNode', () => {
	it('creates a tag node with unquoted value', () => {
		const node = createTagNode('key', 'value');
		expect(node).toEqual({
			type: 'tag',
			key: { type: 'text', value: 'key' },
			value: { type: 'text', value: 'value', quoted: false },
		});
	});

	it('creates a tag node with quoted value when whitespace in value', () => {
		const node = createTagNode('key', 'value with space');
		expect(node).toEqual({
			type: 'tag',
			key: { type: 'text', value: 'key' },
			value: { type: 'text', value: 'value with space', quoted: true },
		});
	});

	it('throws error when key contains whitespace', () => {
		const create = () => createTagNode('invalid key', 'value');
		expect(create).toThrowError('Tag keys cannot contain whitespace');
	});
});
