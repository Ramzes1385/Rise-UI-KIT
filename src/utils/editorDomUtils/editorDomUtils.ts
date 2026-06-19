/** Утилиты: инспекция DOM для contenteditable-редактора */

/** Блочные теги для определения родительского блока */
const BLOCK_TAGS = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV', 'BLOCKQUOTE', 'PRE', 'ADDRESS', 'LI'])

/** Теги блочного форматирования (formatBlock) */
const FORMAT_BLOCK_TAGS = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE', 'ADDRESS'])

/** Inline-теги форматирования для полной очистки */
const INLINE_FORMAT_TAGS = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'DEL', 'FONT', 'SPAN', 'A'])

/** Конфигурация команд форматирования */
const FORMAT_CONFIG: Record<string, { primary: string; match: string[] }> = {
	bold: { primary: 'b', match: ['B', 'STRONG'] },
	italic: { primary: 'i', match: ['I', 'EM'] },
	underline: { primary: 'u', match: ['U'] },
	strikeThrough: { primary: 's', match: ['S', 'STRIKE', 'DEL'] },
}

/** Маппинг команд выравнивания на CSS-значения */
const ALIGN_MAP: Record<string, string> = {
	justifyLeft: 'left',
	justifyCenter: 'center',
	justifyRight: 'right',
	justifyFull: 'justify',
}

/** Получить HTMLElement из узла */
function toHTMLElement(node: Node | null): HTMLElement | null {
	if (!node) return null
	if (node instanceof Text) return node.parentElement
	if (node instanceof HTMLElement) return node
	return null
}

/** Проверить, находится ли узел внутри элемента с одним из указанных тегов */
function isInsideTags(node: Node | null, tagNames: string[], root: HTMLElement): boolean {
	let current = toHTMLElement(node)
	while (current && current !== root) {
		if (tagNames.includes(current.tagName)) return true
		current = current.parentElement
	}
	return false
}

/** Найти ближайшего предка с одним из указанных тегов */
function findAncestorByTags(node: Node | null, root: HTMLElement, tagNames: string[]): HTMLElement | null {
	let current = toHTMLElement(node)
	while (current && current !== root) {
		if (tagNames.includes(current.tagName)) return current
		current = current.parentElement
	}
	return null
}

/** Найти ближайший блочный родитель */
function getBlockParent(node: Node | null, root: HTMLElement): HTMLElement {
	let current = toHTMLElement(node)
	while (current && current !== root) {
		if (BLOCK_TAGS.has(current.tagName)) return current
		current = current.parentElement
	}
	return root
}

/** Найти ближайший блок форматирования */
function getFormatBlock(node: Node | null, root: HTMLElement): string {
	let current = toHTMLElement(node)
	while (current && current !== root) {
		if (FORMAT_BLOCK_TAGS.has(current.tagName)) {
			return current.tagName.toLowerCase()
		}
		current = current.parentElement
	}
	return ''
}

/** Определить выравнивание текста блочного родителя */
function getBlockAlign(node: Node | null, root: HTMLElement): string {
	const block = getBlockParent(node, root)
	if (block === root) return 'left'
	const align = block.style.textAlign
	if (!align || align === 'start') return 'left'
	if (align === 'end') return 'right'
	return align
}

/** Проверить, находится ли узел внутри списка указанного типа */
function isInsideList(node: Node | null, root: HTMLElement, listTag: string): boolean {
	const matchTag = listTag.toUpperCase()
	let current = toHTMLElement(node)
	while (current && current !== root) {
		if (current.tagName === matchTag) return true
		current = current.parentElement
	}
	return false
}

export {
	ALIGN_MAP,
	findAncestorByTags,
	FORMAT_CONFIG,
	getBlockAlign,
	getBlockParent,
	getFormatBlock,
	INLINE_FORMAT_TAGS,
	isInsideList,
	isInsideTags,
	toHTMLElement,
}
