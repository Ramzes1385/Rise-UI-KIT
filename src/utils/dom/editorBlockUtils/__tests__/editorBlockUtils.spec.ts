import { selectTextRange } from '../../editorFormatUtils'
import { clearBlockFormatting, insertParagraphAtSelection, setAlign, setBlockTag, toggleList } from '../editorBlockUtils'

function createRoot(html: string): HTMLDivElement {
	const root = document.createElement('div')
	root.innerHTML = html
	document.body.appendChild(root)
	return root
}

function selectChars(root: HTMLElement, start: number, end = start): void {
	selectTextRange(root, { start, end })
}

function selectNodes(start: [Node, number], end: [Node, number] = start): void {
	window.getSelection()?.setBaseAndExtent(start[0], start[1], end[0], end[1])
}

describe('editorBlockUtils', () => {
	afterEach(() => {
		window.getSelection()?.removeAllRanges()
		document.body.innerHTML = ''
	})

	describe('setBlockTag', () => {
		it('без выделения в области false', () => {
			expect(setBlockTag(createRoot('<p>a</p>'), 'h1')).toBe(false)
		})

		it('каретка в абзаце: абзац становится заголовком, выделение остаётся', () => {
			const root = createRoot('<p>hello</p>')
			selectChars(root, 2)

			expect(setBlockTag(root, 'h2')).toBe(true)

			expect(root.innerHTML).toBe('<h2>hello</h2>')
			expect(window.getSelection()!.anchorOffset).toBe(2)
		})

		it('несколько абзацев выделения меняются вместе, соседний за границей — нет', () => {
			const root = createRoot('<p>one</p><p>two</p><p>three</p>')
			selectChars(root, 1, 5)

			setBlockTag(root, 'h1')

			expect(root.innerHTML).toBe('<h1>one</h1><h1>two</h1><p>three</p>')
		})

		it('выравнивание сохраняется при смене тега', () => {
			const root = createRoot('<p style="text-align: center;">hello</p>')
			selectChars(root, 1)

			setBlockTag(root, 'h3')

			expect(root.innerHTML).toBe('<h3 style="text-align: center;">hello</h3>')
		})

		it('повторное применение с переключением возвращает абзац, без переключения оставляет', () => {
			const root = createRoot('<p>hello</p>')
			selectChars(root, 1)
			setBlockTag(root, 'blockquote', true)
			expect(root.innerHTML).toBe('<blockquote>hello</blockquote>')

			setBlockTag(root, 'blockquote', true)
			expect(root.innerHTML).toBe('<p>hello</p>')

			setBlockTag(root, 'h1')
			setBlockTag(root, 'h1')
			expect(root.innerHTML).toBe('<h1>hello</h1>')
		})

		it('строчный текст прямо в области оборачивается в абзац', () => {
			const root = createRoot('hello <b>bold</b>')
			selectChars(root, 1)

			setBlockTag(root, 'h1')

			expect(root.innerHTML).toBe('<h1>hello <b>bold</b></h1>')
		})

		it('пустая область получает пустой блок', () => {
			const root = createRoot('')
			selectNodes([root, 0])

			expect(setBlockTag(root, 'h1')).toBe(true)

			expect(root.innerHTML).toBe('<h1><br></h1>')
			expect(window.getSelection()!.anchorNode).toBe(root.firstElementChild)
		})

		it('div становится абзацем, блоки внутри div меняются сами', () => {
			const root = createRoot('<div>one</div><div><p>two</p></div>')
			selectChars(root, 1, 5)

			setBlockTag(root, 'p')

			expect(root.innerHTML).toBe('<p>one</p><div><p>two</p></div>')
		})

		it('пункт списка получает тег внутри и теряет его для абзаца; вложенный список не трогается', () => {
			const root = createRoot('<ul><li>item<ul><li>nested</li></ul></li></ul>')
			selectChars(root, 1)

			setBlockTag(root, 'h2')
			expect(root.innerHTML).toBe('<ul><li><h2>item</h2><ul><li>nested</li></ul></li></ul>')

			setBlockTag(root, 'p')
			expect(root.innerHTML).toBe('<ul><li><p>item</p><ul><li>nested</li></ul></li></ul>')

			setBlockTag(root, 'p')
			expect(root.innerHTML).toBe('<ul><li><p>item</p><ul><li>nested</li></ul></li></ul>')

			selectChars(root, 1)
			toggleList(root, 'ul')
			expect(root.innerHTML).toBe('<p>item</p><ul><li>nested</li></ul>')
		})

		it('простой пункт списка с абзацем в качестве тега остаётся как есть', () => {
			const root = createRoot('<ul><li>item</li></ul>')
			selectChars(root, 1)

			expect(setBlockTag(root, 'p')).toBe(true)

			expect(root.innerHTML).toBe('<ul><li>item</li></ul>')
		})

		it('выделение из пустых блоков и блоков с изображениями тоже считается', () => {
			const root = createRoot('<p>a</p><p><br></p><p><img src="a.png" alt=""></p>')
			const paragraphs = root.querySelectorAll('p')
			selectNodes([paragraphs[0].firstChild!, 0], [paragraphs[2], 1])

			setBlockTag(root, 'h1')

			expect(root.querySelectorAll('h1')).toHaveLength(3)
		})
	})

	describe('setAlign', () => {
		it('выравнивает блоки выделения, left убирает свойство и пустой style', () => {
			const root = createRoot('<p>one</p><p>two</p>')
			selectChars(root, 0, 6)

			setAlign(root, 'center')
			expect(root.innerHTML).toBe('<p style="text-align: center;">one</p><p style="text-align: center;">two</p>')

			setAlign(root, 'left')
			expect(root.innerHTML).toBe('<p>one</p><p>two</p>')
		})

		it('right, justify и пункт списка', () => {
			const root = createRoot('<ul><li>item</li></ul>')
			selectChars(root, 1)

			setAlign(root, 'right')
			expect(root.querySelector('li')!.style.textAlign).toBe('right')
			setAlign(root, 'justify')
			expect(root.querySelector('li')!.style.textAlign).toBe('justify')
		})

		it('left не трогает другие стили блока', () => {
			const root = createRoot('<p style="text-align: right; color: red;">one</p>')
			selectChars(root, 1)

			setAlign(root, 'left')

			expect(root.querySelector('p')!.getAttribute('style')).toContain('color')
			expect(root.querySelector('p')!.style.textAlign).toBe('')
		})

		it('выделение по пунктам с вложенной разметкой выравнивает каждый пункт', () => {
			const root = createRoot('<ul><li><b>a</b></li><li>b</li></ul>')
			selectChars(root, 0, 2)

			setAlign(root, 'center')

			expect(root.querySelectorAll('li[style]')).toHaveLength(2)
		})

		it('без выделения false', () => {
			expect(setAlign(createRoot('<p>a</p>'), 'center')).toBe(false)
		})
	})

	describe('toggleList', () => {
		it('абзац становится пунктом нового списка, повтор возвращает абзац', () => {
			const root = createRoot('<p>one</p>')
			selectChars(root, 1)

			expect(toggleList(root, 'ul')).toBe(true)
			expect(root.innerHTML).toBe('<ul><li>one</li></ul>')

			toggleList(root, 'ul')
			expect(root.innerHTML).toBe('<p>one</p>')
		})

		it('соседние абзацы выделения — пункты одного списка', () => {
			const root = createRoot('<p>one</p><p>two</p><p>three</p>')
			selectChars(root, 1, 5)

			toggleList(root, 'ol')

			expect(root.innerHTML).toBe('<ol><li>one</li><li>two</li></ol><p>three</p>')
		})

		it('список принимает соседний список того же вида', () => {
			const root = createRoot('<ul><li>a</li></ul><p>b</p><ul><li>c</li></ul>')
			selectChars(root, 1)

			toggleList(root, 'ul')

			expect(root.innerHTML).toBe('<ul><li>a</li><li>b</li><li>c</li></ul>')
		})

		it('другой вид списка меняет тег списка; смешанное выделение довозит абзацы в список', () => {
			const root = createRoot('<ul><li>a</li></ul><p>b</p>')
			selectChars(root, 0, 2)

			toggleList(root, 'ol')

			expect(root.innerHTML).toBe('<ol><li>a</li><li>b</li></ol>')
		})

		it('убирает из списка один пункт: список разрезается, вложенный список и выравнивание остаются', () => {
			const root = createRoot('<ul><li>a</li><li style="text-align: center;">b<ul><li>n</li></ul></li><li>c</li></ul>')
			selectChars(root, 1)

			toggleList(root, 'ul')

			expect(root.innerHTML).toBe('<ul><li>a</li></ul><p style="text-align: center;">b</p><ul><li>n</li><li>c</li></ul>')
		})

		it('пустой пункт при снятии списка получает заглушку', () => {
			const root = createRoot('<ul><li><br></li></ul>')
			selectNodes([root.querySelector('li')!, 0])

			toggleList(root, 'ul')

			expect(root.innerHTML).toBe('<p><br></p>')
		})

		it('пункт с абзацем внутри снимается вместе с абзацем, пустой пункт получает заглушку', () => {
			const root = createRoot('<ul><li></li></ul>')
			selectNodes([root.querySelector('li')!, 0])

			toggleList(root, 'ul')

			expect(root.innerHTML).toBe('<p><br></p>')
		})

		it('пункт того же вида в смешанном выделении остаётся пунктом', () => {
			const root = createRoot('<ul><li>a</li></ul><p>b</p>')
			selectChars(root, 0, 2)

			toggleList(root, 'ul')

			expect(root.innerHTML).toBe('<ul><li>a</li><li>b</li></ul>')
		})

		it('без выделения false', () => {
			expect(toggleList(createRoot('<p>a</p>'), 'ul')).toBe(false)
		})

		it('выравнивание абзаца переходит в пункт', () => {
			const root = createRoot('<p style="text-align: center;">a</p>')
			selectChars(root, 0)

			toggleList(root, 'ul')

			expect(root.querySelector('li')!.style.textAlign).toBe('center')
		})
	})

	describe('clearBlockFormatting', () => {
		it('заголовок и пункт списка становятся абзацами, выравнивание остаётся', () => {
			const root = createRoot('<h1 style="text-align: center;">a</h1><ul><li>b</li></ul>')
			selectChars(root, 0, 2)

			expect(clearBlockFormatting(root)).toBe(true)

			expect(root.innerHTML).toBe('<p style="text-align: center;">a</p><p>b</p>')
		})

		it('без выделения false', () => {
			expect(clearBlockFormatting(createRoot('<h1>a</h1>'))).toBe(false)
		})
	})

	describe('insertParagraphAtSelection', () => {
		it('без выделения false', () => {
			expect(insertParagraphAtSelection(createRoot('<p>a</p>'))).toBe(false)
		})

		it('режет абзац надвое, каретка в начале второго', () => {
			const root = createRoot('<p>abcd</p>')
			selectChars(root, 2)

			expect(insertParagraphAtSelection(root)).toBe(true)

			expect(root.innerHTML).toBe('<p>ab</p><p>cd</p>')
			expect(window.getSelection()!.anchorNode).toBe(root.lastElementChild)
			expect(window.getSelection()!.anchorOffset).toBe(0)
		})

		it('в конце абзаца — пустой абзац с заглушкой, в начале — пустой абзац перед текстом', () => {
			const atEnd = createRoot('<p>ab</p>')
			selectChars(atEnd, 2)
			insertParagraphAtSelection(atEnd)
			expect(atEnd.innerHTML).toBe('<p>ab</p><p><br></p>')

			const atStart = createRoot('<p>ab</p>')
			selectChars(atStart, 0)
			insertParagraphAtSelection(atStart)
			expect(atStart.innerHTML).toBe('<p><br></p><p>ab</p>')
		})

		it('выделенное удаляется, оформление хвоста сохраняется', () => {
			const root = createRoot('<p>a<b>bcd</b>e</p>')
			selectChars(root, 1, 3)

			insertParagraphAtSelection(root)

			expect(root.innerHTML).toBe('<p>a</p><p><b>d</b>e</p>')
		})

		it('заголовок: в конце следующий блок — абзац, в середине — тот же заголовок, выравнивание сохраняется', () => {
			const atEnd = createRoot('<h2>title</h2>')
			selectChars(atEnd, 5)
			insertParagraphAtSelection(atEnd)
			expect(atEnd.innerHTML).toBe('<h2>title</h2><p><br></p>')

			const middle = createRoot('<h2 style="text-align: center;">title</h2>')
			selectChars(middle, 2)
			insertParagraphAtSelection(middle)
			expect(middle.innerHTML).toBe('<h2 style="text-align: center;">ti</h2><h2 style="text-align: center;">tle</h2>')
		})

		it('пункт списка: новый пункт; вложенный список переходит во второй пункт', () => {
			const root = createRoot('<ul><li>ab<ul><li>n</li></ul></li></ul>')
			selectChars(root, 1)

			insertParagraphAtSelection(root)

			expect(root.innerHTML).toBe('<ul><li>a</li><li>b<ul><li>n</li></ul></li></ul>')
		})

		it('пустой пункт завершает список: в конце — абзац после списка, в середине — список режется', () => {
			const atEnd = createRoot('<ul><li>a</li><li><br></li></ul>')
			selectNodes([atEnd.querySelectorAll('li')[1], 0])
			insertParagraphAtSelection(atEnd)
			expect(atEnd.innerHTML).toBe('<ul><li>a</li></ul><p><br></p>')
			expect(window.getSelection()!.anchorNode).toBe(atEnd.lastElementChild)

			const middle = createRoot('<ul><li>a</li><li><br></li><li>c</li></ul>')
			selectNodes([middle.querySelectorAll('li')[1], 0])
			insertParagraphAtSelection(middle)
			expect(middle.innerHTML).toBe('<ul><li>a</li></ul><p><br></p><ul><li>c</li></ul>')
		})

		it('пустая цитата завершается абзацем, непустая режется на две', () => {
			const empty = createRoot('<blockquote><br></blockquote>')
			selectNodes([empty.querySelector('blockquote')!, 0])
			insertParagraphAtSelection(empty)
			expect(empty.innerHTML).toBe('<p><br></p>')

			const filled = createRoot('<blockquote>abcd</blockquote>')
			selectChars(filled, 2)
			insertParagraphAtSelection(filled)
			expect(filled.innerHTML).toBe('<blockquote>ab</blockquote><blockquote>cd</blockquote>')
		})

		it('блок кода: перевод строки внутри, в конце — два', () => {
			const middle = createRoot('<pre>abcd</pre>')
			selectChars(middle, 2)
			insertParagraphAtSelection(middle)
			expect(middle.querySelector('pre')!.textContent).toBe('ab\ncd')
			expect(middle.querySelectorAll('pre')).toHaveLength(1)

			const atEnd = createRoot('<pre>ab</pre>')
			selectChars(atEnd, 2)
			insertParagraphAtSelection(atEnd)
			expect(atEnd.querySelector('pre')!.textContent).toBe('ab\n\n')
			expect(window.getSelection()!.anchorOffset).toBe(1)
		})

		it('строчный текст прямо в области сначала получает абзац', () => {
			const root = createRoot('abcd')
			selectChars(root, 2)

			insertParagraphAtSelection(root)

			expect(root.innerHTML).toBe('<p>ab</p><p>cd</p>')
		})

		it('каретка между блоками в самой области: вставляется пустой абзац', () => {
			const root = createRoot('<hr><hr>')
			selectNodes([root, 1])

			insertParagraphAtSelection(root)

			expect(root.innerHTML).toBe('<hr><p><br></p><hr>')
		})

		it('пустая область получает пустой абзац', () => {
			const root = createRoot('')
			selectNodes([root, 0])

			insertParagraphAtSelection(root)

			expect(root.querySelectorAll('p').length).toBeGreaterThan(0)
		})

		it('блок с изображением вместо текста не считается пустым', () => {
			const root = createRoot('<ul><li><img src="a.png" alt=""></li></ul>')
			selectNodes([root.querySelector('li')!, 1])

			insertParagraphAtSelection(root)

			expect(root.querySelectorAll('li')).toHaveLength(2)
		})
	})
})
