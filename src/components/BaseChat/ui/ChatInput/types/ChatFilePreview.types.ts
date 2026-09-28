import type { ChatMessageAttachment } from '../../../types/BaseChat.types'

export interface ChatFilePreviewProps {
	attachments: ChatMessageAttachment[]
	sizeScale: number
}

export interface ChatFilePreviewEmits {
	remove: [index: number]
}
