/** Утилиты: превращение набранной пары тегов (`<b>текст</b>`) в элемент форматирования редактора */
import { matchTypedInlineTag } from '@utils/dom/editorDomUtils'
import type { CaretTextNode } from '../types/useToolbarCommands.types'
import type { TypedInlineTagMatch } from '@utils/dom/editorDomUtils/types/editorDomUtils.types'

/** Текстовый узел внутри root, в котором стоит каретка, или null */
function getCaretTextNode(root: HTMLElement): CaretTextNode | null {
	const sel = window.getSelection()
	if (!sel || sel.rangeCount === 0) return null
	const node = sel.anchorNode
	if (!node || !(node instanceof Text) || !root.contains(node)) return null
	return { sel, node }
}

/** Фрагмент на замену узла: текст до пары, элемент форматирования, текст после каретки */
function buildInlineFragment(text: string, caret: number, typed: TypedInlineTagMatch) {
	const element = document.createElement(typed.tag)
	element.textContent = typed.content
	const fragment = document.createDocumentFragment()
	const textBefore = text.slice(0, typed.start)
	const textAfter = text.slice(caret)
	if (textBefore) fragment.appendChild(document.createTextNode(textBefore))
	fragment.appendChild(element)
	if (textAfter) fragment.appendChild(document.createTextNode(textAfter))
	return { element, fragment }
}

/** Ставит каретку сразу после элемента */
function placeCaretAfter(sel: Selection, element: HTMLElement): void {
	const range = document.createRange()
	range.setStartAfter(element)
	range.collapse(true)
	sel.removeAllRanges()
	sel.addRange(range)
}

/**
 * Превращает только что набранную пару `<b>текст</b>` в элемент форматирования.
 * Узлы собираются через DOM API (createElement + textContent), а не через innerHTML:
 * текст абзаца мог прийти из modelValue в экранированном виде (`&lt;img onerror…&gt;`)
 * или из буфера обмена, и разбор его как HTML исполнил бы чужую разметку.
 * Возвращает true, если пара заменена.
 */
function convertTypedInlineTag(root: HTMLElement | null): boolean {
	if (!root) return false
	const caretText = getCaretTextNode(root)
	if (!caretText) return false
	const { sel, node } = caretText
	const text = node.textContent ?? ''
	// Ищем пару только прямо перед кареткой: ввод в любом другом месте абзаца
	// не должен менять ранее сохранённый текст, где теги записаны буквально
	const caret = Math.min(sel.anchorOffset, text.length)
	const typed = matchTypedInlineTag(text.slice(0, caret))
	if (!typed) return false
	const { element, fragment } = buildInlineFragment(text, caret, typed)
	// Узел лежит внутри root (проверено выше), поэтому родитель у него есть — replaceWith заменяет его на месте
	node.replaceWith(fragment)
	placeCaretAfter(sel, element)
	return true
}

export { convertTypedInlineTag }
