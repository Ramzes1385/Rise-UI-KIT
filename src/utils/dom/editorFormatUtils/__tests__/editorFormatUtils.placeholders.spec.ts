import { selectTextRange } from '../helpers/textRange'
import { PENDING_ATTR, PLACEHOLDER } from '../helpers/inlineTree'
import {
	applyInlineStyle,
	releasePlaceholders,
	stripPlaceholders,
	toggleInlineFormat,
	unlinkSelection,
	wrapSelectionInLink,
} from '../editorFormatUtils'

const BOLD = { tag: 'b', tags: ['B', 'STRONG'] }
const LIST = '<ul>\n<li>one</li>\n<li>two</li>\n</ul>'

function createRoot(html: string): HTMLDivElement {
	const root = document.createElement('div')
	root.innerHTML = html
	document.body.appendChild(root)
	return root
}

function placeCaret(node: Node, offset: number): void {
	window.getSelection()?.setBaseAndExtent(node, offset, node, offset)
}

describe('editorFormatUtils: заполнители и пробелы между блоками', () => {
	afterEach(() => {
		window.getSelection()?.removeAllRanges()
		document.body.innerHTML = ''
	})

	describe('пробельные узлы между блоками', () => {
		it('начертание на выделении всего списка не оборачивает пробелы между пунктами', () => {
			const root = createRoot(LIST)
			selectTextRange(root, { start: 0, end: root.textContent!.length })

			toggleInlineFormat(root, BOLD)

			expect(root.innerHTML).toBe('<ul>\n<li><b>one</b></li>\n<li><b>two</b></li>\n</ul>')
		})

		it('цвет не создаёт span прямо в списке', () => {
			const root = createRoot(LIST)
			selectTextRange(root, { start: 0, end: root.textContent!.length })

			applyInlineStyle(root, 'color', 'red')

			expect(root.querySelectorAll('ul > span')).toHaveLength(0)
			expect(root.querySelectorAll('li > span')).toHaveLength(2)
		})

		it('ссылка не создаёт a прямо в списке, а снятие ссылки пробелы не трогает', () => {
			const root = createRoot(LIST)
			selectTextRange(root, { start: 0, end: root.textContent!.length })

			wrapSelectionInLink(root, { href: 'https://a.test' })

			expect(root.querySelectorAll('ul > a')).toHaveLength(0)
			expect(root.querySelectorAll('li > a')).toHaveLength(2)
			expect(unlinkSelection(root)).toBe(true)
			expect(root.querySelectorAll('a')).toHaveLength(0)
		})

		it('пробелы между блоками прямо в области и в таблице тоже пропускаются', () => {
			const root = createRoot('<p>a</p>\n<table>\n<tbody>\n<tr>\n<td>b</td>\n</tr>\n</tbody>\n</table>\n')
			selectTextRange(root, { start: 0, end: root.textContent!.length })

			toggleInlineFormat(root, BOLD)

			expect(root.innerHTML).toBe('<p><b>a</b></p>\n<table>\n<tbody>\n<tr>\n<td><b>b</b></td>\n</tr>\n</tbody>\n</table>\n')
		})

		it('пробел внутри абзаца остаётся содержимым и оформляется', () => {
			const root = createRoot('<p><i>a</i> <i>b</i></p>')
			selectTextRange(root, { start: 0, end: 3 })

			toggleInlineFormat(root, BOLD)

			expect(root.innerHTML).toBe('<p><i><b>a</b></i><b> </b><i><b>b</b></i></p>')
		})
	})

	describe('метка заполнителя', () => {
		it('начертание на каретке ставит помеченную обёртку с невидимым символом', () => {
			const root = createRoot('<p>text</p>')
			placeCaret(root.querySelector('p')!.firstChild!, 4)

			toggleInlineFormat(root, BOLD)

			const wrapper = root.querySelector('b')!
			expect(wrapper.hasAttribute(PENDING_ATTR)).toBe(true)
			expect(wrapper.textContent).toBe(PLACEHOLDER)
		})

		it('цвет на каретке ставит помеченный span', () => {
			const root = createRoot('<p>text</p>')
			placeCaret(root.querySelector('p')!.firstChild!, 4)

			applyInlineStyle(root, 'color', 'red')

			expect(root.querySelector('span')!.hasAttribute(PENDING_ATTR)).toBe(true)
		})

		it('выход из начертания ставит помеченную пустую обёртку после оформленного текста', () => {
			const root = createRoot('<p><b>bold</b></p>')
			placeCaret(root.querySelector('b')!.firstChild!, 4)

			toggleInlineFormat(root, BOLD)

			const holder = root.querySelector('span')!
			expect(holder.hasAttribute(PENDING_ATTR)).toBe(true)
			expect(window.getSelection()!.anchorNode!.parentElement).toBe(holder)
		})
	})

	describe('stripPlaceholders', () => {
		it('без меток HTML не меняется, даже если в нём есть невидимые символы пользователя', () => {
			const html = `<p>a${PLACEHOLDER}b<b>${PLACEHOLDER}</b></p>`

			expect(stripPlaceholders(html)).toBe(html)
		})

		it('убирает помеченные пустые обёртки и невидимый символ набранного текста', () => {
			const html =
				`<p>a<b ${PENDING_ATTR}="">${PLACEHOLDER}</b><span ${PENDING_ATTR}="" style="color: red"><i ${PENDING_ATTR}="">${PLACEHOLDER}</i></span>` +
				`b<u ${PENDING_ATTR}="">${PLACEHOLDER}text</u></p>`

			expect(stripPlaceholders(html)).toBe('<p>ab<u>text</u></p>')
		})

		it('не трогает пустые элементы без метки (иконки-шрифты) и невидимые символы пользователя', () => {
			const html = `<p><span class="icon"></span>x${PLACEHOLDER}y<b ${PENDING_ATTR}="">${PLACEHOLDER}</b></p>`

			expect(stripPlaceholders(html)).toBe(`<p><span class="icon"></span>x${PLACEHOLDER}y</p>`)
		})

		it('в помеченном тексте убирается только первый невидимый символ', () => {
			const html = `<p><b ${PENDING_ATTR}="">${PLACEHOLDER}a${PLACEHOLDER}b</b></p>`

			expect(stripPlaceholders(html)).toBe(`<p><b>a${PLACEHOLDER}b</b></p>`)
		})

		it('помеченная обёртка с текстом без невидимого символа теряет только метку', () => {
			const html = `<p><b ${PENDING_ATTR}="">ab</b></p>`

			expect(stripPlaceholders(html)).toBe('<p><b>ab</b></p>')
		})

		it('помеченный голый span с текстом разворачивается', () => {
			const html = `<p>a<span ${PENDING_ATTR}="">${PLACEHOLDER}b</span></p>`

			expect(stripPlaceholders(html)).toBe('<p>ab</p>')
		})

		it('абзац, опустевший после уборки обёртки, получает <br>', () => {
			const html = `<p><b ${PENDING_ATTR}="">${PLACEHOLDER}</b></p>`

			expect(stripPlaceholders(html)).toBe('<p><br></p>')
		})

		it('пустая обёртка внутри inline-родителя не добавляет <br>', () => {
			const html = `<p><a href="#">x<b ${PENDING_ATTR}="">${PLACEHOLDER}</b></a></p>`

			expect(stripPlaceholders(html)).toBe('<p><a href="#">x</a></p>')
		})
	})

	describe('releasePlaceholders', () => {
		it('без заполнителей ничего не меняет и возвращает false', () => {
			const root = createRoot('<p>text</p>')

			expect(releasePlaceholders(root)).toBe(false)
			expect(root.innerHTML).toBe('<p>text</p>')
		})

		it('снимает заполнители, когда каретка ушла', () => {
			const root = createRoot('<p>text</p>')
			const text = root.querySelector('p')!.firstChild!
			placeCaret(text, 4)
			toggleInlineFormat(root, BOLD)

			placeCaret(root.querySelector('p')!.firstChild!, 0)

			expect(releasePlaceholders(root, window.getSelection()!.anchorNode)).toBe(true)
			expect(root.innerHTML).toBe('<p>text</p>')
		})

		it('оставляет заполнитель, в котором стоит каретка', () => {
			const root = createRoot('<p>text</p>')
			placeCaret(root.querySelector('p')!.firstChild!, 4)
			toggleInlineFormat(root, BOLD)

			expect(releasePlaceholders(root, window.getSelection()!.anchorNode)).toBe(false)
			expect(root.querySelector('b')!.textContent).toBe(PLACEHOLDER)
		})

		it('набранный в заполнителе текст остаётся без метки и невидимого символа', () => {
			const root = createRoot('<p>text</p>')
			placeCaret(root.querySelector('p')!.firstChild!, 4)
			toggleInlineFormat(root, BOLD)
			const marker = root.querySelector('b')!.firstChild as Text
			marker.data = `${PLACEHOLDER}new`

			releasePlaceholders(root)

			expect(root.innerHTML).toBe('<p>text<b>new</b></p>')
		})
	})
})
