<script lang="ts">
	import Playground from '$lib/playground/Playground.svelte';
	import dedent from 'dedent';

	const DEFAULT_CODE = dedent`
		import * as stql from 'stql';

		const query = 'is:open list:groceries decoration';

		const result = stql.parse(query);
		console.log('parse result', result);

		const { tags, text } = stql.collect(result);
		console.log('tags', tags);
		console.log('text', text);
	`;
</script>

<section>
	<h1>stql</h1>

	<p>
		A <strong>S</strong>imple <strong>T</strong>ag <strong>Q</strong>uery
		<strong>L</strong>anguage for building user friendly enhanced search
		boxes.
	</p>
</section>

<section>
	<Playground defaultCode={DEFAULT_CODE} />
</section>
