import { clearBlockFormatting, setAlign, setBlockTag, toggleList } from '../editorBlockUtils'

type Command = (root: HTMLElement) => boolean

const COMMANDS: Record<string, { run: Command; tag: string; container: string }> = {
	выровнять: { run: root => setAlign(root, 'center'), tag: 'P', container: 'P' },
	заголовок: { run: root => setBlockTag(root, 'h2'), tag: 'H2', container: 'H2' },
	цитата: { run: root => setBlockTag(root, 'blockquote', true), tag: 'BLOCKQUOTE', container: 'BLOCKQUOTE' },
	список: { run: root => toggleList(root, 'ul'), tag: 'LI', container: 'LI' },
	очистка: { run: root => clearBlockFormatting(root), tag: 'P', container: 'P' },
}

function createRoot(html: string): HTMLDivElement {
	const root = document.createElement('div')
	root.innerHTML = html
	document.body.appendChild(root)
	return root
}

function placeCaret(node: Node, offset: number): void {
	window.getSelection()?.setBaseAndExtent(node, offset, node, offset)
}

function caretBlock(): { tag: string; text: string; offset: number } {
	const selection = window.getSelection()!
	const anchor = selection.anchorNode!
	const element = anchor instanceof Element ? anchor : anchor.parentElement!
	const block = element.closest('p, h2, blockquote, li')!
	return { tag: block.tagName, text: block.textContent ?? '', offset: anchor instanceof Text ? selection.anchorOffset : -1 }
}

describe('editorBlockUtils: каретка после блочной команды', () => {
	afterEach(() => {
		window.getSelection()?.removeAllRanges()
		document.body.innerHTML = ''
	})

	describe.each(Object.entries(COMMANDS))('%s', (_name, command) => {
		it('в конце непоследнего блока остаётся в нём, а не уходит в начало следующего', () => {
			const root = createRoot('<p>one</p><p>two</p>')
			placeCaret(root.firstElementChild!.firstChild!, 3)

			command.run(root)

			expect(caretBlock()).toEqual({ tag: command.container, text: 'one', offset: 3 })
		})

		it('в начале блока остаётся в нём', () => {
			const root = createRoot('<p>one</p><p>two</p>')
			placeCaret(root.firstElementChild!.firstChild!, 0)

			command.run(root)

			expect(caretBlock()).toEqual({ tag: command.container, text: 'one', offset: 0 })
		})

		it('в середине блока остаётся на том же смещении', () => {
			const root = createRoot('<p>one</p><p>two</p>')
			placeCaret(root.lastElementChild!.firstChild!, 1)

			command.run(root)

			expect(caretBlock()).toEqual({ tag: command.container, text: 'two', offset: 1 })
		})

		it('в пустом абзаце остаётся в нём, а не уходит в первый абзац', () => {
			const root = createRoot('<p>hello</p><p><br></p>')
			placeCaret(root.lastElementChild!, 0)

			command.run(root)

			const block = caretBlock()
			expect(block.tag).toBe(command.container)
			expect(block.text).toBe('')
		})
	})

	it('в конце оформленного текста каретка остаётся в конце блока', () => {
		const root = createRoot('<p>one <b>bold</b></p><p>two</p>')
		placeCaret(root.querySelector('b')!.firstChild!, 4)

		setBlockTag(root, 'h2')

		expect(caretBlock()).toEqual({ tag: 'H2', text: 'one bold', offset: 4 })
	})

	it('пункт с вложенным списком: каретка в конце собственного текста пункта', () => {
		const root = createRoot('<ul><li>one<ul><li>nested</li></ul></li></ul>')
		placeCaret(root.querySelector('li')!.firstChild!, 3)

		toggleList(root, 'ol')

		const selection = window.getSelection()!
		expect(selection.anchorNode!.textContent).toBe('one')
		expect(selection.anchorOffset).toBe(3)
	})

	it('пустой пункт с вложенным списком: каретка в пустом пункте, а не во вложенном тексте', () => {
		const root = createRoot('<ul><li><br><ul><li>nested</li></ul></li></ul>')
		placeCaret(root.querySelector('li')!, 0)

		toggleList(root, 'ol')

		expect(window.getSelection()!.anchorNode).toBe(root.querySelector('li'))
	})

	it('непустое выделение по-прежнему восстанавливается по смещениям текста', () => {
		const root = createRoot('<p>one</p><p>two</p>')
		window.getSelection()?.setBaseAndExtent(root.firstElementChild!.firstChild!, 1, root.lastElementChild!.firstChild!, 2)

		setBlockTag(root, 'h2')

		expect(root.innerHTML).toBe('<h2>one</h2><h2>two</h2>')
		expect(window.getSelection()!.toString()).toBe('netw')
	})
})
