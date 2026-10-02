/** Утилиты: правила подсветки Bash и Python */
import type { CodeRule, CodeTokenType } from '../types/codeHighlightUtils.types'
import { isWordBefore, matchAt, nextSymbol, previousSymbol, regexRule } from '../codeTokenizer'

const BASH_KEYWORDS = new Set(
	(
		'if then else elif fi for while until do done case esac in function select return local export readonly declare ' +
		'unset break continue exit shift source alias set time'
	).split(' '),
)

const COMMAND_SEPARATORS = new Set(['', '\n', '|', ';', '&', '(', '`', '{'])
const COMMAND_PREFIX = /(?:^|[\s;|&(])(?:then|do|else|elif|sudo|time|exec|xargs)[ \t]+$/

const HASH_COMMENT = /#[^\n]*/y
const SINGLE_QUOTED = /'[^']*'?/y
const DOUBLE_QUOTED = /"(?:\\[\s\S]|[^\\"])*"?/y
const BASH_VARIABLE = /\$\{[^}\n]*\}?|\$[A-Za-z_]\w*|\$[\d@#?$!*-]/y
const FLAG = /--?[A-Za-z][\w-]*/y
const DIGITS = /\d+(?![\w.])/y
const BASH_WORD = /[A-Za-z_][\w.-]*/y

const bashCommentRule: CodeRule = (source, index) => {
	if (index > 0 && !/\s/.test(source[index - 1]!)) return null
	return regexRule(HASH_COMMENT, 'comment')(source, index)
}

const flagRule: CodeRule = (source, index) => {
	if (index > 0 && !/\s/.test(source[index - 1]!)) return null
	return regexRule(FLAG, 'attribute')(source, index)
}

const digitsRule: CodeRule = (source, index) => (isWordBefore(source, index) ? null : regexRule(DIGITS, 'number')(source, index))

/** Слово стоит на месте команды: в начале строки, после `|`, `;`, `&&`, `(` или после приглашения `$ ` */
function isCommandPosition(source: string, index: number): boolean {
	const symbol = previousSymbol(source, index)
	if (COMMAND_SEPARATORS.has(symbol) || COMMAND_PREFIX.test(source.slice(Math.max(0, index - 16), index))) return true
	if (symbol !== '$') return false
	const dollar = source.lastIndexOf('$', index)
	return dollar === 0 || source[dollar - 1] === '\n'
}

function classifyBashWord(source: string, index: number, word: string): CodeTokenType | null {
	if (BASH_KEYWORDS.has(word)) return 'keyword'
	if (!isCommandPosition(source, index)) return null
	return source[index + word.length] === '=' ? 'variable' : 'function'
}

const bashWordRule: CodeRule = (source, index) => {
	const word = matchAt(BASH_WORD, source, index)
	return word === null ? null : { type: classifyBashWord(source, index, word), length: word.length }
}

/** Правила Bash: команда — `function`, ключи `-x` и `--name` — `attribute`, переменные — `variable` */
const BASH_RULES: CodeRule[] = [
	bashCommentRule,
	regexRule(SINGLE_QUOTED, 'string'),
	regexRule(DOUBLE_QUOTED, 'string'),
	regexRule(BASH_VARIABLE, 'variable'),
	flagRule,
	digitsRule,
	bashWordRule,
]

const PYTHON_KEYWORDS = new Set(
	(
		'and as assert async await break case class continue def del elif else except finally for from global if import in is ' +
		'lambda match nonlocal not or pass raise return try while with yield'
	).split(' '),
)

const PYTHON_CONSTANTS = new Set(['True', 'False', 'None'])
const PYTHON_SELF = new Set(['self', 'cls'])

const TRIPLE_STRING = /(?:[rRbBuUfF]{1,2})?("""|''')[\s\S]*?(?:\1|$)/y
const PYTHON_STRING = /(?:[rRbBuUfF]{1,2})?(?:'(?:\\[\s\S]|[^\\'\n])*'?|"(?:\\[\s\S]|[^\\"\n])*"?)/y
const PYTHON_NUMBER = /(?:0[xXoObB][\da-fA-F_]+|\d[\d_]*\.?[\d_]*(?:[eE][+-]?\d+)?j?|\.\d[\d_]*)/y
const PYTHON_WORD = /[A-Za-z_]\w*/y
const DECORATOR = /@[\w.]+/y
const DEFINITION = /\b(?:def|class)\s+$/

const decoratorRule: CodeRule = (source, index) => {
	if (!COMMAND_SEPARATORS.has(previousSymbol(source, index))) return null
	return regexRule(DECORATOR, 'function')(source, index)
}

const pythonNumberRule: CodeRule = (source, index) =>
	isWordBefore(source, index) ? null : regexRule(PYTHON_NUMBER, 'number')(source, index)

function classifyPythonWord(word: string, isCall: boolean, isDefinition: boolean): CodeTokenType | null {
	if (PYTHON_KEYWORDS.has(word)) return 'keyword'
	if (PYTHON_CONSTANTS.has(word)) return 'number'
	if (PYTHON_SELF.has(word)) return 'variable'
	return isCall || isDefinition ? 'function' : null
}

const pythonWordRule: CodeRule = (source, index) => {
	const word = matchAt(PYTHON_WORD, source, index)
	if (word === null) return null
	const isCall = nextSymbol(source, index + word.length) === '('
	if (previousSymbol(source, index) === '.') return { type: isCall ? 'function' : 'property', length: word.length }
	const isDefinition = DEFINITION.test(source.slice(Math.max(0, index - 16), index))
	return { type: classifyPythonWord(word, isCall, isDefinition), length: word.length }
}

/** Правила Python: строки с префиксами `f`, `r`, `b`, тройные кавычки, декораторы, `self` */
const PYTHON_RULES: CodeRule[] = [
	regexRule(HASH_COMMENT, 'comment'),
	regexRule(TRIPLE_STRING, 'string'),
	regexRule(PYTHON_STRING, 'string'),
	decoratorRule,
	pythonNumberRule,
	pythonWordRule,
]

export { BASH_RULES, PYTHON_RULES }
