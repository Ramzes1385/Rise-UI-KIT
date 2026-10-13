/**
 * Храповик размера папок: в каждой папке `src/**` не больше 7 файлов (docs/CONTRIBUTING.md, раздел 9).
 * Считаются файлы прямо в папке, вложенные папки — отдельно. Исключения — в `ALLOWED` с причиной.
 * Флаг `--root=<папка>` — корень репозитория (по умолчанию — родитель scripts/).
 */

import { readdirSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const MAX_FILES = 7

/** Папки, которые раскладывать нельзя: путь от корня репозитория и причина */
const ALLOWED = [{ dir: 'src/icons/svg', reason: 'набор значков: один файл — один значок, спрайт собирает build/plugins/sprite.ts' }]

const rootOption = process.argv.slice(2).find(arg => arg.startsWith('--root='))
const ROOT = resolve(rootOption ? rootOption.slice('--root='.length) : join(import.meta.dirname, '..'))

/** Нарушения: папка и число файлов */
function findViolations(dir, found = []) {
	const entries = readdirSync(dir, { withFileTypes: true })
	const files = entries.filter(entry => !entry.isDirectory()).length
	const rel = relative(ROOT, dir).split('\\').join('/')
	if (files > MAX_FILES && !ALLOWED.some(item => item.dir === rel)) found.push({ dir: rel, files })
	for (const entry of entries) {
		if (entry.isDirectory() && entry.name !== 'node_modules') findViolations(join(dir, entry.name), found)
	}
	return found
}

const violations = findViolations(join(ROOT, 'src')).sort((a, b) => b.files - a.files || a.dir.localeCompare(b.dir))

if (violations.length === 0) {
	console.log(`check-folder-size: ✅ в папках src не больше ${MAX_FILES} файлов (исключений: ${ALLOWED.length})`)
} else {
	console.error(`check-folder-size: ❌ папок больше ${MAX_FILES} файлов: ${violations.length}`)
	for (const item of violations) console.error(`  ${item.files}  ${item.dir}`)
	console.error('Разложите файлы по подпапкам по назначению (docs/CONTRIBUTING.md, раздел 9).')
	process.exitCode = 1
}
