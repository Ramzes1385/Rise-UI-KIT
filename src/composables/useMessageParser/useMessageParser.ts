import type {
	MessageToken,
	TextPart,
	UseMessageParserOptions,
	UseMessageParserReturn,
} from './useMessageParser.types'

function useMessageParser(options: UseMessageParserOptions = {}): UseMessageParserReturn {
	const rawSearchQuery = options.searchQuery
	const getSearchQuery: () => string = typeof rawSearchQuery === 'function'
		? rawSearchQuery
		: () => rawSearchQuery ?? ''

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
		const tokenRegex = /(https?:\/\/[^\s]+|@[\wА-Яа-яЁё]+|(?:^|\s)\/[\wА-Яа-яЁё]+)/g
		const parts = text.split(tokenRegex)
		const tokens: MessageToken[] = []
		for (const part of parts) {
			if (!part) continue
			if (/^https?:\/\//i.test(part)) {
				tokens.push({ type: 'link', value: part })
			} else if (/^@[\wА-Яа-яЁё]+$/.test(part)) {
				tokens.push({ type: 'mention', value: part })
			} else if (/^\s?\/[\wА-Яа-яЁё]+$/.test(part)) {
				const leadingSpace = part.startsWith(' ')
				if (leadingSpace) tokens.push({ type: 'text', value: ' ' })
				tokens.push({ type: 'command', value: leadingSpace ? part.slice(1) : part })
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
