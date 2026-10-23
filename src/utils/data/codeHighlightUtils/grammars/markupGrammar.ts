/** Утилиты: подсветка HTML и Vue — теги, атрибуты, вложенные скрипты и стили, выражения шаблона Vue */
import { matchAt, pushToken, pushTokens } from '../codeTokenizer'
import type { CodeLanguage, CodeToken, EmbedTokenizer, MarkupState, MarkupTag } from '../types/codeHighlightUtils.types'

const TAG_OPEN = /<!|<\/?/y
const TAG_NAME = /[A-Za-z][\w:.-]*/y
const SPACE = /\s+/y
const TAG_END = /\/?>/y
const ATTRIBUTE_NAME = /[^\s"'>/=]+/y
const EQUALS = /\s*=\s*/y
const QUOTED = /"[^"]*"?|'[^']*'?/y
const UNQUOTED = /[^\s>]+/y
const TEXT = /[^<{]+|\{/y
const VUE_DIRECTIVE = /^(?::|@|#|v-)/

function take(state: MarkupState, pattern: RegExp): string | null {
	const text = matchAt(pattern, state.source, state.index)
	if (text !== null) state.index += text.length
	return text
}

function emit(state: MarkupState, type: CodeToken['type'], value: string | null): void {
	if (value !== null) pushToken(state.tokens, type, value)
}

function readUntil(state: MarkupState, marker: string): string {
	const end = state.source.indexOf(marker, state.index)
	const stop = end < 0 ? state.source.length : end
	const text = state.source.slice(state.index, stop)
	state.index = stop
	return text
}

function readComment(state: MarkupState): void {
	const end = state.source.indexOf('-->', state.index + 4)
	const stop = end < 0 ? state.source.length : end + 3
	pushToken(state.tokens, 'comment', state.source.slice(state.index, stop))
	state.index = stop
}

function readAttributeValue(state: MarkupState, name: string): string {
	const quoted = take(state, QUOTED)
	if (quoted === null) {
		const plain = take(state, UNQUOTED) ?? ''
		emit(state, 'string', plain)
		return plain
	}
	const inner = quoted.slice(1, quoted.length > 1 && quoted.endsWith(quoted[0]!) ? -1 : undefined)
	if (!state.isVue || !VUE_DIRECTIVE.test(name)) {
		emit(state, 'string', quoted)
		return inner
	}
	emit(state, null, quoted[0]!)
	pushTokens(state.tokens, state.embed(inner, 'typescript'))
	emit(state, null, quoted.slice(1 + inner.length))
	return inner
}

function readAttributes(state: MarkupState, tag: MarkupTag): void {
	while (state.index < state.source.length) {
		emit(state, null, take(state, SPACE))
		const end = take(state, TAG_END)
		if (end !== null) return emit(state, null, end)
		const name = take(state, ATTRIBUTE_NAME)
		if (name === null) return emit(state, null, take(state, /[\s\S]/y))
		emit(state, 'attribute', name)
		const equals = take(state, EQUALS)
		if (equals === null) continue
		emit(state, null, equals)
		tag.attributes[name.toLowerCase()] = readAttributeValue(state, name)
	}
}

function embeddedLanguage(tag: MarkupTag): CodeLanguage {
	const lang = tag.attributes['lang'] ?? ''
	if (tag.name === 'style') return lang === 'scss' ? 'scss' : 'css'
	if ((tag.attributes['type'] ?? '').includes('json')) return 'json'
	return lang === 'ts' || lang === 'tsx' ? 'typescript' : 'javascript'
}

function readEmbedded(state: MarkupState, tag: MarkupTag): void {
	const code = readUntil(state, `</${tag.name}`)
	pushTokens(state.tokens, state.embed(code, embeddedLanguage(tag)))
}

function readTag(state: MarkupState): void {
	const open = take(state, TAG_OPEN)!
	emit(state, null, open)
	const name = take(state, TAG_NAME) ?? ''
	emit(state, open === '<!' ? 'keyword' : 'tag', name)
	const tag: MarkupTag = { name: name.toLowerCase(), attributes: {} }
	readAttributes(state, tag)
	const isRawText = open === '<' && (tag.name === 'script' || tag.name === 'style')
	if (isRawText && !state.source.endsWith('/>', state.index)) readEmbedded(state, tag)
}

function readInterpolation(state: MarkupState): void {
	state.index += 2
	pushToken(state.tokens, null, '{{')
	pushTokens(state.tokens, state.embed(readUntil(state, '}}'), 'typescript'))
	emit(state, null, take(state, /\}\}/y))
}

function readNext(state: MarkupState): void {
	const { source, index } = state
	if (source.startsWith('<!--', index)) return readComment(state)
	if (source[index] === '<' && /[A-Za-z!/]/.test(source[index + 1] ?? '')) return readTag(state)
	if (state.isVue && source.startsWith('{{', index)) return readInterpolation(state)
	emit(state, null, take(state, source[index] === '<' ? /</y : TEXT))
}

/** Разбирает HTML; `isVue` — ещё выражения `{{ }}` и значения директив (`:prop`, `@event`, `v-if`) как TypeScript */
function tokenizeMarkup(source: string, isVue: boolean, embed: EmbedTokenizer): CodeToken[] {
	const state: MarkupState = { source, index: 0, tokens: [], isVue, embed }
	while (state.index < source.length) readNext(state)
	return state.tokens
}

export { tokenizeMarkup }
