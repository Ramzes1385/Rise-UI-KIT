import type { ChatMessage } from '../../../types/BaseChat.types'

export interface ChatMessageContextMenuProps {
	isOpen: boolean
	x: number
	y: number
	/** Верх кнопки, открывшей меню (координаты окна, px): при перевороте вверх меню встаёт над ней */
	anchorY?: number
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
	(event: 'edit'): void
	(event: 'pin'): void
	(event: 'delete'): void
	/** Закрытие с клавиатуры (Escape, Tab) */
	(event: 'close'): void
}

export interface ChatMessageContextMenuExpose {
	/** Ref на DOM-элемент меню */
	menuRef: HTMLElement | null
}

/** Точка вызова меню в координатах окна, px */
export interface ChatMenuPoint {
	x: number
	y: number
	/** Верх кнопки, открывшей меню: переворот вверх отсчитывается от него */
	anchorY?: number
}

export interface ChatMenuSize {
	width: number
	height: number
}

/** Положение меню в системе отсчёта его `position: fixed`, px; `maxHeight` задан, если по высоте не хватает места с обеих сторон */
export interface ChatMenuPlacement {
	top: number
	left: number
	maxHeight: number | undefined
}
