/** Утилиты: начертание, цвет, очистка оформления и ссылки в редакторе через Selection и Range вместо `document.execCommand` */
import { findAncestorByTags } from '../editorDomUtils'
import { getSelectionRange, selectRange } from '../editorInsertUtils'
import { getTextRange, nodesInTextRange, selectTextRange } from './helpers/textRange'
import type { InlineFormatSpec, LinkAttributes } from './types/editorFormatUtils.types'
import { closestTag, isEmptyFragment, normalizeInline, PLACEHOLDER, unwrapFrom, wrapNode } from './helpers/inlineTree'

/** Теги, которые «Очистить форматирование» снимает с текста; ссылки остаются */
const CLEARABLE_TAGS = ['B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'DEL', 'FONT', 'SPAN', 'SUB', 'SUP', 'MARK', 'CODE']
/** Пустая обёртка из одного невидимого символа */
const EMPTY_PLACEHOLDER_RE = /<(b|strong|i|em|u|s|strike|del|span|font)(\s[^>]*)?>\u200b*<\/\1>/gi

function placeCaretAtEnd(text: Text): void {
	const range = document.createRange()
	range.setStart(text, text.data.length)
	range.collapse(true)
	selectRange(range)
}

/** Каретка без выделения: вставляет пустую обёртку с невидимым символом, набранный дальше текст попадёт в неё */
function startPendingFormat(range: Range, wrapper: HTMLElement): boolean {
	const marker = document.createTextNode(PLACEHOLDER)
	wrapper.appendChild(marker)
	range.insertNode(wrapper)
	placeCaretAtEnd(marker)
	return true
}

/** Хвост оформленного текста после каретки в новой оболочке; пустой хвост оболочки не получает */
function extractTail(range: Range, ancestor: HTMLElement): HTMLElement[] {
	const tail = document.createRange()
	tail.setStart(range.startContainer, range.startOffset)
	tail.setEnd(ancestor, ancestor.childNodes.length)
	const rest = tail.extractContents()
	if (isEmptyFragment(rest)) return []
	const shell = ancestor.cloneNode(false) as HTMLElement
	shell.append(rest)
	return [shell]
}

/** Каретка внутри оформленного текста: оформление обрывается, дальше набирается обычный текст */
function leaveFormat(range: Range, ancestor: HTMLElement): void {
	const marker = document.createTextNode(PLACEHOLDER)
	ancestor.after(marker, ...extractTail(range, ancestor))
	if (isEmptyFragment(ancestor)) ancestor.remove()
	placeCaretAtEnd(marker)
}

function toggleAtCaret(root: HTMLElement, spec: InlineFormatSpec): boolean {
	const range = getSelectionRange(root) as Range
	const ancestor = findAncestorByTags(range.startContainer, root, [...spec.tags])
	if (!ancestor) return startPendingFormat(range, document.createElement(spec.tag))
	leaveFormat(range, ancestor)
	return true
}

/** Включает или снимает начертание у выделения: если весь текст уже оформлен — снимает, иначе оформляет весь */
function toggleInlineFormat(root: HTMLElement, spec: InlineFormatSpec): boolean {
	const textRange = getTextRange(root)
	if (!textRange) return false
	if (textRange.start === textRange.end) return toggleAtCaret(root, spec)
	const nodes = nodesInTextRange(root, textRange)
	const isCovered = nodes.every(node => closestTag(node, spec.tags, root))
	if (isCovered) nodes.forEach(node => unwrapFrom(node, spec.tags, root))
	else nodes.filter(node => !closestTag(node, spec.tags, root)).forEach(node => wrapNode(node, document.createElement(spec.tag)))
	normalizeInline(root)
	selectTextRange(root, textRange)
	return true
}

/** Своя обёртка стиля: единственный ребёнок элемента `span` с атрибутом `style` */
function ownStyledSpan(node: Node): HTMLElement | null {
	const parent = node.parentElement
	return parent?.tagName === 'SPAN' && parent.hasAttribute('style') && parent.childNodes.length === 1 ? parent : null
}

/** Задаёт CSS-свойство (цвет текста, фон) тексту выделения; без выделения — тексту, который наберут дальше */
function applyInlineStyle(root: HTMLElement, property: string, value: string): boolean {
	const textRange = getTextRange(root)
	if (!textRange) return false
	if (textRange.start === textRange.end) {
		const span = document.createElement('span')
		span.style.setProperty(property, value)
		return startPendingFormat(getSelectionRange(root) as Range, span)
	}
	const nodes = nodesInTextRange(root, textRange)
	nodes.forEach(node => (ownStyledSpan(node) ?? wrapNode(node, document.createElement('span'))).style.setProperty(property, value))
	normalizeInline(root)
	selectTextRange(root, textRange)
	return true
}

/** Снимает начертание, цвета и прочее оформление текста выделения; ссылки и блоки остаются */
function removeInlineFormatting(root: HTMLElement): boolean {
	const textRange = getTextRange(root)
	if (!textRange || textRange.start === textRange.end) return false
	const nodes = nodesInTextRange(root, textRange)
	nodes.forEach(node => unwrapFrom(node, CLEARABLE_TAGS, root))
	normalizeInline(root)
	selectTextRange(root, textRange)
	return true
}

function createAnchor(attributes: LinkAttributes): HTMLAnchorElement {
	const anchor = document.createElement('a')
	anchor.setAttribute('href', attributes.href)
	if (attributes.target) anchor.setAttribute('target', attributes.target)
	if (attributes.rel) anchor.setAttribute('rel', attributes.rel)
	return anchor
}

/** Оборачивает текст выделения в ссылки (по одной на соседние узлы); прежние ссылки внутри выделения заменяются */
function wrapSelectionInLink(root: HTMLElement, attributes: LinkAttributes): boolean {
	const textRange = getTextRange(root)
	if (!textRange || textRange.start === textRange.end) return false
	const nodes = nodesInTextRange(root, textRange)
	nodes.forEach(node => {
		unwrapFrom(node, ['A'], root)
		wrapNode(node, createAnchor(attributes))
	})
	normalizeInline(root)
	selectTextRange(root, textRange)
	return true
}

/** Снимает ссылки с текста выделения */
function unlinkSelection(root: HTMLElement): boolean {
	const textRange = getTextRange(root)
	if (!textRange) return false
	const nodes = nodesInTextRange(root, textRange)
	nodes.forEach(node => unwrapFrom(node, ['A'], root))
	normalizeInline(root)
	selectTextRange(root, textRange)
	return nodes.length > 0
}

/** Убирает из HTML невидимые символы-заглушки и обёртки, в которые так ничего и не набрали */
function stripPlaceholders(html: string): string {
	if (!html.includes(PLACEHOLDER)) return html
	let result = html
	for (let previous = ''; previous !== result;) {
		previous = result
		result = result.replace(EMPTY_PLACEHOLDER_RE, '')
	}
	return result.replaceAll(PLACEHOLDER, '')
}

export { applyInlineStyle, removeInlineFormatting, stripPlaceholders, toggleInlineFormat, unlinkSelection, wrapSelectionInLink }
