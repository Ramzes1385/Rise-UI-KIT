import {
	collapseAfter,
	collapseToEnd,
	collapseToStart,
	getSelectionRange,
	hasContent,
	insertHtmlAtSelection,
	insertLineBreakAtSelection,
	rangeFromStatic,
	selectRange,
} from '../editorInsertUtils'

function createRoot(html: string): HTMLDivElement {
	const root = document.createElement('div')
	root.innerHTML = html
	document.body.appendChild(root)
	return root
}

function caretAt(node: Node, offset: number, endOffset = offset): void {
	const range = document.createRange()
	range.setStart(node, offset)
	range.setEnd(node, endOffset)
	selectRange(range)
}

function textOf(root: HTMLElement, selector: string): Text {
	return root.querySelector(selector)!.firstChild as Text
}

describe('editorInsertUtils', () => {
	afterEach(() => {
		window.getSelection()?.removeAllRanges()
		document.body.innerHTML = ''
	})

	describe('getSelectionRange', () => {
		it('без выделения и с выделением вне области возвращает null', () => {
			const root = createRoot('<p>текст</p>')
			expect(getSelectionRange(root)).toBeNull()

			const outside = document.createElement('p')
			outside.textContent = 'снаружи'
			document.body.appendChild(outside)
			caretAt(outside.firstChild!, 1)
			expect(getSelectionRange(root)).toBeNull()
		})

		it('выделение внутри области возвращается как есть', () => {
			const root = createRoot('<p>текст</p>')
			caretAt(textOf(root, 'p'), 2)
			expect(getSelectionRange(root)?.startOffset).toBe(2)
		})
	})

	describe('каретка', () => {
		it('collapseAfter, collapseToStart и collapseToEnd ставят каретку рядом с узлом', () => {
			const root = createRoot('<p>один <b>два</b> три</p>')
			const bold = root.querySelector('b')!

			collapseAfter(bold)
			expect(window.getSelection()?.anchorNode).toBe(root.querySelector('p'))
			expect(window.getSelection()?.anchorOffset).toBe(2)

			collapseToStart(bold)
			expect(window.getSelection()?.anchorNode).toBe(bold)
			expect(window.getSelection()?.anchorOffset).toBe(0)

			collapseToEnd(bold)
			expect(window.getSelection()?.anchorOffset).toBe(1)
		})
	})

	describe('hasContent', () => {
		it('текст и медиа — содержимое, пустые обёртки, br и пустой текстовый узел — нет', () => {
			const fragment = document.createDocumentFragment()
			expect(hasContent(fragment)).toBe(false)
			expect(hasContent(document.createTextNode(''))).toBe(false)
			expect(hasContent(document.createTextNode('а'))).toBe(true)

			const empty = document.createElement('p')
			empty.innerHTML = '<b></b><br>'
			expect(hasContent(empty)).toBe(false)

			const withImage = document.createElement('p')
			withImage.innerHTML = '<img src="a.png" alt="">'
			expect(hasContent(withImage)).toBe(true)

			fragment.appendChild(withImage)
			expect(hasContent(fragment)).toBe(true)
		})
	})

	describe('insertHtmlAtSelection: текст в строке', () => {
		it('без выделения в области ничего не вставляет', () => {
			const root = createRoot('<p>текст</p>')
			expect(insertHtmlAtSelection(root, '<b>x</b>')).toBe(false)
			expect(root.innerHTML).toBe('<p>текст</p>')
		})

		it('кладёт разметку в место каретки и ставит каретку после неё', () => {
			const root = createRoot('<p>ab</p>')
			caretAt(textOf(root, 'p'), 1)

			expect(insertHtmlAtSelection(root, '<b>x</b>')).toBe(true)

			expect(root.innerHTML).toBe('<p>a<b>x</b>b</p>')
			expect(window.getSelection()?.anchorNode).toBe(root.querySelector('p'))
			expect(window.getSelection()?.anchorOffset).toBe(2)
		})

		it('заменяет выделенный текст', () => {
			const root = createRoot('<p>abcd</p>')
			caretAt(textOf(root, 'p'), 1, 3)

			insertHtmlAtSelection(root, 'XY')

			expect(root.innerHTML).toBe('<p>aXYd</p>')
		})

		it('пустой HTML только удаляет выделенное, каретка остаётся на месте', () => {
			const root = createRoot('<p>abcd</p>')
			caretAt(textOf(root, 'p'), 1, 3)

			expect(insertHtmlAtSelection(root, '')).toBe(true)

			expect(root.innerHTML).toBe('<p>ad</p>')
			expect(window.getSelection()?.isCollapsed).toBe(true)
		})

		it('в пустом абзаце заглушка br исчезает', () => {
			const root = createRoot('<p><br></p>')
			caretAt(root.querySelector('p')!, 0)

			insertHtmlAtSelection(root, 'текст')

			expect(root.innerHTML).toBe('<p>текст</p>')
		})

		it('абзац с br и текстом заглушку не теряет', () => {
			const root = createRoot('<p>a<br></p>')
			caretAt(textOf(root, 'p'), 1)

			insertHtmlAtSelection(root, 'x')

			expect(root.innerHTML).toBe('<p>ax<br></p>')
		})

		it('каретка прямо в области без абзацев: вставка идёт строкой', () => {
			const root = createRoot('текст')
			caretAt(root.firstChild!, 2)

			insertHtmlAtSelection(root, '<i>x</i>')

			expect(root.innerHTML).toBe('те<i>x</i>кст')
		})
	})

	describe('insertHtmlAtSelection: блоки', () => {
		it('блок режет абзац надвое, каретка встаёт в конец вставленного', () => {
			const root = createRoot('<p>abcd</p>')
			caretAt(textOf(root, 'p'), 2)

			insertHtmlAtSelection(root, '<p>X</p><h2>Y</h2>')

			expect(root.innerHTML).toBe('<p>ab</p><p>X</p><h2>Y</h2><p>cd</p>')
			expect(window.getSelection()?.anchorNode).toBe(root.querySelector('h2'))
			expect(window.getSelection()?.anchorOffset).toBe(1)
		})

		it('в конце абзаца пустой хвост не создаётся, в начале пустая голова пропадает', () => {
			const atEnd = createRoot('<p>ab</p>')
			caretAt(textOf(atEnd, 'p'), 2)
			insertHtmlAtSelection(atEnd, '<p>X</p>')
			expect(atEnd.innerHTML).toBe('<p>ab</p><p>X</p>')

			const atStart = createRoot('<p>ab</p>')
			caretAt(textOf(atStart, 'p'), 0)
			insertHtmlAtSelection(atStart, '<p>X</p>')
			expect(atStart.innerHTML).toBe('<p>X</p><p>ab</p>')
		})

		it('в пустом абзаце вставка заменяет его', () => {
			const root = createRoot('<p><br></p>')
			caretAt(root.querySelector('p')!, 0)

			insertHtmlAtSelection(root, '<p>X</p>')

			expect(root.innerHTML).toBe('<p>X</p>')
		})

		it('хвост с изображением остаётся отдельным абзацем того же типа', () => {
			const root = createRoot('<h3>ab<img src="a.png" alt=""></h3>')
			caretAt(textOf(root, 'h3'), 2)

			insertHtmlAtSelection(root, '<p>X</p>')

			expect(root.innerHTML).toBe('<h3>ab</h3><p>X</p><h3><img src="a.png" alt=""></h3>')
		})

		it('разделитель в середине: каретка в начале хвоста', () => {
			const root = createRoot('<p>ab</p>')
			caretAt(textOf(root, 'p'), 1)

			insertHtmlAtSelection(root, '<hr>')

			expect(root.innerHTML).toBe('<p>a</p><hr><p>b</p>')
			expect(window.getSelection()?.anchorNode).toBe(root.lastElementChild)
			expect(window.getSelection()?.anchorOffset).toBe(0)
		})

		it('разделитель в конце: после него появляется пустой абзац для каретки', () => {
			const root = createRoot('<p>ab</p>')
			caretAt(textOf(root, 'p'), 2)

			insertHtmlAtSelection(root, '<hr>')

			expect(root.innerHTML).toBe('<p>ab</p><hr><p><br></p>')
			expect(window.getSelection()?.anchorNode).toBe(root.lastElementChild)
		})

		it('в пункте списка блоки разворачиваются в строки через br, вложенный список остаётся', () => {
			const root = createRoot('<ul><li>ab</li></ul>')
			caretAt(textOf(root, 'li'), 1)

			insertHtmlAtSelection(root, '<p>x</p><p>y</p><ul><li>n</li></ul>')

			expect(root.innerHTML).toBe('<ul><li>ax<br>y<ul><li>n</li></ul>b</li></ul>')
		})

		it('в пункте списка последний абзац не получает лишнего br', () => {
			const root = createRoot('<ul><li>ab</li></ul>')
			caretAt(textOf(root, 'li'), 2)

			insertHtmlAtSelection(root, '<p>x</p>')

			expect(root.innerHTML).toBe('<ul><li>abx</li></ul>')
		})

		it('каретка прямо в области: блоки идут рядом с текстом', () => {
			const root = createRoot('текст')
			caretAt(root.firstChild!, 5)

			insertHtmlAtSelection(root, '<h1>T</h1>')

			expect(root.innerHTML).toBe('текст<h1>T</h1>')
			expect(window.getSelection()?.anchorNode).toBe(root.querySelector('h1'))
		})

		it('таблица в области: каретка встаёт после неё', () => {
			const root = createRoot('текст')
			caretAt(root.firstChild!, 5)

			insertHtmlAtSelection(root, '<table><tbody><tr><td>1</td></tr></tbody></table>')

			expect(window.getSelection()?.anchorNode).toBe(root)
			expect(window.getSelection()?.anchorOffset).toBe(2)
		})

		it('скрипты и обработчики из HTML не исполняются при разборе', () => {
			const root = createRoot('<p>ab</p>')
			caretAt(textOf(root, 'p'), 1)
			const handler = vi.fn()
			Object.assign(window, { riseXss: handler })

			insertHtmlAtSelection(root, '<img src="x" onerror="window.riseXss()"><script>window.riseXss()</script>')

			expect(handler).not.toHaveBeenCalled()
			Reflect.deleteProperty(window, 'riseXss')
		})
	})

	describe('insertLineBreakAtSelection', () => {
		it('без выделения в области возвращает false', () => {
			const root = createRoot('<p>ab</p>')
			expect(insertLineBreakAtSelection(root)).toBe(false)
		})

		it('в середине текста вставляет один br, каретка после него', () => {
			const root = createRoot('<p>ab</p>')
			caretAt(textOf(root, 'p'), 1)

			expect(insertLineBreakAtSelection(root)).toBe(true)

			expect(root.innerHTML).toBe('<p>a<br>b</p>')
			expect(window.getSelection()?.anchorOffset).toBe(2)
		})

		it('в конце абзаца добавляет второй br, каретка между ними', () => {
			const root = createRoot('<p>ab</p>')
			caretAt(textOf(root, 'p'), 2)

			insertLineBreakAtSelection(root)

			expect(root.innerHTML).toBe('<p>ab<br><br></p>')
			expect(window.getSelection()?.anchorOffset).toBe(2)
		})

		it('перед существующим br второй не нужен', () => {
			const root = createRoot('<p>ab<br></p>')
			caretAt(textOf(root, 'p'), 2)

			insertLineBreakAtSelection(root)

			expect(root.innerHTML).toBe('<p>ab<br><br></p>')
		})

		it('в конце пункта списка и внутри <b> считает конец своего блока', () => {
			const root = createRoot('<ul><li><b>ab</b></li><li>cd</li></ul>')
			caretAt(textOf(root, 'b'), 2)

			insertLineBreakAtSelection(root)

			expect(root.innerHTML).toBe('<ul><li><b>ab<br><br></b></li><li>cd</li></ul>')
		})

		it('перед текстом в соседнем элементе того же абзаца второй br не добавляется', () => {
			const root = createRoot('<p><b>ab</b>cd</p>')
			caretAt(textOf(root, 'b'), 2)

			insertLineBreakAtSelection(root)

			expect(root.querySelectorAll('br')).toHaveLength(1)
		})

		it('выделенное удаляется', () => {
			const root = createRoot('<p>abcd</p>')
			caretAt(textOf(root, 'p'), 1, 3)

			insertLineBreakAtSelection(root)

			expect(root.innerHTML).toBe('<p>a<br>d</p>')
		})
	})

	describe('rangeFromStatic', () => {
		it('собирает Range по границам StaticRange', () => {
			const root = createRoot('<p>текст</p>')
			const text = textOf(root, 'p')
			const range = rangeFromStatic(new StaticRange({ startContainer: text, startOffset: 1, endContainer: text, endOffset: 3 }))

			expect(range.toString()).toBe('ек')
		})
	})
})
