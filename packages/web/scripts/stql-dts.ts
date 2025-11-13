import { build } from '@dtsbuild/core';
import { join } from 'node:path';

const OUT_PATH = join(import.meta.dirname, '../src/lib/codemirror/stql');
const DTS_PATH = join(import.meta.dirname, '../../stql/dist/index.d.mts');

await build({
	entryPoints: { [OUT_PATH]: DTS_PATH },
	emptyOutDir: false,
});
