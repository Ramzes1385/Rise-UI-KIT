import { selectRange } from '../../editorInsertUtils'
import { getTextRange, nodesInTextRange, selectTextRange } from '../helpers/textRange'
import { closestTag, isEmptyFragment, normalizeInline, PLACEHOLDER, unwrapFrom, wrapNode } from '../helpers/inlineTree'
import {
	applyInlineStyle,
	removeInlineFormatting,
	stripPlaceholders,
	toggleInlineFormat,
	unlinkSelection,
	wrapSelectionInLink,
} from '../editorFormatUtils'

const BOLD = { tag: 'b', tags: ['B', 'STRONG'] }
const ITALIC = { tag: 'i', tags: ['I', 'EM'] }

function createRoot(html: string): HTMLDivElement {
	const root = document.createElement('div')
	root.innerHTML = html
	document.body.appendChild(root)
	return root
}

function selectChars(root: HTMLElement, start: number, end: number): void {
	selectTextRange(root, { start, end })
}

function selectNodes(start: [Node, number], end: [Node, number]): void {
	window.getSelection()?.setBaseAndExtent(start[0], start[1], end[0], end[1])
}

describe('editorFormatUtils', () => {
	afterEach(() => {
		window.getSelection()?.removeAllRanges()
		document.body.innerHTML = ''
	})

	describe('textRange', () => {
		it('выделение как отрезок текста не зависит от разметки', () => {
			const root = createRoot('<p>ab<b>cd</b>ef</p>')
			const bold = root.querySelector('b')!.firstChild!
			selectNodes([bold, 1], [root.querySelector('p')!.lastChild!, 1])

			expect(getTextRange(root)).toEqual({ start: 3, end: 5 })
		})

		it('без выделения в области — null', () => {
			expect(getTextRange(createRoot('<p>a</p>'))).toBeNull()
		})

		it('границы режут текстовые узлы, внутрь попадают только целые узлы', () => {
			const root = createRoot('<p>abcdef</p>')

			const nodes = nodesInTextRange(root, { start: 2, end: 4 })

			expect(nodes.map(node => node.data)).toEqual(['cd'])
			expect(root.querySelector('p')!.childNodes).toHaveLength(3)
		})

		it('пустые текстовые узлы пропускаются', () => {
			const root = createRoot('<p>ab</p>')
			root.querySelector('p')!.append(document.createTextNode(''), 'cd')

			expect(nodesInTextRange(root, { start: 0, end: 4 }).map(node => node.data)).toEqual(['ab', 'cd'])
		})

		it('граница на стыке узлов ничего не режет', () => {
			const root = createRoot('<p>ab<b>cd</b></p>')

			const nodes = nodesInTextRange(root, { start: 2, end: 4 })

			expect(nodes.map(node => node.data)).toEqual(['cd'])
			expect(root.querySelector('p')!.childNodes).toHaveLength(2)
		})

		it('выделение ставится на отрезок: начало — в следующий узел, конец — в предыдущий', () => {
			const root = createRoot('<p>ab<b>cd</b></p>')

			selectChars(root, 2, 4)
			const selection = window.getSelection()!
			expect(selection.anchorNode).toBe(root.querySelector('b')!.firstChild)
			expect(selection.anchorOffset).toBe(0)
			expect(selection.focusNode).toBe(root.querySelector('b')!.firstChild)
			expect(selection.focusOffset).toBe(2)

			selectChars(root, 1, 1)
			expect(window.getSelection()!.isCollapsed).toBe(true)
		})

		it('смещение за концом текста — конец последнего узла, пустая область — сама область', () => {
			const root = createRoot('<p>ab</p>')
			selectChars(root, 10, 10)
			expect(window.getSelection()!.anchorOffset).toBe(2)

			const empty = createRoot('')
			selectChars(empty, 0, 0)
			expect(window.getSelection()!.anchorNode).toBe(empty)
		})
	})

	describe('inlineTree', () => {
		it('closestTag ищет предка в пределах области, сам узел не считается', () => {
			const root = createRoot('<p><b><i>x</i></b></p>')
			const text = root.querySelector('i')!.firstChild!

			expect(closestTag(text, ['B'], root)).toBe(root.querySelector('b'))
			expect(closestTag(text, ['U'], root)).toBeNull()
			expect(closestTag(root.querySelector('p')!, ['B'], root)).toBeNull()
			expect(closestTag(root, ['B'], root)).toBeNull()
		})

		it('isEmptyFragment: пустые обёртки и br — не пусто для br, текст и медиа — не пусто', () => {
			const empty = document.createDocumentFragment()
			empty.append(document.createElement('i'))
			expect(isEmptyFragment(empty)).toBe(true)

			const withText = document.createDocumentFragment()
			withText.append(' ')
			expect(isEmptyFragment(withText)).toBe(false)

			const withBreak = document.createDocumentFragment()
			withBreak.append(document.createElement('br'))
			expect(isEmptyFragment(withBreak)).toBe(false)
		})

		it('unwrapFrom разрезает предка вокруг узла и оставляет остальные обёртки', () => {
			const root = createRoot('<p><b>aa<i>bb<u>X</u>cc</i>dd</b></p>')
			const text = root.querySelector('u')!.firstChild!

			unwrapFrom(text, ['B'], root)
			normalizeInline(root)

			expect(root.innerHTML).toBe('<p><b>aa<i>bb</i></b><i><u>X</u></i><b><i>cc</i>dd</b></p>')
		})

		it('unwrapFrom снимает вложенные обёртки подряд и не теряет пробелы по краям', () => {
			const root = createRoot('<p><b> <b>x</b> </b></p>')

			unwrapFrom(root.querySelector('b b')!.firstChild!, ['B'], root)

			expect(root.textContent).toBe(' x ')
			expect(root.querySelector('b b')).toBeNull()
		})

		it('normalizeInline сливает одинаковых соседей, убирает пустые и склеивает текст', () => {
			const root = createRoot(
				'<p><b>a</b><b>b</b><i>c</i><b></b><span style="color: red">d</span><span style="color: blue">e</span></p>',
			)

			normalizeInline(root)

			expect(root.innerHTML).toBe('<p><b>ab</b><i>c</i><span style="color: red">d</span><span style="color: blue">e</span></p>')
		})

		it('wrapNode оборачивает узел', () => {
			const root = createRoot('<p>x</p>')
			const text = root.querySelector('p')!.firstChild!

			wrapNode(text, document.createElement('em'))

			expect(root.innerHTML).toBe('<p><em>x</em></p>')
		})
	})

	describe('toggleInlineFormat', () => {
		it('без выделения в области false', () => {
			expect(toggleInlineFormat(createRoot('<p>a</p>'), BOLD)).toBe(false)
		})

		it('оформляет выделенное, слова сохраняют выделение', () => {
			const root = createRoot('<p>hello world</p>')
			selectChars(root, 0, 5)

			expect(toggleInlineFormat(root, BOLD)).toBe(true)

			expect(root.innerHTML).toBe('<p><b>hello</b> world</p>')
			expect(window.getSelection()!.toString()).toBe('hello')
		})

		it('если всё выделенное уже оформлено, снимает; если часть — доводит до полного', () => {
			const root = createRoot('<p><b>he</b>llo</p>')
			selectChars(root, 0, 5)
			toggleInlineFormat(root, BOLD)
			expect(root.innerHTML).toBe('<p><b>hello</b></p>')

			selectChars(root, 0, 5)
			toggleInlineFormat(root, BOLD)
			expect(root.innerHTML).toBe('<p>hello</p>')
		})

		it('снимает часть слова внутри оформленного текста, остальное оформление остаётся', () => {
			const root = createRoot('<p><strong>hello</strong></p>')
			selectChars(root, 1, 3)

			toggleInlineFormat(root, BOLD)

			expect(root.innerHTML).toBe('<p><strong>h</strong>el<strong>lo</strong></p>')
		})

		it('работает через несколько абзацев и узлов', () => {
			const root = createRoot('<p>ab<i>cd</i></p><p>ef</p>')
			selectChars(root, 1, 5)

			toggleInlineFormat(root, BOLD)

			expect(root.innerHTML).toBe('<p>a<b>b</b><i><b>cd</b></i></p><p><b>e</b>f</p>')
		})

		it('выделено только изображение — это каретка: ставится заглушка', () => {
			const root = createRoot('<p><img src="a.png" alt=""></p>')
			const parent = root.querySelector('p')!
			selectNodes([parent, 0], [parent, 1])

			expect(toggleInlineFormat(root, BOLD)).toBe(true)

			expect(stripPlaceholders(root.innerHTML)).toBe('<p><img src="a.png" alt=""></p>')
		})

		it('каретка вне оформления: появляется обёртка с заглушкой, каретка внутри', () => {
			const root = createRoot('<p>ab</p>')
			selectChars(root, 1, 1)

			expect(toggleInlineFormat(root, BOLD)).toBe(true)

			const bold = root.querySelector('b')!
			expect(bold.textContent).toBe(PLACEHOLDER)
			expect(window.getSelection()!.anchorNode).toBe(bold.firstChild)
			expect(window.getSelection()!.anchorOffset).toBe(1)
		})

		it('каретка внутри оформленного текста: оформление обрывается, хвост остаётся оформленным', () => {
			const root = createRoot('<p><b>abcd</b></p>')
			selectChars(root, 2, 2)

			toggleInlineFormat(root, BOLD)

			expect(stripPlaceholders(root.innerHTML)).toBe('<p><b>ab</b><b>cd</b></p>')
			expect(window.getSelection()!.anchorNode!.textContent).toBe(PLACEHOLDER)
		})

		it('каретка в конце оформленного текста: хвоста нет, новое оформление не создаётся', () => {
			const root = createRoot('<p><b>ab</b></p>')
			selectChars(root, 2, 2)

			toggleInlineFormat(root, BOLD)

			expect(stripPlaceholders(root.innerHTML)).toBe('<p><b>ab</b></p>')
		})

		it('каретка в начале оформленного текста: пустая голова удаляется', () => {
			const root = createRoot('<p>x<b>ab</b></p>')
			const bold = root.querySelector('b')!.firstChild!
			selectNodes([bold, 0], [bold, 0])

			toggleInlineFormat(root, BOLD)

			expect(stripPlaceholders(root.innerHTML)).toBe('<p>x<b>ab</b></p>')
			expect(root.querySelector('b')!.textContent).toBe('ab')
		})

		it('каретка на самом элементе оформления тоже считается внутри него', () => {
			const root = createRoot('<p><b>ab</b></p>')
			const bold = root.querySelector('b')!
			selectNodes([bold, 1], [bold, 1])

			toggleInlineFormat(root, BOLD)

			expect(stripPlaceholders(root.innerHTML)).toBe('<p><b>ab</b></p>')
		})

		it('другое начертание не мешает', () => {
			const root = createRoot('<p><i>ab</i></p>')
			selectChars(root, 0, 2)

			toggleInlineFormat(root, BOLD)
			toggleInlineFormat(root, ITALIC)

			expect(root.innerHTML).toBe('<p><b>ab</b></p>')
		})
	})

	describe('applyInlineStyle', () => {
		it('без выделения false', () => {
			expect(applyInlineStyle(createRoot('<p>a</p>'), 'color', 'red')).toBe(false)
		})

		it('красит выделенный текст, повторный выбор меняет цвет той же обёртки', () => {
			const root = createRoot('<p>hello world</p>')
			selectChars(root, 0, 5)

			expect(applyInlineStyle(root, 'color', '#ff0000')).toBe(true)
			expect(root.innerHTML).toBe('<p><span style="color: rgb(255, 0, 0);">hello</span> world</p>')

			selectChars(root, 0, 5)
			applyInlineStyle(root, 'color', '#00ff00')
			expect(root.innerHTML).toBe('<p><span style="color: rgb(0, 255, 0);">hello</span> world</p>')
		})

		it('цвет и фон складываются на одной обёртке', () => {
			const root = createRoot('<p>hello</p>')
			selectChars(root, 0, 5)

			applyInlineStyle(root, 'color', '#ff0000')
			selectChars(root, 0, 5)
			applyInlineStyle(root, 'background-color', '#ffff00')

			const span = root.querySelector('span')!
			expect(span.style.color).toBe('rgb(255, 0, 0)')
			expect(span.style.backgroundColor).toBe('rgb(255, 255, 0)')
		})

		it('текст внутри другого оформления оборачивается внутри него', () => {
			const root = createRoot('<p><b>hello</b></p>')
			selectChars(root, 0, 5)

			applyInlineStyle(root, 'color', '#ff0000')

			expect(root.innerHTML).toBe('<p><b><span style="color: rgb(255, 0, 0);">hello</span></b></p>')
		})

		it('каретка без выделения: пустой span с заглушкой для следующего набора', () => {
			const root = createRoot('<p>ab</p>')
			selectChars(root, 1, 1)

			expect(applyInlineStyle(root, 'color', '#ff0000')).toBe(true)

			expect(root.querySelector('span')!.style.color).toBe('rgb(255, 0, 0)')
			expect(window.getSelection()!.anchorOffset).toBe(1)
		})
	})

	describe('removeInlineFormatting', () => {
		it('снимает начертание, цвета и шрифты, ссылки и блоки остаются', () => {
			const root = createRoot(
				'<h2><b>a</b><span style="color: red">b</span><font color="red">c</font><a href="https://a.test"><u>d</u></a></h2>',
			)
			selectChars(root, 0, 4)

			expect(removeInlineFormatting(root)).toBe(true)

			expect(root.innerHTML).toBe('<h2>abc<a href="https://a.test">d</a></h2>')
		})

		it('без выделения и с каретой — false', () => {
			const root = createRoot('<p><b>ab</b></p>')
			expect(removeInlineFormatting(root)).toBe(false)

			selectChars(root, 1, 1)
			expect(removeInlineFormatting(root)).toBe(false)
		})
	})

	describe('ссылки', () => {
		it('wrapSelectionInLink оборачивает выделение, новая вкладка — атрибуты', () => {
			const root = createRoot('<p>hello world</p>')
			selectChars(root, 0, 5)

			expect(wrapSelectionInLink(root, { href: 'https://a.test', target: '_blank', rel: 'noopener noreferrer' })).toBe(true)

			expect(root.innerHTML).toBe('<p><a href="https://a.test" target="_blank" rel="noopener noreferrer">hello</a> world</p>')
		})

		it('ссылка без target и rel; прежние ссылки внутри выделения заменяются', () => {
			const root = createRoot('<p><a href="https://old.test">hello</a> world</p>')
			selectChars(root, 0, 11)

			wrapSelectionInLink(root, { href: 'https://new.test' })

			expect(root.innerHTML).toBe('<p><a href="https://new.test">hello world</a></p>')
		})

		it('без выделения и с кареткой — false', () => {
			const root = createRoot('<p>ab</p>')
			expect(wrapSelectionInLink(root, { href: 'https://a.test' })).toBe(false)

			selectChars(root, 1, 1)
			expect(wrapSelectionInLink(root, { href: 'https://a.test' })).toBe(false)
		})

		it('unlinkSelection снимает ссылки с выделенного, остальное остаётся', () => {
			const root = createRoot('<p><a href="https://a.test">hello world</a></p>')
			selectChars(root, 0, 5)

			expect(unlinkSelection(root)).toBe(true)

			expect(root.innerHTML).toBe('<p>hello<a href="https://a.test"> world</a></p>')
		})

		it('unlinkSelection без выделения и с кареткой — false', () => {
			const root = createRoot('<p><a href="https://a.test">ab</a></p>')
			expect(unlinkSelection(root)).toBe(false)

			selectChars(root, 1, 1)
			expect(unlinkSelection(root)).toBe(false)
			expect(root.querySelector('a')).not.toBeNull()
		})
	})

	describe('stripPlaceholders', () => {
		it('HTML без заглушек не меняется', () => {
			expect(stripPlaceholders('<p><span class="icon"></span></p>')).toBe('<p><span class="icon"></span></p>')
		})

		it('убирает заглушки и обёртки, в которые ничего не набрали, оставляя набранное', () => {
			const mark = 'data-rise-pending=""'
			const html = `<p>a<b ${mark}>${PLACEHOLDER}</b><span ${mark} style="color: red"><i ${mark}>${PLACEHOLDER}</i></span>b<u ${mark}>${PLACEHOLDER}text</u></p>`

			expect(stripPlaceholders(html)).toBe('<p>ab<u>text</u></p>')
		})
	})

	describe('выбор диапазона', () => {
		it('selectRange доступен для тестов вставки', () => {
			const root = createRoot('<p>ab</p>')
			const range = document.createRange()
			range.setStart(root.querySelector('p')!.firstChild!, 1)
			range.collapse(true)
			selectRange(range)
			expect(getTextRange(root)).toEqual({ start: 1, end: 1 })
		})
	})
})
