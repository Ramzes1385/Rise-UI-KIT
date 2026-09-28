/** Props компонента ChatEmojiPicker */
export interface ChatEmojiPickerProps {
	/** Масштаб размера */
	sizeScale: number
}

export interface ChatEmojiPickerEmits {
	(event: 'select', emoji: string): void
}
