import { emptyParagraph, selectedBlocks } from './helpers/blockSelection'
/** Утилиты: блоки, списки, выравнивание и абзацы редактора через Selection и Range вместо `document.execCommand` */
import { getTextRange, isEmptyFragment, selectTextRange } from '../editorFormatUtils'
import { collapseToStart, getSelectionRange, selectRange } from '../editorInsertUtils'
import type { EditorAlign, EditorBlockTag, EditorListTag } from './types/editorBlockUtils.types'
import { alignBlock, convertToItem, mergeAdjacentLists, retagBlock, switchList, unwrapListItem } from './helpers/blockOps'

const HEADING_RE = /^H[1-6]$/
const INLINE_SELECTOR = 'b, strong, i, em, u, s, strike, del, span, font, a, code, mark, sub, sup'

/** Абзац внутри пункта списка работает как сам пункт: команды списков меняют пункт целиком */
function itemOf(block: HTMLElement): HTMLElement {
	return block.parentElement?.tagName === 'LI' ? block.parentElement : block
}

/**
 * Выполняет действие над каждым выделенным блоком и возвращает выделение на место: по тексту, а в пустом блоке —
 * в начало первого блока, который вернуло действие. false, если блоков нет.
 */
function forEachSelectedBlock(root: HTMLElement, action: (block: HTMLElement) => HTMLElement | void, isItemLevel = false): boolean {
	const blocks = selectedBlocks(root)
	const textRange = getTextRange(root)
	if (blocks.length === 0 || !textRange) return false
	const targets = isItemLevel ? [...new Set(blocks.map(itemOf))] : blocks
	const results = targets.map(action)
	selectTextRange(root, textRange)
	const anchor = window.getSelection()?.anchorNode
	const first = results.find(result => result instanceof HTMLElement)
	if ((!anchor || anchor === root) && first) collapseToStart(first)
	return true
}

/**
 * Меняет тег выделенных блоков (`h1`–`h6`, `p`, `blockquote`, `pre`). С `isToggle` повторное применение того же тега
 * возвращает абзац — так работают кнопки «Цитата» и «Блок кода».
 */
function setBlockTag(root: HTMLElement, tag: EditorBlockTag, isToggle = false): boolean {
	const blocks = selectedBlocks(root)
	const isSame = blocks.length > 0 && blocks.every(block => block.tagName === tag.toUpperCase())
	const target = isToggle && isSame ? 'p' : tag
	return forEachSelectedBlock(root, block => retagBlock(block, target))
}

/** Выравнивание выделенных блоков */
function setAlign(root: HTMLElement, align: EditorAlign): boolean {
	return forEachSelectedBlock(root, block => {
		alignBlock(block, align)
		return block
	})
}

/**
 * Маркированный или нумерованный список: если все выделенные блоки уже в списке этого вида — они возвращаются
 * абзацами, иначе блоки становятся пунктами (соседние блоки — пунктами одного списка).
 */
function toggleList(root: HTMLElement, tag: EditorListTag): boolean {
	const items = selectedBlocks(root).map(itemOf)
	const isInList = items.length > 0 && items.every(block => block.tagName === 'LI' && block.parentElement?.tagName === tag.toUpperCase())
	const done = forEachSelectedBlock(
		root,
		block => {
			if (isInList) return unwrapListItem(block)
			if (block.tagName === 'LI') return switchList(block, tag)
			return convertToItem(block, tag)
		},
		true,
	)
	mergeAdjacentLists(root)
	return done
}

/** Блоки выделения становятся абзацами, пункты списков уходят из списков */
function clearBlockFormatting(root: HTMLElement): boolean {
	return forEachSelectedBlock(root, block => (block.tagName === 'LI' ? unwrapListItem(block) : retagBlock(block, 'p')), true)
}

/** Пустой блок: ни текста, ни медиа (заглушка `<br>` не в счёт) */
function isEmptyBlock(block: HTMLElement): boolean {
	return block.textContent === '' && block.querySelector('img, video, audio, iframe, hr, table') === null
}

/** Убирает пустые обёртки начертания, которые остаются после разреза или удаления выделенного */
function pruneEmptyInline(block: HTMLElement): void {
	block.querySelectorAll(INLINE_SELECTOR).forEach(element => {
		if (element.textContent === '' && element.querySelector('img, video, audio, iframe, br') === null) element.remove()
	})
}

/** Блок без содержимого получает заглушку `<br>`, чтобы не схлопнуться */
function finishBlock(block: HTMLElement): void {
	pruneEmptyInline(block)
	if (isEmptyBlock(block)) block.appendChild(document.createElement('br'))
}

/** Новая строка в блоке кода: перевод строки в тексте, в конце блока — два, чтобы строка была видна */
function insertNewline(range: Range, block: HTMLElement): void {
	const tail = document.createRange()
	tail.setStart(range.startContainer, range.startOffset)
	tail.setEnd(block, block.childNodes.length)
	const isAtEnd = tail.toString() === ''
	const newline = document.createTextNode(isAtEnd ? '\n\n' : '\n')
	range.insertNode(newline)
	const caret = document.createRange()
	caret.setStart(newline, 1)
	caret.collapse(true)
	selectRange(caret)
}

/** Блок режется кареткой на два того же вида; в конце заголовка следующий блок — абзац */
function splitBlock(range: Range, block: HTMLElement): void {
	const tail = document.createRange()
	tail.setStart(range.startContainer, range.startOffset)
	tail.setEnd(block, block.childNodes.length)
	const rest = tail.extractContents()
	const next = isEmptyFragment(rest) && HEADING_RE.test(block.tagName) ? document.createElement('p') : block.cloneNode(false)
	next.appendChild(rest)
	finishBlock(block)
	finishBlock(next as HTMLElement)
	block.after(next)
	collapseToStart(next)
}

/** Пустой пункт или пустая цитата завершают список или цитату: блок становится абзацем */
function leaveContainer(block: HTMLElement): void {
	const paragraph = block.tagName === 'LI' ? unwrapListItem(block) : emptyParagraph()
	if (block.tagName !== 'LI') block.replaceWith(paragraph)
	collapseToStart(paragraph)
}

/**
 * Enter: новый абзац на месте выделения. Пункт списка даёт пункт, пустой пункт или пустая цитата — выход в абзац,
 * блок кода получает перевод строки. Возвращает false, если выделения в области нет.
 */
function insertParagraphAtSelection(root: HTMLElement): boolean {
	const initial = getSelectionRange(root)
	if (!initial) return false
	initial.deleteContents()
	const [block] = selectedBlocks(root)
	const range = getSelectionRange(root) as Range
	if (!block) {
		const paragraph = emptyParagraph()
		range.insertNode(paragraph)
		collapseToStart(paragraph)
	} else if (block.tagName === 'PRE') insertNewline(range, block)
	else if (isEmptyBlock(block) && ['LI', 'BLOCKQUOTE'].includes(block.tagName)) leaveContainer(block)
	else splitBlock(range, block)
	return true
}

export { clearBlockFormatting, insertParagraphAtSelection, setAlign, setBlockTag, toggleList }
