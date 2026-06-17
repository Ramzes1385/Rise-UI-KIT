import type { ChatMessage } from './BaseChat.types'

export interface ChatPinnedPanelProps {
	pinnedMessages: ChatMessage[]
	currentIndex: number
	currentUserRole?: 'admin' | 'member'
	sizeScale?: number
}

export interface ChatPinnedPanelEmits {
	(e: 'update:currentIndex', index: number): void
	(e: 'click', messageId: string): void
	(e: 'unpin', messageId: string): void
}
