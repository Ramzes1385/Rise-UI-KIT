/** Утилиты: активные форматы тулбара редактора по положению каретки */
import type { EditorActiveStates } from '../types/useEditorToolbar.types'
import { FORMAT_CONFIG, getBlockAlign, getFormatBlock, isInsideList, isInsideTags } from '@utils/dom/editorDomUtils'

/** Начальное состояние: ни один формат не активен */
function createActiveStates(): EditorActiveStates {
	return {
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
	}
}

/** Начертание и списки */
function readInlineStates(states: EditorActiveStates, node: Node | null, root: HTMLElement): void {
	states.isBold = isInsideTags(node, FORMAT_CONFIG.bold.match, root)
	states.isItalic = isInsideTags(node, FORMAT_CONFIG.italic.match, root)
	states.isUnderline = isInsideTags(node, FORMAT_CONFIG.underline.match, root)
	states.isStrike = isInsideTags(node, FORMAT_CONFIG.strikeThrough.match, root)
	states.isUnorderedList = isInsideList(node, root, 'UL')
	states.isOrderedList = isInsideList(node, root, 'OL')
}

/** Выравнивание и тип блока */
function readBlockStates(states: EditorActiveStates, node: Node | null, root: HTMLElement): void {
	const align = getBlockAlign(node, root)
	states.isJustifyLeft = align === 'left'
	states.isJustifyCenter = align === 'center'
	states.isJustifyRight = align === 'right'
	states.isJustifyFull = align === 'justify'
	const block = getFormatBlock(node, root)
	states.formatBlock = block
	states.isBlockquote = block === 'blockquote'
	states.isPre = block === 'pre'
}

/** Обновляет активные форматы по узлу, в котором стоит каретка */
function readActiveStates(states: EditorActiveStates, root: HTMLElement | null): void {
	const node = window.getSelection()?.anchorNode ?? null
	if (!root) return
	readInlineStates(states, node, root)
	readBlockStates(states, node, root)
}

export { createActiveStates, readActiveStates }
