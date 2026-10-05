/**
 * Токены компонентов (уровень 3, docs/design/DESIGN_SYSTEM.md §1): `--rise-<компонент>[-<часть>]-<свойство>[-<состояние>]`.
 *
 * Собирает из `src/components/<BaseX>/styles/**\/*.scss` чтения токенов — `ct(<компонент>, <свойство>, <запасное>)` и
 * `var(--rise-<компонент>-…)` — и проверяет:
 * 1. имя компонента в токене = папка (`BaseDropdownMenu` → `dropdown-menu`): компонент читает только свои токены;
 * 2. свойство и состояние — из закрытых словарей (PROPS, STATES);
 * 3. у каждого чтения есть запасное значение;
 * 4. стили компонентов не объявляют токены компонентов (`--rise-<компонент>-…:`).
 * Токены без имени компонента в начале (семантика `--rise-primary`) и объявленные в `src/styles` (`--rise-chart-*`, `--rise-code-*`)
 * — не токены компонентов.
 * Чтения с переменной Sass в имени (`ct($component, …)` в миксине, `var(--rise-code-#{$type})`) не разбираются — их нет в отчёте.
 *
 * Таблица — `docs/design/COMPONENT_TOKENS.md`: `--write` записывает её, без флага проверка падает, если таблица устарела.
 * Флаги: `--write`; `--root=<папка>` — корень репозитория (по умолчанию — родитель scripts/).
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'

const PROPS = [
	'bg',
	'text',
	'border',
	'radius',
	'shadow',
	'padding',
	'padding-x',
	'padding-y',
	'gap',
	'height',
	'width',
	'font-size',
	'font-weight',
	'icon-size',
	'ring',
]
const STATES = ['hover', 'active', 'checked', 'selected', 'disabled', 'focus', 'open']
const DOC = 'docs/design/COMPONENT_TOKENS.md'

const args = process.argv.slice(2)
const option = name => args.find(arg => arg.startsWith(`--${name}=`))?.slice(name.length + 3)
const ROOT = resolve(option('root') ?? join(import.meta.dirname, '..'))

/** `BaseDropdownMenu` → `dropdown-menu` */
function tokenComponent(folder) {
	return folder
		.replace(/^Base/, '')
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.toLowerCase()
}

function scssFiles(dir) {
	if (!existsSync(dir)) return []
	return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
		const path = join(dir, entry.name)
		if (entry.isDirectory()) return scssFiles(path)
		return entry.name.endsWith('.scss') ? [path] : []
	})
}

/** Аргументы вызова от открывающей скобки `open`: [аргументы, индекс после закрывающей] */
function callArgs(source, open) {
	const parts = []
	let depth = 0
	let current = ''
	for (let i = open; i < source.length; i++) {
		const char = source[i]
		if (char === '(') depth++
		if (char === ')') depth--
		if (depth === 0) {
			parts.push(current.trim())
			return [parts, i + 1]
		}
		if (char === ',' && depth === 1) {
			parts.push(current.trim())
			current = ''
		} else if (i !== open) current += char
	}
	return [parts, source.length]
}

