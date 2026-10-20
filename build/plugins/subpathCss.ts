/**
 * Третий проход сборки пакета (vite.subpath-css.config.ts): CSS для точечной установки (build/config/subpaths.ts).
 *
 * - `components/<Имя>/style.css` — собственные стили папки компонента. Токены, которые Sass-prelude (build/config/css.ts)
 *   кладёт в начало каждого файла, отрезаются по метке: в этом проходе prelude заканчивается модулем-меткой
 *   (`@use 'rise:css-split-marker'`), и всё до неё в скомпилированном CSS — вывод prelude. Метка стоит после prelude,
 *   но до `@use` самого файла, поэтому стили частичных файлов (`@use './body/cell'` у BaseTable) остаются.
 * - `components/<Имя>/style.layer.css` — то же внутри `@layer rise{…}`: готовый слой, а не `@import … layer(rise)`, потому что ленивый чанк
 *   подключает файл из JS, и сборщики приложений по-разному разбирают `layer()` в `@import` (порядок, дубли запросов); так правила ленивой части
 *   слабее любых неслойных стилей приложения и в том же слое, что у `styles.layer.css`.
 * - `tokens.css` — `src/styles/kit.scss` целиком: токены, темы, движение и база шрифта; `tokens.layer.css` — он же в слое `rise`.
 *
 * Модули каждой папки компонента — свой чанк (группа `codeSplitting`), CSS чанка — CSS этой папки; JS прохода не нужен
 * (код подпутей уже собран основным проходом) и из бандла удаляется. Минификация и цели браузеров — те же, что у styles.css.
 */

import { resolve } from 'node:path'
import type { Plugin, Rollup } from 'vite'
import { stripBeforeMarker } from './cssSplit'
import { createScssOptions } from '../config/css'
import {
	componentCssFile,
	componentLayerCssFile,
	componentOfModule,
	TOKENS_CSS_FILE,
	TOKENS_LAYER_CSS_FILE,
	TOKENS_SOURCE,
} from '../config/subpaths'

const CSS_FILE = /\.(?:css|scss|sass)$/
const MARKER_URL = 'rise:css-split-marker'
const MARKER_CSS = '.rise-css-split-marker{--rise-css-split-marker:0}\n'
const TOKENS_VIRTUAL = 'virtual:rise-subpath-tokens'
const TOKENS_RESOLVED = `\0${TOKENS_VIRTUAL}`

const TOKENS_LAYER_CSS = `@import url('./${TOKENS_CSS_FILE}') layer(rise);\n`

function cleanId(id: string): string {
	return id.split('?')[0]!.replaceAll('\\', '/')
}

/** Sass-импортёр модуля-метки: его CSS — одно правило, по которому отрезается вывод prelude */
const splitMarkerImporter = {
	canonicalize(url: string): URL | null {
		return url === MARKER_URL ? new URL(MARKER_URL) : null
	},
	load(): { contents: string; syntax: 'css' } {
		return { contents: MARKER_CSS, syntax: 'css' }
	},
}

/** Стили папки компонента получают метку после prelude; токены и общие файлы `src/styles` — без неё */
function needsSplitMarker(filename: string): boolean {
	return componentOfModule(filename) !== null
}

/**
 * Настройки Sass прохода: тот же prelude (build/config/css.ts), а у стилей компонентов за ним — `@use` модуля-метки.
 * Prelude подставляется перед исходником (`additionalData`), поэтому метка встаёт после токенов, но раньше `@use` самого файла.
 */
export function createSubpathScssOptions(): object {
	const base = createScssOptions()
	return {
		...base,
		importers: [splitMarkerImporter],
		additionalData: (source: string, filename: string) => {
			const withPrelude = base.additionalData(source, filename)
			if (!needsSplitMarker(filename) || withPrelude === source) return withPrelude
			return `${withPrelude.slice(0, withPrelude.length - source.length)}@use '${MARKER_URL}';\n${source}`
		},
	}
}

/** Группы чанков: модули каждой папки компонента — отдельно, без общих зависимостей (`kit.scss` и так только у входа токенов) */
export function createSubpathCssGroups(components: string[]): Rollup.OutputOptions['codeSplitting'] {
	return {
		includeDependenciesRecursively: false,
		groups: components.map(component => ({
			name: `css-${component}`,
			test: new RegExp(`[\\\\/]src[\\\\/]components[\\\\/]${component}[\\\\/]`),
			priority: 10,
		})),
	}
}

/** Вход прохода для `tokens.css` (абсолютный путь — так Vite не тронет его в `build.lib.entry`) */
export const TOKENS_ENTRY = TOKENS_VIRTUAL

