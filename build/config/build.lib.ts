import { resolve } from 'node:path'
import type { BuildOptions } from 'vite'
import { LAZY_COMPONENT_NAMES } from '../../src/plugin/registry/lazyNames'
import { createSubpathEntries } from '../plugins/subpaths'

/**
 * Входы и чанки пакета. `withSubpaths` — основной проход (JS всех входов и подпутей `./<Компонент>`, build/plugins/subpaths.ts);
 * без них — проход `styles.css` (vite.styles-css.config.ts): тот же граф, что до подпутей, поэтому порядок правил в `styles.css`
 * не зависит от того, как подпути делят код на чанки (Vite склеивает CSS по чанкам).
 */
export function createLibBuildConfig({ withSubpaths }: { withSubpaths: boolean }): BuildOptions {
	return {
		outDir: 'dist',
		emptyOutDir: withSubpaths,
		sourcemap: false,
		cssCodeSplit: false,
		target: 'es2020',
		minify: 'oxc',

		lib: {
			entry: {
				index: resolve(process.cwd(), 'src/index.ts'),
				plugin: resolve(process.cwd(), 'src/plugin/index.ts'),
				components: resolve(process.cwd(), 'src/components/index.ts'),
				composables: resolve(process.cwd(), 'src/composables/index.ts'),
				utils: resolve(process.cwd(), 'src/utils/index.ts'),
				icons: resolve(process.cwd(), 'src/icons/index.ts'),
				media: resolve(process.cwd(), 'src/components/BaseMediaPlayer/index.ts'),
				map3d: resolve(process.cwd(), 'src/map3d.ts'),
				// Подпути `./<Компонент>` (build/config/subpaths.ts): `components/<Компонент>/index.js`
				...(withSubpaths ? createSubpathEntries() : {}),
			},
			formats: ['es'],
			cssFileName: 'styles',
		},

		rollupOptions: {
			external: ['vue', /^three(\/.*)?$/],
			// Нужно для includeDependenciesRecursively: false (ниже); у входов могут появиться служебные имена экспорта (в .d.ts их нет)
			preserveEntrySignatures: 'allow-extension',

			output: {
				entryFileNames: '[name].js',
				strictExecutionOrder: true,
				chunkFileNames: 'chunks/[name]-[hash].js',

				// Тяжёлые компоненты плагина (`src/plugin/registry/lazyNames.ts`, тот же список в реестре) — в свои чанки без общих зависимостей: потребитель, которому нужен только
				// createUiKitPlugin, грузит их по import() (FOLLOW_UPS № 58)
				codeSplitting: {
					includeDependenciesRecursively: false,
					groups: LAZY_COMPONENT_NAMES.map(component => ({
						name: `lazy-${component}`,
						test: new RegExp(`[\\/]src[\\/]components[\\/]${component}[\\/](?:ui|model|styles)[\\/]`),
						priority: 10,
					})),
				},

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
