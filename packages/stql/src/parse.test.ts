import { describe, it, expect } from 'vitest';
import { parse } from './parse';

describe('parser', () => {
	it('understands simple text', () => {
		const result = parse('hello-world');
		expect(result).toMatchObject({
			nodes: [{ type: 'text', value: 'hello-world', quoted: false }],
		});
	});

	it('understands spaces', () => {
		const result = parse('hello world');
		expect(result).toMatchObject({
			nodes: [{ type: 'text', value: 'hello world', quoted: false }],
		});
	});

	it('understands multiple spaces', () => {
		const result = parse('hello   world');
		expect(result).toMatchObject({
			nodes: [{ type: 'text', value: 'hello   world', quoted: false }],
		});
	});

	it('understands tabs', () => {
		const result = parse('hello\tworld');
		expect(result).toMatchObject({
			nodes: [{ type: 'text', value: 'hello\tworld', quoted: false }],
		});
	});

	it('understands quotes', () => {
		const result = parse('"hello" world');
		expect(result).toMatchObject({
			nodes: [
				{ type: 'text', value: 'hello', quoted: true },
				{ type: 'text', value: ' world', quoted: false },
			],
		});
	});

	it('handles emojis', () => {
		const result = parse('hello 🤷‍♀️ world');
		expect(result).toMatchObject({
			nodes: [{ type: 'text', value: 'hello 🤷‍♀️ world', quoted: false }],
		});
	});

	it('handles newlines', () => {
		const result = parse('hello\nworld');
		expect(result).toMatchObject({
			nodes: [{ type: 'text', value: 'hello\nworld', quoted: false }],
		});
	});

	it('handles complex mix', () => {
		const result = parse('"hello"   world foo   bar "baz" q');
		expect(result).toMatchObject({
			nodes: [
				{ type: 'text', value: 'hello', quoted: true },
				{ type: 'text', value: '   world foo   bar ', quoted: false },
				{ type: 'text', value: 'baz', quoted: true },
				{ type: 'text', value: ' q', quoted: false },
			],
		});
	});

	it('handles whitespace in quotes', () => {
		const result = parse('"hello world"');
		expect(result).toMatchObject({
			nodes: [{ type: 'text', value: 'hello world', quoted: true }],
		});
	});

	it('understands assignment operator', () => {
		const result = parse('hello = world');
		expect(result).toMatchObject({
			nodes: [{ type: 'text', value: 'hello = world', quoted: false }],
		});
	});

	it('handles assignment operator in quotes', () => {
		const result = parse('"hello = world"');
		expect(result).toMatchObject({
			nodes: [{ type: 'text', value: 'hello = world', quoted: true }],
		});
	});

	it('handles simple tags', () => {
		const result = parse('foo:bar');
		expect(result).toMatchObject({
			nodes: [
				{
					type: 'tag',
					key: { type: 'text', value: 'foo' },
					value: { type: 'text', value: 'bar', quoted: false },
				},
			],
		});
	});

	it('handles quoted tags', () => {
		const result = parse('foo:"bar"');
		expect(result).toMatchObject({
			nodes: [
				{
					type: 'tag',
					key: { type: 'text', value: 'foo' },
					value: { type: 'text', value: 'bar', quoted: true },
				},
			],
		});
	});

	it('handles empty input', () => {
		const result = parse('');
		expect(result).toMatchObject({
			nodes: [],
		});
	});

	it('handles tag with missing value', () => {
		const result = parse('key:');
		expect(result).toMatchObject({
			nodes: [
				{
					type: 'tag',
					key: { type: 'text', value: 'key' },
					value: { type: 'text', value: '', quoted: false },
				},
			],
		});
	});

	it('handles tag with missing value but adjacent text node', () => {
		const result = parse('key: value');
		expect(result).toMatchObject({
			nodes: [
				{
					type: 'tag',
					key: { type: 'text', value: 'key' },
					value: { type: 'text', value: '', quoted: false },
				},
				{ type: 'text', value: ' value', quoted: false },
			],
		});
	});

	// it('handles consecutive tags', () => {
	// 	const result = parse('a:1b:2c:3');
	// 	expect(result).toMatchObject([
	// 		{
	// 			type: 'tag',
	// 			key: { type: 'text', value: 'a' },
	// 			value: { type: 'text', value: '1', quoted: false },
	// 		},
	// 		{
	// 			type: 'tag',
	// 			key: { type: 'text', value: 'b' },
	// 			value: { type: 'text', value: '2', quoted: false },
	// 		},
	// 		{
	// 			type: 'tag',
	// 			key: { type: 'text', value: 'c' },
	// 			value: { type: 'text', value: '3', quoted: false },
	// 		},
	// 	]);
	// });
});
