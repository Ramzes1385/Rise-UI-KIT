/** Сборка CSS подпутей (build/plugins/subpathCss.ts): входы — папки публичных компонентов и `tokens.css`, CSS — по чанку на папку. */

import { resolve } from 'node:path'
import type { BuildOptions } from 'vite'
import { fontFileName } from './build.lib'
import { readPublicComponents } from './subpaths'
import { createSubpathCssGroups, TOKENS_ENTRY } from '../plugins/subpathCss'

export function createSubpathCssBuildConfig(): BuildOptions {
	const components = readPublicComponents()
	return {
		outDir: 'dist',
		emptyOutDir: false,
		sourcemap: false,
		cssCodeSplit: true,
		target: 'es2020',
		minify: 'oxc',

		lib: {
			entry: {
				'css-rise-tokens': TOKENS_ENTRY,
				...Object.fromEntries(
					components.map(component => [`css-${component}`, resolve(process.cwd(), 'src/components', component, 'index.ts')]),
				),
			},
			formats: ['es'],
		},

		rollupOptions: {
			external: ['vue', /^three(\/.*)?$/],
			preserveEntrySignatures: 'allow-extension',
			output: {
				codeSplitting: createSubpathCssGroups(components),
				// CSS чанков — в корне, как `tokens.css`, который из них собирается: адреса шрифтов в нём `./fonts/…` (build.lib.ts, FONT_FILE)
				assetFileNames: assetInfo => fontFileName(assetInfo.name) ?? '[name][extname]',
			},
		},

		reportCompressedSize: false,
	}
}
