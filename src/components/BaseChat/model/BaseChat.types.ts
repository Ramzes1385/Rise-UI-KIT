import type { CustomClassProp } from '@composables/useCustomClass'
import type { CustomColor } from '@composables/useCustomColor'

export type ChatMessageSender = 'me' | 'other'
export type ChatMessageStatus = 'sending' | 'sent' | 'delivered' | 'read'
export type ChatInfoTab = 'info' | 'media' | 'files' | 'links' | 'profile'

export interface ChatMessageAttachment {
	/** Уникальный идентификатор вложения */
	id: string
	/** Имя файла */
	name: string
	/** Тип вложения: изображение или файл */
	type: 'image' | 'file'
	/** URL для отображения или скачивания */
	url: string
	/** Размер файла в читаемом формате (например, "1.2 MB") */
	size?: string
}

export interface ChatMessageReaction {
	/** Эмодзи реакции */
	emoji: string
	/** Список имен пользователей, поставивших эту реакцию */
	users: string[]
}

export interface ChatMessage {
	/** Уникальный идентификатор сообщения */
	id: string
	/** Текст сообщения */
	text: string
	/** Отправитель: 'me' (я) или 'other' (собеседник) */
	sender: ChatMessageSender
	/** ID отправителя */
	senderId?: string
	/** Время отправки (например, "10:15") */
	time: string
	/** Дата отправки (например, "12 мая 2024") — для группировки медиа/файлов/ссылок */
	date?: string
	/** Имя отправителя */
	senderName?: string
	/** Аватар отправителя */
	senderAvatar?: string
	/** Статус доставки сообщения */
	status?: ChatMessageStatus
	/** Вложения к сообщению */
	attachments?: ChatMessageAttachment[]
	/** ID сообщения, на которое сделан ответ */
	replyToId?: string
	/** Текст сообщения, на которое сделан ответ */
	replyToText?: string
	/** Имя отправителя сообщения, на которое сделан ответ */
	replyToSenderName?: string
	/** Реакции на сообщение */
	reactions?: ChatMessageReaction[]
	/** Закреплено ли сообщение */
	isPinned?: boolean
}

export interface ChatMember {
	id: string
	name: string
	avatar?: string
	status?: 'online' | 'offline'
	role?: string
	warningsCount?: number
	isBanned?: boolean
}

export interface ChatCommand {
	/** Имя команды без слеша (например, "help") */
	name: string
	/** Описание команды для подсказки */
	description: string
}

/**
 * Пропсы компонента BaseChat
 */
export interface BaseChatProps {
	/** Список сообщений */
	messages: ChatMessage[]
	/** Заголовок чата */
	title: string
	/** Подзаголовок чата */
	subtitle?: string
	/** Аватар собеседника или группы */
	avatar?: string
	/** Высота контейнера чата */
	height?: string
	/** Масштаб размера (50-200) */
	sizeScale?: number
	/** Вариант отображения */
	variant?: 'bubble' | 'flat' | 'modern'
	/** Кастомный цвет */
	color?: CustomColor
	/** Кастомные классы */
	customClass?: CustomClassProp
	/** Флаг, показывающий, что собеседник печатает */
	isTyping?: boolean
	/** Имя того, кто печатает (для групповых чатов) */
	typingUsername?: string
	/** Является ли чат групповым */
	isGroup?: boolean
	/** Список участников группового чата */
	members?: ChatMember[]
	/** Быстрые ответы */
	quickReplies?: string[]
	/** Список доступных команд чата (для автодополнения по "/" и кнопки команд) */
	commands?: ChatCommand[]
	/** Список закрепленных сообщений */
	pinnedMessages?: ChatMessage[]
	/** Роль текущего пользователя в чате */
	currentUserRole?: 'admin' | 'member'
}

/**
 * События компонента BaseChat
 */
export interface BaseChatEmits {
	(event: 'send', payload: { text: string; attachments?: ChatMessageAttachment[]; replyToId?: string }): void
	(event: 'attach', files: FileList): void
	(event: 'avatar-click', senderId: string): void
	(event: 'search', query: string): void
	(event: 'message-select', messageId: string): void
	(event: 'info-click'): void
	(event: 'message-reaction', payload: { messageId: string; emoji: string }): void
	(event: 'quick-reply', text: string): void
	(event: 'download-file', file: ChatMessageAttachment): void
	(event: 'delete-messages', messageIds: string[]): void
	(event: 'forward-messages', messageIds: string[]): void
	(event: 'pin-message', messageId: string): void
	(event: 'unpin-message', messageId: string): void
	(event: 'add-member', member: ChatMember): void
	(event: 'kick-member', memberId: string): void
	(event: 'ban-member', payload: { memberId: string; reason?: string; warningsCount?: number }): void
	(event: 'update-member-role', payload: { memberId: string; role: string }): void
	(event: 'mention-click', mention: string): void
	(event: 'command-click', command: string): void
	(event: 'error', payload: { type: string; message: string; detail?: unknown }): void
}
