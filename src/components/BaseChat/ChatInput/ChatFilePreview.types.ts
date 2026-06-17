import type { ChatMessageAttachment } from '../model/BaseChat.types'

export interface ChatFilePreviewProps {
	attachments: ChatMessageAttachment[]
	sizeScale: number
}

export interface ChatFilePreviewEmits {
	remove: [index: number]
}
