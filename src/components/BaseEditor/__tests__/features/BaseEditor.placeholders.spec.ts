import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseEditor from '../../ui/BaseEditor.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

const stubs = { BaseTooltip: { template: '<div class="tooltip-stub"><slot /></div>' } }
const MARK = 'data-rise-pending=""'
const INVISIBLE = '​'
const PENDING_HTML = `<p>text<b ${MARK}>${INVISIBLE}</b></p>`

function textbox(): HTMLElement {
	return screen.getByRole('textbox')
}

function renderWithPending(): HTMLElement {
	render(BaseEditor, { props: { modelValue: '<p>text</p>' }, global: { stubs } })
	textbox().innerHTML = PENDING_HTML
	return textbox()
}

function placeCaret(node: Node, offset: number): void {
	window.getSelection()?.setBaseAndExtent(node, offset, node, offset)
}

describe('BaseEditor: заполнители начертания', () => {
	afterEach(() => {
		window.getSelection()?.removeAllRanges()
		document.body.innerHTML = ''
	})

	it('когда каретка ушла из пустой обёртки, невидимый символ снимается из живого DOM', () => {
		const content = renderWithPending()
		placeCaret(content.querySelector('p')!.firstChild!, 2)

		document.dispatchEvent(new Event('selectionchange'))

		expect(content.innerHTML).toBe('<p>text</p>')
	})

	it('пока каретка внутри заполнителя, он остаётся', () => {
		const content = renderWithPending()
		placeCaret(content.querySelector('b')!.firstChild!, 1)

		document.dispatchEvent(new Event('selectionchange'))

		expect(content.innerHTML).toBe(PENDING_HTML)
	})

	it('в режиме выделения (не каретка) заполнители не трогаются', () => {
		const content = renderWithPending()
		const text = content.querySelector('p')!.firstChild!
		window.getSelection()?.setBaseAndExtent(text, 0, text, 3)

		document.dispatchEvent(new Event('selectionchange'))

		expect(content.innerHTML).toBe(PENDING_HTML)
	})

	it('копирование и вырезание очищают DOM, чтобы невидимый символ не попал в буфер', async () => {
		const content = renderWithPending()
		const text = content.querySelector('p')!.firstChild!
		window.getSelection()?.setBaseAndExtent(text, 0, content.querySelector('b')!.firstChild!, 1)

		await fireEvent.copy(content)
		expect(content.innerHTML).toBe('<p>text</p>')

		content.innerHTML = PENDING_HTML
		await fireEvent.cut(content)
		expect(content.innerHTML).toBe('<p>text</p>')
	})

	it('копирование без заполнителей ничего не меняет', async () => {
		const content = renderWithPending()
		content.innerHTML = '<p>a</p>'

		await fireEvent.copy(content)

		expect(content.innerHTML).toBe('<p>a</p>')
	})

	it('режим кода показывает HTML без заполнителей', async () => {
		const content = renderWithPending()
		expect(content).toBeInTheDocument()

		await fireEvent.click(screen.getByRole('button', { name: 'Режим кода' }))
		await nextTick()

		expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('<p>text</p>')
	})
})
