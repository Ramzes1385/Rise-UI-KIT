import type { CustomColor } from '@/shared/composables/useCustomColor'

/** Варианты отображения чата */
export const CHAT_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Тип сообщения чата
 */
export type ChatMessageType = 'text' | 'image' | 'system' | 'typing' | 'link'

/**
 * Отправитель сообщения
 */
export type ChatSender = 'me' | 'other' | 'system'

/**
 * Статус сообщения
 */
export type ChatMessageStatus = 'sent' | 'delivered' | 'read' | 'error'

/**
 * Вариант отображения чата
 */
export type ChatVariant = 'bubble' | 'modern' | 'minimal' | 'support' | 'sidebar' | 'thread' | 'feed'

/**
 * Участник группового чата
 */
export interface ChatParticipant {
	/** Идентификатор */
	id: string | number
	/** Имя */
	name: string
	/** Аватар */
	avatar?: string
	/** Онлайн */
	isOnline?: boolean
}

/**
 * Превью ссылки
 */
export interface ChatLinkPreview {
	/** URL ссылки */
	url: string
	/** Заголовок */
	title?: string
	/** Описание */
	description?: string
	/** Изображение превью */
	image?: string
}

/**
 * Быстрый ответ (для support-чата)
 */
export interface ChatQuickReply {
	/** Текст кнопки */
	label: string
	/** Значение */
	value: string
}

/**
 * Реакция на сообщение (для feed-чата)
 */
export interface ChatReaction {
	/** Эмодзи */
	emoji: string
	/** Количество */
	count: number
	/** Поставил ли текущий пользователь */
	isMine?: boolean
}

/**
 * Сообщение чата
 */
export interface ChatMessage {
	/** Идентификатор */
	id: string | number
	/** Текст */
	text?: string
	/** URL изображения */
	imageUrl?: string
	/** Отправитель */
	sender: ChatSender
	/** Время */
	time?: string
	/** Статус доставки */
	status?: ChatMessageStatus
	/** Имя отправителя */
	senderName?: string
	/** Аватар отправителя */
	senderAvatar?: string
	/** Тип сообщения */
	type?: ChatMessageType
	/** Превью ссылки */
	linkPreview?: ChatLinkPreview
	/** ID сообщения-ответа (для thread) */
	replyToId?: string | number
	/** Текст ответа (превью) */
	replyToText?: string
	/** Имя автора ответа */
	replyToName?: string
	/** Реакции (для feed) */
	reactions?: ChatReaction[]
}

/**
 * Пропсы компонента BaseChat
 */
export interface BaseChatProps {
	/** Сообщения */
	messages?: ChatMessage[]
	/** Вариант отображения */
	variant?: ChatVariant
	/** Вариант стиля */
	styleVariant?: (typeof CHAT_VARIANTS)[number]
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Показывать поле ввода */
	hasInput?: boolean
	/** Показывать заголовок */
	hasHeader?: boolean
	/** Заголовок чата */
	title?: string
	/** Подзаголовок */
	subtitle?: string
	/** Аватар собеседника */
	companionAvatar?: string
	/** Плейсхолдер ввода */
	inputPlaceholder?: string
	/** Высота чата */
	height?: string
	/** Автопрокрутка */
	isAutoScroll?: boolean
	/** Участники группового чата */
	participants?: ChatParticipant[]
	/** Групповой чат */
	isGroup?: boolean
	/** Показывать кнопку голосового ввода */
	hasVoiceInput?: boolean
	/** Показывать кнопку вложений */
	hasAttachInput?: boolean
	/** Встроенный зум изображений */
	hasImageZoom?: boolean
	/** Быстрые ответы (для support) */
	quickReplies?: ChatQuickReply[]
	/** Статус оператора онлайн (для support) */
	isOperatorOnline?: boolean
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
}

/**
 * События компонента BaseChat
 */
export interface BaseChatEmits {
	(event: 'send', message: string): void
	(event: 'scroll-top'): void
	(event: 'send-voice'): void
	(event: 'send-file'): void
	(event: 'image-zoom', scale: number): void
	(event: 'link-click', url: string): void
	(event: 'quick-reply', value: string): void
	(event: 'reaction', payload: { messageId: string | number; emoji: string }): void
	(event: 'reply', messageId: string | number): void
}

/**
 * Слоты компонента BaseChat
 */
export interface BaseChatSlots {
	header?: () => unknown
	message?: (props: { message: ChatMessage; index: number }) => unknown
	input?: () => unknown
	empty?: () => unknown
}
