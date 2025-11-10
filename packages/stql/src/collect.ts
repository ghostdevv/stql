import type { ParseResult, TextNode } from './parse';

/**
 * The result of stql' {@link collect} fn
 */
export interface CollectionResult {
	/**
	 * A record of tag keys to the values found.
	 *
	 * The values aren't a text node anymore since whether
	 * the value was quoted or not is only really relevant
	 * for printing, and as such the value array has been
	 * simplified for your convenience.
	 */
	tags: Partial<Record<string, string[]>>;

	/**
	 * The text nodes found.
	 *
	 * This is still a text node for convience, since whether
	 * or not it was quoted could be relevant depending on how
	 * you decide to treat it. If you don't care, then simply
	 * ignore it and join the values as you otherwise would.
	 *
	 * In the future there may be a print text fn that can handle
	 * this for you, to correctly insert or remove missing/duplicate
	 * whitespace.
	 */
	text: TextNode[];
}

/**
 * "Collects" the parsed result into a {@link CollectionResult}.
 *
 * This is a one-way convience function that simplifies the
 * parsed result into a more convenient format for further
 * processing. You can't turn this back into a parse result,
 * so is only really useful when you're transforming stql
 * to the query language of your database/w.e.
 *
 * @param parseResult the result to collect
 * @returns an object of tags and text nodes
 */
export function collect(parseResult: ParseResult) {
	const result: CollectionResult = { tags: {}, text: [] };

	for (const node of parseResult.nodes) {
		if (node.type === 'text') {
			result.text.push(node);
			continue;
		}

		result.tags[node.key] ||= [];
		// biome-ignore lint/style/noNonNullAssertion: see above
		result.tags[node.key]!.push(node.value.value);
	}

	return result;
}
