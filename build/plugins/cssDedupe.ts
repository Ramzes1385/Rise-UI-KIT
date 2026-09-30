/**
 * Повторы блоков `@media` в собранных стилях. Токены попадают в стили каждого компонента через prelude
 * (build/config/css.ts → @styles/variables → _tokens.scss). Одинаковые обычные правила минификатор схлопывает сам,
 * а блоки `@media` из _tokens.scss (тёмная тема `data-theme="system"`, `prefers-reduced-motion`) остаются
 * в каждом компоненте: около сотни копий и ≈400 КБ лишнего в dist/styles.css.
 *
 * Из одинаковых блоков остаётся последний: у копий один селектор и одни значения, поэтому в каскаде решает
 * позиция последней, и результат не меняется.
 */

import type { Plugin } from 'vite'

const MEDIA = '@media'

function skipComment(css: string, index: number): number {
	const end = css.indexOf('*/', index + 2)
	return end < 0 ? css.length : end + 1
}

function skipString(css: string, index: number): number {
	const quote = css[index]
	let cursor = index + 1
	while (cursor < css.length && css[cursor] !== quote) cursor += css[cursor] === '\\' ? 2 : 1
	return cursor
}

/** Делит CSS на блоки верхнего уровня: правила, at-правила с телом и инструкции вроде `@import …;` */
export function splitTopLevelBlocks(css: string): string[] {
	const blocks: string[] = []
	let depth = 0
	let start = 0
	for (let index = 0; index < css.length; index++) {
		const char = css[index]
		if (char === '\\') index++
		else if (char === '"' || char === "'") index = skipString(css, index)
		else if (char === '/' && css[index + 1] === '*') index = skipComment(css, index)
		else if (char === '{') depth++
		else if (char === '}' || (char === ';' && depth === 0)) {
			if (char === '}') depth--
			if (depth > 0) continue
			blocks.push(css.slice(start, index + 1))
			start = index + 1
		}
	}
	if (start < css.length) blocks.push(css.slice(start))
	return blocks
}

/** Убирает повторы одинаковых блоков `@media`, оставляя последний */
export function removeDuplicateMediaBlocks(css: string): string {
	const blocks = splitTopLevelBlocks(css)
	const lastIndex = new Map<string, number>()
	blocks.forEach((block, index) => {
		if (block.trimStart().startsWith(MEDIA)) lastIndex.set(block.trim(), index)
	})
	return blocks.filter((block, index) => !block.trimStart().startsWith(MEDIA) || lastIndex.get(block.trim()) === index).join('')
}

/** Сборка библиотеки: чистит повторы `@media` в итоговом styles.css */
export function createCssDedupePlugin(): Plugin {
	return {
		name: 'rise:css-dedupe',
		apply: 'build',
		enforce: 'post',
		generateBundle(_, bundle) {
			for (const file of Object.values(bundle)) {
				if (file.type !== 'asset' || !file.fileName.endsWith('.css') || typeof file.source !== 'string') continue
				file.source = removeDuplicateMediaBlocks(file.source)
			}
		},
	}
}
