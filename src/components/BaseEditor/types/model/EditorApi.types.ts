import type { ComputedRef, Ref } from 'vue'
import type { useEditorToolbar } from '@composables/editor/useEditorToolbar'

export interface EditorApiContext {
	editorRef: Ref<HTMLDivElement | null>
	toolbar: ReturnType<typeof useEditorToolbar>
	isLocked: ComputedRef<boolean>
	isEmpty: Ref<boolean>
	sanitize: (html: string) => string
	formField: { validate: () => boolean; reset: () => void }
	openLinkDialog: () => void
}

/** Точка окна, где отпущено перетаскиваемое: запасной способ найти место вставки, если событие `beforeinput` его не назвало */
export interface DropPoint {
	x: number
	y: number
}
