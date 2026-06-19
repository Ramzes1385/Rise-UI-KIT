import type { ChatMessage, ChatMessageAttachment } from '../../model/BaseChat.types'

export interface ChatMessageItemProps {
	message: ChatMessage
	isGroup?: boolean
	isSelectionMode?: boolean
	isSelected?: boolean
	isContextActive?: boolean
	sizeScale: number
	searchQuery?: string
	allImagesUrls?: string[]
}

export interface ChatMessageItemEmits {
	(event: 'avatar-click'): void
	(event: 'select'): void
	(event: 'reply-action'): void
	(event: 'context-menu', payload: MouseEvent): void
	(event: 'reply-click', replyToId: string): void
	(event: 'download', file: ChatMessageAttachment): void
	(event: 'file-click', file: ChatMessageAttachment): void
	(event: 'mention-click', mention: string): void
	(event: 'command-click', command: string): void
	(event: 'reaction-toggle', emoji: string): void
}
