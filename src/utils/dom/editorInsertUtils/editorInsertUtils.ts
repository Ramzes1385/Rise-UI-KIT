/** Утилиты: вставка HTML и переноса строки в редакторе через Selection и Range вместо `document.execCommand` */
import { getBlockParent } from '../editorDomUtils'

/** Теги, которые вставка HTML кладёт отдельным блоком, а не в строку текста */
const BLOCK_FRAGMENT_TAGS = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE', 'UL', 'OL', 'HR', 'DIV', 'TABLE'])
/** Блоки с текстом, которые в пункте списка разворачиваются в строку с переносами */
const TEXT_BLOCK_TAGS = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE', 'DIV'])
/** Списки: после блока с текстом перед ними перенос строки не нужен */
const LIST_TAGS = new Set(['UL', 'OL'])
/** Элементы, которые считаются содержимым, даже если в них нет текста */
const CONTENT_ELEMENTS = 'img, video, audio, iframe, hr, table, canvas, svg'

/** Диапазон выделения, если он целиком внутри области редактора; иначе null */
function getSelectionRange(root: HTMLElement): Range | null {
	const selection = window.getSelection()
	if (!selection || selection.rangeCount === 0) return null
	const range = selection.getRangeAt(0)
	return root.contains(range.commonAncestorContainer) ? range : null
}

/** Ставит выделение в диапазон `range` */
function selectRange(range: Range): void {
	const selection = window.getSelection()
	selection?.removeAllRanges()
	selection?.addRange(range)
}

/** Каретка сразу после узла */
function collapseAfter(node: Node): void {
	const range = document.createRange()
	range.setStartAfter(node)
	range.collapse(true)
	selectRange(range)
}

/** Каретка в начале узла */
function collapseToStart(node: Node): void {
	const range = document.createRange()
	range.selectNodeContents(node)
	range.collapse(true)
	selectRange(range)
}

/** Каретка в конце узла */
function collapseToEnd(node: Node): void {
	const range = document.createRange()
	range.selectNodeContents(node)
	range.collapse(false)
	selectRange(range)
}

/** Есть ли в узле что показывать: текст, изображение, видео, разделитель. Пустые обёртки и `<br>` — нет */
function hasContent(node: Element | DocumentFragment | Text): boolean {
	if (`${node.textContent}`.trim() !== '') return true
	return node instanceof Text ? false : node.querySelector(CONTENT_ELEMENTS) !== null
}

/** HTML разбирается в «неживом» шаблоне: скрипты и обработчики не исполняются, пока узлы не вставлены */
function parseHtmlFragment(html: string): DocumentFragment {
	const template = document.createElement('template')
	template.innerHTML = html
	const fragment = document.importNode(template.content, true)
	fragment.querySelectorAll('script').forEach(script => script.remove())
	return fragment
}

function hasBlockContent(fragment: DocumentFragment): boolean {
	return Array.from(fragment.childNodes).some(node => node instanceof Element && BLOCK_FRAGMENT_TAGS.has(node.tagName))
}

/** В пункте списка блоки теряют обёртку: абзацы идут строками через `<br>`, вложенные списки остаются */
function flattenBlocks(fragment: DocumentFragment): DocumentFragment {
	const flat = document.createDocumentFragment()
	const nodes = Array.from(fragment.childNodes)
	nodes.forEach((node, index) => {
		const isText = node instanceof Element && TEXT_BLOCK_TAGS.has(node.tagName)
		const next = nodes[index + 1]
		flat.append(...(isText ? Array.from(node.childNodes) : [node]))
		if (isText && next && !(next instanceof Element && LIST_TAGS.has(next.tagName))) flat.append(document.createElement('br'))
	})
	return flat
}

/** Пустой абзац хранит `<br>` только затем, чтобы не схлопнуться: перед вставкой текста он лишний */
function dropPlaceholderBreak(range: Range): void {
	const block = range.startContainer
	if (!(block instanceof HTMLElement) || block.childNodes.length !== 1 || block.firstChild?.nodeName !== 'BR') return
	block.firstChild.remove()
	range.setStart(block, 0)
	range.collapse(true)
}

