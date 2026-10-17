/**
 * Храповики качества и бюджет размера пакета. База — `build/ratchets.json`.
 *
 * 1. Размер каждого входа пакета (`exports` в package.json) в gzip: файл входа вместе со всеми чанками и CSS, которые он
 *    подгружает статическими `import`/`export … from` (динамические `import()` не считаются). Нужна сборка: `npm run build`.
 *    Подпути компонентов (`components/<Имя>/index.js`, build/config/subpaths.ts) — один бюджет на самый тяжёлый из них,
 *    CSS папок компонентов (`components/<Имя>/style.css`) — один бюджет на самый тяжёлый файл.
 *    Больше бюджета — проверка падает. Бюджет поднимают осознанно (`--reset-size-budget`, строкой в DECISIONS).
 * 2. Число `--coverage.exclude` в каждом скрипте `test:*:coverage` — не больше базы.
 * 3. Число предупреждений `eslint "src/**\/*.{ts,vue}"` (то же, что `npm run lint`) — не больше базы.
 *
 * Флаги:
 *   --update             опускает базу (2) и (3) до текущих чисел, если они меньше; бюджет размера не трогает;
 *   --reset-size-budget  записывает бюджет размера заново: текущий размер + запас (SIZE_MARGIN);
 *   --lint-report=<файл> берёт готовый JSON-отчёт eslint (`--format json`) вместо своего прогона;
 *   --root=<папка>       корень репозитория (по умолчанию — родитель scripts/).
 */

import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'

/** Запас бюджета размера над текущим размером: 10%, но не меньше 1 КБ */
const SIZE_MARGIN = 0.1
const SIZE_MARGIN_MIN = 1024
const BASE_FILE = 'build/ratchets.json'
const LINT_GLOB = 'src/**/*.{ts,vue}'
const COVERAGE_SCRIPT = /^test:.*:coverage$/
const COVERAGE_EXCLUDE = /--coverage\.exclude[=\s]/g
/** Группы файлов с общим бюджетом по самому тяжёлому: ключ в ratchets.json → какие файлы dist в неё входят */
const SIZE_GROUPS = [
	{ key: 'components/*/index.js', test: /^components\/[^/]+\/index\.js$/ },
	{ key: 'components/*/style.css', test: /^components\/[^/]+\/style\.css$/, single: true },
	{ key: 'tokens/*.json', test: /^tokens\/[^/]+\.json$/, single: true },
]
const STATIC_IMPORT = /\b(?:import|export)\s*(?:[\w$*{},\s]*?\bfrom\s*)?["'](\.{1,2}\/[^"']+)["']/g

const args = process.argv.slice(2)
const flag = name => args.includes(`--${name}`)
const option = name => args.find(arg => arg.startsWith(`--${name}=`))?.slice(name.length + 3)

const ROOT = resolve(option('root') ?? join(import.meta.dirname, '..'))
const DIST = join(ROOT, 'dist')

const readJson = file => JSON.parse(readFileSync(file, 'utf8'))
const kb = bytes => `${(bytes / 1024).toFixed(1)} КБ`

/** Файлы `dist` по шаблону с `*` в последнем сегменте (`./dist/tokens/*.json`) */
function expandPattern(pattern) {
	const folder = join(DIST, dirname(pattern))
	if (!existsSync(folder)) return []
	const name = new RegExp(
		`^${basename(pattern)
			.split('*')
			.map(part => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
			.join('[^/]+')}$`,
	)
	return readdirSync(folder)
		.filter(file => name.test(file))
		.map(file => `${dirname(pattern)}/${file}`)
}

/** Файлы `dist`, на которые ссылается `exports` пакета (кроме типов); шаблоны с `*` раскрываются по файлам в `dist` */
function packageEntries(pkg) {
	const files = new Set()
	const collect = value => {
		if (typeof value === 'string') {
			if (!value.startsWith('./dist/') || value.endsWith('.d.ts')) return
			const entry = value.slice('./dist/'.length)
			if (entry.includes('*')) expandPattern(entry).forEach(file => files.add(file))
			else files.add(entry)
			return
		}
		if (value && typeof value === 'object') Object.entries(value).forEach(([key, inner]) => key !== 'types' && collect(inner))
	}
	collect(pkg.exports ?? {})
	return [...files].sort()
}

/** Файл входа и все чанки, которые он подгружает статически */
function staticGraph(entry) {
	const seen = new Set()
	const visit = file => {
		if (seen.has(file) || !existsSync(file)) return
		seen.add(file)
		if (!file.endsWith('.js')) return
		for (const [, specifier] of readFileSync(file, 'utf8').matchAll(STATIC_IMPORT)) visit(resolve(dirname(file), specifier))
	}
	visit(join(DIST, entry))
	return [...seen]
}

const gzipSize = file => gzipSync(readFileSync(file), { level: 9 }).length

/** CSS папок компонентов: в exports их нет, их подключают входы подпутей */
function componentCssFiles() {
	const folder = join(DIST, 'components')
	if (!existsSync(folder)) return []
	return readdirSync(folder)
		.map(name => `components/${name}/style.css`)
		.filter(file => existsSync(join(DIST, file)))
}

