/** Утилиты: выделение области как отрезок текста — переживает любую перестройку разметки внутри */
import type { TextRange } from '../types/editorFormatUtils.types'
import { getSelectionRange, selectRange } from '../../editorInsertUtils'

/** Непустые текстовые узлы области по порядку */
function textNodes(root: HTMLElement): Text[] {
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
	const nodes: Text[] = []
	while (walker.nextNode()) {
		const node = walker.currentNode as Text
		if (node.data.length > 0) nodes.push(node)
	}
	return nodes
}

/** Сколько символов текстовых узлов области лежит до точки */
function textOffset(root: HTMLElement, container: Node, offset: number): number {
	const range = document.createRange()
	range.selectNodeContents(root)
	range.setEnd(container, offset)
	return range.toString().length
}

/** Выделение внутри области как отрезок текста; null, если выделения в области нет */
function getTextRange(root: HTMLElement): TextRange | null {
	const range = getSelectionRange(root)
	if (!range) return null
	return {
		start: textOffset(root, range.startContainer, range.startOffset),
		end: textOffset(root, range.endContainer, range.endOffset),
	}
}

/** Разрезает текстовый узел, внутри которого лежит смещение, чтобы граница стала границей узлов */
function splitTextAt(root: HTMLElement, offset: number): void {
	let passed = 0
	for (const node of textNodes(root)) {
		const next = passed + node.data.length
		if (offset > passed && offset < next) {
			node.splitText(offset - passed)
			return
		}
		passed = next
	}
}

/** Текстовые узлы, целиком лежащие в отрезке; границы отрезка предварительно разрезают узлы */
function nodesInTextRange(root: HTMLElement, range: TextRange): Text[] {
	splitTextAt(root, range.end)
	splitTextAt(root, range.start)
	let passed = 0
	const result: Text[] = []
	for (const node of textNodes(root)) {
		const next = passed + node.data.length
		if (passed >= range.start && next <= range.end) result.push(node)
		passed = next
	}
	return result
}

/** Узел и смещение для смещения в тексте; начало предпочитает следующий узел, конец — предыдущий */
function pointAt(root: HTMLElement, offset: number, isEnd: boolean): [Node, number] {
	let passed = 0
	let last: Text | null = null
	for (const node of textNodes(root)) {
		const next = passed + node.data.length
		if (isEnd ? offset <= next : offset < next) return [node, offset - passed]
		passed = next
		last = node
	}
	return last ? [last, last.data.length] : [root, 0]
}

/** Ставит выделение на отрезок текста области */
function selectTextRange(root: HTMLElement, textRange: TextRange): void {
	const range = document.createRange()
	const isCollapsed = textRange.start === textRange.end
	const [startNode, startOffset] = pointAt(root, textRange.start, false)
	const [endNode, endOffset] = isCollapsed ? [startNode, startOffset] : pointAt(root, textRange.end, true)
	range.setStart(startNode, startOffset)
	range.setEnd(endNode, endOffset)
	selectRange(range)
}

export { getTextRange, nodesInTextRange, selectTextRange, textNodes }
