import type { Ref } from 'vue'
import { reactive } from 'vue'
import type { FileManagerEditing } from '../../types/FileManagerInternal.types'

function rowBox(row: HTMLElement) {
	return { top: `${row.offsetTop}px`, left: `${row.offsetLeft}px`, width: `${row.offsetWidth}px`, minHeight: `${row.offsetHeight}px` }
}

export function useEditorPlacement(listRef: Ref<HTMLElement | null>, findElement: (id: string | null) => HTMLElement | null) {
	const editorBox = reactive({ top: '0px', left: '0px', width: 'auto', minHeight: '0px' })
	let observer: ResizeObserver | null = null

	function placeEditor(current: FileManagerEditing): HTMLElement | null {
		const row = current.mode === 'rename' ? findElement(current.id) : null
		if (row) Object.assign(editorBox, rowBox(row))
		return row
	}

	function stopObserving(): void {
		observer?.disconnect()
		observer = null
	}

	function observeEditor(current: FileManagerEditing): void {
		stopObserving()
		const row = placeEditor(current)
		if (typeof ResizeObserver === 'undefined' || !row) return
		observer = new ResizeObserver(() => placeEditor(current))
		observer.observe(row)
		if (listRef.value) observer.observe(listRef.value)
	}

	return { editorBox, stopObserving, observeEditor }
}
