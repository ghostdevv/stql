import { createWorker } from '@valtown/codemirror-ts/worker';
import stqlDTS from './stql.d.ts?raw';
import * as Comlink from 'comlink';
import ts from 'typescript';
import {
	createDefaultMapFromCDN,
	createSystem,
	createVirtualTypeScriptEnvironment,
} from '@typescript/vfs';

Comlink.expose(
	createWorker(async () => {
		const compilerOpts: ts.CompilerOptions = {
			target: ts.ScriptTarget.ESNext,
			module: ts.ModuleKind.ESNext,
			lib: ['dom'],
			checkJs: true,
			allowJs: true,
		};

		const fsMap = await createDefaultMapFromCDN(
			compilerOpts,
			'5.9.3',
			false,
			ts,
		);

		fsMap.set('/node_modules/stql/index.d.ts', stqlDTS);
		fsMap.set(
			'/node_modules/stql/package.json',
			JSON.stringify({
				name: 'stql',
				type: 'module',
				types: './index.d.ts',
			}),
		);

		const system = createSystem(fsMap);

		return createVirtualTypeScriptEnvironment(system, [], ts, compilerOpts);
	}),
);
