/** Командная строка `rise-ui-kit migrate [папка] [--dry] [--write]`: обход файлов, запуск правил, отчёт. */

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'

import { unifiedDiff } from './diff.mjs'
import { KIT, MIGRATION_URL, SECTION, slugify } from './rules.mjs'
import { collectFacts, mergeFacts, transformFile } from './transform.mjs'

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'coverage', '.nuxt', '.output', '.next', '.turbo', 'storybook-static'])
const FILE_RE = /\.(?:vue|[cm]?[jt]s|[jt]sx|s?css)$/

export const HELP = `Использование: npx ${KIT} migrate [папка] [--dry] [--write]

Переводит приложение с Rise UI Kit 1.x на 2.0: переименования импортов, пропсов и CSS-классов делает сам,
остальное (удалённые слоты, события, токены) показывает предупреждениями с ссылкой на docs/v2/MIGRATION.md.

  папка    где искать файлы (.vue, .ts, .tsx, .js, .css, .scss); по умолчанию текущая
  --dry    по умолчанию: показать diff и предупреждения, файлы не менять
  --write  записать правки в файлы (повторный запуск ничего не меняет)
  --help   эта справка`

export function parseArgs(argv) {
	const options = { dir: '.', write: false, help: false, error: null }
	let hasDry = false
	let hasDir = false
	for (const arg of argv) {
		if (arg === '--write') options.write = true
		else if (arg === '--dry') hasDry = true
		else if (arg === '--help' || arg === '-h') options.help = true
		else if (arg.startsWith('-')) options.error = `Неизвестный параметр: ${arg}`
		else if (hasDir) options.error = `Лишний аргумент: ${arg}`
		else {
			options.dir = arg
			hasDir = true
		}
	}
	if (hasDry && options.write) options.error = '--dry и --write взаимоисключающие'
	return options
}

/** Файлы для обработки: отсортированные пути относительно папки, без служебных каталогов и `.d.ts`. */
export function listFiles(root) {
	const found = []
	const walk = dir => {
		for (const entry of readdirSync(dir, { withFileTypes: true })) {
			if (entry.isDirectory()) {
				if (!SKIP_DIRS.has(entry.name)) walk(join(dir, entry.name))
			} else if (entry.isFile() && FILE_RE.test(entry.name) && !entry.name.endsWith('.d.ts')) {
				found.push(relative(root, join(dir, entry.name)).split('\\').join('/'))
			}
		}
	}
	walk(root)
	return found.sort()
}

/** Ищет package.json рядом с папкой или выше (до трёх уровней) и проверяет версию Vue. */
export function vueVersionWarning(root) {
	let dir = root
	for (let level = 0; level < 4; level++) {
		const file = join(dir, 'package.json')
		if (existsSync(file)) {
			const text = readFileSync(file, 'utf8')
			const pkg = JSON.parse(text)
			const range = pkg.dependencies?.vue ?? pkg.devDependencies?.vue
			const version = /(\d+)\.(\d+)/.exec(range ?? '')
			if (!version || Number(version[1]) > 3 || (Number(version[1]) === 3 && Number(version[2]) >= 5)) return null
			const line = text.slice(0, text.indexOf('"vue"')).split('\n').length
			return {
				file: relative(root, file).split('\\').join('/'),
				line,
				text: `vue ${range}: кит 2.0 требует Vue 3.5 или новее (vue теперь только peerDependency)`,
				section: SECTION.order,
			}
		}
		dir = dirname(dir)
	}
	return null
}

const link = section => `${MIGRATION_URL}#${slugify(section)}`

/** Запуск кодмода. Возвращает код выхода: 0 — готово, 2 — ошибка параметров или папки. */
export function main(argv, io = { stdout: process.stdout, stderr: process.stderr, cwd: process.cwd() }) {
	const out = (text = '') => io.stdout.write(`${text}\n`)
	const options = parseArgs(argv[0] === 'migrate' ? argv.slice(1) : argv)
	if (options.help) {
		out(HELP)
		return 0
	}
	if (options.error) {
		io.stderr.write(`${options.error}\n\n${HELP}\n`)
		return 2
	}
	const root = resolve(io.cwd, options.dir)
	if (!existsSync(root) || !statSync(root).isDirectory()) {
		io.stderr.write(`Папка не найдена: ${root}\n`)
		return 2
	}

	const files = listFiles(root)
	const texts = new Map(files.map(file => [file, readFileSync(join(root, file), 'utf8')]))
	const ctx = mergeFacts(files.map(file => ({ file, facts: collectFacts(file, texts.get(file)) })))

	out(`Rise UI Kit: переход 1.x → 2.0 (${options.write ? 'режим --write: файлы изменяются' : 'режим --dry: файлы не меняются'})`)
	out(`Папка: ${root}`)
	let changedFiles = 0
	let edits = 0
	const warnings = []
	const vue = vueVersionWarning(root)
	if (vue) warnings.push(vue)
	for (const file of files) {
		const before = texts.get(file)
		const result = transformFile(file, before, ctx)
		for (const w of result.warnings) warnings.push({ file, ...w })
		if (result.text === before) continue
		changedFiles++
		edits += result.edits
		if (options.write) {
			writeFileSync(join(root, file), result.text)
			out(`изменён: ${file} (правок: ${result.edits})`)
		} else {
			out()
			out(unifiedDiff(file, before, result.text))
		}
	}

	if (warnings.length) {
		out()
		out('Предупреждения (нужно решение человека, кодмод эти места не меняет):')
		for (const w of warnings) {
			out(`  ${w.file}:${w.line}  ${w.text}`)
			out(`      → MIGRATION, «${w.section}»: ${link(w.section)}`)
		}
	}
	out()
	out(
		`Итого: файлов просмотрено ${files.length}, ${options.write ? 'изменено' : 'будет изменено'} ${changedFiles} (правок: ${edits}), предупреждений: ${warnings.length}.`,
	)
	if (!options.write && changedFiles) out(`Применить правки: npx ${KIT} migrate ${options.dir} --write`)
	if (!changedFiles) out('Механических правок нет.')
	return 0
}
