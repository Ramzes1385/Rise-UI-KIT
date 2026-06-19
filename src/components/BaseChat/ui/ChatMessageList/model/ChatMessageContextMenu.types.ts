import type { ChatMessage } from '../../model/BaseChat.types'

export interface ChatMessageContextMenuProps {
	isOpen: boolean
	x: number
	y: number
	message: ChatMessage | null
	currentUserRole: 'admin' | 'member'
	sizeScale: number
	popularEmojis?: string[]
}

export interface ChatMessageContextMenuEmits {
	(event: 'reaction', emoji: string): void
	(event: 'reply'): void
	(event: 'select'): void
	(event: 'copy'): void
	(event: 'pin'): void
	(event: 'delete'): void
}

/**
 * Публичный API компонента ChatMessageContextMenu
 */
export interface ChatMessageContextMenuExpose {
	/** Ref на DOM-элемент меню */
	menuRef: HTMLElement | null
}
