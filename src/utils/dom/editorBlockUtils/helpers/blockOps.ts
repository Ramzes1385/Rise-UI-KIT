/** Утилиты: превращение блоков редактора — смена тега, пункты списка, выравнивание */
import { splitAround } from '../../editorFormatUtils'
import type { EditorAlign, EditorBlockTag, EditorListTag } from '../types/editorBlockUtils.types'

const LIST_TAGS = new Set(['UL', 'OL'])
const TEXT_BLOCK_TAGS = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE', 'DIV'])

function isList(node: Node): node is HTMLElement {
	return node instanceof HTMLElement && LIST_TAGS.has(node.tagName)
}

/** Новый элемент того же места: тег другой, выравнивание сохраняется, дети переезжают */
function cloneAs(source: HTMLElement, tag: string): HTMLElement {
	const target = document.createElement(tag)
	const style = source.getAttribute('style')
	if (style) target.setAttribute('style', style)
	target.append(...Array.from(source.childNodes))
	return target
}

/** Пункт списка получает тег внутри: `<li><h2>…</h2></li>`; вложенные списки остаются снаружи */
function retagListItem(item: HTMLElement, tag: EditorBlockTag): HTMLElement {
	if (tag === 'p') return item
	const wrapper = document.createElement(tag)
	const content = Array.from(item.childNodes).filter(node => !isList(node))
	item.prepend(wrapper)
	wrapper.append(...content)
	return wrapper
}

/** Меняет тег блока на месте, содержимое и выравнивание остаются; возвращает блок на его месте */
function retagBlock(block: HTMLElement, tag: EditorBlockTag): HTMLElement {
	if (block.tagName === 'LI') return retagListItem(block, tag)
	if (block.tagName === tag.toUpperCase()) return block
	const target = cloneAs(block, tag)
	block.replaceWith(target)
	return target
}

/** Блок на месте пункта: единственный абзац или заголовок внутри остаётся как есть, иначе создаётся абзац */
function blockOfItem(item: HTMLElement): HTMLElement {
	const nested = Array.from(item.children).filter(isList)
	const content = Array.from(item.childNodes).filter(node => !nested.includes(node as HTMLElement))
	const [only] = content
	if (content.length === 1 && only instanceof HTMLElement && TEXT_BLOCK_TAGS.has(only.tagName)) return only
	const paragraph = document.createElement('p')
	const style = item.getAttribute('style')
	if (style) paragraph.setAttribute('style', style)
	paragraph.append(...content)
	if (!paragraph.hasChildNodes()) paragraph.appendChild(document.createElement('br'))
	return paragraph
}

/** Пункт списка уходит из списка абзацем; список разрезается, вложенные списки остаются после абзаца */
function unwrapListItem(item: HTMLElement): HTMLElement {
	splitAround(item.parentElement as HTMLElement, item)
	const nested = Array.from(item.children).filter(isList)
	const block = blockOfItem(item)
	item.replaceWith(block, ...nested)
	return block
}

/** Блок становится пунктом списка; рядом стоящий список того же вида принимает пункт */
function convertToItem(block: HTMLElement, tag: EditorListTag): HTMLElement {
	const item = cloneAs(block, 'li')
	const previous = block.previousElementSibling
	if (previous?.tagName === tag.toUpperCase()) {
		previous.append(item)
		block.remove()
		return item
	}
	const list = document.createElement(tag)
	list.append(item)
	block.replaceWith(list)
	return item
}

/** Список другого вида меняет тег целиком */
function switchList(item: HTMLElement, tag: EditorListTag): HTMLElement {
	const list = item.parentElement as HTMLElement
	if (list.tagName !== tag.toUpperCase()) list.replaceWith(cloneAs(list, tag))
	return item
}

/** Соседние списки одного вида сливаются в один */
function mergeAdjacentLists(root: HTMLElement): void {
	root.querySelectorAll('ul, ol').forEach(list => {
		for (let next = list.nextElementSibling; next && next.tagName === list.tagName; next = list.nextElementSibling) {
			list.append(...Array.from(next.childNodes))
			next.remove()
		}
	})
}

/** Выравнивание блока; `left` — значение по умолчанию, свойство убирается */
function alignBlock(block: HTMLElement, align: EditorAlign): void {
	if (align === 'left') block.style.removeProperty('text-align')
	else block.style.textAlign = align
	if (!block.getAttribute('style')) block.removeAttribute('style')
}

export { alignBlock, convertToItem, mergeAdjacentLists, retagBlock, switchList, unwrapListItem }
