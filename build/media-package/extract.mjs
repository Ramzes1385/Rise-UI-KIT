/**
 * Готовит содержимое отдельного репозитория плеера: `node build/media-package/extract.mjs <папка>`.
 * Копирует плеер (без тестов и stories), переписывает импорты кита на публичные входы пакета
 * `@ramzes1385/rise-ui-kit`, кладёт SCSS-помощники кита и шаблон проекта (package.json, сборка, README).
 */

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const PLAYER = join(ROOT, 'src/components/BaseMediaPlayer')
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

function rewriteImports(source, file) {
	return source.replace(/(\bfrom\s+|\bimport\s+)(['"])([^'"]+)\2/g, (match, keyword, quote, specifier) => {
		const entry = KIT_ENTRIES.find(([pattern]) => pattern.test(specifier))
		if (entry) return `${keyword}${quote}${entry[1]}${quote}`
		if (INTERNAL.test(specifier)) throw new Error(`${file}: импорт внутреннего модуля кита «${specifier}»`)
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
	for (const file of sourceFiles(src)) {
		writeFileSync(file, rewriteImports(readFileSync(file, 'utf8'), relative(target, file)))
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
cpSync(join(ROOT, 'THIRD_PARTY_NOTICES.md'), join(target, 'THIRD_PARTY_NOTICES.md'))
console.log(`Готово: ${target}. Дальше — npm install и npm run build (см. README.md)`)
