/// <reference types="node" />

/** Чтение токенов из `src/styles/_tokens.scss`: Sass компилирует файл, а значения `--rise-*` берутся из блоков готового CSS */

import { compile } from 'sass-embedded'
import { splitTopLevel } from './cssValue.ts'
import type { TokenDeclarations } from './types.ts'

interface CssRule {
	selector: string
	isInMedia: boolean
	declarations: [string, string][]
}

const BASE_SELECTOR = ':root'
const LIGHT_SELECTOR = ':root, [data-theme=light], [data-theme=system]'
const DARK_SELECTOR = '[data-theme=dark]'
const DERIVED_SELECTOR = ':root, [data-theme=light], [data-theme=dark], [data-theme=system]'
const TOKEN_PREFIX = '--rise-'

function stripComments(css: string): string {
	return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

function parseDeclarations(body: string): [string, string][] {
	return splitTopLevel(body, ';')
		.map(item => {
			const colon = item.indexOf(':')
			return [item.slice(0, colon).trim(), item.slice(colon + 1).trim()] as [string, string]
		})
		.filter(([name]) => name.startsWith('--'))
}

/** Индекс `}`, закрывающей `{` в позиции `open` */
function closingBrace(css: string, open: number): number {
	let depth = 0
	for (let index = open; index < css.length; index += 1) {
		if (css[index] === '{') depth += 1
		else if (css[index] === '}') depth -= 1
		if (depth === 0) return index
	}
	throw new Error('Нет закрывающей фигурной скобки в скомпилированном CSS')
}

/** Правила скомпилированного CSS; `@media` раскрывается в свои правила с пометкой `isInMedia`, `@charset` пропускается */
function parseRules(css: string, isInMedia = false): CssRule[] {
	const rules: CssRule[] = []
	let cursor = 0
	while (cursor < css.length) {
		const brace = css.indexOf('{', cursor)
		const semicolon = css.indexOf(';', cursor)
		if (brace === -1) break
		if (semicolon !== -1 && semicolon < brace) {
			cursor = semicolon + 1
			continue
		}
		const prelude = css.slice(cursor, brace).trim().replace(/\s+/g, ' ')
		const end = closingBrace(css, brace)
		const body = css.slice(brace + 1, end)
		if (prelude.startsWith('@media')) rules.push(...parseRules(body, true))
		else if (!prelude.startsWith('@'))
			rules.push({ selector: prelude.replace(/\s*,\s*/g, ', '), isInMedia, declarations: parseDeclarations(body) })
		cursor = end + 1
	}
	return rules
}

function collect(rules: readonly CssRule[], selector: string): Map<string, string> {
	const found = new Map<string, string>()
	for (const rule of rules) {
		if (rule.selector !== selector || rule.isInMedia) continue
		for (const [name, value] of rule.declarations) if (name.startsWith(TOKEN_PREFIX)) found.set(name, value)
	}
	return found
}

/** Блоки `_tokens.scss`: палитры и статика (`:root`), светлая и тёмная семантика, производные значения; `--color-*` (старые имена) не читаются */
export function readTokenDeclarations(scssPath: string): TokenDeclarations {
	const rules = parseRules(stripComments(compile(scssPath, { style: 'expanded' }).css))
	const declarations: TokenDeclarations = {
		base: collect(rules, BASE_SELECTOR),
		light: collect(rules, LIGHT_SELECTOR),
		dark: collect(rules, DARK_SELECTOR),
		derived: collect(rules, DERIVED_SELECTOR),
	}
	for (const [block, map] of Object.entries(declarations)) {
		if (map.size === 0) throw new Error(`В ${scssPath} не найден блок токенов «${block}»: селекторы в _tokens.scss изменились`)
	}
	return declarations
}
