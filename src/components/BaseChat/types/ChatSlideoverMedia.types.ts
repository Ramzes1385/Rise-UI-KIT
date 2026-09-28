import type { ChatMessage } from './BaseChat.types'

/** Props компонента ChatSlideoverMedia */
export interface ChatSlideoverMediaProps {
	/** Сообщения чата */
	messages: ChatMessage[]
	/** Масштаб размера */
	sizeScale: number
}
