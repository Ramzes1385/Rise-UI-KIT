/** Props компонента ChatEmojiPicker */
export interface ChatEmojiPickerProps {
	/** Масштаб размера */
	sizeScale: number
}

/** Emits компонента ChatEmojiPicker */
export interface ChatEmojiPickerEmits {
	(event: 'select', emoji: string): void
}
