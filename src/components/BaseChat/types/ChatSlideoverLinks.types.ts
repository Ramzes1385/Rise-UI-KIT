import type { ChatMessage } from './BaseChat.types'

/** Props компонента ChatSlideoverLinks */
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
