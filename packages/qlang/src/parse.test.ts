import { describe, it, expect } from 'vitest';
import { parse } from './parse';

describe('parser', () => {
	it('understands simple text', () => {
		const result = parse('hello-world');
		expect(result).toEqual([
			{ type: 'text', literal: 'hello-world', quoted: false },
		]);
	});

	it('understands spaces', () => {
		const result = parse('hello world');
		expect(result).toEqual([
			{ type: 'text', literal: 'hello world', quoted: false },
		]);
	});

	it('understands multiple spaces', () => {
		const result = parse('hello   world');
		expect(result).toEqual([
			{ type: 'text', literal: 'hello   world', quoted: false },
		]);
	});

	it('understands tabs', () => {
		const result = parse('hello\tworld');
		expect(result).toEqual([
			{ type: 'text', literal: 'hello\tworld', quoted: false },
		]);
	});

	it('understands quotes', () => {
		const result = parse('"hello" world');
		expect(result).toEqual([
			{ type: 'text', literal: 'hello', quoted: true },
			{ type: 'text', literal: ' world', quoted: false },
		]);
	});

	it('handles emojis', () => {
		const result = parse('hello 🤷‍♀️ world');
		expect(result).toEqual([
			{ type: 'text', literal: 'hello 🤷‍♀️ world', quoted: false },
		]);
	});

	it('handles newlines', () => {
		const result = parse('hello\nworld');
		expect(result).toEqual([
			{ type: 'text', literal: 'hello\nworld', quoted: false },
		]);
	});

	it('handles complex mix', () => {
		const result = parse('"hello"   world foo   bar "baz" q');
		expect(result).toEqual([
			{ type: 'text', literal: 'hello', quoted: true },
			{ type: 'text', literal: '   world foo   bar ', quoted: false },
			{ type: 'text', literal: 'baz', quoted: true },
			{ type: 'text', literal: ' q', quoted: false },
		]);
	});

	it('handles whitespace in quotes', () => {
		const result = parse('"hello world"');
		expect(result).toEqual([
			{ type: 'text', literal: 'hello world', quoted: true },
		]);
	});

	it('understands assignment operator', () => {
		const result = parse('hello = world');
		expect(result).toEqual([
			{ type: 'text', literal: 'hello = world', quoted: false },
		]);
	});

	it('handles assignment operator in quotes', () => {
		const result = parse('"hello = world"');
		expect(result).toEqual([
			{ type: 'text', literal: 'hello = world', quoted: true },
		]);
	});

	it('handles simple tags', () => {
		const result = parse('foo:bar');
		expect(result).toEqual([
			{
				type: 'tag',
				key: { type: 'text', literal: 'foo' },
				value: { type: 'text', literal: 'bar', quoted: false },
			},
		]);
	});

	it('handles quoted tags', () => {
		const result = parse('foo:"bar"');
		expect(result).toEqual([
			{
				type: 'tag',
				key: { type: 'text', literal: 'foo' },
				value: { type: 'text', literal: 'bar', quoted: true },
			},
		]);
	});

	it('handles empty input', () => {
		const result = parse('');
		expect(result).toEqual([]);
	});

	it('handles tag with missing value', () => {
		const result = parse('key:');
		expect(result).toEqual([
			{
				type: 'tag',
				key: { type: 'text', literal: 'key' },
				value: { type: 'text', literal: '', quoted: false },
			},
		]);
	});

	it('handles tag with missing value but adjacent text token', () => {
		const result = parse('key: value');
		expect(result).toEqual([
			{
				type: 'tag',
				key: { type: 'text', literal: 'key' },
				value: { type: 'text', literal: '', quoted: false },
			},
			{ type: 'text', literal: ' value', quoted: false },
		]);
	});

	// it('handles consecutive tags', () => {
	// 	const result = parse('a:1b:2c:3');
	// 	expect(result).toEqual([
	// 		{
	// 			type: 'tag',
	// 			key: { type: 'text', literal: 'a' },
	// 			value: { type: 'text', literal: '1', quoted: false },
	// 		},
	// 		{
	// 			type: 'tag',
	// 			key: { type: 'text', literal: 'b' },
	// 			value: { type: 'text', literal: '2', quoted: false },
	// 		},
	// 		{
	// 			type: 'tag',
	// 			key: { type: 'text', literal: 'c' },
	// 			value: { type: 'text', literal: '3', quoted: false },
	// 		},
	// 	]);
	// });
});
