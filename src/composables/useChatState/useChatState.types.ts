import type { ChatMember, ChatMessage } from '@components/BaseChat/model/BaseChat.types'

export interface UseChatStateProps {
	messages: ChatMessage[]
	isGroup?: boolean
	members?: ChatMember[]
	currentUserRole?: 'admin' | 'member'
}

export interface UseChatStateEmit {
	(event: 'message-select', messageId: string): void
	(event: 'avatar-click', senderId: string): void
	(event: 'info-click'): void
	(event: 'pin-message', messageId: string): void
	(event: 'unpin-message', messageId: string): void
}

export interface UseChatStateOptions {
	scrollToMessage?: (messageId: string) => void
}
