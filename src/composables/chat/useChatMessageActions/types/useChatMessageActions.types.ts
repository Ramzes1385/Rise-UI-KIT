import type { ChatMessage, ChatMessageAttachment } from '@components/BaseChat/types/BaseChat.types'

export interface UseChatMessageActionsOptions {
	selectedMessageIds: { value: readonly string[] }
	emit: {
		(event: 'avatar-click', senderId: string): void
		(event: 'message-select', messageId: string): void
		(event: 'reply-click', replyToId: string): void
		(event: 'message-reply', message: ChatMessage): void
		(event: 'message-reaction', payload: { messageId: string; emoji: string }): void
		(event: 'download-file', file: ChatMessageAttachment): void
		(event: 'file-click', file: ChatMessageAttachment): void
		(event: 'pin-message', messageId: string): void
		(event: 'unpin-message', messageId: string): void
		(event: 'message-edit', message: ChatMessage): void
		(event: 'delete-message', messageId: string): void
		(event: 'retry-message' | 'discard-message', messageId: string): void
		(event: 'mention-click', mention: string): void
		(event: 'command-click', command: string): void
	}
}

/** Состояние контекстного меню сообщения: открыто ли, где стоит и к какому сообщению относится */
export interface ChatContextMenuState {
	isOpen: boolean
	x: number
	y: number
	message: ChatMessage | null
}

/** Параметры контекстного меню: лента (её прокрутка закрывает меню) и выбранные сообщения (при выборе меню не открывается) */
export interface UseChatContextMenuOptions {
	listRef: { value: HTMLElement | null }
	selectedMessageIds: UseChatMessageActionsOptions['selectedMessageIds']
}
