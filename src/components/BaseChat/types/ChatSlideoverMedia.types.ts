import type { ChatMessage } from './BaseChat.types'

export interface ChatSlideoverMediaProps {
	/** Сообщения чата */
	messages: ChatMessage[]
	/** Масштаб размера */
	sizeScale: number
}
