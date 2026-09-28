import type { ChatMessageAttachment } from '../../../types/BaseChat.types'

export interface ChatMessageAttachmentsProps {
	attachments: ChatMessageAttachment[]
	sizeScale: number
	gallery?: string[]
}

export interface ChatMessageAttachmentsEmits {
	(event: 'download', file: ChatMessageAttachment): void
	(event: 'file-click', file: ChatMessageAttachment): void
}