/** Блок разрезается кареткой: вставка кладётся между половинами, пустые половины не остаются */
function insertBetweenHalves(block: HTMLElement, range: Range, fragment: DocumentFragment): Node {
	const tailRange = document.createRange()
	tailRange.setStart(range.startContainer, range.startOffset)
	tailRange.setEnd(block, block.childNodes.length)
	const tail = tailRange.extractContents()
	const last = fragment.lastChild as Element | Text
	block.after(fragment)
	if (hasContent(tail)) {
		const tailBlock = block.cloneNode(false)
		tailBlock.appendChild(tail)
		last.after(tailBlock)
	}
	if (!hasContent(block)) block.remove()
	return last
}

/** Куда ставить каретку после вставки блока: в конец текста последнего блока, у разделителя — в следующий блок */
function placeCaretAfterBlock(last: Node): void {
	if (!(last instanceof HTMLElement) || last.tagName !== 'HR') {
		if (last instanceof HTMLElement && last.tagName !== 'TABLE') collapseToEnd(last)
		else collapseAfter(last)
		return
	}
	let next = last.nextElementSibling
	if (!next) {
		next = document.createElement('p')
		next.appendChild(document.createElement('br'))
		last.after(next)
	}
	collapseToStart(next)
}

function insertInline(range: Range, fragment: DocumentFragment): void {
	const last = fragment.lastChild as Node
	range.insertNode(fragment)
	collapseAfter(last)
}

function insertBlocks(root: HTMLElement, range: Range, fragment: DocumentFragment): void {
	const block = getBlockParent(range.startContainer, root)
	if (block.tagName === 'LI') {
		insertInline(range, flattenBlocks(fragment))
		return
	}
	if (block === root) {
		const last = fragment.lastChild as Node
		range.insertNode(fragment)
		placeCaretAfterBlock(last)
		return
	}
	placeCaretAfterBlock(insertBetweenHalves(block, range, fragment))
}

/**
 * Вставляет HTML на место выделения: выделенное удаляется, блоки (`<p>`, `<hr>`, списки) режут текущий абзац надвое,
 * остальное идёт в строку текста. Каретка встаёт после вставленного. HTML должен быть уже очищен вызывающим.
 * Возвращает false, если выделения в области нет.
 */
function insertHtmlAtSelection(root: HTMLElement, html: string): boolean {
	const range = getSelectionRange(root)
	if (!range) return false
	range.deleteContents()
	const fragment = parseHtmlFragment(html)
	if (!fragment.firstChild) {
		selectRange(range)
		return true
	}
	dropPlaceholderBreak(range)
	if (hasBlockContent(fragment)) insertBlocks(root, range, fragment)
	else insertInline(range, fragment)
	return true
}

/** После узла до конца его блока есть текст, элементы или другой перенос */
function hasContentAfter(node: Node, root: HTMLElement): boolean {
	const block = getBlockParent(node, root)
	const tail = document.createRange()
	tail.setStartAfter(node)
	tail.setEnd(block, block.childNodes.length)
	const rest = tail.cloneContents()
	return hasContent(rest) || rest.querySelector('br') !== null
}

/**
 * Вставляет перенос строки `<br>` на место выделения. В конце блока `<br>` один не создаёт новую строку,
 * поэтому добавляется второй, а каретка встаёт между ними.
 * Возвращает false, если выделения в области нет.
 */
function insertLineBreakAtSelection(root: HTMLElement): boolean {
	const range = getSelectionRange(root)
	if (!range) return false
	range.deleteContents()
	const lineBreak = document.createElement('br')
	range.insertNode(lineBreak)
	if (!hasContentAfter(lineBreak, root)) lineBreak.after(document.createElement('br'))
	collapseAfter(lineBreak)
	return true
}

/** Диапазон из `StaticRange` события `beforeinput` (место вставки при перетаскивании) */
function rangeFromStatic(source: StaticRange): Range {
	const range = document.createRange()
	range.setStart(source.startContainer, source.startOffset)
	range.setEnd(source.endContainer, source.endOffset)
	return range
}

export {
	collapseAfter,
	collapseToEnd,
	collapseToStart,
	getSelectionRange,
	hasContent,
	insertHtmlAtSelection,
	insertLineBreakAtSelection,
	rangeFromStatic,
	selectRange,
}
