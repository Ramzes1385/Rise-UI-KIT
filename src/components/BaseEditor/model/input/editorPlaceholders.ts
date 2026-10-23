import type { Ref } from 'vue'
import { getSelectionRange } from '@utils/dom/editorInsertUtils'
import { getClipboardData, releasePlaceholders } from '@utils/dom/editorFormatUtils'

export function releaseBeforeInput(root: HTMLElement | null): void {
	if (root) releasePlaceholders(root, window.getSelection()?.anchorNode ?? null)
}

function copySelection(root: HTMLElement | null, event: ClipboardEvent): boolean {
	const range = root && getSelectionRange(root)
	if (!range || range.collapsed || !event.clipboardData) return false
	const data = getClipboardData(range)
	event.clipboardData.setData('text/html', data.html)
	event.clipboardData.setData('text/plain', data.text)
	event.preventDefault()
	return true
}

export function createClipboardHandlers(root: Ref<HTMLElement | null>, deleteSelection: () => void) {
	return {
		handleCopy: (event: ClipboardEvent): void => void copySelection(root.value, event),
		handleCut: (event: ClipboardEvent): void => {
			if (copySelection(root.value, event)) deleteSelection()
		},
	}
}
