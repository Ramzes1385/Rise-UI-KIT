/** Сборка `dist/media.css`: тот же вход `./media`, что и у JS, но в бандле остаётся только CSS плеера (build/plugins/cssSplit.ts, роль `only`). */

import { resolve } from 'node:path'
import type { BuildOptions } from 'vite'
import { MEDIA_ENTRY_FILE } from './cssSplit'

export function createMediaCssBuildConfig(): BuildOptions {
	return {
		outDir: 'dist',
		emptyOutDir: false,
		sourcemap: false,
		cssCodeSplit: false,
		target: 'es2020',
		minify: 'oxc',

		lib: {
			entry: { media: resolve(process.cwd(), MEDIA_ENTRY_FILE) },
			formats: ['es'],
			cssFileName: 'media',
		},

		rollupOptions: {
			external: ['vue', /^three(\/.*)?$/],
			output: {
				assetFileNames: assetInfo => (assetInfo.name?.endsWith('.css') ? 'media.css' : 'assets/[name]-[hash][extname]'),
			},
		},

		reportCompressedSize: false,
	}
}
