/** Утилиты: правила подсветки JavaScript, TypeScript и JSON */
import type { CodeRule, CodeTokenType } from '../types/codeHighlightUtils.types'
import { isWordBefore, matchAt, nextSymbol, previousSymbol, regexRule } from '../codeTokenizer'

const JS_KEYWORDS = new Set(
	(
		'async await break case catch class const continue debugger default delete do else export extends finally for from function ' +
		'get if import in instanceof let new of return set static super switch this throw try typeof var void while with yield'
	).split(' '),
)

const TS_KEYWORDS = new Set(
	(
		'abstract any as asserts bigint boolean declare enum implements infer interface is keyof module namespace never number ' +
		'object override private protected public readonly satisfies string symbol type unique unknown'
	).split(' '),
)

const JS_CONSTANTS = new Set(['true', 'false', 'null', 'undefined', 'NaN', 'Infinity'])

const COMMENT = /\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)/y
const QUOTED = /'(?:\\[\s\S]|[^\\'\n])*'?|"(?:\\[\s\S]|[^\\"\n])*"?/y
const REGEX_LITERAL = /\/(?:\\.|\[(?:\\.|[^\]\\\n])*\]|[^/\\\n[])+\/[a-z]*/y
const REGEX_AFTER_WORDS = new Set(['return', 'typeof', 'case', 'in', 'of', 'yield', 'await', 'delete', 'void', 'throw', 'else', 'do'])
const REGEX_AFTER_SYMBOLS = new Set([
	'',
	'\n',
	'(',
	',',
	'=',
	':',
	'[',
	'!',
	'&',
	'|',
	'?',
	'{',
	'}',
	';',
	'+',
	'-',
	'*',
	'%',
	'<',
	'>',
	'~',
	'^',
])
const LAST_WORD = /([A-Za-z_$][\w$]*)[ \t]*$/
const NUMBER = /(?:0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|\d[\d_]*(?:\.[\d_]*)?(?:[eE][+-]?\d+)?|\.\d[\d_]*(?:[eE][+-]?\d+)?)n?/y
const IDENTIFIER = /[A-Za-z_$][\w$]*/y
const DECORATOR = /@[A-Za-z_$][\w$]*/y

/** Конец выражения `${ … }`: счётчик вложенных `{ }`, внутри — строки и вложенные шаблонные строки */
function scanExpression(source: string, start: number): number {
	let depth = 1
	let index = start
	while (index < source.length) {
		const char = source[index]!
		if (char === '`') index = scanTemplate(source, index)
		else if (char === "'" || char === '"') index += matchAt(QUOTED, source, index)!.length
		else {
			if (char === '{') depth++
			if (char === '}') depth--
			index++
			if (depth === 0) return index
		}
	}
	return source.length
}

/** Конец шаблонной строки, открытой обратной кавычкой в `start`; незакрытая идёт до конца текста */
function scanTemplate(source: string, start: number): number {
	let index = start + 1
	while (index < source.length) {
		const char = source[index]
		if (char === '\\') index += 2
		else if (char === '`') return index + 1
		else if (char === '$' && source[index + 1] === '{') index = scanExpression(source, index + 2)
		else index++
	}
	return source.length
}

const templateRule: CodeRule = (source, index) =>
	source[index] === '`' ? { type: 'string', length: scanTemplate(source, index) - index } : null

/** Здесь может начаться литерал регулярного выражения: после оператора, `(`, `,`, начала текста или слова вроде `return` */
function canStartRegex(source: string, index: number): boolean {
	if (REGEX_AFTER_SYMBOLS.has(previousSymbol(source, index))) return true
	const word = LAST_WORD.exec(source.slice(Math.max(0, index - 12), index))
	return word !== null && REGEX_AFTER_WORDS.has(word[1]!)
}

const regexLiteralRule: CodeRule = (source, index) => {
	if (source[index] !== '/' || !canStartRegex(source, index)) return null
	const text = matchAt(REGEX_LITERAL, source, index)
	return text === null ? null : { type: 'string', length: text.length }
}

const numberRule: CodeRule = (source, index) => {
	if (isWordBefore(source, index)) return null
	const text = matchAt(NUMBER, source, index)
	return text === null ? null : { type: 'number', length: text.length }
}

function classifyIdentifier(word: string, isTypeScript: boolean, isCall: boolean): CodeTokenType | null {
	if (JS_KEYWORDS.has(word) || (isTypeScript && TS_KEYWORDS.has(word))) return 'keyword'
	if (JS_CONSTANTS.has(word)) return 'number'
	return isCall ? 'function' : null
}

function identifierRule(isTypeScript: boolean): CodeRule {
	return (source, index) => {
		const word = matchAt(IDENTIFIER, source, index)
		if (word === null) return null
		const end = index + word.length
		const isCall = nextSymbol(source, end) === '('
		if (previousSymbol(source, index) === '.') return { type: isCall ? 'function' : 'property', length: word.length }
		return { type: classifyIdentifier(word, isTypeScript, isCall), length: word.length }
	}
}

/** Правила JavaScript; `isTypeScript` добавляет ключевые слова и типы TypeScript */
function scriptRules(isTypeScript: boolean): CodeRule[] {
	return [
		regexRule(COMMENT, 'comment'),
		regexLiteralRule,
		regexRule(QUOTED, 'string'),
		templateRule,
		regexRule(DECORATOR, 'function'),
		numberRule,
		identifierRule(isTypeScript),
	]
}

const JSON_STRING = /"(?:\\[\s\S]|[^\\"\n])*"?/y
const JSON_NUMBER = /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y
const JSON_WORD = /true|false|null/y

const jsonStringRule: CodeRule = (source, index) => {
	const text = matchAt(JSON_STRING, source, index)
	if (text === null) return null
	return { type: nextSymbol(source, index + text.length) === ':' ? 'property' : 'string', length: text.length }
}

/** Правила JSON (с комментариями JSONC): ключи — `property`, значения-строки — `string` */
const JSON_RULES: CodeRule[] = [
	regexRule(COMMENT, 'comment'),
	jsonStringRule,
	regexRule(JSON_NUMBER, 'number'),
	regexRule(JSON_WORD, 'keyword'),
]

export { JSON_RULES, scriptRules }
