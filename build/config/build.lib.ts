import { readdirSync, readFileSync } from 'node:fs'
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

/** Входы автоимпорта: `./resolver`, `./nuxt` и runtime-плагин Nuxt, который `./nuxt` подключает по пути рядом с собой */
function createIntegrationEntries(): Record<string, string> {
	return {
		resolver: resolve(process.cwd(), 'src/resolver.ts'),
		nuxt: resolve(process.cwd(), 'src/nuxt.ts'),
		'nuxt-plugin': resolve(process.cwd(), 'src/integrations/nuxt/runtimePlugin.ts'),
	}
}

/** Готовые словари, кроме встроенного `ru`, — каждый в своём чанке: `en` импортирует и плагин, и без группы rolldown клал словарь в чанк
 * плагина, и приложение, взявшее `en` из корня ради `registerLocale(en)`, получало реестр всех компонентов (`uiKitPlugin`) */
const LOCALE_GROUPS = ['en', 'kk', 'uz', 'zh', 'ja'].map(code => ({
	name: `locale-${code}`,
	test: new RegExp(`[\\/]src[\\/]locales[\\/]${code}[\\/]`),
}))

/**
 * Общий код тяжёлых компонентов и их ленивых частей (`defineAsyncComponent(() => import(...))`, загрузчики по `import()`).
 * Без групп rolldown клал такой код (контекст карты, легенду роадмапа) в чанк самого компонента, и ленивый чанк импортировал
 * его обратно: компонент вызывает `import()` ленивого чанка, а тот статически импортирует чанк компонента. Приложение, которое
 * берёт из корня пакета только `createUiKitConfig` или `en`, получало из-за такой петли все ленивые чанки (≈200 КБ gzip) без
 * единого компонента: Vite 8 (rolldown) оставляет чанк по `import()`, если цель импортирует чанк его же вызывающего.
 * Группа выносит общее в чанки без обратной связи. `entriesAware` обязателен: без него группа забирает и зависимости модулей
 * (BaseButton, BaseIcon…) в один чанк, и плагин грузит его целиком (+15 КБ gzip в стартовом JS).
 * Новый общий модуль ленивой части: `test:subpaths` покажет «в сборке есть чанки по import()» — добавь его сюда.
 */
const LAZY_SHARED_GROUPS = [
	{
		name: 'roadmap-shared',
		test: /[\\/]BaseRoadmap[\\/](?:ui[\\/]parts[\\/](?:RoadmapLegend\.vue|notices[\\/])|model[\\/]view[\\/]format[\\/](?:roadmapLegend|roadmapText)\.ts)/,
		priority: 10,
		entriesAware: true,
	},
	{
		name: 'flow-map-shared',
		test: /[\\/]BaseFlowMap[\\/](?:model[\\/](?:context[\\/]flowContext|scenario[\\/]scenarioContext|notations[\\/](?:resolveKind|registry)|layout[\\/](?:compound|placement|useFlowLayout)|render[\\/]shapes[\\/]flowShapes|execute[\\/]flowReject|panels[\\/](?:detailsView|panelStatus)|data[\\/](?:flowDiff|flowGraph|flowIds|flowValidate|flowMigrate|flowNormalize))\.ts|ui[\\/]canvas[\\/]FlowSvgNode\.vue)/,
		priority: 10,
		entriesAware: true,
	},
]

/** Обойти `dir` и вернуть пути всех `.ts`-файлов (разделы словаря лежат по областям, в том числе во вложенных папках) */
function listSectionFiles(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
		const path = resolve(dir, entry.name)
		if (entry.isDirectory()) return listSectionFiles(path)
		return entry.name.endsWith('.ts') ? [path] : []
	})
}

/**
 * Русский словарь по чанкам (`src/locales/sections/**`): файл `ru/**` и обёртки `UI_*` его разделов — свой чанк `locale-ru-<путь>`,
 * чтобы раздел попадал туда, где его читают (в том числе в ленивый чанк компонента), а не в общий чанк `messages`.
 * `locale-core` (`localized`, `current`, `legacyKeys`) — отдельная группа с большим приоритетом: без неё первая группа забирает эти
 * общие зависимости, и все чанки словаря импортируют её (вместе со строками чата, которые тогда остаются в первом виде у всех).
 * Группы без `strictExecutionOrder`: в модулях разделов и `ru/**` нет вызовов, кроме `localized` (`__tests__/sections.spec.ts`).
 *
 * @public Тест `sections.spec.ts` берёт функцию динамическим импортом (файл вне проекта vue-tsc) — knip его не видит
 */
export function createRuLocaleGroups() {
	const localesDir = resolve(process.cwd(), 'src/locales')
	const norm = (path: string): string => path.replace(/\\/g, '/')
	const ruByModule = new Map<string, string>()
	for (const file of listSectionFiles(resolve(localesDir, 'sections'))) {
		const ruPath = /from '(?:\.\.\/)+(ru\/[^']+)'/.exec(readFileSync(file, 'utf8'))?.[1]
		if (ruPath) ruByModule.set(norm(file), ruPath)
	}
	const sectionsByRu = new Map<string, Set<string>>()
	for (const [module, ruPath] of ruByModule) {
		const modules = sectionsByRu.get(ruPath) ?? new Set<string>([norm(resolve(localesDir, `${ruPath}.ts`))])
		modules.add(module)
		sectionsByRu.set(ruPath, modules)
	}
	const core = new Set(['localized', 'current', 'legacyKeys'].map(name => norm(resolve(localesDir, `${name}.ts`))))
	return [
		{ name: 'locale-core', test: (id: string) => core.has(norm(id)), priority: 20 },
		...[...sectionsByRu].map(([ruPath, modules]) => ({
			name: `locale-${ruPath.replace(/\//g, '-')}`,
			test: (id: string) => modules.has(norm(id)),
			priority: 10,
		})),
	]
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
				config: resolve(process.cwd(), 'src/config.ts'),
				components: resolve(process.cwd(), 'src/components/index.ts'),
				composables: resolve(process.cwd(), 'src/composables/index.ts'),
				utils: resolve(process.cwd(), 'src/utils/index.ts'),
				icons: resolve(process.cwd(), 'src/icons/index.ts'),
				media: resolve(process.cwd(), 'src/components/BaseMediaPlayer/index.ts'),
				map3d: resolve(process.cwd(), 'src/map3d.ts'),
				roadmap3d: resolve(process.cwd(), 'src/roadmap3d.ts'),
				flow3d: resolve(process.cwd(), 'src/flow3d.ts'),
				// Автоимпорт: резолвер, модуль Nuxt и его плагин — без кода компонентов (src/integrations)
				...(withSubpaths ? createIntegrationEntries() : {}),
				// Подпути `./<Компонент>` (build/config/subpaths.ts): `components/<Компонент>/index.js`
				...(withSubpaths ? createSubpathEntries() : {}),
			},
			formats: ['es'],
			cssFileName: 'styles',
		},

		rollupOptions: {
			external: ['vue', /^three(\/.*)?$/, /^node:/],
			// Вход экспортирует ровно своё (без служебных имён); группам прохода styles.css нужен 'allow-extension'
			preserveEntrySignatures: withSubpaths ? 'strict' : 'allow-extension',

			output: {
				entryFileNames: '[name].js',
				chunkFileNames: 'chunks/[name]-[hash].js',
				...(withSubpaths
					? { codeSplitting: { groups: [...LOCALE_GROUPS, ...createRuLocaleGroups(), ...LAZY_SHARED_GROUPS] } }
					: createLazyGroups()),

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
