import type { ChatMessage, ChatMessageAttachment } from './BaseChat.types'

export interface ChatSlideoverFilesProps {
	/** Сообщения чата */
	messages: ChatMessage[]
	/** Масштаб размера */
	sizeScale: number
}

export interface ChatSlideoverFilesEmits {
	(event: 'file-click', file: ChatMessageAttachment): void
	(event: 'download-file', file: ChatMessageAttachment): void
}
