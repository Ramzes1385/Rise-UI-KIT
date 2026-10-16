/**
 * Подпути точечной установки в `exports` package.json (build/config/subpaths.ts): `./<Компонент>` на каждый реэкспорт
 * `src/components/index.ts`, а также `./tokens.css` и `./tokens.layer.css`. Список не правится руками — его пишет этот скрипт.
 *
 *   node scripts/generate-subpath-exports.mjs          — переписывает exports в package.json;
 *   node scripts/generate-subpath-exports.mjs --check  — только сверяет (код 1, если exports устарели).
 *
 * Прочие ключи exports остаются на своих местах; подпути встают перед `./icons.svg` в алфавитном порядке.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { readPublicComponents, subpathEntryName, TOKENS_CSS_FILE, TOKENS_LAYER_CSS_FILE } from '../build/config/subpaths.ts'

const ROOT = resolve(join(import.meta.dirname, '..'))
const PACKAGE_FILE = join(ROOT, 'package.json')
const ANCHOR = './icons.svg'
const GENERATED_KEY = /^\.\/(?:Base\w+|tokens(?:\.layer)?\.css)$/

const cssExport = file => ({ types: './dist/styles.d.ts', import: `./dist/${file}`, default: `./dist/${file}` })

/** Подпути, которые должны быть в exports, в порядке записи */
export function subpathExports(root = ROOT) {
	const entries = [
		[`./${TOKENS_CSS_FILE}`, cssExport(TOKENS_CSS_FILE)],
		[`./${TOKENS_LAYER_CSS_FILE}`, cssExport(TOKENS_LAYER_CSS_FILE)],
	]
	for (const component of readPublicComponents(root)) {
		const file = subpathEntryName(component)
		entries.push([`./${component}`, { types: `./dist/${file}.d.ts`, import: `./dist/${file}.js` }])
	}
	return Object.fromEntries(entries)
}

/** exports пакета с подпутями на месте: свои ключи — как были, сгенерированные — заново */
export function withSubpathExports(exports, root = ROOT) {
	const own = Object.entries(exports).filter(([key]) => !GENERATED_KEY.test(key))
	const anchor = own.findIndex(([key]) => key === ANCHOR)
	const at = anchor < 0 ? own.length : anchor
	return Object.fromEntries([...own.slice(0, at), ...Object.entries(subpathExports(root)), ...own.slice(at)])
}

function main() {
	const source = readFileSync(PACKAGE_FILE, 'utf8')
	const pkg = JSON.parse(source)
	const next = `${JSON.stringify({ ...pkg, exports: withSubpathExports(pkg.exports) }, null, 2)}\n`
	if (process.argv.includes('--check')) {
		if (next !== source) {
			console.error('exports в package.json не совпадают со списком компонентов — `node scripts/generate-subpath-exports.mjs`')
			process.exit(1)
		}
		console.log(`Подпути: ✓ ${Object.keys(subpathExports()).length} ключей exports совпадают со списком компонентов.`)
		return
	}
	if (next !== source) writeFileSync(PACKAGE_FILE, next)
	console.log(`Подпути: ${Object.keys(subpathExports()).length} ключей exports${next === source ? ' — без изменений' : ' записаны'}.`)
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) main()
