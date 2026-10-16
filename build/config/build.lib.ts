import { resolve } from 'node:path'
import type { BuildOptions } from 'vite'
import { LAZY_COMPONENT_NAMES } from '../../src/plugin/registry/lazyNames'
import { createSubpathEntries } from '../plugins/subpaths'

/**
 * Тяжёлые компоненты плагина (`src/plugin/registry/lazyNames.ts`) — в своих чанках без общих зависимостей (FOLLOW_UPS № 58).
 * Так было устроено до подпутей, и так граф остаётся в проходе `styles.css`: порядок правил в нём — прежний (Vite склеивает CSS по чанкам).
 * В основном проходе группы не нужны: у каждого компонента свой вход-подпуть, и rolldown сам кладёт код в чанки по набору входов,
 * а `import()` плагина — отдельный вход; без групп не нужен и `strictExecutionOrder`, который ломал тряску дерева в приложениях (ниже).
 */
function createLazyGroups(): NonNullable<NonNullable<BuildOptions['rollupOptions']>['output']> {
	return {
		strictExecutionOrder: true,
		codeSplitting: {
			includeDependenciesRecursively: false,
			groups: LAZY_COMPONENT_NAMES.map(component => ({
				name: `lazy-${component}`,
				test: new RegExp(`[\\/]src[\\/]components[\\/]${component}[\\/](?:ui|model|styles)[\\/]`),
				priority: 10,
			})),
		},
	}
}

/**
 * Входы и чанки пакета. `withSubpaths` — основной проход: JS всех входов и подпутей `./<Компонент>` (build/plugins/subpaths.ts).
 * Обычный ESM без `strictExecutionOrder`: его обёртки инициализации модулей (`var X; init = () => { X = … }`) при
 * `sideEffects` пакета приложение на Vite 8 выбрасывало вместе с вызовом, и импортированный компонент оставался `undefined`.
 * Без `withSubpaths` — проход `styles.css` (vite.styles-css.config.ts): входы и группы чанков как до подпутей, JS не пишется.
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
			// Вход экспортирует ровно своё (без служебных имён); группам прохода styles.css нужен 'allow-extension'
			preserveEntrySignatures: withSubpaths ? 'strict' : 'allow-extension',

			output: {
				entryFileNames: '[name].js',
				chunkFileNames: 'chunks/[name]-[hash].js',
				...(withSubpaths ? {} : createLazyGroups()),

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
