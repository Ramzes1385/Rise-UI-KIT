/** Утилиты: какие блоки (абзацы, заголовки, пункты списка) задевает выделение редактора */
import { getBlockParent } from '../../editorDomUtils'
import { collapseToStart, getSelectionRange } from '../../editorInsertUtils'
import { getTextRange, selectTextRange, textOffset } from '../../editorFormatUtils'

/** Теги блоков первого уровня: всё, что не входит в этот список, считается строчным содержимым */
const BLOCK_TAGS = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE', 'UL', 'OL', 'DIV', 'HR', 'TABLE', 'LI'])
/** Теги блоков с текстом, кроме пункта списка */
const TEXT_BLOCK_TAGS = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE', 'DIV'])
/** Блоки, внутри которых лежит текст */
const TEXT_BLOCK_SELECTOR = 'p, h1, h2, h3, h4, h5, h6, blockquote, pre, div, li'

function isBlockNode(node: Node): boolean {
	return node instanceof Element && BLOCK_TAGS.has(node.tagName)
}

function isBlankText(node: Node): boolean {
	return node.nodeType === Node.TEXT_NODE && `${node.textContent}`.trim() === ''
}

function emptyParagraph(): HTMLParagraphElement {
	const paragraph = document.createElement('p')
	paragraph.appendChild(document.createElement('br'))
	return paragraph
}

/** Группы подряд идущих строчных детей области: текст, `<b>`, `<br>` без своего блока */
function looseRuns(root: HTMLElement): Node[][] {
	const runs: Node[][] = []
	let current: Node[] = []
	for (const node of Array.from(root.childNodes)) {
		if (isBlockNode(node)) current = []
		else {
			if (current.length === 0) runs.push(current)
			current.push(node)
		}
	}
	return runs
}

/** Строчное содержимое прямо в области получает свой абзац: команды блоков работают с блоками; true — что-то обернуто */
function wrapLooseInline(root: HTMLElement): boolean {
	if (!root.hasChildNodes()) {
		root.appendChild(emptyParagraph())
		return true
	}
	const runs = looseRuns(root).filter(run => !run.every(isBlankText))
	for (const run of runs) {
		const paragraph = document.createElement('p')
		;(run[0] as Element | Text).before(paragraph)
		paragraph.append(...run)
	}
	return runs.length > 0
}

/** Блок без блоков внутри; пункт списка считается блоком и с вложенным списком, но не с абзацем или заголовком внутри */
function isLeafBlock(element: Element): boolean {
	if (element.tagName !== 'LI') return element.querySelector(TEXT_BLOCK_SELECTOR) === null
	return !Array.from(element.children).some(child => TEXT_BLOCK_TAGS.has(child.tagName))
}

/** Текстовая протяжённость блока: сколько символов области лежит до его начала и конца */
function blockSpan(root: HTMLElement, block: HTMLElement): { start: number; end: number } {
	return { start: textOffset(root, block, 0), end: textOffset(root, block, block.childNodes.length) }
}

function overlaps(span: { start: number; end: number }, selection: { start: number; end: number }): boolean {
	if (span.start === span.end) return span.start >= selection.start && span.start <= selection.end
	return span.start < selection.end && span.end > selection.start
}

/**
 * Блоки, которые задевает выделение: блок каретки или все блоки, чей текст попадает в выделение.
 * Строчное содержимое прямо в области предварительно оборачивается в абзацы, пустая область получает пустой абзац.
 * Выделение после этого сохраняется.
 */
function selectedBlocks(root: HTMLElement): HTMLElement[] {
	const textRange = getTextRange(root)
	if (!textRange) return []
	const wasEmpty = !root.hasChildNodes()
	const isChanged = wrapLooseInline(root)
	if (wasEmpty) collapseToStart(root.firstElementChild as Element)
	else if (isChanged) selectTextRange(root, textRange)
	const range = getSelectionRange(root) as Range
	if (range.collapsed) {
		const block = getBlockParent(range.startContainer, root)
		return block === root ? [] : [block]
	}
	const selection = { start: textRange.start, end: textRange.end }
	return Array.from(root.querySelectorAll<HTMLElement>(TEXT_BLOCK_SELECTOR)).filter(
		block => isLeafBlock(block) && overlaps(blockSpan(root, block), selection),
	)
}

export { emptyParagraph, selectedBlocks }
