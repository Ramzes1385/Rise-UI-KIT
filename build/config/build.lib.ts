import { resolve } from 'node:path'
import type { BuildOptions } from 'vite'

export function createLibBuildConfig(): BuildOptions {
	return {
		outDir: 'dist',
		emptyOutDir: true,
		sourcemap: false,
		cssCodeSplit: false,
		target: 'es2020',
		minify: 'oxc',

		lib: {
			entry: {
				index: resolve(process.cwd(), 'src/index.ts'),
			},
			formats: ['es'],
			fileName: () => 'index.js',
			cssFileName: 'styles',
		},

		rollupOptions: {
			external: ['vue'],

			output: {
				chunkFileNames: 'chunks/[name]-[hash].js',

				assetFileNames: assetInfo => {
					const name = assetInfo.name ?? ''

					if (name.endsWith('.css')) {
						return 'styles.css'
					}

					if (name === 'icons.svg') {
						return 'icons.svg'
					}

					return 'assets/[name]-[hash][extname]'
				},
			},
		},

		reportCompressedSize: false,
	}
}
