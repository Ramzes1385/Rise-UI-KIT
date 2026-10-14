import { onBeforeUnmount, onMounted } from 'vue'
import type { SelectionSyncOptions } from '../../types/model/EditorSelectionSync.types'

export function useEditorSelectionSync(options: SelectionSyncOptions): void {
	let frame = 0

	function isCaretInEditor(): boolean {
		const node = window.getSelection()?.anchorNode
		return Boolean(node && options.editorRef.value?.contains(node))
	}

	function handleSelectionChange(): void {
		if (frame || options.isCodeMode.value || options.composition.isActive || !isCaretInEditor()) return
		frame = requestAnimationFrame(() => {
			frame = 0
			options.refresh()
		})
	}

	onMounted(() => document.addEventListener('selectionchange', handleSelectionChange))
	onBeforeUnmount(() => {
		document.removeEventListener('selectionchange', handleSelectionChange)
		cancelAnimationFrame(frame)
	})
}
