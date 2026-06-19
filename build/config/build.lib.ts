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
				components: resolve(process.cwd(), 'src/components/index.ts'),
				composables: resolve(process.cwd(), 'src/composables/index.ts'),
				utils: resolve(process.cwd(), 'src/utils/index.ts'),
				icons: resolve(process.cwd(), 'src/icons/index.ts'),
				plugins: resolve(process.cwd(), 'src/plugins/index.ts'),
			},
			formats: ['es'],
			cssFileName: 'styles',
		},

		rollupOptions: {
			external: ['vue'],

			output: {
				entryFileNames: '[name].js',
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
