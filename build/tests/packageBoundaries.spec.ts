/** Регрессия: utils/index.ts реэкспортировал storybookUtils с runtime-импортом 'storybook/test' — lib-сборка вшивала тестовый рантайм Storybook (~600 КБ) в dist/utils, подгружаемый при импорте корня пакета. */

import ts from 'typescript'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
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
		if (existsSync(base + ext)) return base + ext
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
		const unexpected = [...collectExternalImports()].filter(([name]) => !allowed.has(name))
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

/** Папки отдельного пакета плеера: сам плеер и презентация на его ядре; друг из друга они берут код напрямую */
const MEDIA_DIRS = ['components/BaseMediaPlayer', 'components/BasePresentationPlayer'].map(dir => join(SRC, dir))

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

/** Импорты папки плеера из остального кита: файл, модуль и импортируемые имена */
function mediaKitImports(): Array<{ file: string; specifier: string; name: string }> {
	return MEDIA_DIRS.flatMap(listSources).flatMap(file => {
		let source = readFileSync(file, 'utf8')
		if (file.endsWith('.vue')) source = [...source.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(match => match[1]).join('\n')
		const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest)
		return tree.statements.flatMap(statement => {
			if (!(ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) || !statement.moduleSpecifier) return []
			const specifier = (statement.moduleSpecifier as ts.StringLiteral).text
			const target = resolveSpecifier(specifier, file)
			if (!target || MEDIA_DIRS.some(dir => target.startsWith(dir + sep))) return []
			const names = ts.isImportDeclaration(statement)
				? importedNames(statement.importClause, undefined)
				: importedNames(undefined, statement.exportClause)
			return names.map(name => ({ file: relative(ROOT, file), specifier, name }))
		})
	})
}

describe('границы плеера', () => {
	it('папка плеера берёт код кита только из его публичных входов: каждое имя экспортирует пакет', () => {
		const imports = mediaKitImports()
		const publicNames = kitPublicNames()
		expect(imports.length).toBeGreaterThan(0)
		expect(imports.filter(({ name }) => !publicNames.has(name))).toEqual([])
	})
})
