import type { ChatMessage, ChatMessageAttachment } from './BaseChat.types'

/** Props компонента ChatSlideoverFiles */
export interface ChatSlideoverFilesProps {
	/** Сообщения чата */
	messages: ChatMessage[]
	/** Масштаб размера */
	sizeScale: number
}

/** Emits компонента ChatSlideoverFiles */
export interface ChatSlideoverFilesEmits {
	(event: 'file-click', file: ChatMessageAttachment): void
	(event: 'download-file', file: ChatMessageAttachment): void
}
