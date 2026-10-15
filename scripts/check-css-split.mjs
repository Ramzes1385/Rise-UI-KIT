/**
 * Разбиение CSS пакета (PLAN, Н.2): стили плеера лежат в `dist/media.css`, а не в `dist/styles.css`. Нужна сборка: `npm run build`.
 *
 * 1. В `dist/styles.css` нет корневых классов плеера (блоки верхнего уровня файлов из MEDIA_STYLE_DIRS: `.base-media-player` и др.).
 * 2. В `dist/media.css` каждый такой класс есть, а токенов кита нет: ни `:root`, ни переключателей темы `[data-theme=` /
 *    `[data-rise-motion=` на верхнем уровне, ни палитры (`--rise-color-primary-500:`) — они один раз в `styles.css`.
 * 3. `dist/media.layer.css` подключает `media.css` в слой `rise`, как `styles.layer.css` — `styles.css`.
 *
 * Флаг `--root=<папка>` — корень репозитория (по умолчанию — родитель scripts/).
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { MEDIA_STYLE_DIRS } from '../build/config/cssSplit.ts'

const rootArg = process.argv.slice(2).find(arg => arg.startsWith('--root='))
const ROOT = resolve(rootArg ? rootArg.slice('--root='.length) : join(import.meta.dirname, '..'))
const DIST = join(ROOT, 'dist')

const TOP_LEVEL_CLASS = /^\.([a-z][\w-]*)/gm
const TOKEN_MARKERS = [':root', '[data-theme=', '[data-rise-motion=', '--rise-color-primary-500:']

function rootClasses() {
	const classes = new Set()
	for (const dir of MEDIA_STYLE_DIRS) {
		const folder = join(ROOT, dir)
		if (!existsSync(folder)) continue
		for (const file of readdirSync(folder).filter(name => name.endsWith('.scss'))) {
			for (const [, name] of readFileSync(join(folder, file), 'utf8').matchAll(TOP_LEVEL_CLASS)) classes.add(name)
		}
	}
	return [...classes].sort()
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
	return { problems, classes, sizes: { styles: styles?.length ?? 0, media: media?.length ?? 0 } }
}

const { problems, classes, sizes } = check()
console.log(`Разбиение CSS: styles.css ${sizes.styles} Б, media.css ${sizes.media} Б; классы плеера: ${classes.join(', ')}`)
if (problems.length > 0) {
	console.error(problems.map(problem => `  ✗ ${problem}`).join('\n'))
	process.exit(1)
}
console.log('Разбиение CSS: ✓ styles.css без плеера, media.css без токенов.')
