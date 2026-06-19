import type { EditorActiveStates } from './useEditorToolbar.types'
import type { Ref } from 'vue'

export interface UseToolbarCommandsOptions {
	editorRef: Ref<HTMLDivElement | null>
	onInput: () => void
	activeStates: EditorActiveStates
	updateActiveStates: () => void
	saveSelection: () => void
	restoreSelection: () => boolean
	ensureSelection: () => void
	isCodeMode: Ref<boolean>
	codeContent: Ref<string>
	wrapCodeSelection: (open: string, close: string) => void
	insertCodeAtCursor: (html: string) => void
	getCodeTextarea: () => HTMLTextAreaElement | null
	promptForUrl?: () => string | null
}
