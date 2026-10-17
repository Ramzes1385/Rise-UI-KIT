/** Регрессия: utils/index.ts реэкспортировал storybookUtils с runtime-импортом 'storybook/test' — lib-сборка вшивала тестовый рантайм Storybook (~600 КБ) в dist/utils, подгружаемый при импорте корня пакета. */

import ts from 'typescript'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, normalize, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const SRC = join(ROOT, 'src')

/** Входы lib-сборки: src/index.ts и subpath-входы из package.json exports */
const PUBLIC_ENTRIES = [
	'index.ts',
	'components/index.ts',
	'composables/index.ts',
	'utils/index.ts',
	'icons/index.ts',
	'components/BaseMediaPlayer/index.ts',
	'map3d.ts',
	'config.ts',
	'resolver.ts',
	'nuxt.ts',
	'integrations/nuxt/runtimePlugin.ts',
]

const ALIASES: Record<string, string> = {
	'@components': 'components',
	'@composables': 'composables',
	'@icons': 'icons',
	'@styles': 'styles',
	'@utils': 'utils',
	'@': '',
}

const EXTENSIONS = ['.ts', '.vue', '/index.ts']

function resolveFile(base: string): string | null {
	if (existsSync(base) && statSync(base).isFile()) return base
	for (const ext of EXTENSIONS) {
		if (existsSync(base + ext)) return normalize(base + ext)
	}
	return null
}

function resolveSpecifier(specifier: string, importer: string): string | null {
	for (const [alias, target] of Object.entries(ALIASES)) {
		if (specifier === alias || specifier.startsWith(`${alias}/`)) {
			return resolveFile(join(SRC, target, specifier.slice(alias.length)))
		}
	}
	if (specifier.startsWith('.')) return resolveFile(resolve(dirname(importer), specifier))
	return null
}

/** Runtime-импорты модуля: type-only импорты стираются компилятором и в бандл не попадают */
function runtimeSpecifiers(file: string): string[] {
	let source = readFileSync(file, 'utf8')
	if (file.endsWith('.vue')) {
		source = [...source.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(match => match[1]).join('\n')
	}
	const specifiers: string[] = []
	const staticRe = /^\s*(import|export)\s+(type\s+)?(?:[\s\S]*?\sfrom\s+)?['"]([^'"]+)['"]/gm
	for (const match of source.matchAll(staticRe)) {
		if (!match[2]) specifiers.push(match[3])
	}
	for (const match of source.matchAll(/\bimport\(\s*['"]([^'"]+)['"]\s*\)/g)) specifiers.push(match[1])
	return specifiers.filter(specifier => !/\.(s?css|sass)$/.test(specifier))
}

function collectExternalImports(): Map<string, string[]> {
	const externals = new Map<string, string[]>()
	const queue = PUBLIC_ENTRIES.map(entry => join(SRC, entry))
	const seen = new Set<string>()
	while (queue.length) {
		const file = queue.pop()!
		if (seen.has(file)) continue
		seen.add(file)
		for (const specifier of runtimeSpecifiers(file)) {
			const local = resolveSpecifier(specifier, file)
			if (local) {
				queue.push(local)
				continue
			}
			if (specifier.startsWith('.') || specifier.startsWith('@/')) continue
			const packageName = specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0]
			externals.set(packageName, [...(externals.get(packageName) ?? []), relative(ROOT, file)])
		}
	}
	return externals
}

describe('границы npm-пакета', () => {
	it('публичные входы импортируют извне только peerDependencies и dependencies', () => {
		const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
		const allowed = new Set([...Object.keys(pkg.peerDependencies ?? {}), ...Object.keys(pkg.dependencies ?? {})])
		const unexpected = [...collectExternalImports()].filter(([name]) => !allowed.has(name) && !name.startsWith('node:'))
		expect(unexpected).toEqual([])
	})

	it('storybook-хелперы не входят в публичный barrel utils', () => {
		const externals = collectExternalImports()
		expect(externals.has('storybook')).toBe(false)
		expect(externals.has('@storybook/vue3')).toBe(false)
	})
})

/** Входы кита, через которые плеер (отдельный вход `/media`, позже — отдельный пакет) может брать его код */
const KIT_ENTRIES = ['index.ts', 'components/index.ts', 'composables/index.ts', 'utils/index.ts', 'icons/index.ts']

