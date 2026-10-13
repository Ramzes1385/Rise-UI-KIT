import type { ComputedRef, Ref } from 'vue'
import type { useEditorToolbar } from '@composables/editor/useEditorToolbar'

export interface EditorApiContext {
	editorRef: Ref<HTMLDivElement | null>
	toolbar: ReturnType<typeof useEditorToolbar>
	isLocked: ComputedRef<boolean>
	isEmpty: Ref<boolean>
	sanitize: (html: string) => string
	handleInput: () => void
	formField: { validate: () => boolean; reset: () => void }
	openLinkDialog: () => void
}
