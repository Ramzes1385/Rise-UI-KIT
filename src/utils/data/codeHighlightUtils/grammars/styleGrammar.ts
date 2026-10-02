import type { CodeRule } from '../types/codeHighlightUtils.types'
/** Утилиты: правила подсветки CSS и SCSS */
import { isWordBefore, matchAt, regexRule } from '../codeTokenizer'

const BLOCK_COMMENT = /\/\*[\s\S]*?(?:\*\/|$)/y
const LINE_COMMENT = /\/\/[^\n]*/y
const STRING = /'(?:\\[\s\S]|[^\\'\n])*'?|"(?:\\[\s\S]|[^\\"\n])*"?/y
const AT_RULE = /@[\w-]+/y
const CUSTOM_PROPERTY = /--[\w-]+/y
const SCSS_VARIABLE = /\$[\w-]+/y
const IMPORTANT = /!important/y
const HEX_COLOR = /#[\da-fA-F]{3,8}(?![\w-])(?![^;{}]*\{)/y
const PROPERTY = /-?[A-Za-z][\w-]*(?=\s*:(?:[^{}]*[;}]|[^{};()]*\)))/y
const PSEUDO = /::?[\w-]+(?=[^;{}]*\{)/y
const SELECTOR = /[.#%][\w-]+(?=[^;{}]*\{)/y
const TAG = /[A-Za-z][\w-]*(?=[^;{}]*\{)/y
const FUNCTION = /[\w-]+(?=\()/y
const NUMBER = /-?(?:\d+\.?\d*|\.\d+)(?:%|[A-Za-z]+)?/y
const WORD = /[\w-]+/y

const numberRule: CodeRule = (source, index) => {
	if (isWordBefore(source, index)) return null
	const text = matchAt(NUMBER, source, index)
	return text === null ? null : { type: 'number', length: text.length }
}

/** Общие правила CSS и SCSS после комментариев и переменных: свойство раньше селектора, селектор — по `{` впереди */
const BASE_RULES: CodeRule[] = [
	regexRule(STRING, 'string'),
	regexRule(AT_RULE, 'keyword'),
	regexRule(CUSTOM_PROPERTY, 'variable'),
	regexRule(IMPORTANT, 'keyword'),
	regexRule(HEX_COLOR, 'number'),
	regexRule(PROPERTY, 'property'),
	regexRule(PSEUDO, 'keyword'),
	regexRule(SELECTOR, 'attribute'),
	regexRule(TAG, 'tag'),
	regexRule(FUNCTION, 'function'),
	numberRule,
	regexRule(WORD, null),
]

/** Правила CSS */
const CSS_RULES: CodeRule[] = [regexRule(BLOCK_COMMENT, 'comment'), ...BASE_RULES]

/** Правила SCSS: ещё строчные комментарии `//` и переменные `$name` */
const SCSS_RULES: CodeRule[] = [
	regexRule(BLOCK_COMMENT, 'comment'),
	regexRule(LINE_COMMENT, 'comment'),
	regexRule(SCSS_VARIABLE, 'variable'),
	...BASE_RULES,
]

export { CSS_RULES, SCSS_RULES }
