import type { ChatCommand, ChatMember, ChatMessage, ChatMessageAttachment } from '../model/BaseChat.types'

export interface ChatInputProps {
	/** Масштаб размера */
	sizeScale?: number
	/** Сообщение, на которое пишется ответ */
	replyingTo?: ChatMessage | null
	/** Панель быстрых ответов */
	quickReplies?: string[]
	/** Список участников для упоминаний */
	members?: ChatMember[]
	/** Список доступных команд чата */
	commands?: ChatCommand[]
	/** Является ли чат групповым */
	isGroup?: boolean
}

export interface ChatInputEmits {
	(event: 'send', payload: { text: string; attachments?: ChatMessageAttachment[] }): void
	(event: 'attach', files: FileList): void
	(event: 'cancel-reply'): void
	(event: 'quick-reply', text: string): void
}
