<script lang="ts">
	import Playground from '$lib/playground/Playground.svelte';
	import dedent from 'dedent';

	const DEFAULT_CODE = dedent`
        import * as stql from 'stql';

        // Your user's query; it could relate to any kind of
        // app with search. In this example lets say it's a
        // todo list app.
        const query = 'is:open list:groceries decoration';

        // You can parse the query.
        // This gives you something of an AST - if you actually
        // work with ASTs then just pretend that this is one.
        const ast = stql.parse(query);
        console.log(ast);

        // If we want to take our user at their word, we can
        // use this utility to "collect" the parts we care about.
        // (the \`text\` part of this fn needs some work...)
        const { tags, text } = stql.collect(ast);
        console.log(tags)

        // You're free to modify the AST too.
        const newAST = ast.nodes.filter(
        node => !(node.type === 'tag' && node.key === 'is')
        );

        // After modification we may want to update the
        // copy the user has in the UI. We can use \`print\`
        // for this.
        //
        // Additionally, we'll use \`repair\` to try to fix
        // any issues we may have created in the AST. For example,
        // missing whitespace between tags.
        const newQuery = stql.print(stql.repair({ nodes: newAST }));
        console.log(newQuery);

        // Alright, I see that extra whitespace we now have...
        // let's just pretend that didn't happen! Much better
        console.log(newQuery.trimStart())
	`;
</script>

<section>
	<h1>stql</h1>

	<p>
		A <strong>S</strong>imple <strong>T</strong>ag <strong>Q</strong>uery
		<strong>L</strong>anguage for building user friendly enhanced search
		boxes. Website very much work in progress.
		<a href="https://github.com/ghostdevv/stql">GitHub</a>
	</p>
</section>

<section>
	<Playground defaultCode={DEFAULT_CODE} />
</section>
