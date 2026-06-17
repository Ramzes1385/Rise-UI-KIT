import type { ChatMessageAttachment } from '../../model/BaseChat.types'

export interface ChatMessageAttachmentsProps {
	attachments: ChatMessageAttachment[]
	sizeScale: number
	gallery?: string[]
}

export interface ChatMessageAttachmentsEmits {
	(event: 'download', file: ChatMessageAttachment): void
	(event: 'file-click', file: ChatMessageAttachment): void
}
