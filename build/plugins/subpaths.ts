/**
 * Входы подпутей в основной сборке пакета (build/config/subpaths.ts).
 *
 * Вход `components/<Имя>/index` — виртуальный модуль `export * from 'src/components/<Имя>/index.ts'`: код компонента остаётся
 * в общих чанках, которые делят `./`, `./components` и все подпути, — в приложении один экземпляр компонента, composables
 * и ключей provide/inject (настройки `createUiKitPlugin` доходят и до компонентов из подпутей). Сам вход — только реэкспорт.
 *
 * В начало входа сборка дописывает `import '../<Папка>/style.css'` по одному на каждую папку компонента, чьи стили
 * статически подключает подпуть (своя и внутренние компоненты), — в порядке выполнения модулей ESM, как правила лежат
 * в `styles.css`. CSS импортирует только вход подпути, общие чанки — нет: `./components` и корень по-прежнему без CSS.
 * Стили модулей по `import()` (ленивые части компонента) подключаются тем же входом, после статических.
 * Сами `style.css` собирает отдельный проход (vite.subpath-css.config.ts): список папок он берёт из того же графа модулей.
 */

import { posix, resolve } from 'node:path'
import type { Plugin, Rollup } from 'vite'
import { componentCssFile, componentOfModule, readPublicComponents, subpathEntryName } from '../config/subpaths'

const VIRTUAL_PREFIX = 'virtual:rise-subpath/'
const RESOLVED_PREFIX = `\0${VIRTUAL_PREFIX}`
const STYLE_FILE = /\.(?:css|scss|sass)$/

/** Входы для `build.lib.entry`: имя файла в dist → виртуальный модуль подпути */
export function createSubpathEntries(components: string[] = readPublicComponents()): Record<string, string> {
	return Object.fromEntries(components.map(component => [subpathEntryName(component), `${VIRTUAL_PREFIX}${component}`]))
}

function isStyleModule(id: string): boolean {
	return STYLE_FILE.test(id.split('?')[0]!)
}

/**
 * Папки компонентов, чьи стили подключает модуль `entryId`, в порядке выполнения ESM: сперва статический граф (зависимости раньше
 * импортёра, по порядку импортов), затем модули по `import()` в порядке обнаружения — их стили вход тоже подключает, иначе ленивая
 * часть (правка роадмапа) берёт внутренние компоненты кита без CSS: чанки CSS не подключают, подключает только вход подпути.
 */
export function collectStyleComponents(getModuleInfo: (id: string) => Rollup.ModuleInfo | null, entryId: string): string[] {
	const order: string[] = []
	const seen = new Set<string>()
	const lazy: string[] = []
	const visit = (id: string): void => {
		if (seen.has(id)) return
		seen.add(id)
		const info = getModuleInfo(id)
		if (!info) return
		info.importedIds.forEach(visit)
		lazy.push(...info.dynamicallyImportedIds)
		const component = isStyleModule(id) ? componentOfModule(id) : null
		if (component && !order.includes(component)) order.push(component)
	}
	visit(entryId)
	for (let index = 0; index < lazy.length; index++) visit(lazy[index]!)
	return order
}

function cssImports(entryFile: string, components: string[]): string {
	const from = posix.dirname(entryFile)
	return components.map(component => `import"./${posix.relative(from, componentCssFile(component))}";`.replace('"./../', '"../')).join('')
}

export function createSubpathsPlugin(root: string = process.cwd()): Plugin {
	return {
		name: 'rise:subpaths',
		apply: 'build',
		// Vite приводит входы `build.lib.entry` к абсолютному пути: имя компонента — всё после префикса
		resolveId(id) {
			const index = id.indexOf(VIRTUAL_PREFIX)
			return index < 0 ? null : `${RESOLVED_PREFIX}${id.slice(index + VIRTUAL_PREFIX.length)}`
		},
		load(id) {
			if (!id.startsWith(RESOLVED_PREFIX)) return null
			const component = id.slice(RESOLVED_PREFIX.length)
			const target = resolve(root, 'src/components', component, 'index.ts').replaceAll('\\', '/')
			return `export * from ${JSON.stringify(target)}\n`
		},
		generateBundle(_, bundle) {
			for (const file of Object.values(bundle)) {
				if (file.type !== 'chunk' || !file.facadeModuleId?.startsWith(RESOLVED_PREFIX)) continue
				const components = collectStyleComponents(id => this.getModuleInfo(id), file.facadeModuleId)
				file.code = `${cssImports(file.fileName, components)}${file.code}`
			}
		},
	}
}
