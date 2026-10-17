/**
 * Подпути точечной установки в `exports` package.json (build/config/subpaths.ts): `./<Компонент>` на каждый реэкспорт
 * `src/components/index.ts`, а также `./tokens.css`, `./tokens.layer.css` и входы автоимпорта (`./resolver`, `./nuxt`, `./global`).
 * Список не правится руками — его пишет этот скрипт. Он же пишет `src/integrations/componentNames.ts` — имена компонентов для
 * резолвера и модуля Nuxt (Node-код, которому `src/components` недоступен).
 *
 *   node scripts/generate-subpath-exports.mjs          — переписывает exports в package.json;
 *   node scripts/generate-subpath-exports.mjs --check  — только сверяет (код 1, если exports устарели).
 *
 * Прочие ключи exports остаются на своих местах; подпути встают перед `./icons.svg` в алфавитном порядке.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import {
	COMPONENT_NAMES_FILE,
	componentNamesSource,
	readPublicComponents,
	subpathExports,
	withSubpathExports,
} from '../build/config/subpaths.ts'

const ROOT = resolve(join(import.meta.dirname, '..'))
const PACKAGE_FILE = join(ROOT, 'package.json')

const NAMES_FILE = join(ROOT, COMPONENT_NAMES_FILE)

function readIfExists(file) {
	return existsSync(file) ? readFileSync(file, 'utf8') : ''
}

function main() {
	const source = readFileSync(PACKAGE_FILE, 'utf8')
	const pkg = JSON.parse(source)
	const next = `${JSON.stringify({ ...pkg, exports: withSubpathExports(pkg.exports, ROOT) }, null, 2)}\n`
	const names = readIfExists(NAMES_FILE)
	const nextNames = componentNamesSource(readPublicComponents(ROOT))
	const keys = Object.keys(subpathExports(ROOT)).length
	if (process.argv.includes('--check')) {
		if (next !== source) {
			console.error('exports в package.json не совпадают со списком компонентов — `node scripts/generate-subpath-exports.mjs`')
			process.exit(1)
		}
		if (nextNames !== names) {
			console.error(`${COMPONENT_NAMES_FILE} не совпадает со списком компонентов — \`node scripts/generate-subpath-exports.mjs\``)
			process.exit(1)
		}
		console.log(`Подпути: ✓ ${keys} ключей exports и список имён для автоимпорта совпадают со списком компонентов.`)
		return
	}
	if (next !== source) writeFileSync(PACKAGE_FILE, next)
	if (nextNames !== names) writeFileSync(NAMES_FILE, nextNames)
	const changed = next !== source || nextNames !== names
	console.log(`Подпути: ${keys} ключей exports${changed ? ' записаны' : ' — без изменений'}.`)
}

main()
