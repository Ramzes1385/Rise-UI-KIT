import { insertParagraphAtSelection } from '../editorBlockUtils'

function createRoot(html: string): HTMLDivElement {
	const root = document.createElement('div')
	root.innerHTML = html
	document.body.appendChild(root)
	return root
}

function select(start: [Node, number], end: [Node, number] = start): void {
	window.getSelection()?.setBaseAndExtent(start[0], start[1], end[0], end[1])
}

describe('insertParagraphAtSelection: пустые блоки и выделение', () => {
	afterEach(() => {
		window.getSelection()?.removeAllRanges()
		document.body.innerHTML = ''
	})

	describe('Enter не дублирует заглушку <br>', () => {
		it('в пустом абзаце получается два пустых абзаца с одним <br>', () => {
			const root = createRoot('<p><br></p>')
			select([root.firstElementChild!, 0])

			insertParagraphAtSelection(root)

			expect(root.innerHTML).toBe('<p><br></p><p><br></p>')
		})

		it('в пустом абзаце после текста', () => {
			const root = createRoot('<p>abc</p><p><br></p>')
			select([root.lastElementChild!, 0])

			insertParagraphAtSelection(root)

			expect(root.innerHTML).toBe('<p>abc</p><p><br></p><p><br></p>')
		})

		it('в конце непустого абзаца', () => {
			const root = createRoot('<p>abc</p>')
			select([root.firstElementChild!.firstChild!, 3])

			insertParagraphAtSelection(root)

			expect(root.innerHTML).toBe('<p>abc</p><p><br></p>')
		})

		it('в середине непустого абзаца', () => {
			const root = createRoot('<p>abc</p>')
			select([root.firstElementChild!.firstChild!, 1])

			insertParagraphAtSelection(root)

			expect(root.innerHTML).toBe('<p>a</p><p>bc</p>')
		})

		it('в начале непустого абзаца', () => {
			const root = createRoot('<p>abc</p>')
			select([root.firstElementChild!.firstChild!, 0])

			insertParagraphAtSelection(root)

			expect(root.innerHTML).toBe('<p><br></p><p>abc</p>')
		})

		it('в конце абзаца с текстом и завершающим <br>', () => {
			const root = createRoot('<p>abc<br></p>')
			select([root.firstElementChild!.firstChild!, 3])

			insertParagraphAtSelection(root)

			expect(root.innerHTML).toBe('<p>abc</p><p><br></p>')
		})

		it('в пустом пункте списка пункт уходит в абзац без лишних <br>', () => {
			const root = createRoot('<ul><li>a</li><li><br></li></ul>')
			select([root.querySelectorAll('li')[1], 0])

			insertParagraphAtSelection(root)

			expect(root.innerHTML).toBe('<ul><li>a</li></ul><p><br></p>')
		})

		it('в конце пункта новый пункт получает одну заглушку', () => {
			const root = createRoot('<ul><li>a</li></ul>')
			select([root.querySelector('li')!.firstChild!, 1])

			insertParagraphAtSelection(root)

			expect(root.innerHTML).toBe('<ul><li>a</li><li><br></li></ul>')
		})
	})

	describe('Enter в пункте с абзацем внутри', () => {
		it('в конце: новый пункт со своим абзацем и кареткой в нём', () => {
			const root = createRoot('<ul><li><p>one</p></li></ul>')
			select([root.querySelector('p')!.firstChild!, 3])

			insertParagraphAtSelection(root)

			expect(root.innerHTML).toBe('<ul><li><p>one</p></li><li><p><br></p></li></ul>')
			expect(window.getSelection()!.anchorNode).toBe(root.querySelectorAll('p')[1])
		})

		it('в середине: пункт делится на два', () => {
			const root = createRoot('<ul><li><p>one</p></li></ul>')
			select([root.querySelector('p')!.firstChild!, 1])

			insertParagraphAtSelection(root)

			expect(root.innerHTML).toBe('<ul><li><p>o</p></li><li><p>ne</p></li></ul>')
		})

		it('в пустом пункте с абзацем - выход из списка', () => {
			const root = createRoot('<ul><li>a</li><li><p><br></p></li></ul>')
			select([root.querySelectorAll('p')[0], 0])

			insertParagraphAtSelection(root)

			expect(root.innerHTML).toBe('<ul><li>a</li></ul><p><br></p>')
		})

		it('пункт с заголовком внутри делится так же', () => {
			const root = createRoot('<ol><li><h2>title</h2></li></ol>')
			select([root.querySelector('h2')!.firstChild!, 5])

			insertParagraphAtSelection(root)

			expect(root.innerHTML).toBe('<ol><li><h2>title</h2></li><li><h2><br></h2></li></ol>')
		})
	})

	describe('Enter поверх выделения', () => {
		it('через два абзаца: края склеиваются, потом делятся', () => {
			const root = createRoot('<p>hello</p><p>world</p>')
			select([root.firstElementChild!.firstChild!, 3], [root.lastElementChild!.firstChild!, 2])

			insertParagraphAtSelection(root)

			expect(root.innerHTML).toBe('<p>hel</p><p>rld</p>')
		})

		it('через пункты списка: пункты остаются пунктами, абзац в список не попадает', () => {
			const root = createRoot('<ul><li>abc</li><li>def</li><li>ghi</li></ul>')
			const items = root.querySelectorAll('li')
			select([items[0].firstChild!, 1], [items[2].firstChild!, 2])

			insertParagraphAtSelection(root)

			expect(root.innerHTML).toBe('<ul><li>a</li><li>i</li></ul>')
		})

		it('от абзаца до пункта списка', () => {
			const root = createRoot('<p>abc</p><ul><li>def</li></ul>')
			select([root.firstElementChild!.firstChild!, 1], [root.querySelector('li')!.firstChild!, 1])

			insertParagraphAtSelection(root)

			expect(root.innerHTML).toBe('<p>a</p><p>ef</p>')
		})

		it('выделена вся область: остаётся два пустых абзаца', () => {
			const root = createRoot('<p>abc</p><p>def</p>')
			select([root, 0], [root, 2])

			insertParagraphAtSelection(root)

			expect(root.innerHTML).toBe('<p><br></p><p><br></p>')
		})

		it('выделен весь текст по краям текстовых узлов', () => {
			const root = createRoot('<p>abc</p><p>def</p>')
			select([root.firstElementChild!.firstChild!, 0], [root.lastElementChild!.firstChild!, 3])

			insertParagraphAtSelection(root)

			expect(root.innerHTML).toBe('<p><br></p><p><br></p>')
		})

		it('внутри одного абзаца текст выделения удаляется', () => {
			const root = createRoot('<p>abcdef</p>')
			select([root.firstElementChild!.firstChild!, 1], [root.firstElementChild!.firstChild!, 4])

			insertParagraphAtSelection(root)

			expect(root.innerHTML).toBe('<p>a</p><p>ef</p>')
		})
	})
})
