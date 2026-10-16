/**
 * Разбиение CSS пакета (PLAN, Н.2): стили плеера лежат в `dist/media.css`, а не в `dist/styles.css`. Нужна сборка: `npm run build`.
 *
 * 1. В `dist/styles.css` нет корневых классов плеера (блоки верхнего уровня файлов из MEDIA_STYLE_DIRS: `.base-media-player` и др.).
 * 2. В `dist/media.css` каждый такой класс есть, а токенов кита нет: ни `:root`, ни переключателей темы `[data-theme=` /
 *    `[data-rise-motion=` на верхнем уровне, ни палитры (`--rise-color-primary-500:`) — они один раз в `styles.css`.
 * 3. `dist/media.layer.css` подключает `media.css` в слой `rise`, как `styles.layer.css` — `styles.css`.
 * 4. Точечная установка (build/config/subpaths.ts): `tokens.css` — с токенами, `components/<Имя>/style.css` — без токенов и без плеера;
 *    у каждого публичного компонента есть `components/<Имя>/index.js`, и все CSS, которые он импортирует, есть в dist;
 *    правила `tokens.css` + всех `style.css` — ровно правила `styles.css` (без компонентов вне подпутей: 3D-карта), с точностью
 *    до объявления: селектор и свойство в своём `@media`/`@supports`.
 *
 * Флаг `--root=<папка>` — корень репозитория (по умолчанию — родитель scripts/).
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { MEDIA_STYLE_DIRS } from '../build/config/cssSplit.ts'
import { componentCssFile, readPublicComponents, subpathEntryName, TOKENS_CSS_FILE } from '../build/config/subpaths.ts'
import { splitTopLevelBlocks } from '../build/plugins/cssDedupe.ts'

const rootArg = process.argv.slice(2).find(arg => arg.startsWith('--root='))
const ROOT = resolve(rootArg ? rootArg.slice('--root='.length) : join(import.meta.dirname, '..'))
const DIST = join(ROOT, 'dist')

const TOP_LEVEL_CLASS = /^\.([a-z][\w-]*)/gm
const TOKEN_MARKERS = [':root', '[data-theme=', '[data-rise-motion=', '--rise-color-primary-500:']
/** В CSS компонента `[data-theme=…]` и `[data-rise-motion=…]` — его собственные правила (пауза анимаций и т. п.), токены — `:root` и палитра */
const COMPONENT_TOKEN_MARKERS = [':root', '--rise-color-primary-500:']

function rootClasses(dirs = MEDIA_STYLE_DIRS, recursive = false) {
	const classes = new Set()
	for (const dir of dirs) {
		const folder = join(ROOT, dir)
		if (!existsSync(folder)) continue
		for (const file of readdirSync(folder, { recursive }).filter(name => name.endsWith('.scss'))) {
			for (const [, name] of readFileSync(join(folder, file), 'utf8').matchAll(TOP_LEVEL_CLASS)) classes.add(name)
		}
	}
	return [...classes].sort()
}

const COMMENT = /\/\*[\s\S]*?\*\//g
const AT_GROUP = /^@(?:media|supports|layer|container)\b/

/** Делит список через запятую верхнего уровня (селекторы, объявления), не заходя в скобки */
function splitList(text, separator) {
	const parts = []
	let depth = 0
	let start = 0
	for (let index = 0; index < text.length; index++) {
		if ('(['.includes(text[index])) depth++
		else if (')]'.includes(text[index])) depth--
		else if (text[index] === separator && depth === 0) {
			parts.push(text.slice(start, index).trim())
			start = index + 1
		}
	}
	parts.push(text.slice(start).trim())
	return parts.filter(Boolean)
}

/** Правила CSS как набор «контекст | селектор | объявление»: склейка селекторов минификатором на сравнение не влияет */
function ruleSet(css, context = '', set = new Set()) {
	for (const block of splitTopLevelBlocks(css.replace(COMMENT, ''))
		.map(text => text.trim())
		.filter(Boolean)) {
		const open = block.indexOf('{')
		const head = open < 0 ? block : block.slice(0, open).trim()
		const body = open < 0 ? '' : block.slice(open + 1, -1)
		if (open < 0 || head.startsWith('@')) {
			if (AT_GROUP.test(head)) ruleSet(body, `${context}${head} > `, set)
			else set.add(`${context}${block}`)
			continue
		}
		for (const selector of splitList(head, ',')) {
			if (body.includes('{')) set.add(`${context}${selector}{${body}}`)
			else for (const declaration of splitList(body, ';')) set.add(`${context}${selector} | ${declaration}`)
		}
	}
	return set
}

/** Корневые классы компонентов, у которых нет подпути (кроме плеера — его в styles.css и так нет) */
function hiddenClasses(publicComponents) {
	const media = new Set(MEDIA_STYLE_DIRS.map(dir => dir.split('/')[2]))
	const folders = readdirSync(join(ROOT, 'src/components'), { withFileTypes: true }).filter(entry => entry.isDirectory())
	const hidden = folders.map(({ name }) => name).filter(name => !publicComponents.includes(name) && !media.has(name))
	return rootClasses(
		hidden.map(name => `src/components/${name}/`),
		true,
	)
}

