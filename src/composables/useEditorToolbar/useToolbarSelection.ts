import type { Ref } from 'vue'
import { reactive } from 'vue'

import {
	FORMAT_CONFIG,
	getBlockAlign,
	getFormatBlock,
	isInsideList,
	isInsideTags,
} from '@utils/editorDomInspect'
import type { EditorActiveStates } from './useEditorToolbar.types'

interface UseToolbarSelectionOptions {
	editorRef: Ref<HTMLDivElement | null>
}

/**
 * Composable для управления состоянием выделения в редакторе и определения активных форматов.
 */
function useToolbarSelection(options: UseToolbarSelectionOptions) {
	const { editorRef } = options

	const activeStates = reactive<EditorActiveStates>({
		isBold: false,
		isItalic: false,
		isUnderline: false,
		isStrike: false,
		isJustifyLeft: false,
		isJustifyCenter: false,
		isJustifyRight: false,
		isJustifyFull: false,
		isUnorderedList: false,
		isOrderedList: false,
		isBlockquote: false,
		isPre: false,
		formatBlock: '',
	})

	let savedRange: Range | null = null

	function updateActiveStates(): void {
		const sel = window.getSelection()
		const node = sel?.anchorNode ?? null
		const root = editorRef.value
		if (!root) return

		activeStates.isBold = isInsideTags(node, FORMAT_CONFIG.bold.match, root)
		activeStates.isItalic = isInsideTags(node, FORMAT_CONFIG.italic.match, root)
		activeStates.isUnderline = isInsideTags(node, FORMAT_CONFIG.underline.match, root)
		activeStates.isStrike = isInsideTags(node, FORMAT_CONFIG.strikeThrough.match, root)

		const align = getBlockAlign(node, root)
		activeStates.isJustifyLeft = align === 'left'
		activeStates.isJustifyCenter = align === 'center'
		activeStates.isJustifyRight = align === 'right'
		activeStates.isJustifyFull = align === 'justify'

		activeStates.isUnorderedList = isInsideList(node, root, 'UL')
		activeStates.isOrderedList = isInsideList(node, root, 'OL')

		const block = getFormatBlock(node, root)
		activeStates.formatBlock = block
		activeStates.isBlockquote = block === 'blockquote'
		activeStates.isPre = block === 'pre'
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
export type { UseToolbarSelectionOptions }
