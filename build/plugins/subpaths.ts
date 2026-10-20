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
 * Стили модулей по `import()` (ленивые части компонента) вход не подключает: их `style.css` импортирует сам ленивый чанк
 * (то, чего нет у входа компонента, который вызывает `import()`), и приложение подтягивает CSS при загрузке чанка.
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
 * Папки компонентов, чьи стили подключает модуль `entryId`, в порядке выполнения ESM: статический граф (зависимости раньше
 * импортёра, по порядку импортов). Модули по `import()` в обход не входят: их стили подключает сам ленивый чанк
 * (`lazyChunkStyleComponents`), поэтому приложение, открывшее только первый вид, не грузит CSS ленивой части.
 */
export function collectStyleComponents(getModuleInfo: (id: string) => Rollup.ModuleInfo | null, entryId: string): string[] {
	const order: string[] = []
	const seen = new Set<string>()
	const visit = (id: string): void => {
		if (seen.has(id)) return
		seen.add(id)
		const info = getModuleInfo(id)
		if (!info) return
		info.importedIds.forEach(visit)
		const component = isStyleModule(id) ? componentOfModule(id) : null
		if (component && !order.includes(component)) order.push(component)
	}
	visit(entryId)
	return order
}

/**
 * Папки компонентов, чей CSS нужен ленивому чанку (цель `import()` — модуль `lazyId`) и которого нет у входа подпути компонента,
 * вызывающего `import()`: ленивый чанк импортирует их `style.css` сам, и приложение подтягивает CSS вместе с чанком. Если чанк
 * вызывают из нескольких компонентов, исключается только то, что есть у входов всех. Вызов не из папки публичного компонента
 * (реестр плагина) — пусто: у плагина и корня есть `styles.css`.
 */
export function lazyChunkStyleComponents(
	getModuleInfo: (id: string) => Rollup.ModuleInfo | null,
	lazyId: string,
	publicComponents: ReadonlySet<string>,
): string[] {
	const importers = getModuleInfo(lazyId)?.dynamicImporters ?? []
	const owners = importers.map(id => componentOfModule(id))
	if (!owners.length || owners.some(owner => !owner || !publicComponents.has(owner))) return []
	const own = owners.map(owner => new Set(collectStyleComponents(getModuleInfo, `${RESOLVED_PREFIX}${owner}`)))
	return collectStyleComponents(getModuleInfo, lazyId).filter(component => !own.every(set => set.has(component)))
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
			const getInfo = (id: string): Rollup.ModuleInfo | null => this.getModuleInfo(id)
			const publicComponents = new Set(readPublicComponents(root))
			for (const file of Object.values(bundle)) {
				if (file.type !== 'chunk' || !file.facadeModuleId) continue
				const isSubpath = file.facadeModuleId.startsWith(RESOLVED_PREFIX)
				if (!isSubpath && !file.isDynamicEntry) continue
				const components = isSubpath
					? collectStyleComponents(getInfo, file.facadeModuleId)
					: lazyChunkStyleComponents(getInfo, file.facadeModuleId, publicComponents)
				file.code = `${cssImports(file.fileName, components)}${file.code}`
			}
		},
	}
}
