import type { ChatMessage, ChatMessageAttachment } from '../../model/BaseChat.types'
import type { BaseComponentProps } from '@/types/base.types'

export interface ChatMessageListProps extends BaseComponentProps {
	/** Список сообщений */
	messages: ChatMessage[]
	/** Поисковый запрос для подсветки */
	searchQuery?: string
	/** Список ID выделенных сообщений */
	selectedMessageIds?: string[]
	/** Является ли чат групповым */
	isGroup?: boolean
	/** Флаг, показывающий, что собеседник печатает */
	isTyping?: boolean
	/** Имя того, кто печатает */
	typingUsername?: string
	/** Аватар собеседника для индикатора печатания */
	avatar?: string
	/** Все URL картинок в чате для галереи */
	allImagesUrls?: string[]
	/** Роль текущего пользователя */
	currentUserRole?: 'admin' | 'member'
}

export interface ChatMessageListEmits {
	(event: 'avatar-click', senderId: string): void
	(event: 'message-select', messageId: string): void
	(event: 'reply-click', replyToId: string): void
	(event: 'message-reply', message: ChatMessage): void
	(event: 'message-reaction', payload: { messageId: string; emoji: string }): void
	(event: 'download-file', file: ChatMessageAttachment): void
	(event: 'file-click', file: ChatMessageAttachment): void
	(event: 'pin-message', messageId: string): void
	(event: 'unpin-message', messageId: string): void
	(event: 'delete-message', messageId: string): void
	(event: 'mention-click', mention: string): void
	(event: 'command-click', command: string): void
}

/**
 * Слоты компонента ChatMessageList
 */
export interface ChatMessageListSlots {
	default?: () => unknown
}

/**
 * Публичный API компонента ChatMessageList
 */
export interface ChatMessageListExpose {
	/** Прокрутить к сообщению по id */
	scrollToMessage: (messageId: string) => void
}
