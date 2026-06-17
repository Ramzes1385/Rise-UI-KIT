import type { Ref } from 'vue'

/** Активные состояния кнопок тулбара */
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
	formatBlock: string
}

/** Состояние контекстного меню медиа */
export interface MediaContextMenuState {
	isVisible: boolean
	x: number
	y: number
	element: HTMLElement | null
	width: string
	height: string
}

/** Опции composable useEditorToolbar */
export interface UseEditorToolbarOptions {
	editorRef: Ref<HTMLDivElement | null>
	codeTextareaRef: Ref<HTMLTextAreaElement | { textareaRef: HTMLTextAreaElement | null } | null>
	onInput: () => void
	promptForUrl?: () => string | null
}
