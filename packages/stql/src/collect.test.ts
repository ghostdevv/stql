import { describe, it, expect } from 'vitest';
import { collect } from './collect';
import { parse } from './parse';

describe('collect', () => {
	it('returns only text nodes when there are no tags', () => {
		const result = collect(parse('hello world'));
		expect(result.tags).toMatchObject({});
		expect(result.text).toMatchObject([
			{ type: 'text', value: 'hello world', quoted: false },
		]);
	});

	it('collects a single tag and remaining text', () => {
		const result = collect(parse('foo:bar baz'));
		expect(result.tags).toMatchObject({ foo: ['bar'] });
		expect(result.text).toMatchObject([
			{ type: 'text', value: ' baz', quoted: false },
		]);
	});

	it('handles multiple tags with the same key', () => {
		const result = collect(parse('color:red color:blue other'));
		// Both tags should be aggregated under the same key
		expect(result.tags).toMatchObject({ color: ['red', 'blue'] });
		expect(result.text).toMatchObject([
			{ type: 'text', value: ' ', quoted: false },
			{ type: 'text', value: ' other', quoted: false },
		]);
	});

	it('preserves quoted values for tags and text nodes', () => {
		const result = collect(parse('msg:"Hello World" "quoted text"'));
		// Tag value is quoted in the original query
		expect(result.tags).toMatchObject({ msg: ['Hello World'] });
		// The quoted text node should retain its quoted flag
		expect(result.text).toContainEqual({
			type: 'text',
			value: 'quoted text',
			quoted: true,
		});
		// Any whitespace preceding the quoted text should appear as an unquoted text node
		expect(result.text).toContainEqual({
			type: 'text',
			value: ' ',
			quoted: false,
		});
	});

	it('handles tags with missing values', () => {
		const result = collect(parse('empty: andSomeText'));
		expect(result.tags).toMatchObject({ empty: [''] });
		expect(result.text).toMatchObject([
			{ type: 'text', value: ' andSomeText', quoted: false },
		]);
	});

	it('works with an empty input string', () => {
		const result = collect(parse(''));
		expect(result.tags).toMatchObject({});
		expect(result.text).toMatchObject([]);
	});
});
