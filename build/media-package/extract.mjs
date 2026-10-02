/**
 * Готовит содержимое отдельного репозитория плеера: `node build/media-package/extract.mjs <папка>`.
 * Копирует плеер и презентацию на его ядре (без тестов и stories), переписывает импорты кита на публичные входы пакета
 * `@ramzes1385/rise-ui-kit`, кладёт SCSS-помощники кита и шаблон проекта (package.json, сборка, README).
 */

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const PLAYER = join(ROOT, 'src/components/BaseMediaPlayer')
const PRESENTATION = join(ROOT, 'src/components/BasePresentationPlayer')
const TEMPLATE = join(ROOT, 'build/media-package/template')
const KIT = '@ramzes1385/rise-ui-kit'

const PLAYER_PARTS = ['index.ts', 'model', 'types', 'ui', 'styles']

const KIT_SCSS = ['_functions.scss', '_mixins.scss', '_variables.scss']

const KIT_ENTRIES = [
	[/^@components(?:\/.*)?$/, `${KIT}/components`],
	[/^@composables(?:\/.*)?$/, `${KIT}/composables`],
	[/^@utils(?:\/.*)?$/, `${KIT}/utils`],
	[/^@icons(?:\/.*)?$/, `${KIT}/icons`],
	[/^@\/locales(?:\/.*)?$/, KIT],
]

const INTERNAL = /^@(?:\/|styles\/)/

/** Папки пакета внутри кита и их место в `src/` пакета: плеер — корень, презентация на его ядре — `presentation/` */
const PACKAGE_DIRS = [
	[/^@components\/BaseMediaPlayer(\/.*)?$/, ''],
	[/^@components\/BasePresentationPlayer(\/.*)?$/, 'presentation'],
]

function packagePath(specifier, file, src) {
	const dir = PACKAGE_DIRS.find(([pattern]) => pattern.test(specifier))
	if (!dir) return null
	const rest = specifier.match(dir[0])[1] ?? ''
	const path = relative(dirname(file), join(src, dir[1], rest)).replaceAll('\\', '/')
	return path.startsWith('.') ? path : `./${path}`
}

function rewriteImports(source, file, target) {
	const src = join(target, 'src')
	return source.replace(/(\bfrom\s+|\bimport\s+)(['"])([^'"]+)\2/g, (match, keyword, quote, specifier) => {
		const local = packagePath(specifier, file, src)
		if (local) return `${keyword}${quote}${local}${quote}`
		const entry = KIT_ENTRIES.find(([pattern]) => pattern.test(specifier))
		if (entry) return `${keyword}${quote}${entry[1]}${quote}`
		if (INTERNAL.test(specifier)) throw new Error(`${relative(target, file)}: импорт внутреннего модуля кита «${specifier}»`)
		return match
	})
}

function sourceFiles(dir) {
	return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
		const path = join(dir, entry.name)
		if (entry.isDirectory()) return sourceFiles(path)
		return /\.(ts|vue)$/.test(entry.name) ? [path] : []
	})
}

function copyPlayer(target) {
	const src = join(target, 'src')
	for (const part of PLAYER_PARTS) cpSync(join(PLAYER, part), join(src, part), { recursive: true })
	for (const part of PLAYER_PARTS) cpSync(join(PRESENTATION, part), join(src, 'presentation', part), { recursive: true })
	for (const file of sourceFiles(src)) {
		writeFileSync(file, rewriteImports(readFileSync(file, 'utf8'), file, target))
	}
}

function copyKitScss(target) {
	const dir = join(target, 'src/styles/kit')
	mkdirSync(dir, { recursive: true })
	for (const name of KIT_SCSS) {
		const lines = readFileSync(join(ROOT, 'src/styles', name), 'utf8').split('\n')
		const body = lines.slice(lines.findIndex(line => !line.startsWith('//'))).filter(line => !line.startsWith("@use './tokens'"))
		const header = `// Копия src/styles/${name} из Rise UI Kit без токенов: переменные --rise-* приходят из styles.css кита`
		writeFileSync(join(dir, name), [header, ...body].join('\n'))
	}
}

const target = process.argv[2] ? resolve(process.argv[2]) : null
if (!target) {
	console.error('Укажите папку: node build/media-package/extract.mjs <папка>')
	process.exit(1)
}
if (existsSync(target) && readdirSync(target).length > 0) {
	console.error(`Папка ${target} не пуста`)
	process.exit(1)
}
cpSync(TEMPLATE, target, { recursive: true })
copyPlayer(target)
copyKitScss(target)
console.log(`Готово: ${target}. Дальше — npm install и npm run build (см. README.md)`)
