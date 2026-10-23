/** Утилиты: движок подсветки кода — правила на «липких» регулярных выражениях и сборка фрагментов */
import type { CodeMatch, CodeRule, CodeToken, CodeTokenType } from './types/codeHighlightUtils.types'

/** Текст, совпавший с «липким» (флаг `y`) выражением ровно с позиции `index`, или null */
function matchAt(pattern: RegExp, source: string, index: number): string | null {
	pattern.lastIndex = index
	const match = pattern.exec(source)
	return match && match[0].length > 0 ? match[0] : null
}

/** Правило из выражения: всё совпадение — один фрагмент вида `type` */
function regexRule(pattern: RegExp, type: CodeTokenType | null): CodeRule {
	return (source, index) => {
		const text = matchAt(pattern, source, index)
		return text === null ? null : { type, length: text.length }
	}
}

/** Добавляет фрагмент; соседние фрагменты одного вида склеиваются */
function pushToken(tokens: CodeToken[], type: CodeTokenType | null, value: string): void {
	if (!value) return
	const last = tokens[tokens.length - 1]
	if (last?.type === type) last.value += value
	else tokens.push({ type, value })
}

/** Добавляет все фрагменты из `next` с той же склейкой */
function pushTokens(tokens: CodeToken[], next: readonly CodeToken[]): void {
	for (const token of next) pushToken(tokens, token.type, token.value)
}

function firstMatch(rules: readonly CodeRule[], source: string, index: number): CodeMatch | null {
	for (const rule of rules) {
		const match = rule(source, index)
		if (match) return match
	}
	return null
}

/** Разбирает `source` правилами по порядку; символ, к которому не подошло ни одно правило, — обычный текст */
function runRules(source: string, rules: readonly CodeRule[]): CodeToken[] {
	const tokens: CodeToken[] = []
	let index = 0
	while (index < source.length) {
		const match = firstMatch(rules, source, index)
		const length = match ? match.length : 1
		pushToken(tokens, match ? match.type : null, source.slice(index, index + length))
		index += length
	}
	return tokens
}

/** Ближайший слева непробельный символ (пробелы и табы, без переводов строки) или '' в начале текста */
function previousSymbol(source: string, index: number): string {
	let position = index - 1
	while (position >= 0 && (source[position] === ' ' || source[position] === '\t')) position--
	return position >= 0 ? source[position]! : ''
}

/** Ближайший справа символ после пробелов и переводов строки или '' в конце текста */
function nextSymbol(source: string, index: number): string {
	const match = /\s*/y
	match.lastIndex = index
	match.exec(source)
	return source[match.lastIndex] ?? ''
}

/** Символ перед позицией — часть имени (буква, цифра, `_`, `$`): число или слово внутри имени не выделяется */
function isWordBefore(source: string, index: number): boolean {
	return index > 0 && /[\w$]/.test(source[index - 1]!)
}

export { isWordBefore, matchAt, nextSymbol, previousSymbol, pushToken, pushTokens, regexRule, runRules }
