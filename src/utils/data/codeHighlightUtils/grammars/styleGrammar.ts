/** Утилиты: правила подсветки CSS и SCSS */
import { isWordBefore, matchAt, regexRule, runRules } from '../codeTokenizer'
import type { CodeRule, CodeToken, StyleBounds } from '../types/codeHighlightUtils.types'

const BLOCK_COMMENT = /\/\*[\s\S]*?(?:\*\/|$)/y
const LINE_COMMENT = /\/\/[^\n]*/y
const STRING = /'(?:\\[\s\S]|[^\\'\n])*'?|"(?:\\[\s\S]|[^\\"\n])*"?/y
const AT_RULE = /@[\w-]+/y
const CUSTOM_PROPERTY = /--[\w-]+/y
const SCSS_VARIABLE = /\$[\w-]+/y
const IMPORTANT = /!important/y
const HEX_COLOR = /#[\da-fA-F]{3,8}(?![\w-])/y
const PROPERTY = /-?[A-Za-z][\w-]*/y
const PSEUDO = /::?[\w-]+/y
const SELECTOR = /[.#%][\w-]+/y
const TAG = /[A-Za-z][\w-]*/y
const FUNCTION = /[\w-]+(?=\()/y
const NUMBER = /-?(?:\d+\.?\d*|\.\d+)(?:%|[A-Za-z]+)?/y
const WORD = /[\w-]+/y
const SPACES = /\s*/y

function scanBounds(source: string): StyleBounds {
	const stop = new Int32Array(source.length + 1).fill(source.length)
	const paren = new Int32Array(source.length + 1).fill(source.length)
	for (let index = source.length - 1; index >= 0; index--) {
		const symbol = source[index]
		const isStop = symbol === ';' || symbol === '{' || symbol === '}'
		stop[index] = isStop ? index : stop[index + 1]!
		paren[index] = isStop || symbol === '(' || symbol === ')' ? index : paren[index + 1]!
	}
	return { stop, paren }
}

/** Правило: совпадение выражения, если позиция после него подходит (`isFit`) */
function checkedRule(pattern: RegExp, type: CodeToken['type'], isFit: (source: string, end: number) => boolean): CodeRule {
	return (source, index) => {
		const text = matchAt(pattern, source, index)
		return text !== null && isFit(source, index + text.length) ? { type, length: text.length } : null
	}
}

const numberRule: CodeRule = (source, index) => {
	if (isWordBefore(source, index)) return null
	const text = matchAt(NUMBER, source, index)
	return text === null ? null : { type: 'number', length: text.length }
}

/**
 * Правила стилей над границами текста: селектор — если впереди до `;` и `}` стоит `{`; свойство — `:` после имени,
 * а дальше `;` или `}` раньше `{` (значение) либо `)` раньше скобок и `;` (условие `(max-width: 600px)`)
 */
function styleRules(bounds: StyleBounds, isScss: boolean): CodeRule[] {
	const opensBlock = (source: string, index: number): boolean => source[bounds.stop[index]!] === '{'
	const isProperty = (source: string, end: number): boolean => {
		SPACES.lastIndex = end
		SPACES.exec(source)
		const colon = SPACES.lastIndex
		if (source[colon] !== ':') return false
		const stop = source[bounds.stop[colon + 1]!]
		return stop === ';' || stop === '}' || source[bounds.paren[colon + 1]!] === ')'
	}
	const scssRules = isScss ? [regexRule(LINE_COMMENT, 'comment'), regexRule(SCSS_VARIABLE, 'variable')] : []
	return [
		regexRule(BLOCK_COMMENT, 'comment'),
		...scssRules,
		regexRule(STRING, 'string'),
		regexRule(AT_RULE, 'keyword'),
		regexRule(CUSTOM_PROPERTY, 'variable'),
		regexRule(IMPORTANT, 'keyword'),
		checkedRule(HEX_COLOR, 'number', (source, end) => !opensBlock(source, end)),
		checkedRule(PROPERTY, 'property', isProperty),
		checkedRule(PSEUDO, 'keyword', opensBlock),
		checkedRule(SELECTOR, 'attribute', opensBlock),
		checkedRule(TAG, 'tag', opensBlock),
		regexRule(FUNCTION, 'function'),
		numberRule,
		regexRule(WORD, null),
	]
}

/** Разбор CSS за линейное время; `isScss` — ещё строчные комментарии `//` и переменные `$name` */
function tokenizeStyle(source: string, isScss: boolean): CodeToken[] {
	return runRules(source, styleRules(scanBounds(source), isScss))
}

export { tokenizeStyle }