const lineOf = (source, index) => source.slice(0, index).split('\n').length
const unquote = value => value.replace(/^['"]|['"]$/g, '')

/** Чтения токенов в файле: { name, fallback, line } */
function readsIn(source) {
	const reads = []
	for (const match of source.matchAll(/(?<![\w-])ct\(/g)) {
		const [parts] = callArgs(source, match.index + 2)
		const [component = '', prop = '', ...rest] = parts.map(unquote)
		if (/[$#]/.test(component + prop)) continue
		reads.push({ name: `--rise-${component}-${prop}`, fallback: rest.join(', ') || null, line: lineOf(source, match.index) })
	}
	for (const match of source.matchAll(/var\((--rise-[a-z0-9-]+)(?!#\{)/g)) {
		const [parts] = callArgs(source, match.index + 3)
		reads.push({ name: match[1], fallback: parts.slice(1).join(', ') || null, line: lineOf(source, match.index) })
	}
	return reads
}

/** `button-label-bg-hover` без компонента → { part, prop, state } или null */
function parseRest(rest) {
	const state = STATES.find(item => rest.endsWith(`-${item}`))
	const body = state ? rest.slice(0, -state.length - 1) : rest
	const prop = [...PROPS].sort((a, b) => b.length - a.length).find(item => body === item || body.endsWith(`-${item}`))
	if (!prop) return null
	return { part: body.slice(0, -prop.length).replace(/-$/, '') || null, prop, state: state ?? null }
}

function declaredInStyles() {
	const names = new Set()
	for (const file of scssFiles(join(ROOT, 'src/styles'))) {
		for (const match of readFileSync(file, 'utf8').matchAll(/(--rise-[a-z0-9-]+)\s*:/g)) names.add(match[1])
	}
	return names
}

/** Все токены и ошибки: { tokens: Map<компонент, Map<имя, запись>>, errors: string[] } */
function collect() {
	const errors = []
	const tokens = new Map()
	const declared = declaredInStyles()
	const componentsDir = join(ROOT, 'src/components')
	const folders = existsSync(componentsDir) ? readdirSync(componentsDir).filter(name => /^Base[A-Z]/.test(name)) : []
	const names = folders.map(tokenComponent).sort((a, b) => b.length - a.length)
	const ownerOf = token => names.find(name => token.startsWith(`--rise-${name}-`))

	for (const folder of folders) {
		const own = tokenComponent(folder)
		for (const file of scssFiles(join(componentsDir, folder, 'styles'))) {
			const source = readFileSync(file, 'utf8')
			const where = line => `${relative(ROOT, file).replaceAll('\\', '/')}:${line}`
			for (const match of source.matchAll(/(--rise-[a-z0-9-]+)\s*:/g)) {
				if (ownerOf(match[1])) errors.push(`${where(lineOf(source, match.index))}: токен компонента объявлен — ${match[1]}`)
			}
			for (const read of readsIn(source)) {
				if (declared.has(read.name)) continue
				const owner = ownerOf(read.name)
				if (!owner) continue
				if (owner !== own) {
					errors.push(`${where(read.line)}: ${read.name} — не токен ${folder} (ожидается --rise-${own}-…)`)
					continue
				}
				const parsed = parseRest(read.name.slice(`--rise-${own}-`.length))
				if (!parsed) {
					errors.push(`${where(read.line)}: ${read.name} — свойство не из словаря (${PROPS.join(', ')})`)
					continue
				}
				if (!read.fallback) {
					errors.push(`${where(read.line)}: ${read.name} — нет запасного значения`)
					continue
				}
				if (!tokens.has(folder)) tokens.set(folder, new Map())
				const list = tokens.get(folder)
				if (!list.has(read.name)) list.set(read.name, { ...parsed, fallback: read.fallback })
			}
		}
	}
	return { tokens, errors }
}

function renderDoc(tokens) {
	const lines = [
		'# Токены компонентов',
		'',
		'Сгенерировано `node scripts/check-component-tokens.mjs --write` из `src/components/*/styles`. Не править руками.',
		'',
		'Токены уровня 3 кит только читает (с запасным значением) и нигде не объявляет: задайте их на `:root`, в теме',
		'или на контейнере — правило имён и порядок силы в DESIGN_SYSTEM.md, §1.',
		'',
	]
	const folders = [...tokens.keys()].sort()
	if (!folders.length) lines.push('Пока ни один компонент не читает токены уровня 3.', '')
	for (const folder of folders) {
		lines.push(`## ${folder}`, '', '| Токен | Часть | Свойство | Состояние | По умолчанию |', '|---|---|---|---|---|')
		for (const [name, item] of [...tokens.get(folder)].sort(([a], [b]) => a.localeCompare(b))) {
			lines.push(
				`| \`${name}\` | ${item.part ?? 'корень'} | ${item.prop} | ${item.state ?? '—'} | \`${item.fallback.replaceAll('|', '\\|')}\` |`,
			)
		}
		lines.push('')
	}
	return lines.join('\n')
}

function main() {
	const { tokens, errors } = collect()
	const doc = renderDoc(tokens)
	const docPath = join(ROOT, DOC)
	if (args.includes('--write')) {
		mkdirSync(dirname(docPath), { recursive: true })
		writeFileSync(docPath, doc)
	} else if (!existsSync(docPath) || readFileSync(docPath, 'utf8') !== doc) {
		errors.push(`${DOC} устарел — запустите \`node scripts/check-component-tokens.mjs --write\``)
	}
	const count = [...tokens.values()].reduce((sum, list) => sum + list.size, 0)
	if (errors.length) {
		console.error(`✗ Токены компонентов: ${errors.length} ошибок\n${errors.map(error => `  ${error}`).join('\n')}`)
		process.exit(1)
	}
	console.log(`✓ Токены компонентов: ${count} в ${tokens.size} компонентах`)
}

main()
