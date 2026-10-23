/** Утилиты: выделение редактора как путь по дереву — переживает пересборку DOM из строки HTML */
import type { EditorSelectionPath, EditorSelectionPoint, EditorSelectionUnit } from '../types/useEditorHistory.types'

function isText(node: Node | null): node is Text {
	return node?.nodeType === Node.TEXT_NODE
}

function unitOf(child: Node): EditorSelectionUnit {
	let index = 0
	let afterText = false
	for (let node = (child.parentNode as Node).firstChild; node !== child; node = (node as Node).nextSibling) {
		if (isText(node) && !node.data) continue
		if (!(isText(node) && afterText)) index++
		afterText = isText(node)
	}
	return { index, isContinuation: isText(child) && afterText }
}

function unitCount(parent: Node): number {
	let count = 0
	let afterText = false
	for (let node = parent.firstChild; node; node = node.nextSibling) {
		if (isText(node) && !node.data) continue
		if (!(isText(node) && afterText)) count++
		afterText = isText(node)
	}
	return count
}

function elementPath(root: HTMLElement, node: Node): number[] {
	const path: number[] = []
	for (let current: Node | null = node; current && current !== root; current = current.parentNode) path.unshift(unitOf(current).index)
	return path
}

/** Первый текстовый узел цепочки, в которой лежит `node`, и смещение, пересчитанное от её начала */
function chainStart(node: Text, offset: number): { first: Text; offset: number; length: number } {
	let first = node
	let shifted = offset
	while (isText(first.previousSibling)) {
		first = first.previousSibling
		shifted += first.data.length
	}
	let length = 0
	for (let current: Node | null = first; isText(current); current = current.nextSibling) length += current.data.length
	return { first, offset: shifted, length }
}

function textPoint(root: HTMLElement, node: Text, offset: number): EditorSelectionPoint {
	const chain = chainStart(node, offset)
	const parentPath = elementPath(root, node.parentNode as Node)
	const unit = unitOf(chain.first)
	if (!chain.length) return { path: parentPath, offset: unit.index }
	return { path: [...parentPath, unit.index], offset: chain.offset }
}

/** Точка выделения как путь от корня; граница элемента посреди цепочки текстов превращается в текстовую точку */
function toPoint(root: HTMLElement, node: Node, offset: number): EditorSelectionPoint {
	if (isText(node)) return textPoint(root, node, offset)
	const child = node.childNodes[offset]
	if (isText(child) && isText(child.previousSibling)) return textPoint(root, child, 0)
	const index = child ? unitOf(child).index : unitCount(node)
	return { path: elementPath(root, node), offset: index }
}

function fromPoint(root: HTMLElement, point: EditorSelectionPoint): [Node, number] | null {
	let node: Node | undefined = root
	for (const index of point.path) node = node?.childNodes[index]
	if (!node) return null
	const limit = isText(node) ? node.data.length : node.childNodes.length
	return point.offset <= limit ? [node, point.offset] : null
}

/** Текущее выделение как путь от корня; null, если выделения нет или оно выходит за область */
function readSelectionPath(root: HTMLElement): EditorSelectionPath | null {
	const selection = window.getSelection()
	const { anchorNode, focusNode } = selection ?? {}
	if (!selection || !anchorNode || !focusNode || !root.contains(anchorNode) || !root.contains(focusNode)) return null
	return {
		anchor: toPoint(root, anchorNode, selection.anchorOffset),
		focus: toPoint(root, focusNode, selection.focusOffset),
	}
}

/** Ставит выделение по пути, направление сохраняется; false, если путь не найден в текущем DOM */
function writeSelectionPath(root: HTMLElement, path: EditorSelectionPath): boolean {
	const anchor = fromPoint(root, path.anchor)
	const focus = fromPoint(root, path.focus)
	if (!anchor || !focus) return false
	window.getSelection()?.setBaseAndExtent(anchor[0], anchor[1], focus[0], focus[1])
	return true
}

export { readSelectionPath, writeSelectionPath }
