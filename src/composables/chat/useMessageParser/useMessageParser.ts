/** Composable: разбор текста сообщения на сегменты */
import type { MessageToken, ScannedToken, TextPart, UseMessageParserOptions, UseMessageParserReturn } from './types/useMessageParser.types'

/** Буква любого алфавита (в том числе і, ї, є), цифра или подчёркивание: имя упоминания и команды */
const WORD = String.raw`[\p{L}\p{N}_]`
/** Знаки, которыми заканчивается предложение со ссылкой: в адрес они не входят (закрывающая скобка — только парная, как в GFM) */
const URL_TAIL = '.,;:!?»”"\''
/** Символ перед `@`, при котором это не упоминание, а часть слова или адреса (`user@host`, `a.@b`) */
const MENTION_BLOCKER = /[\p{L}\p{N}_.]$/u
const TOKEN_REGEX = new RegExp(String.raw`(https?:\/\/\S+)|(@${WORD}+)|((?:^|\s)\/${WORD}+)`, 'giu')
const SCHEME_LENGTH_PATTERN = /^https?:\/\//i

/** Конец адреса без «хвоста» предложения: знаки препинания и непарная `)` отрезаются, парная `)` остаётся */
function getLinkEnd(raw: string): number {
	let end = raw.length
	let unclosed = [...raw].filter(char => char === ')').length - [...raw].filter(char => char === '(').length
	while (end > 0) {
		const char = raw[end - 1]
		const isTailMark = URL_TAIL.includes(char)
		const isUnpairedBracket = char === ')' && unclosed > 0
		if (!isTailMark && !isUnpairedBracket) break
		if (isUnpairedBracket) unclosed--
		end--
	}
	return end
}

/** Ссылка из совпадения без «хвоста» предложения; схема без адреса — `null`. Сдвигает `regex.lastIndex` за отрезанный хвост */
function readLink(link: string, index: number, regex: RegExp): ScannedToken | null {
	const end = getLinkEnd(link)
	regex.lastIndex = index + Math.max(end, 1)
	if (end <= (SCHEME_LENGTH_PATTERN.exec(link)?.[0].length ?? 0)) return null
	return { tokens: [{ type: 'link', value: link.slice(0, end) }], from: index, to: index + end }
}

/** Упоминание, если перед `@` не стоит буква, цифра, `_` или `.` (иначе это адрес вроде `user@host`) */
function readMention(mention: string, text: string, index: number): ScannedToken | null {
	if (index > 0 && MENTION_BLOCKER.test(text.slice(Math.max(0, index - 2), index))) return null
	return { tokens: [{ type: 'mention', value: mention }], from: index, to: index + mention.length }
}

/** Команда; ведущий пробельный символ уходит отдельным текстовым токеном */
function readCommand(command: string, index: number): ScannedToken {
	const leading = command.startsWith('/') ? '' : command[0]
	const tokens: MessageToken[] = leading ? [{ type: 'text', value: leading }] : []
	tokens.push({ type: 'command', value: command.slice(leading.length) })
	return { tokens, from: index, to: index + command.length }
}

/** Токен из совпадения `TOKEN_REGEX`; отвергнутое (адрес вместо упоминания, схема без адреса) остаётся текстом */
function scanMatch(match: RegExpExecArray, text: string, regex: RegExp): ScannedToken | null {
	const [, link, mention, command] = match
	if (mention) return readMention(mention, text, match.index)
	if (command) return readCommand(command, match.index)
	return readLink(link, match.index, regex)
}

/** Разбор текста на ссылки, упоминания, команды и текст одним проходом: время растёт линейно с длиной строки */
function splitMessage(text: string): MessageToken[] {
	const result: MessageToken[] = []
	const regex = new RegExp(TOKEN_REGEX)
	let textStart = 0
	for (let match = regex.exec(text); match; match = regex.exec(text)) {
		const scanned = scanMatch(match, text, regex)
		if (!scanned) continue
		if (scanned.from > textStart) result.push({ type: 'text', value: text.slice(textStart, scanned.from) })
		result.push(...scanned.tokens)
		textStart = scanned.to
	}
	if (text.length > textStart) result.push({ type: 'text', value: text.slice(textStart) })
	return result
}

/** Текст по частям: совпадения с поисковым запросом помечены `isMatch` */
function highlightText(text: string, searchQuery: string): TextPart[] {
	if (!searchQuery) return [{ text, isMatch: false }]
	const escapedQuery = searchQuery.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
	return text
		.split(new RegExp(`(${escapedQuery})`, 'gi'))
		.filter(Boolean)
		.map(part => ({ text: part, isMatch: part.toLowerCase() === searchQuery.toLowerCase() }))
}

/**
 * Composable для разбора текста сообщения на сегменты: упоминания, команды, ссылки, текст.
 */
function useMessageParser(options: UseMessageParserOptions = {}): UseMessageParserReturn {
	const rawSearchQuery = options.searchQuery
	const getSearchQuery: () => string = typeof rawSearchQuery === 'function' ? rawSearchQuery : () => rawSearchQuery ?? ''

	return {
		getHighlightedParts: text => highlightText(text, getSearchQuery()),
		parseMessageText: text => (text ? splitMessage(text) : []),
	}
}

export { useMessageParser }
