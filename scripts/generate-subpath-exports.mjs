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
import { subpathExports, withSubpathExports } from '../build/config/subpaths.ts'

const ROOT = resolve(join(import.meta.dirname, '..'))
const PACKAGE_FILE = join(ROOT, 'package.json')

function main() {
	const source = readFileSync(PACKAGE_FILE, 'utf8')
	const pkg = JSON.parse(source)
	const next = `${JSON.stringify({ ...pkg, exports: withSubpathExports(pkg.exports, ROOT) }, null, 2)}\n`
	if (process.argv.includes('--check')) {
		if (next !== source) {
			console.error('exports в package.json не совпадают со списком компонентов — `node scripts/generate-subpath-exports.mjs`')
			process.exit(1)
		}
		console.log(`Подпути: ✓ ${Object.keys(subpathExports(ROOT)).length} ключей exports совпадают со списком компонентов.`)
		return
	}
	if (next !== source) writeFileSync(PACKAGE_FILE, next)
	console.log(`Подпути: ${Object.keys(subpathExports(ROOT)).length} ключей exports${next === source ? ' — без изменений' : ' записаны'}.`)
}

main()
