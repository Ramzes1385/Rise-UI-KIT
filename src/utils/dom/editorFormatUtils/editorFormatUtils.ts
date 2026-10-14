/** Утилиты: начертание, цвет, очистка оформления и ссылки в редакторе через Selection и Range вместо `document.execCommand` */
import { findAncestorByTags } from '../editorDomUtils'
import { getSelectionRange, selectRange } from '../editorInsertUtils'
import { getTextRange, nodesInTextRange, selectTextRange } from './helpers/textRange'
import type { InlineFormatSpec, LinkAttributes } from './types/editorFormatUtils.types'
import { closestTag, isEmptyFragment, normalizeInline, PENDING_ATTR, PLACEHOLDER, unwrapFrom, wrapNode } from './helpers/inlineTree'

/** Теги, которые «Очистить форматирование» снимает с текста; ссылки остаются */
const CLEARABLE_TAGS = ['B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'DEL', 'FONT', 'SPAN', 'SUB', 'SUP', 'MARK', 'CODE']
/** Блоки, после которых в простом тексте буфера идёт перевод строки */
const TEXT_BREAK_SELECTOR = 'p, h1, h2, h3, h4, h5, h6, li, blockquote, pre, div'
const PENDING_SELECTOR = `[${PENDING_ATTR}]`
/** Блоки, которым после уборки пустой обёртки возвращается заглушка `<br>` */
const BLOCK_TAGS = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'DIV', 'BLOCKQUOTE', 'PRE'])

function placeCaretAtEnd(text: Text): void {
	const range = document.createRange()
	range.setStart(text, text.data.length)
	range.collapse(true)
	selectRange(range)
}

/** Каретка без выделения: вставляет пустую обёртку с невидимым символом, набранный дальше текст попадёт в неё */
function startPendingFormat(range: Range, wrapper: HTMLElement): boolean {
	const marker = document.createTextNode(PLACEHOLDER)
	wrapper.setAttribute(PENDING_ATTR, '')
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
	const holder = document.createElement('span')
	holder.setAttribute(PENDING_ATTR, '')
	holder.appendChild(marker)
	ancestor.after(holder, ...extractTail(range, ancestor))
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

/** Первый невидимый символ внутри заполнителя - тот, что поставил редактор; остальные принадлежат тексту пользователя */
function removeFirstPlaceholder(element: Element): void {
	const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
	while (walker.nextNode()) {
		const node = walker.currentNode as Text
		if (node.data.includes(PLACEHOLDER)) {
			node.data = node.data.replace(PLACEHOLDER, '')
			return
		}
	}
}

/** Снимает метку с заполнителя: пустой - убирается, с текстом - остаётся обычной разметкой (голый `span` разворачивается) */
function releasePending(element: Element): void {
	removeFirstPlaceholder(element)
	if (isEmptyFragment(element)) {
		const parent = element.parentElement
		element.remove()
		if (parent && BLOCK_TAGS.has(parent.tagName) && !parent.hasChildNodes()) parent.appendChild(document.createElement('br'))
		return
	}
	element.removeAttribute(PENDING_ATTR)
	if (element.tagName === 'SPAN' && element.attributes.length === 0) element.replaceWith(...Array.from(element.childNodes))
}

/** Снимает заполнители внутри `scope`, кроме тех, что содержат `keep`; true - что-то изменено. Внутренние - раньше внешних */
function releasePendingIn(scope: Element | DocumentFragment, keep: Node | null): boolean {
	const pending = Array.from(scope.querySelectorAll(PENDING_SELECTOR)).filter(element => !keep || !element.contains(keep))
	pending.reverse().forEach(releasePending)
	return pending.length > 0
}

/**
 * Убирает из HTML заполнители редактора: невидимый символ в помеченных обёртках и сами пустые обёртки.
 * Невидимые символы текста пользователя и чужие пустые элементы (иконочные шрифты) остаются.
 */
function stripPlaceholders(html: string): string {
	if (!html.includes(PENDING_ATTR)) return html
	const template = document.createElement('template')
	template.innerHTML = html
	releasePendingIn(template.content, null)
	return template.innerHTML
}

/**
 * Снимает заполнители в живом DOM области, кроме того, в котором стоит каретка `caret`: невидимый символ не остаётся
 * в тексте, когда каретка ушла дальше. true - DOM изменён.
 */
function releasePlaceholders(root: HTMLElement, caret: Node | null = null): boolean {
	return releasePendingIn(root, caret)
}

/** Тексты для буфера обмена из выделения: HTML и простой текст без заполнителей и меток; DOM области не меняется */
function getClipboardData(range: Range): { html: string; text: string } {
	const box = document.createElement('div')
	box.append(range.cloneContents())
	const html = stripPlaceholders(box.innerHTML)
	const template = document.createElement('template')
	template.innerHTML = html
	template.content.querySelectorAll('br').forEach(lineBreak => lineBreak.replaceWith('\n'))
	template.content.querySelectorAll(TEXT_BREAK_SELECTOR).forEach(block => block.append('\n'))
	return { html, text: `${template.content.textContent}`.replace(/\n$/, '') }
}

export {
	applyInlineStyle,
	getClipboardData,
	releasePlaceholders,
	removeInlineFormatting,
	stripPlaceholders,
	toggleInlineFormat,
	unlinkSelection,
	wrapSelectionInLink,
}
