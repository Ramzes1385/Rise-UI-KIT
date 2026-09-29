import type { Ref } from 'vue'

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

export interface MediaContextMenuState {
	isVisible: boolean
	x: number
	y: number
	element: HTMLElement | null
	width: string
	height: string
}

export interface UseEditorToolbarOptions {
	editorRef: Ref<HTMLDivElement | null>
	codeTextareaRef: Ref<HTMLTextAreaElement | { textareaRef: HTMLTextAreaElement | null } | null>
	onInput: () => void
	promptForUrl?: () => string | null
	/** Режим только для чтения: контекстное меню медиа не открывается и не меняет содержимое */
	isReadonly?: () => boolean
	/** Очистка HTML, набранного в режиме кода, перед возвратом в визуальный режим. По умолчанию HTML не меняется */
	sanitize?: (html: string) => string
}
