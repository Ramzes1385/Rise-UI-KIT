import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { ChatBadge, ChatMessage, ChatMessageAttachment } from '../../../types/BaseChat.types'

/**
 * Событие вызова контекстного меню: `anchorTop` — верх кнопки «Другие действия» в координатах окна (меню открыто кнопкой):
 * при перевороте вверх меню встаёт над кнопкой, а не закрывает её
 */
export type ChatContextMenuEvent = MouseEvent & { anchorTop?: number }

export interface ChatMessageItemProps {
	message: ChatMessage
	isGroup?: boolean
	isSelectionMode?: boolean
	isSelected?: boolean
	isContextActive?: boolean
	sizeScale: number
	searchQuery?: string
	allImagesUrls?: string[]
	/** Значки отправителя — из `members` по `senderId` */
	badges?: ChatBadge[]
	/** Сколько значков видно рядом с именем */
	maxBadges?: number
	/** Классы пузыря (часть `bubble` пропа `ui` у BaseChat) */
	bubbleClass?: string
}

export interface ChatMessageItemEmits {
	(event: 'avatar-click'): void
	(event: 'select'): void
	/** «Повторить» под сообщением со статусом `failed`; в payload — клик (по нему лента отличает клавиатуру от мыши и касания) */
	(event: 'retry', payload: MouseEvent): void
	/** «Удалить» под сообщением со статусом `failed`; в payload — клик (по нему лента отличает клавиатуру от мыши и касания) */
	(event: 'discard', payload: MouseEvent): void
	(event: 'reply-action'): void
	(event: 'context-menu', payload: ChatContextMenuEvent): void
	(event: 'reply-click', replyToId: string): void
	(event: 'download', file: ChatMessageAttachment): void
	(event: 'file-click', file: ChatMessageAttachment): void
	(event: 'mention-click', mention: string): void
	(event: 'command-click', command: string): void
	(event: 'reaction-toggle', emoji: string): void
}

export type MessageItemProps = PropsWithDefaults<ChatMessageItemProps, 'isGroup' | 'allImagesUrls'>
