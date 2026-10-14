import { insertHtmlAtSelection } from '../editorInsertUtils'

function createRoot(html: string): HTMLDivElement {
	const root = document.createElement('div')
	root.innerHTML = html
	document.body.appendChild(root)
	return root
}

function select(start: [Node, number], end: [Node, number] = start): void {
	window.getSelection()?.setBaseAndExtent(start[0], start[1], end[0], end[1])
}

describe('insertHtmlAtSelection: выделение через блоки и смешанная вставка', () => {
	afterEach(() => {
		window.getSelection()?.removeAllRanges()
		document.body.innerHTML = ''
	})

	describe('выделение через несколько блоков', () => {
		it('края склеиваются перед вставкой текста', () => {
			const root = createRoot('<p>hello</p><p>world</p>')
			select([root.firstElementChild!.firstChild!, 3], [root.lastElementChild!.firstChild!, 2])

			insertHtmlAtSelection(root, 'X')

			expect(root.innerHTML).toBe('<p>helXrld</p>')
		})

		it('каретка после вставки стоит за вставленным текстом', () => {
			const root = createRoot('<p>hello</p><p>world</p>')
			select([root.firstElementChild!.firstChild!, 3], [root.lastElementChild!.firstChild!, 2])

			insertHtmlAtSelection(root, 'X')
			insertHtmlAtSelection(root, 'Y')

			expect(root.innerHTML).toBe('<p>helXYrld</p>')
		})

		it('блоки между краями исчезают', () => {
			const root = createRoot('<p>a1</p><h2>mid</h2><p>b2</p>')
			select([root.firstElementChild!.firstChild!, 1], [root.lastElementChild!.firstChild!, 1])

			insertHtmlAtSelection(root, 'X')

			expect(root.innerHTML).toBe('<p>aX2</p>')
		})

		it('Ctrl+A: выделена вся область - остаётся один абзац со вставкой', () => {
			const root = createRoot('<p>abc</p><p>def</p>')
			select([root, 0], [root, 2])

			insertHtmlAtSelection(root, 'X')

			expect(root.innerHTML).toBe('<p>X</p>')
		})

		it('Ctrl+A по краям текста: один абзац со вставкой', () => {
			const root = createRoot('<p>abc</p><p>def</p>')
			select([root.firstElementChild!.firstChild!, 0], [root.lastElementChild!.firstChild!, 3])

			insertHtmlAtSelection(root, 'X')

			expect(root.innerHTML).toBe('<p>X</p>')
		})

		it('Ctrl+A и вставка HTML с блоками заменяет всё содержимое', () => {
			const root = createRoot('<p>abc</p><p>def</p>')
			select([root, 0], [root, 2])

			insertHtmlAtSelection(root, '<p>A</p><h2>B</h2>')

			expect(root.innerHTML).toBe('<p>A</p><h2>B</h2>')
		})

		it('через пункты списка пункты склеиваются в один', () => {
			const root = createRoot('<ul><li>abc</li><li>def</li></ul>')
			const items = root.querySelectorAll('li')
			select([items[0].firstChild!, 1], [items[1].firstChild!, 2])

			insertHtmlAtSelection(root, 'X')

			expect(root.innerHTML).toBe('<ul><li>aXf</li></ul>')
		})

		it('от абзаца до пункта: опустевший список убирается', () => {
			const root = createRoot('<p>abc</p><ul><li>def</li></ul>')
			select([root.firstElementChild!.firstChild!, 1], [root.querySelector('li')!.firstChild!, 3])

			insertHtmlAtSelection(root, 'X')

			expect(root.innerHTML).toBe('<p>aX</p>')
		})

		it('целый блок и начало следующего', () => {
			const root = createRoot('<p>one</p><p>two</p>')
			select([root.firstElementChild!.firstChild!, 0], [root.lastElementChild!.firstChild!, 1])

			insertHtmlAtSelection(root, 'X')

			expect(root.innerHTML).toBe('<p>Xwo</p>')
		})

		it('вложенный блок не склеивается с предком: пункт и его вложенный список', () => {
			const root = createRoot('<ul><li>one<ul><li>two</li></ul></li></ul>')
			const nested = root.querySelectorAll('li')[1]
			select([root.querySelector('li')!.firstChild!, 1], [nested.firstChild!, 1])

			insertHtmlAtSelection(root, 'X')

			expect(root.textContent).toBe('oXwo')
		})

		it('первый блок пустой', () => {
			const root = createRoot('<p><br></p><p>abc</p>')
			select([root.firstElementChild!, 0], [root.lastElementChild!.firstChild!, 1])

			insertHtmlAtSelection(root, 'X')

			expect(root.innerHTML).toBe('<p>Xbc</p>')
		})

		it('выделение начинается после заглушки <br> первого блока: заглушка не остаётся в склейке', () => {
			const root = createRoot('<p><br></p><p>abc</p>')
			select([root.firstElementChild!, 1], [root.lastElementChild!.firstChild!, 1])

			insertHtmlAtSelection(root, 'X')

			expect(root.innerHTML).toBe('<p>Xbc</p>')
		})

		it('оба крайних блока пустые: остаётся один пустой абзац со вставкой', () => {
			const root = createRoot('<p><br></p><p><br></p>')
			select([root.firstElementChild!, 0], [root.lastElementChild!, 1])

			insertHtmlAtSelection(root, 'X')

			expect(root.innerHTML).toBe('<p>X</p>')
		})

		it('последний блок пустой: его заглушка не попадает в склейку', () => {
			const root = createRoot('<p>abc</p><p><br></p>')
			select([root.firstElementChild!.firstChild!, 1], [root.lastElementChild!, 0])

			insertHtmlAtSelection(root, 'X')

			expect(root.innerHTML).toBe('<p>aX</p>')
		})
	})

	describe('вставка прямо в корень', () => {
		it('в пустую область инлайн оборачивается в абзац', () => {
			const root = createRoot('')
			select([root, 0])

			insertHtmlAtSelection(root, 'X')

			expect(root.innerHTML).toBe('<p>X</p>')
		})

		it('между блоками инлайн получает свой абзац', () => {
			const root = createRoot('<p>a</p><p>b</p>')
			select([root, 1])

			insertHtmlAtSelection(root, '<b>X</b>')

			expect(root.innerHTML).toBe('<p>a</p><p><b>X</b></p><p>b</p>')
		})
	})

	describe('смешанная вставка «строчное + блок»', () => {
		it('строчные узлы идут в абзац, блоки остаются блоками', () => {
			const root = createRoot('<p><br></p>')
			select([root.firstElementChild!, 0])

			insertHtmlAtSelection(root, 'abc<b>def</b><p>ghi</p>tail')

			expect(root.innerHTML).toBe('<p>abc<b>def</b></p><p>ghi</p><p>tail</p>')
		})

		it('пробельные узлы между блоками отбрасываются', () => {
			const root = createRoot('<p><br></p>')
			select([root.firstElementChild!, 0])

			insertHtmlAtSelection(root, '<p>A</p>\n  <ul>\n<li>b</li>\n</ul>\n')

			expect(root.innerHTML).toBe('<p>A</p><ul>\n<li>b</li>\n</ul>')
		})

		it('в пункте списка строчное и блок идут строками через <br>', () => {
			const root = createRoot('<ul><li><br></li></ul>')
			select([root.querySelector('li')!, 0])

			insertHtmlAtSelection(root, 'abc<p>def</p>')

			expect(root.innerHTML).toBe('<ul><li>abc<br>def</li></ul>')
		})
	})
})
