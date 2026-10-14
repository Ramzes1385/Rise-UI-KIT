import { emptyParagraph, placeCaretInBlock, selectedBlocks } from './helpers/blockSelection'
import type { EditorAlign, EditorBlockTag, EditorListTag } from './types/editorBlockUtils.types'
/** Утилиты: блоки, списки, выравнивание и абзацы редактора через Selection и Range вместо `document.execCommand` */
import { getTextRange, isEmptyFragment, selectTextRange, textOffset } from '../editorFormatUtils'
import { collapseToStart, deleteSelection, getSelectionRange, selectRange } from '../editorInsertUtils'
import { alignBlock, convertToItem, mergeAdjacentLists, retagBlock, switchList, unwrapListItem } from './helpers/blockOps'

const HEADING_RE = /^H[1-6]$/
const TEXT_BLOCK_TAGS = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE', 'DIV'])
const INLINE_SELECTOR = 'b, strong, i, em, u, s, strike, del, span, font, a, code, mark, sub, sup'

/** Абзац внутри пункта списка работает как сам пункт: команды списков меняют пункт целиком */
function itemOf(block: HTMLElement): HTMLElement {
	return block.parentElement?.tagName === 'LI' ? block.parentElement : block
}

/**
 * Выполняет действие над каждым выделенным блоком и возвращает выделение на место: свёрнутая каретка встаёт в блок,
 * который вернуло действие, на то же смещение внутри него, непустое выделение пересчитывается по тексту, а в пустом
 * блоке каретка встаёт в начало первого блока. false, если блоков нет.
 */
function forEachSelectedBlock(root: HTMLElement, action: (block: HTMLElement) => HTMLElement, isItemLevel = false): boolean {
	const blocks = selectedBlocks(root)
	const textRange = getTextRange(root)
	if (blocks.length === 0 || !textRange) return false
	const targets = isItemLevel ? [...new Set(blocks.map(itemOf))] : blocks
	const caretOffset = textRange.start - textOffset(root, targets[0], 0)
	const [first] = targets.map(action)
	if (textRange.start === textRange.end) placeCaretInBlock(first, caretOffset)
	else selectTextRange(root, textRange)
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

/** Блок без содержимого получает заглушку `<br>`, чтобы не схлопнуться; пункт с абзацем внутри — абзац пункта */
function finishBlock(block: HTMLElement): void {
	pruneEmptyInline(block)
	const inner = block.tagName === 'LI' ? Array.from(block.children).filter(child => TEXT_BLOCK_TAGS.has(child.tagName)) : []
	if (inner.length > 0) inner.forEach(child => finishBlock(child as HTMLElement))
	else if (isEmptyBlock(block) && block.querySelector('br') === null) block.appendChild(document.createElement('br'))
}

/** Куда ставить каретку в новом блоке: в пункте с абзацем или заголовком внутри - в него */
function caretTarget(block: HTMLElement): HTMLElement {
	const first = block.firstElementChild
	return block.tagName === 'LI' && first && TEXT_BLOCK_TAGS.has(first.tagName) ? (first as HTMLElement) : block
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
	collapseToStart(caretTarget(next as HTMLElement))
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
	deleteSelection(root, initial)
	const [selected] = selectedBlocks(root)
	const block = selected && selected.parentElement?.tagName === 'LI' ? selected.parentElement : selected
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
