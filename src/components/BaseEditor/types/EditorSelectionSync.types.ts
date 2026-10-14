import type { Ref } from 'vue'
import type { EditorComposition } from './EditorComposition.types'

export interface SelectionSyncOptions {
	editorRef: Ref<HTMLElement | null>
	isCodeMode: Ref<boolean>
	composition: EditorComposition
	refresh: () => void
	release: () => void
}
