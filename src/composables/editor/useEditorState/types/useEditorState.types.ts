import type { Ref } from 'vue'

export interface UseEditorStateOptions {
	editorRef: Ref<HTMLDivElement | null>
	applyColor: (color: string) => void
	applyBackgroundColor: (color: string) => void
	resetColor: () => void
	resetBackgroundColor: () => void
}
