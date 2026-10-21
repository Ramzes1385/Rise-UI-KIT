/**
 * Область цвета компонента (DESIGN_SYSTEM, правило 11): каждый компонент, чьи стили читают `--custom-*`, сбрасывает их на корне
 * миксином `custom-color-scope` (`:where(.base-x)`). Иначе `color` родителя протекает во вложенные компоненты.
 * Проверка собирает SCSS каждого компонента и ищет сброс корня. Исключения — в `ALLOWED` с причиной.
 * Флаг `--root=<папка>` — корень репозитория (по умолчанию — родитель scripts/).
 */

import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import * as sass from 'sass-embedded'

const ALLOWED = {
	BaseDropdown: 'корень — обёртка триггера без собственного вывода, панель телепортируется и получает цвет через style',
	BaseTooltip: 'корень — обёртка триггера без собственного вывода, всплывающая подсказка телепортируется',
}

const ROOT_CLASS_OVERRIDES = { BaseFlowMap3D: 'base-flow-map-3d', BaseImageMap3D: 'base-image-map-3d', BaseRoadmap3D: 'base-roadmap-3d' }

const rootOption = process.argv.slice(2).find(arg => arg.startsWith('--root='))
const ROOT = resolve(rootOption ? rootOption.slice('--root='.length) : join(import.meta.dirname, '..'))
const STYLES = join(ROOT, 'src/styles')
const PRELUDE = '@use "@styles/variables" as *;\n@use "@styles/mixins" as *;\n@use "@styles/functions" as *;\n'

const importer = {
	findFileUrl: url => (url.startsWith('@styles/') ? pathToFileURL(join(STYLES, url.slice('@styles/'.length))) : null),
}

function kebab(name) {
	return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

function scssFiles(dir, found = []) {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		if (entry.isDirectory() && entry.name !== 'stories' && entry.name !== '__tests__') scssFiles(join(dir, entry.name), found)
		else if (entry.name.endsWith('.scss')) found.push(join(dir, entry.name))
	}
	return found
}

function compile(file) {
	const source = PRELUDE + readFileSync(file, 'utf8')
	return sass.compileString(source, {
		url: pathToFileURL(file),
		importers: [importer],
		loadPaths: [STYLES],
		silenceDeprecations: ['import'],
	}).css
}

const componentsDir = join(ROOT, 'src/components')
const violations = []
let consumers = 0

for (const entry of readdirSync(componentsDir, { withFileTypes: true })) {
	if (!entry.isDirectory()) continue
	const css = scssFiles(join(componentsDir, entry.name)).map(compile).join('\n')
	if (!css.includes('var(--custom-')) continue
	consumers++
	if (ALLOWED[entry.name]) continue
	const rootClass = ROOT_CLASS_OVERRIDES[entry.name] ?? kebab(entry.name)
	const reset = new RegExp(`:where\\(\\.${rootClass}\\)\\s*\\{[^}]*--custom-bg:\\s*initial`)
	if (!reset.test(css)) violations.push({ name: entry.name, rootClass })
}

if (violations.length === 0) {
	console.log(
		`check-custom-color-scope: ✅ корень сбрасывает --custom-* у ${consumers - Object.keys(ALLOWED).length} компонентов (исключений: ${Object.keys(ALLOWED).length})`,
	)
} else {
	console.error(`check-custom-color-scope: ❌ нет сброса --custom-* на корне: ${violations.length}`)
	for (const item of violations) console.error(`  ${item.name}: добавьте @include custom-color-scope в .${item.rootClass}`)
	console.error('Правило 11 DESIGN_SYSTEM: цвет компонента не должен протекать во вложенные.')
	process.exitCode = 1
}