const CSS_IMPORT = /import\s*["'](\.{1,2}\/[^"']+\.css)["']/g

function checkSubpaths(styles, problems) {
	const tokens = read(TOKENS_CSS_FILE, problems)
	const components = readPublicComponents(ROOT)
	for (const marker of [':root', '--rise-color-primary-500:']) {
		if (tokens !== null && !tokens.includes(marker)) problems.push(`${TOKENS_CSS_FILE} без токенов (${marker})`)
	}
	const split = tokens === null ? new Set() : ruleSet(tokens)
	const playerClasses = rootClasses()
	let files = 0
	for (const component of components) {
		const entry = join(DIST, `${subpathEntryName(component)}.js`)
		if (!existsSync(entry)) {
			problems.push(`нет dist/${subpathEntryName(component)}.js — подпуть ./${component} не собран`)
			continue
		}
		for (const [, specifier] of readFileSync(entry, 'utf8').matchAll(CSS_IMPORT)) {
			if (!existsSync(resolve(DIST, 'components', component, specifier)))
				problems.push(`./${component} импортирует ${specifier}, а файла нет`)
		}
		const cssFile = join(DIST, componentCssFile(component))
		if (!existsSync(cssFile)) continue
		files++
		const css = readFileSync(cssFile, 'utf8')
		for (const marker of COMPONENT_TOKEN_MARKERS) {
			if (css.includes(marker)) problems.push(`${componentCssFile(component)} содержит токены кита (${marker})`)
		}
		for (const name of playerClasses)
			if (css.includes(`.${name}`)) problems.push(`${componentCssFile(component)} содержит стили плеера: .${name}`)
		ruleSet(css, '', split)
	}
	if (styles !== null && tokens !== null) {
		const hidden = hiddenClasses(components).map(name => new RegExp(`(?:\\.|@keyframes )${name}(?![a-z0-9])`))
		const expected = [...ruleSet(styles)].filter(rule => !hidden.some(test => test.test(rule)))
		const expectedSet = new Set(expected)
		const missing = expected.filter(rule => !split.has(rule))
		const extra = [...split].filter(rule => !expectedSet.has(rule))
		if (missing.length > 0)
			problems.push(`в CSS подпутей нет ${missing.length} правил styles.css, например: ${missing.slice(0, 3).join(' ; ')}`)
		if (extra.length > 0)
			problems.push(`в CSS подпутей ${extra.length} правил, которых нет в styles.css, например: ${extra.slice(0, 3).join(' ; ')}`)
		return { files, rules: expected.length }
	}
	return { files, rules: 0 }
}

function read(name, problems) {
	const file = join(DIST, name)
	if (!existsSync(file)) {
		problems.push(`нет dist/${name} — сначала \`npm run build\``)
		return null
	}
	return readFileSync(file, 'utf8')
}

function check() {
	const problems = []
	const classes = rootClasses()
	if (classes.length === 0) problems.push(`в ${MEDIA_STYLE_DIRS.join(', ')} не найдено корневых классов — проверьте MEDIA_STYLE_DIRS`)

	const styles = read('styles.css', problems)
	const media = read('media.css', problems)
	const mediaLayer = read('media.layer.css', problems)

	for (const name of classes) {
		if (styles?.includes(`.${name}`)) problems.push(`styles.css содержит стили плеера: .${name}`)
		if (media !== null && !media.includes(`.${name}`)) problems.push(`media.css не содержит .${name}`)
	}
	for (const marker of TOKEN_MARKERS) {
		if (media?.includes(marker)) problems.push(`media.css содержит токены кита (${marker}) — они должны быть только в styles.css`)
	}
	if (mediaLayer !== null && !/@import url\(['"]\.\/media\.css['"]\) layer\(rise\)/.test(mediaLayer)) {
		problems.push('media.layer.css не подключает ./media.css в слой rise')
	}
	const subpaths = checkSubpaths(styles, problems)
	return { problems, classes, subpaths, sizes: { styles: styles?.length ?? 0, media: media?.length ?? 0 } }
}

const { problems, classes, subpaths, sizes } = check()
console.log(`Разбиение CSS: styles.css ${sizes.styles} Б, media.css ${sizes.media} Б; классы плеера: ${classes.join(', ')}`)
console.log(`Подпути: ${subpaths.files} файлов style.css компонентов, сверено правил со styles.css: ${subpaths.rules}`)
if (problems.length > 0) {
	console.error(problems.map(problem => `  ✗ ${problem}`).join('\n'))
	process.exit(1)
}
console.log('Разбиение CSS: ✓ styles.css без плеера, media.css без токенов, CSS подпутей без токенов и совпадает со styles.css.')
