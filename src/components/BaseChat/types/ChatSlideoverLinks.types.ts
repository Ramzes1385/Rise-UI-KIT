import type { ChatMessage } from './BaseChat.types'

export interface ChatSlideoverLinksProps {
	/** Сообщения чата */
	messages: ChatMessage[]
	/** Масштаб размера */
	sizeScale: number
}

export interface SharedLink {
	url: string
	publishedAt: string
}