function createTokensEntryPlugin(root: string): Plugin {
	return {
		name: 'rise:subpath-css-tokens',
		apply: 'build',
		resolveId(id) {
			return id.includes(TOKENS_VIRTUAL) ? TOKENS_RESOLVED : null
		},
		load(id) {
			if (id !== TOKENS_RESOLVED) return null
			return `import ${JSON.stringify(resolve(root, TOKENS_SOURCE).replaceAll('\\', '/'))}\n`
		},
	}
}

/** Без `enforce`: после `vite:css` (компиляция Sass), до `vite:css-post` — как фильтр build/plugins/cssSplit.ts */
function createStripPlugin(root: string): Plugin {
	const tokensSource = resolve(root, TOKENS_SOURCE).replaceAll('\\', '/')
	return {
		name: 'rise:subpath-css-strip',
		apply: 'build',
		transform(code, id) {
			if (!CSS_FILE.test(cleanId(id))) return null
			if (cleanId(id) === tokensSource) return null
			if (!needsSplitMarker(cleanId(id))) this.error(`subpath-css: ${cleanId(id)} — стили вне папки компонента и не ${TOKENS_SOURCE}`)
			const own = stripBeforeMarker(code)
			if (own === null) this.error(`subpath-css: в ${cleanId(id)} нет метки — токены не отделить от стилей компонента`)
			return { code: own, map: null }
		},
	}
}

function chunkCss(chunk: Rollup.OutputChunk, bundle: Rollup.OutputBundle): string {
	const files = [...(chunk.viteMetadata?.importedCss ?? [])]
	return files.map(file => (bundle[file]?.type === 'asset' ? String((bundle[file] as Rollup.OutputAsset).source) : '')).join('')
}

/** Файл в dist, которому принадлежат стили чанка; стили разных папок в одном чанке — ошибка сборки, а не молча перепутанный CSS */
function chunkTarget(chunk: Rollup.OutputChunk, tokensSource: string, fail: (message: string) => never): string | null {
	const owners = new Set<string>()
	for (const id of chunk.moduleIds.map(cleanId).filter(id => CSS_FILE.test(id))) {
		const component = componentOfModule(id)
		owners.add(id === tokensSource ? TOKENS_CSS_FILE : component ? componentCssFile(component) : id)
	}
	if (owners.size > 1) fail(`subpath-css: в чанке ${chunk.fileName} стили нескольких папок (${[...owners].join(', ')})`)
	if (owners.size === 0 && chunk.viteMetadata?.importedCss.size)
		fail(`subpath-css: у чанка ${chunk.fileName} чужой CSS (из удалённого чанка без JS)`)
	return owners.values().next().value ?? null
}

/** Оставляет в бандле только `components/<Имя>/style.css`, `tokens.css` и `tokens.layer.css` */
function createCollectPlugin(root: string): Plugin {
	const tokensSource = resolve(root, TOKENS_SOURCE).replaceAll('\\', '/')
	return {
		name: 'rise:subpath-css-collect',
		apply: 'build',
		enforce: 'post',
		generateBundle(_, bundle) {
			const outputs = new Map<string, string>()
			const fail = (message: string): never => this.error(message)
			for (const file of Object.values(bundle)) {
				const target = file.type === 'chunk' ? chunkTarget(file, tokensSource, fail) : null
				if (!target) continue
				if (outputs.has(target)) fail(`subpath-css: стили ${target} разошлись по нескольким чанкам — порядок правил не определён`)
				outputs.set(target, chunkCss(file as Rollup.OutputChunk, bundle))
			}
			for (const name of Object.keys(bundle)) delete bundle[name]
			if (!outputs.get(TOKENS_CSS_FILE)) fail(`subpath-css: ${TOKENS_CSS_FILE} не собран`)
			for (const [fileName, source] of outputs) {
				if (!source.trim()) continue
				this.emitFile({ type: 'asset', fileName, source })
				const component = /^components\/(\w+)\/style\.css$/.exec(fileName)?.[1]
				if (component)
					this.emitFile({ type: 'asset', fileName: componentLayerCssFile(component), source: `@layer rise{${source}}\n` })
			}
			this.emitFile({ type: 'asset', fileName: TOKENS_LAYER_CSS_FILE, source: TOKENS_LAYER_CSS })
		},
	}
}

export function createSubpathCssPlugins(root: string = process.cwd()): Plugin[] {
	return [createTokensEntryPlugin(root), createStripPlugin(root), createCollectPlugin(root)]
}
