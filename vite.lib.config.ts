import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { createCssConfig } from './build/config/css'
import { createResolveConfig } from './build/config/resolve'
import { createPlugins } from './build/plugins'

export default defineConfig(({ mode }) => ({
	resolve: createResolveConfig(),
	css: createCssConfig(mode),
	plugins: createPlugins(mode),

	build: {
		outDir: 'dist',
		emptyOutDir: true,
		sourcemap: false,
		cssCodeSplit: false,
		target: 'es2020',
		minify: 'oxc',

		lib: {
			entry: {
				index: resolve(__dirname, 'src/index.ts'),
			},
			formats: ['es'],
			fileName: (_format, entryName) => `${entryName}.js`,
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
	},
}))
