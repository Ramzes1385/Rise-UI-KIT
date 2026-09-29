import type { MessageToken, TextPart } from '@composables/chat/useMessageParser/types/useMessageParser.types'

export interface ChatMessageTextProps {
	text: string
	sizeScale: number
	searchQuery?: string
}

export interface HighlightedToken extends MessageToken {
	highlightedParts: TextPart[]
}

export interface ChatMessageTextEmits {
	(event: 'mention-click', mention: string): void
	(event: 'command-click', command: string): void
}