/** Пакеты из `build/packages/packages.json`: папки компонентов кита, входы пакета и входы, которым разрешён `three` */
interface PackageConfig {
	name: string
	components: Array<{ dir: string; to: string }>
	entries: Record<string, string[]>
	threeEntries: string[]
}

const PACKAGES: Record<string, PackageConfig> = JSON.parse(readFileSync(join(ROOT, 'build/packages/packages.json'), 'utf8'))

function packageDirs(config: PackageConfig): string[] {
	return config.components.map(({ dir }) => join(SRC, 'components', dir))
}

/** Строки и формат языка кита пакет берёт через сгенерированный `src/kitLocale.ts` (публичный `useLocale()`): имена проверяет сборка пакета в extract.mjs */
const KIT_LOCALE_SPECIFIER = /^@\/locales\/(?:messages|state|warn)$/

function kitPublicNames(): Set<string> {
	const host = { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => undefined }
	const config = ts.getParsedCommandLineOfConfigFile(join(ROOT, 'tsconfig.app.json'), {}, host)
	const entries = KIT_ENTRIES.map(entry => join(SRC, entry))
	const program = ts.createProgram(entries, config?.options ?? {})
	const checker = program.getTypeChecker()
	return new Set(
		entries.flatMap(entry => {
			const moduleSymbol = checker.getSymbolAtLocation(program.getSourceFile(entry) as ts.SourceFile)
			return moduleSymbol ? checker.getExportsOfModule(moduleSymbol).map(symbol => symbol.name) : []
		}),
	)
}

function listSources(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
		const path = join(dir, entry.name)
		if (entry.isDirectory()) return ['__tests__', 'stories'].includes(entry.name) ? [] : listSources(path)
		return /\.(ts|vue)$/.test(entry.name) ? [path] : []
	})
}

function importedNames(clause: ts.ImportClause | undefined, exportClause: ts.NamedExportBindings | undefined): string[] {
	const names: string[] = []
	if (clause?.name) names.push('default')
	const bindings = clause?.namedBindings ?? exportClause
	if (bindings && (ts.isNamespaceImport(bindings) || ts.isNamespaceExport(bindings))) names.push('*')
	else if (bindings) bindings.elements.forEach(element => names.push((element.propertyName ?? element.name).text))
	return names
}

/** Импорты папок пакета из остального кита: файл, модуль и импортируемые имена */
function packageKitImports(dirs: string[]): Array<{ file: string; specifier: string; name: string }> {
	return dirs.flatMap(listSources).flatMap(file => {
		let source = readFileSync(file, 'utf8')
		if (file.endsWith('.vue')) source = [...source.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(match => match[1]).join('\n')
		const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest)
		return tree.statements.flatMap(statement => {
			if (!(ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) || !statement.moduleSpecifier) return []
			const specifier = (statement.moduleSpecifier as ts.StringLiteral).text
			if (KIT_LOCALE_SPECIFIER.test(specifier)) return []
			const target = resolveSpecifier(specifier, file)
			if (!target || dirs.some(dir => target.startsWith(dir + sep))) return []
			const names = ts.isImportDeclaration(statement)
				? importedNames(statement.importClause, undefined)
				: importedNames(undefined, statement.exportClause)
			return names.map(name => ({ file: relative(ROOT, file), specifier, name }))
		})
	})
}

