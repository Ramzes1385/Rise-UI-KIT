/** Утилиты: обёртки текста в дереве редактора — разрез вокруг узла, снятие, слияние соседей */
import { findAncestorByTags } from '../../editorDomUtils'

/** Невидимый символ: держит каретку внутри пустой обёртки, пока в неё не набрали текст; при отправке значения убирается */
const PLACEHOLDER = '\u200b'
/** Теги оформления, соседи которых с одинаковыми атрибутами сливаются в один */
const MERGE_TAGS = 'b, strong, i, em, u, s, strike, del, span, font, a, code, mark, sub, sup'
/** Элементы, которые считаются содержимым, даже если в них нет текста */
const CONTENT_ELEMENTS = 'img, video, audio, iframe, hr, table, canvas, svg, br'

/** Ближайший предок узла из списка тегов внутри области; сам узел не считается */
function closestTag(node: Node, tags: readonly string[], root: HTMLElement): HTMLElement | null {
	const parent = node.parentElement
	return parent && parent !== root ? findAncestorByTags(parent, root, [...tags]) : null
}

/** В фрагменте или элементе нет ни текста, ни медиа, ни переносов */
function isEmptyFragment(fragment: DocumentFragment | Element): boolean {
	return fragment.textContent === '' && fragment.querySelector(CONTENT_ELEMENTS) === null
}

/** Оболочка из фрагмента: пустой фрагмент оболочки не получает */
function shellOf(ancestor: HTMLElement, fragment: DocumentFragment): HTMLElement[] {
	if (isEmptyFragment(fragment)) return []
	const shell = ancestor.cloneNode(false) as HTMLElement
	shell.append(fragment)
	return [shell]
}

/** Вынимает узел из предка: предок разрезается на часть до, сам узел (с остальными обёртками) и часть после */
function splitAround(ancestor: HTMLElement, node: Node): void {
	const before = document.createRange()
	before.setStart(ancestor, 0)
	before.setEndBefore(node)
	const after = document.createRange()
	after.setStartAfter(node)
	after.setEnd(ancestor, ancestor.childNodes.length)
	const tail = after.extractContents()
	const head = before.extractContents()
	ancestor.replaceWith(...shellOf(ancestor, head), ...Array.from(ancestor.childNodes), ...shellOf(ancestor, tail))
}

/** Снимает с узла все обёртки из списка тегов */
function unwrapFrom(node: Node, tags: readonly string[], root: HTMLElement): void {
	for (let ancestor = closestTag(node, tags, root); ancestor; ancestor = closestTag(node, tags, root)) splitAround(ancestor, node)
}

/** Оболочки совпадают: тот же тег и те же атрибуты */
function isSameShell(first: Element, second: Element): boolean {
	return (first.cloneNode(false) as Element).outerHTML === (second.cloneNode(false) as Element).outerHTML
}

/** Сливает соседние одинаковые обёртки, убирает пустые и склеивает текстовые узлы */
function normalizeInline(root: HTMLElement): void {
	root.normalize()
	root.querySelectorAll(MERGE_TAGS).forEach(element => {
		if (!element.firstChild) element.remove()
	})
	root.querySelectorAll(MERGE_TAGS).forEach(element => {
		for (let next = element.nextSibling; next instanceof Element && isSameShell(element, next); next = element.nextSibling) {
			element.append(...Array.from(next.childNodes))
			next.remove()
		}
	})
	root.normalize()
}

/** Оборачивает узел в новый элемент и возвращает его */
function wrapNode<T extends HTMLElement>(node: Node, wrapper: T): T {
	node.parentNode?.replaceChild(wrapper, node)
	wrapper.appendChild(node)
	return wrapper
}

export { closestTag, isEmptyFragment, normalizeInline, PLACEHOLDER, unwrapFrom, wrapNode }
