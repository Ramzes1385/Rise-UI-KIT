/** Composable: разбор текста сообщения на сегменты */
import type { MessageToken, TextPart, UseMessageParserOptions, UseMessageParserReturn } from './types/useMessageParser.types'

/** Буква любого алфавита (в том числе і, ї, є), цифра или подчёркивание: имя упоминания и команды */
const WORD = String.raw`[\p{L}\p{N}_]`
/** Знаки, которыми заканчивается предложение со ссылкой: в адрес они не входят */
const URL_TAIL = String.raw`[.,;:!?)»”"']*`
const TOKEN_REGEX = new RegExp(
	String.raw`(https?:\/\/[^\s]+?(?=${URL_TAIL}(?:\s|$))|(?<![\p{L}\p{N}_.])@${WORD}+|(?:^|\s)\/${WORD}+)`,
	'giu',
)
const MENTION_REGEX = new RegExp(String.raw`^@${WORD}+$`, 'u')
const COMMAND_REGEX = new RegExp(String.raw`^(\s?)\/${WORD}+$`, 'u')

/**
 * Composable для разбора текста сообщения на сегменты: упоминания, команды, ссылки, текст.
 */
function useMessageParser(options: UseMessageParserOptions = {}): UseMessageParserReturn {
	const rawSearchQuery = options.searchQuery
	const getSearchQuery: () => string = typeof rawSearchQuery === 'function' ? rawSearchQuery : () => rawSearchQuery ?? ''

	function getHighlightedParts(text: string): TextPart[] {
		const searchQuery = getSearchQuery()
		if (!searchQuery) {
			return [{ text, isMatch: false }]
		}

		const parts: TextPart[] = []
		const escapedQuery = searchQuery.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
		const regex = new RegExp(`(${escapedQuery})`, 'gi')
		const matches = text.split(regex)

		for (const part of matches) {
			if (part) {
				const isMatch = part.toLowerCase() === searchQuery.toLowerCase()
				parts.push({ text: part, isMatch })
			}
		}

		return parts
	}

	function parseMessageText(text: string): MessageToken[] {
		if (!text) return []
		const parts = text.split(TOKEN_REGEX)
		const tokens: MessageToken[] = []
		for (const part of parts) {
			if (!part) continue
			if (/^https?:\/\//i.test(part)) {
				tokens.push({ type: 'link', value: part })
			} else if (MENTION_REGEX.test(part)) {
				tokens.push({ type: 'mention', value: part })
			} else if (COMMAND_REGEX.test(part)) {
				const leading = part.startsWith('/') ? '' : part[0]
				if (leading) tokens.push({ type: 'text', value: leading })
				tokens.push({ type: 'command', value: part.slice(leading.length) })
			} else {
				tokens.push({ type: 'text', value: part })
			}
		}
		return tokens
	}

	return {
		getHighlightedParts,
		parseMessageText,
	}
}

export { useMessageParser }
