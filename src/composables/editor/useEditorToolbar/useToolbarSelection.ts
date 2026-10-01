/** Composable: управление состоянием выделения в редакторе и определение активных форматов */
import { reactive } from 'vue'
import type { EditorActiveStates } from './types/useEditorToolbar.types'
import { createActiveStates, readActiveStates } from './helpers/activeStates'
import type { UseToolbarSelectionOptions } from './types/useToolbarSelection.types'

function useToolbarSelection(options: UseToolbarSelectionOptions) {
	const { editorRef } = options

	const activeStates = reactive<EditorActiveStates>(createActiveStates())

	let savedRange: Range | null = null

	function updateActiveStates(): void {
		readActiveStates(activeStates, editorRef.value)
	}

	function saveSelection(): void {
		const sel = window.getSelection()
		if (!sel || sel.rangeCount === 0 || !editorRef.value) return
		const range = sel.getRangeAt(0)
		if (editorRef.value.contains(range.commonAncestorContainer)) {
			savedRange = range.cloneRange()
		}
		updateActiveStates()
	}

	function restoreSelection(): boolean {
		if (!savedRange || !editorRef.value) return false
		editorRef.value.focus()
		const sel = window.getSelection()
		if (!sel) return false
		sel.removeAllRanges()
		sel.addRange(savedRange)
		return true
	}

	function ensureSelection(): void {
		if (!editorRef.value) return
		const sel = window.getSelection()
		if (!sel || !editorRef.value.contains(sel.anchorNode)) {
			restoreSelection()
		}
	}

	return {
		activeStates,
		updateActiveStates,
		saveSelection,
		restoreSelection,
		ensureSelection,
	}
}

export { useToolbarSelection }
