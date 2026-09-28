import type { ChatMessageReaction } from '../../../types/BaseChat.types'

export interface ChatMessageReactionsProps {
	reactions: ChatMessageReaction[]
	sender: 'me' | 'other'
}

export interface ChatMessageReactionsEmits {
	(event: 'toggle', emoji: string): void
}
