export interface TextPart {
	text: string
	isMatch: boolean
}

export interface MessageToken {
	type: 'text' | 'link' | 'mention' | 'command'
	value: string
}

export interface UseMessageParserOptions {
	/** Поисковый запрос для подсветки (строка или getter-функция) */
	searchQuery?: string | (() => string)
}

export interface UseMessageParserReturn {
	/** Разделить обычный текст на части с подсветкой совпадений */
	getHighlightedParts: (text: string) => TextPart[]
	/** Разобрать текст сообщения на токены */
	parseMessageText: (text: string) => MessageToken[]
}
