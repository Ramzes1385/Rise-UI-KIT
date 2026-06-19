import type { Ref } from 'vue'

/** Опции composable useEditorState */
export interface UseEditorStateOptions {
	editorRef: Ref<HTMLDivElement | null>
	applyColor: (color: string) => void
	applyBackgroundColor: (color: string) => void
	resetColor: () => void
	resetBackgroundColor: () => void
}
