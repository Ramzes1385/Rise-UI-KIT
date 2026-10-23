import { readSelectionPath, writeSelectionPath } from '../helpers/selectionPath'

function createRoot(html: string): HTMLDivElement {
	const root = document.createElement('div')
	root.innerHTML = html
	document.body.appendChild(root)
	return root
}

function select(anchor: [Node, number], focus: [Node, number]): void {
	window.getSelection()?.setBaseAndExtent(anchor[0], anchor[1], focus[0], focus[1])
}

function roundTrip(root: HTMLElement): void {
	const path = readSelectionPath(root)!
	const html = root.innerHTML
	root.innerHTML = html
	expect(writeSelectionPath(root, path)).toBe(true)
}

describe('selectionPath', () => {
	afterEach(() => {
		window.getSelection()?.removeAllRanges()
		document.body.innerHTML = ''
	})

	it('без выделения и с выделением вне области — null', () => {
		const root = createRoot('<p>текст</p>')
		expect(readSelectionPath(root)).toBeNull()

		const outside = document.createElement('p')
		outside.textContent = 'вне'
		document.body.appendChild(outside)
		select([outside.firstChild!, 1], [outside.firstChild!, 2])
		expect(readSelectionPath(root)).toBeNull()

		select([root.querySelector('p')!.firstChild!, 1], [outside.firstChild!, 2])
		expect(readSelectionPath(root)).toBeNull()
	})

	it('свёрнутое выделение переживает пересборку из строки', () => {
		const root = createRoot('<p>один <b>два</b> три</p>')
		select([root.querySelector('b')!.firstChild!, 1], [root.querySelector('b')!.firstChild!, 1])

		roundTrip(root)

		const selection = window.getSelection()!
		expect(selection.anchorNode).toBe(root.querySelector('b')!.firstChild)
		expect(selection.anchorOffset).toBe(1)
		expect(selection.isCollapsed).toBe(true)
	})

	it('обратное выделение сохраняет направление', () => {
		const root = createRoot('<p>abcdef</p>')
		const text = root.querySelector('p')!.firstChild!
		select([text, 5], [text, 1])

		roundTrip(root)

		const selection = window.getSelection()!
		expect(selection.anchorOffset).toBe(5)
		expect(selection.focusOffset).toBe(1)
	})

	it('текстовые узлы после splitText и пустой текстовый узел считаются одним: тот же текст после пересборки', () => {
		const root = createRoot('<p>abcdefgh</p>')
		const paragraph = root.querySelector('p')!
		const tail = (paragraph.firstChild as Text).splitText(3)
		tail.splitText(2)
		paragraph.insertBefore(document.createTextNode(''), paragraph.firstChild)
		select([tail, 1], [tail.nextSibling!, 1])
		const before = window.getSelection()!.toString()

		roundTrip(root)

		expect(window.getSelection()!.toString()).toBe(before)
		expect(before).toBe('ef')
	})

	it('граница элемента: начало, середина цепочки текстов, конец', () => {
		const root = createRoot('<p></p>')
		root.querySelector('p')!.append('ab', 'cd', document.createElement('br'), 'ef')
		const paragraph = (): HTMLElement => root.querySelector('p')!

		select([paragraph(), 0], [paragraph(), 0])
		roundTrip(root)
		expect(window.getSelection()!.anchorNode).toBe(paragraph())
		expect(window.getSelection()!.anchorOffset).toBe(0)

		root.innerHTML = '<p></p>'
		paragraph().append('ab', 'cd', document.createElement('br'), 'ef')
		select([paragraph(), 1], [paragraph(), 1])
		roundTrip(root)
		expect(window.getSelection()!.anchorNode!.nodeType).toBe(Node.TEXT_NODE)
		expect(window.getSelection()!.anchorOffset).toBe(2)

		root.innerHTML = '<p></p>'
		paragraph().append('ab', 'cd', document.createElement('br'), 'ef')
		select([paragraph(), 4], [paragraph(), 4])
		roundTrip(root)
		expect(window.getSelection()!.anchorNode).toBe(paragraph())
		expect(window.getSelection()!.anchorOffset).toBe(3)
	})

	it('каретка в пустом абзаце и перед пустым текстовым узлом', () => {
		const root = createRoot('<p><br></p><p></p>')
		const empty = root.querySelectorAll('p')[1]
		empty.appendChild(document.createTextNode(''))
		select([empty.firstChild!, 0], [empty.firstChild!, 0])

		roundTrip(root)

		expect(window.getSelection()!.anchorNode).toBe(root.querySelectorAll('p')[1])
	})

	it('пустые текстовые узлы не считаются, цепочка текстов — один узел', () => {
		const root = createRoot('<p></p>')
		const paragraph = root.querySelector('p')!
		paragraph.append('', 'ab', 'cd', document.createElement('br'), '')

		select([paragraph, 3], [paragraph, 3])
		expect(readSelectionPath(root)).toEqual({ anchor: { path: [0], offset: 1 }, focus: { path: [0], offset: 1 } })

		select([paragraph, 5], [paragraph, 5])
		expect(readSelectionPath(root)).toEqual({ anchor: { path: [0], offset: 2 }, focus: { path: [0], offset: 2 } })

		select([paragraph.childNodes[2], 1], [paragraph.childNodes[2], 1])
		expect(readSelectionPath(root)).toEqual({ anchor: { path: [0, 0], offset: 3 }, focus: { path: [0, 0], offset: 3 } })
	})

	it('если getSelection недоступен, путь не строится', () => {
		const root = createRoot('<p>a</p>')
		vi.spyOn(window, 'getSelection').mockReturnValueOnce(null)

		expect(readSelectionPath(root)).toBeNull()
	})

	it('каретка в самой области', () => {
		const root = createRoot('<p>a</p>')
		select([root, 1], [root, 1])

		roundTrip(root)

		expect(window.getSelection()!.anchorNode).toBe(root)
		expect(window.getSelection()!.anchorOffset).toBe(1)
	})

	it('неверный путь — false без исключения', () => {
		const root = createRoot('<p>abc</p>')
		const point = { path: [5], offset: 0 }
		expect(writeSelectionPath(root, { anchor: point, focus: point })).toBe(false)

		const far = { path: [0, 0], offset: 99 }
		expect(writeSelectionPath(root, { anchor: far, focus: far })).toBe(false)

		const valid = { path: [0, 0], offset: 1 }
		expect(writeSelectionPath(root, { anchor: valid, focus: far })).toBe(false)
	})
})
