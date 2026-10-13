import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { ChatMember, ChatMessage, ChatMessageAttachment } from '../../../types/BaseChat.types'

export interface ChatMessageListProps extends BaseComponentProps<string, 'root'> {
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
	/** Участники группы: значки отправителя ищутся по `senderId` */
	members?: ChatMember[]
	/** Сколько значков видно рядом с именем отправителя */
	maxBadges?: number
	/** Последнее прочитанное сообщение: перед первым чужим после него — разделитель «Непрочитанные» */
	lastReadMessageId?: string
	/** Текущий день для «Сегодня» и «Вчера» в разделителях дат */
	today?: string | number | Date
	/** Первая загрузка: вместо сообщений — скелетон */
	isLoading?: boolean
	/** Есть ли более старые сообщения для подгрузки */
	hasMoreMessages?: boolean
	/** Идёт подгрузка старых сообщений */
	isLoadingMore?: boolean
	/** Классы строки сообщения (часть `message` пропа `ui` у BaseChat) */
	messageClass?: string
	/** Классы пузыря сообщения (часть `bubble` пропа `ui` у BaseChat) */
	bubbleClass?: string
}

export interface ChatMessageListEmits {
	(event: 'avatar-click', senderId: string): void
	(event: 'message-select', messageId: string): void
	(event: 'reply-click', replyToId: string): void
	(event: 'message-reply', message: ChatMessage): void
	/** «Изменить» в меню своего сообщения */
	(event: 'message-edit', message: ChatMessage): void
	/** Прокрутка дошла до начала ленты: нужны более старые сообщения */
	(event: 'load-more'): void
	(event: 'message-reaction', payload: { messageId: string; emoji: string }): void
	(event: 'download-file', file: ChatMessageAttachment): void
	(event: 'file-click', file: ChatMessageAttachment): void
	(event: 'pin-message', messageId: string): void
	(event: 'unpin-message', messageId: string): void
	(event: 'delete-message', messageId: string): void
	/** `retry-message` — «Повторить», `discard-message` — «Удалить» под сообщением со статусом `failed` */
	(event: 'retry-message' | 'discard-message', messageId: string): void
	(event: 'mention-click', mention: string): void
	(event: 'command-click', command: string): void
}

export type MessageListProps = PropsWithDefaults<ChatMessageListProps, 'selectedMessageIds' | 'members'>