/** Размеры входов; у группы — самый тяжёлый файл, его имя — в `heaviest` */
function measureSizes(pkg) {
	if (!existsSync(DIST)) throw new Error('нет dist/ — сначала `npm run build`')
	const sizes = {}
	const heaviest = {}
	for (const entry of [...packageEntries(pkg), ...componentCssFiles()]) {
		if (!existsSync(join(DIST, entry))) throw new Error(`вход ${entry} из exports не найден в dist/ — пересоберите пакет`)
		const group = SIZE_GROUPS.find(({ test }) => test.test(entry))
		const bytes = group?.single ? gzipSize(join(DIST, entry)) : staticGraph(entry).reduce((sum, file) => sum + gzipSize(file), 0)
		const key = group?.key ?? entry
		if (sizes[key] !== undefined && sizes[key] >= bytes) continue
		sizes[key] = bytes
		if (group) heaviest[key] = entry
	}
	return { sizes, heaviest }
}

function countCoverageExcludes(pkg) {
	const counts = {}
	for (const [name, command] of Object.entries(pkg.scripts ?? {})) {
		if (COVERAGE_SCRIPT.test(name) && command.includes('--coverage')) counts[name] = (command.match(COVERAGE_EXCLUDE) ?? []).length
	}
	return counts
}

function runEslint() {
	const dir = mkdtempSync(join(tmpdir(), 'rise-ratchets-'))
	const report = join(dir, 'eslint.json')
	try {
		const eslint = join(ROOT, 'node_modules/eslint/bin/eslint.js')
		const result = spawnSync(process.execPath, [eslint, LINT_GLOB, '--format', 'json', '--output-file', report], {
			cwd: ROOT,
			stdio: ['ignore', 'ignore', 'inherit'],
		})
		if (!existsSync(report)) throw new Error(`eslint не выдал отчёт (код ${result.status})`)
		return readJson(report)
	} finally {
		rmSync(dir, { recursive: true, force: true })
	}
}

function countLintWarnings() {
	const reportFile = option('lint-report')
	const report = reportFile ? readJson(resolve(reportFile)) : runEslint()
	return report.reduce((sum, file) => sum + (file.warningCount ?? 0), 0)
}

const withMargin = bytes => Math.ceil(Math.max(bytes * (1 + SIZE_MARGIN), bytes + SIZE_MARGIN_MIN) / 1024) * 1024

function checkSizes({ sizes, heaviest }, base, problems) {
	if (flag('reset-size-budget')) {
		base.size = Object.fromEntries(Object.entries(sizes).map(([entry, bytes]) => [entry, { gzip: bytes, budget: withMargin(bytes) }]))
		console.log('Бюджет размера записан заново: текущий размер + запас.')
	}
	for (const [entry, bytes] of Object.entries(sizes)) {
		const limit = base.size?.[entry]?.budget
		const line = `  ${entry}: ${kb(bytes)} gzip${heaviest[entry] ? ` (самый тяжёлый — ${heaviest[entry]})` : ''}`
		if (limit === undefined) {
			problems.push(`размер: у входа ${entry} нет бюджета в ${BASE_FILE}`)
			console.log(`${line} — нет бюджета`)
		} else if (bytes > limit) {
			problems.push(`размер: ${entry} — ${kb(bytes)} gzip, бюджет ${kb(limit)}`)
			console.log(`${line} > бюджет ${kb(limit)} ✗`)
		} else console.log(`${line} ≤ бюджет ${kb(limit)}`)
	}
}

/** Храповик: число не больше базы (нет базы — 0); с `--update` база опускается до текущего */
function ratchet(label, current, recorded, problems) {
	const base = recorded ?? 0
	if (current > base) {
		problems.push(`${label}: ${current}, база ${base}`)
		console.log(`  ${label}: ${current} > база ${base} ✗`)
		return base
	}
	const lowered = flag('update') && current < base
	console.log(`  ${label}: ${current} ≤ база ${base}${lowered ? ` → база опущена до ${current}` : ''}`)
	return lowered ? current : base
}

function main() {
	const pkg = readJson(join(ROOT, 'package.json'))
	const baseFile = join(ROOT, BASE_FILE)
	const base = existsSync(baseFile) ? readJson(baseFile) : {}
	const before = JSON.stringify(base)
	const problems = []

	console.log('Размер входов пакета (gzip, вместе со статически подгружаемыми чанками):')
	checkSizes(measureSizes(pkg), base, problems)

	console.log('Исключения покрытия (--coverage.exclude):')
	for (const [script, count] of Object.entries(countCoverageExcludes(pkg))) {
		base.coverageExcludes ??= {}
		base.coverageExcludes[script] = ratchet(script, count, base.coverageExcludes[script], problems)
	}

	console.log(`Предупреждения ESLint (${LINT_GLOB}):`)
	base.lintWarnings = ratchet('предупреждений', countLintWarnings(), base.lintWarnings, problems)

	const writes = flag('update') || flag('reset-size-budget')
	if (writes && JSON.stringify(base) !== before) {
		writeFileSync(baseFile, `${JSON.stringify(base, null, '\t')}\n`)
		console.log(`База обновлена: ${relative(process.cwd(), baseFile) || BASE_FILE}`)
	}

	if (problems.length > 0) {
		console.error(`\nХраповики не пройдены (${problems.length}):\n${problems.map(problem => `  - ${problem}`).join('\n')}`)
		console.error(
			'Число выросло — уберите новое исключение или предупреждение. Размер вырос — облегчите код или осознанно поднимите бюджет (--reset-size-budget, строка в DECISIONS).',
		)
		process.exit(1)
	}
	console.log('\nХраповики пройдены.')
}

try {
	main()
} catch (error) {
	console.error(`check-ratchets: ${error.message}`)
	process.exit(1)
}