describe.each(Object.entries(PACKAGES))('границы пакета %s', (key, config) => {
	const dirs = packageDirs(config)

	it('папки пакета берут код кита только из его публичных входов: каждое имя экспортирует пакет', () => {
		const imports = packageKitImports(dirs)
		const publicNames = kitPublicNames()
		expect(imports.length).toBeGreaterThan(0)
		expect(imports.filter(({ name }) => !publicNames.has(name))).toEqual([])
	})

	it('внешние runtime-импорты пакета объявлены в peerDependencies шаблона', () => {
		const template = JSON.parse(readFileSync(join(ROOT, 'build/packages/templates', key, 'package.json'), 'utf8'))
		const declared = new Set([...Object.keys(template.peerDependencies ?? {}), ...Object.keys(template.dependencies ?? {})])
		const external = new Set(
			dirs
				.flatMap(listSources)
				.flatMap(file =>
					runtimeSpecifiers(file).filter(specifier => !specifier.startsWith('.') && !resolveSpecifier(specifier, file)),
				)
				.map(specifier => (specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0])),
		)
		expect([...external].filter(name => !declared.has(name))).toEqual([])
	})

	it('three — только в папках входов threeEntries; остальные входы пакета его не достигают', () => {
		const threeDirs = config.threeEntries.flatMap(entry => config.entries[entry]).map(dir => join(SRC, 'components', dir))
		const offenders = dirs
			.flatMap(listSources)
			.filter(importsThree)
			.filter(file => !threeDirs.some(dir => file.startsWith(dir + sep)))
		expect(offenders.map(file => relative(ROOT, file))).toEqual([])
		const plainEntries = Object.entries(config.entries)
			.filter(([entry]) => !config.threeEntries.includes(entry))
			.flatMap(([, entryDirs]) => entryDirs.map(dir => `components/${dir}/index.ts`))
		expect([...reachableFrom(plainEntries)].filter(importsThree).map(file => relative(ROOT, file))).toEqual([])
	})

	it('extract.mjs собирает пакет: импорты кита переписаны, внутренних модулей нет', () => {
		const out = mkdtempSync(join(tmpdir(), `rise-${key}-`))
		try {
			execFileSync('node', [join(ROOT, 'build/packages/extract.mjs'), key, join(out, 'pkg')], { stdio: 'pipe' })
			const sources = listSources(join(out, 'pkg/src'))
			expect(sources.length).toBeGreaterThan(0)
			const leftovers = sources.filter(file =>
				/from\s+['"]@(?:components|composables|utils|icons|styles)?\//.test(readFileSync(file, 'utf8')),
			)
			expect(leftovers).toEqual([])
		} finally {
			rmSync(out, { recursive: true, force: true })
		}
	})
})

/** Где разрешён `three` (вход `/map3d`): остальной кит и его входы WebGL-движок не тянут */
const MAP3D_DIR = join(SRC, 'components/BaseImageMap3D')
const MAP3D_ENTRY = join(SRC, 'map3d.ts')
/** Модули BaseImageMap3D, которые берёт основной вход (BaseImageMapEditor проверяет 3D-поля JSON): без three и сцены */
const MAP3D_SHARED = ['model/validate3d.ts']

function importsThree(file: string): boolean {
	return runtimeSpecifiers(file).some(specifier => /^three(\/.*)?$/.test(specifier))
}

function reachableFrom(entries: string[]): Set<string> {
	const seen = new Set<string>()
	const queue = entries.map(entry => join(SRC, entry))
	while (queue.length) {
		const file = queue.pop()!
		if (seen.has(file)) continue
		seen.add(file)
		runtimeSpecifiers(file).forEach(specifier => {
			const local = resolveSpecifier(specifier, file)
			if (local) queue.push(local)
		})
	}
	return seen
}

describe('границы входа /map3d', () => {
	it('three импортируется только из BaseImageMap3D и src/map3d.ts', () => {
		const offenders = listSources(SRC)
			.filter(file => !file.startsWith(MAP3D_DIR + sep) && file !== MAP3D_ENTRY)
			.filter(importsThree)
			.map(file => relative(ROOT, file))
		expect(offenders).toEqual([])
	})

	it('входы кита и /media достигают из BaseImageMap3D только проверки данных без three (редактор карты)', () => {
		const reachable = [...reachableFrom([...KIT_ENTRIES, 'components/BaseMediaPlayer/index.ts'])]
		const fromMap3d = reachable
			.filter(file => file.startsWith(MAP3D_DIR + sep))
			.map(file => relative(MAP3D_DIR, file).split(sep).join('/'))
		expect(fromMap3d.filter(file => !MAP3D_SHARED.includes(file))).toEqual([])
		expect(reachable.filter(importsThree).map(file => relative(ROOT, file))).toEqual([])
	})

	it('вход /map3d импортирует three', () => {
		expect([...reachableFrom(['map3d.ts'])].some(importsThree)).toBe(true)
	})
})

describe('границы входа /config', () => {
	it('настройки кита не достигают компонентов и реестра плагина: JS компонентов в сборку не попадает', () => {
		const reachable = [...reachableFrom(['config.ts'])].map(file => relative(SRC, file).split(sep).join('/'))
		expect(reachable).toContain('plugin/options.ts')
		expect(reachable.filter(file => file.startsWith('components/') || file.startsWith('plugin/registry/'))).toEqual([])
		expect(reachable).not.toContain('plugin/plugin.ts')
	})
})
