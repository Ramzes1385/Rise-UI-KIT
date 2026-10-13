import type { useEditorToolbar } from '@composables/editor/useEditorToolbar'

export type EditorToolbar = ReturnType<typeof useEditorToolbar>

export interface EditorLinkDialogState {
	isVisible: boolean
	x: number
	y: number
	url: string
	isNewTab: boolean
	hasLink: boolean
	error: string
}
