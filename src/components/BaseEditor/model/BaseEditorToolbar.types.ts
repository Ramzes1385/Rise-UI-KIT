import type { BaseSelectOption } from '@components/BaseSelect'

/** Состояния активности кнопок форматирования */
export interface EditorActiveStates {
	isBold: boolean
	isItalic: boolean
	isUnderline: boolean
	isStrike: boolean
	isJustifyLeft: boolean
	isJustifyCenter: boolean
	isJustifyRight: boolean
	isJustifyFull: boolean
	isUnorderedList: boolean
	isOrderedList: boolean
	isBlockquote: boolean
	isPre: boolean
}

/** Props компонента BaseEditorToolbar */
export interface BaseEditorToolbarProps {
	/** Состояния активности кнопок форматирования */
	activeStates: EditorActiveStates
	/** Масштаб размера */
	sizeScale: number
	/** Объект CSS-классов для кастомизации элементов тулбара */
	classes: Record<string, string | undefined>
	/** Режим кода */
	isCodeMode: boolean
	/** Только чтение */
	isReadonly: boolean
	/** Показывать тулбар */
	hasToolbar: boolean
	/** Опции заголовков */
	headingOptions: BaseSelectOption[]
	/** Цвет текста */
	textColor: string
	/** Цвет фона */
	backgroundColor: string
	/** Активен ли цвет текста */
	isTextColorActive: boolean
	/** Активен ли цвет фона */
	isBackgroundColorActive: boolean
}

/** Emits компонента BaseEditorToolbar */
export interface BaseEditorToolbarEmits {
	(event: 'applyFormat', command: string): void
	(event: 'applyBlock', tag: string): void
	(event: 'handleHeadingChange', value: string | number): void
	(event: 'insertLink'): void
	(event: 'handleImageUpload', payload: Event): void
	(event: 'handleVideoUpload', payload: Event): void
	(event: 'clearAllFormatting'): void
	(event: 'insertSeparator'): void
	(event: 'toggleCodeMode'): void
	(event: 'saveSelection'): void
	(event: 'handleTextColor', color: string): void
	(event: 'handleBackgroundColor', color: string): void
	(event: 'resetTextColor'): void
	(event: 'resetBackgroundColor'): void
}

/** Слоты компонента BaseEditorToolbar */
export interface BaseEditorToolbarSlots {
	toolbar?: () => unknown
}
