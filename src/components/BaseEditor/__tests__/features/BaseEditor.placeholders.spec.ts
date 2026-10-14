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

function renderWithPending(props: Record<string, unknown> = {}): HTMLElement {
	render(BaseEditor, { props: { modelValue: '<p>text</p>', ...props }, global: { stubs } })
	textbox().innerHTML = PENDING_HTML
	return textbox()
}

function placeCaret(node: Node, offset: number): void {
	window.getSelection()?.setBaseAndExtent(node, offset, node, offset)
}

function clipboardEvent(type: 'copy' | 'cut'): { event: Event; data: Record<string, string> } {
	const data: Record<string, string> = {}
	const event = new Event(type, { bubbles: true, cancelable: true })
	Object.defineProperty(event, 'clipboardData', { value: { setData: (format: string, value: string) => (data[format] = value) } })
	return { event, data }
}

function beforeInput(inputType: string): InputEvent {
	return new InputEvent('beforeinput', { inputType, data: 'x', bubbles: true, cancelable: true })
}

function selectPendingParagraph(content: HTMLElement): void {
	const text = content.querySelector('p')!.firstChild!
	window.getSelection()?.setBaseAndExtent(text, 0, content.querySelector('b')!.firstChild!, 1)
}

describe('BaseEditor: заполнители начертания', () => {
	afterEach(() => {
		window.getSelection()?.removeAllRanges()
		document.body.innerHTML = ''
	})

	describe('снятие вместе со следующей правкой', () => {
		it('selectionchange DOM не меняет, даже когда каретка ушла из заполнителя', () => {
			const content = renderWithPending()
			placeCaret(content.querySelector('p')!.firstChild!, 2)

			document.dispatchEvent(new Event('selectionchange'))

			expect(content.innerHTML).toBe(PENDING_HTML)
		})

		it('ввод вне заполнителя снимает его перед нативной вставкой', () => {
			const content = renderWithPending()
			placeCaret(content.querySelector('p')!.firstChild!, 2)

			content.dispatchEvent(beforeInput('insertText'))

			expect(content.innerHTML).toBe('<p>text</p>')
		})

		it('ввод внутри заполнителя его сохраняет', () => {
			const content = renderWithPending()
			placeCaret(content.querySelector('b')!.firstChild!, 1)

			content.dispatchEvent(beforeInput('insertText'))

			expect(content.innerHTML).toBe(PENDING_HTML)
		})

		it('во время композиции заполнитель не трогается', async () => {
			const content = renderWithPending()
			placeCaret(content.querySelector('p')!.firstChild!, 2)
			await fireEvent.compositionStart(content)

			content.dispatchEvent(beforeInput('insertCompositionText'))

			expect(content.innerHTML).toBe(PENDING_HTML)
		})

		it('после ухода каретки один Ctrl+Z отменяет последнюю видимую правку, а не невидимый шаг', async () => {
			render(BaseEditor, { props: { modelValue: '<p>text</p>' }, global: { stubs } })
			const content = textbox()
			const text = content.querySelector('p')!.firstChild as Text
			placeCaret(text, 4)
			await fireEvent.click(screen.getByRole('button', { name: 'Жирный' }))
			expect(content.innerHTML).toContain('data-rise-pending')

			placeCaret(text, 0)
			document.dispatchEvent(new Event('selectionchange'))
			content.dispatchEvent(beforeInput('insertText'))
			text.data = 'Xtext'
			await fireEvent.input(content)
			expect(content.textContent).toBe('Xtext')

			await fireEvent.keyDown(content, { key: 'z', ctrlKey: true })

			expect(content.textContent!.replaceAll(INVISIBLE, '')).toBe('text')
		})
	})

	describe('буфер обмена', () => {
		it('копирование кладёт очищенные HTML и текст, DOM не меняется', () => {
			const content = renderWithPending()
			selectPendingParagraph(content)
			const { event, data } = clipboardEvent('copy')

			content.dispatchEvent(event)

			expect(event.defaultPrevented).toBe(true)
			expect(data).toEqual({ 'text/html': 'text', 'text/plain': 'text' })
			expect(content.innerHTML).toBe(PENDING_HTML)
		})

		it('копирование нескольких блоков разделяет строки переводом', () => {
			render(BaseEditor, { props: { modelValue: '<p>one</p><p>two<br>three</p>' }, global: { stubs } })
			const content = textbox()
			window.getSelection()?.setBaseAndExtent(content.firstElementChild!.firstChild!, 0, content.lastElementChild!.lastChild!, 5)
			const { event, data } = clipboardEvent('copy')

			content.dispatchEvent(event)

			expect(data['text/plain']).toBe('one\ntwo\nthree')
			expect(data['text/html']).toBe('<p>one</p><p>two<br>three</p>')
		})

		it('копирование без выделения или без clipboardData остаётся нативным', () => {
			const content = renderWithPending()
			placeCaret(content.querySelector('p')!.firstChild!, 2)
			const collapsed = clipboardEvent('copy')
			content.dispatchEvent(collapsed.event)
			expect(collapsed.event.defaultPrevented).toBe(false)

			selectPendingParagraph(content)
			const bare = new Event('copy', { bubbles: true, cancelable: true })
			content.dispatchEvent(bare)
			expect(bare.defaultPrevented).toBe(false)
		})

		it('вырезание кладёт очищенное в буфер и удаляет выделение одним шагом истории', async () => {
			render(BaseEditor, { props: { modelValue: '<p>one two</p>' }, global: { stubs } })
			const content = textbox()
			const text = content.querySelector('p')!.firstChild!
			window.getSelection()?.setBaseAndExtent(text, 0, text, 3)
			const { event, data } = clipboardEvent('cut')

			content.dispatchEvent(event)

			expect(event.defaultPrevented).toBe(true)
			expect(data).toEqual({ 'text/html': 'one', 'text/plain': 'one' })
			expect(content.innerHTML).toBe('<p> two</p>')

			await fireEvent.keyDown(content, { key: 'z', ctrlKey: true })
			expect(content.innerHTML).toBe('<p>one two</p>')
		})

		it('вырезание всего содержимого абзаца оставляет в нём заглушку', () => {
			render(BaseEditor, { props: { modelValue: '<p>one</p>' }, global: { stubs } })
			const content = textbox()
			const text = content.querySelector('p')!.firstChild!
			window.getSelection()?.setBaseAndExtent(text, 0, text, 3)

			content.dispatchEvent(clipboardEvent('cut').event)

			expect(content.innerHTML).toBe('<p><br></p>')
		})

		it('в режиме чтения вырезание только копирует', () => {
			render(BaseEditor, { props: { modelValue: '<p>one</p>', isReadonly: true }, global: { stubs } })
			const content = textbox()
			const text = content.querySelector('p')!.firstChild!
			window.getSelection()?.setBaseAndExtent(text, 0, text, 3)
			const { event, data } = clipboardEvent('cut')

			content.dispatchEvent(event)

			expect(data['text/plain']).toBe('one')
			expect(content.innerHTML).toBe('<p>one</p>')
		})
	})

	it('режим кода показывает HTML без заполнителей', async () => {
		renderWithPending()

		await fireEvent.click(screen.getByRole('button', { name: 'Режим кода' }))
		await nextTick()

		expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('<p>text</p>')
	})
})
