/**
 * Точечная установка (PLAN, Н.2, вариант «б»): подпуть пакета на каждый публичный компонент — `@ramzes1385/rise-ui-kit/BaseButton`.
 * Здесь — единственный источник имён и путей и для сборки (build/plugins/subpaths.ts, vite.subpath-css.config.ts),
 * и для exports в package.json (scripts/generate-subpath-exports.mjs), и для проверок.
 *
 * Раскладка в dist:
 * - `components/<Имя>/index.js` — вход подпути: импорт CSS компонента и того, что он использует внутри, и реэкспорт из общих чанков
 *   основной сборки (тех же, что у `./` и `./components`: один экземпляр кода и ключей provide/inject на приложение);
 * - `components/<Имя>/style.css` — только собственные стили папки компонента, без токенов;
 * - `components/<Имя>/style.layer.css` — они же, готовые в слое `rise` (`@layer rise{…}`): их подключают ленивые чанки;
 * - `components/<Имя>/index.d.ts` — типы (их кладёт `build:lib:types`);
 * - `tokens.css` и `tokens.layer.css` — токены, тема, движение и база шрифта кита: подключаются один раз.
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const COMPONENTS_INDEX = 'src/components/index.ts'
const PUBLIC_EXPORT = /^export \* from '\.\/(Base\w+)'$/gm
const COMPONENT_DIR = /\/src\/components\/(Base\w+)\//

/** Публичные компоненты — ровно реэкспорты `src/components/index.ts` (вход `./components`) */
export function readPublicComponents(root: string = process.cwd()): string[] {
	const source = readFileSync(resolve(root, COMPONENTS_INDEX), 'utf8')
	return [...source.matchAll(PUBLIC_EXPORT)].map(([, name]) => name!).sort()
}

/** Папка компонента, которой принадлежит модуль (id — абсолютный путь, возможно с `?query`), или `null` */
export function componentOfModule(id: string): string | null {
	return COMPONENT_DIR.exec(id.split('?')[0]!.replaceAll('\\', '/'))?.[1] ?? null
}

/** Имя входа сборки и файла в dist без расширения: `components/BaseButton/index` */
export function subpathEntryName(component: string): string {
	return `components/${component}/index`
}

/** CSS папки компонента в dist */
export function componentCssFile(component: string): string {
	return `components/${component}/style.css`
}

/** CSS папки компонента в слое `rise` (`@layer rise{…}`): его импортируют ленивые чанки, чтобы не перебивать стили приложения */
export function componentLayerCssFile(component: string): string {
	return `components/${component}/style.layer.css`
}

export const TOKENS_CSS_FILE = 'tokens.css'
export const TOKENS_LAYER_CSS_FILE = 'tokens.layer.css'

/** Файл SCSS с токенами и базой кита: в `tokens.css` он попадает целиком, вместе с выводом prelude (build/config/css.ts) */
export const TOKENS_SOURCE = 'src/styles/kit.scss'

type ExportTarget = string | Record<string, string>

const EXPORTS_ANCHOR = './icons.svg'
const GENERATED_EXPORT = /^\.\/(?:Base\w+|tokens(?:\.layer)?\.css|resolver|nuxt|global)$/

/** Файл со списком имён публичных компонентов для резолвера и модуля Nuxt (их код — Node, без доступа к `src/components`) */
export const COMPONENT_NAMES_FILE = 'src/integrations/componentNames.ts'

/** Имя пакета в строках, которые собираются в код приложения: импорты подпутей и объявления типов */
const PACKAGE_NAME = '@ramzes1385/rise-ui-kit'

/** Текст `src/integrations/componentNames.ts` по списку компонентов (формат — как после prettier) */
export function componentNamesSource(components: string[]): string {
	const names = components.map(component => `\t'${component}',\n`).join('')
	return [
		'/** Утилиты: имена публичных компонентов с подпутями `@ramzes1385/rise-ui-kit/<Имя>` — файл пишет scripts/generate-subpath-exports.mjs */',
		'',
		`export const SUBPATH_COMPONENT_NAMES = [\n${names}] as const`,
		'',
	].join('\n')
}

/**
 * Текст `dist/global.d.ts`: компоненты кита в `GlobalComponents` Vue — типы шаблонов для глобальной регистрации
 * (`createUiKitPlugin`, Nuxt, `unplugin-vue-components`). Имена — по умолчанию, без префикса.
 */
export function globalTypesSource(components: string[]): string {
	const lines = components.map(component => `\t\t${component}: typeof import('${PACKAGE_NAME}/${component}')['${component}']\n`).join('')
	return `export {}\n\ndeclare module 'vue' {\n\texport interface GlobalComponents {\n${lines}\t}\n}\n`
}

const cssExport = (file: string): Record<string, string> => ({
	types: './dist/styles.d.ts',
	import: `./dist/${file}`,
	default: `./dist/${file}`,
})

/** Ключи exports точечной установки в порядке записи (`components` — список, если его ещё нет на диске, как в create:component) */
export function subpathExports(
	root: string = process.cwd(),
	components: string[] = readPublicComponents(root),
): Record<string, ExportTarget> {
	const entries: [string, ExportTarget][] = [
		['./resolver', { types: './dist/resolver.d.ts', import: './dist/resolver.js' }],
		['./nuxt', { types: './dist/nuxt.d.ts', import: './dist/nuxt.js' }],
		['./global', { types: './dist/global.d.ts' }],
		[`./${TOKENS_CSS_FILE}`, cssExport(TOKENS_CSS_FILE)],
		[`./${TOKENS_LAYER_CSS_FILE}`, cssExport(TOKENS_LAYER_CSS_FILE)],
	]
	for (const component of components) {
		const file = subpathEntryName(component)
		entries.push([`./${component}`, { types: `./dist/${file}.d.ts`, import: `./dist/${file}.js` }])
	}
	return Object.fromEntries(entries)
}

/** exports пакета с подпутями на месте: свои ключи — как были, сгенерированные — заново, перед `./icons.svg` */
export function withSubpathExports(
	exports: Record<string, unknown>,
	root: string = process.cwd(),
	components: string[] = readPublicComponents(root),
): Record<string, unknown> {
	const own = Object.entries(exports).filter(([key]) => !GENERATED_EXPORT.test(key))
	const anchor = own.findIndex(([key]) => key === EXPORTS_ANCHOR)
	const at = anchor < 0 ? own.length : anchor
	return Object.fromEntries([...own.slice(0, at), ...Object.entries(subpathExports(root, components)), ...own.slice(at)])
}
