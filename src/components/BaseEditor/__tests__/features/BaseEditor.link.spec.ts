import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseEditor from '../../ui/BaseEditor.vue'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

const stubs = { BaseTooltip: { template: '<div class="tooltip-stub"><slot /></div>' } }
const LINKED = '<p>Текст <a href="https://old.test">ссылка</a> и ещё слова</p>'

function selectIn(node: Node, start: number, end: number): void {
	const range = document.createRange()
	range.setStart(node, start)
	range.setEnd(node, end)
	const selection = window.getSelection()
	selection?.removeAllRanges()
	selection?.addRange(range)
}

async function selectLinkText(textbox: HTMLElement): Promise<void> {
	const link = textbox.querySelector('a') as HTMLAnchorElement
	selectIn(link.firstChild as Text, 1, 4)
	await fireEvent.keyUp(textbox)
}

function lastEmitted(wrapper: ReturnType<typeof render>): string {
	const all = (wrapper.emitted('update:modelValue') ?? []) as string[][]
	return all[all.length - 1][0]
}

describe('BaseEditor: диалог ссылки', () => {
	beforeEach(() => {
		Range.prototype.getClientRects = vi.fn(() => [{ left: 20, bottom: 40, width: 10, height: 10 }] as unknown as DOMRectList)
		Range.prototype.getBoundingClientRect = vi.fn(() => ({ left: 20, bottom: 40, width: 10, height: 10 }) as DOMRect)
		vi.spyOn(window, 'prompt').mockReturnValue('https://prompt.test')
	})

	afterEach(() => {
		vi.restoreAllMocks()
		window.getSelection()?.removeAllRanges()
		document.body.innerHTML = ''
	})

	it('кнопка «Ссылка» открывает диалог с полем адреса в фокусе, window.prompt не вызывается', async () => {
		render(BaseEditor, { props: { modelValue: LINKED }, global: { stubs } })
		await selectLinkText(screen.getByRole('textbox'))

		await fireEvent.click(screen.getByRole('button', { name: 'Ссылка' }))

		const dialog = await screen.findByRole('dialog', { name: 'Ссылка' })
		await waitFor(() => expect(screen.getByLabelText('Адрес ссылки')).toHaveFocus())
		expect(dialog).toBeInTheDocument()
		expect(window.prompt).not.toHaveBeenCalled()
	})

	it('у существующей ссылки поля заполнены, «Применить» меняет адрес и включает новую вкладку', async () => {
		const wrapper = render(BaseEditor, { props: { modelValue: LINKED }, global: { stubs } })
		const textbox = screen.getByRole('textbox')
		await selectLinkText(textbox)
		await fireEvent.click(screen.getByRole('button', { name: 'Ссылка' }))
		const input = (await screen.findByLabelText('Адрес ссылки')) as HTMLInputElement
		expect(input).toHaveValue('https://old.test')
		expect(screen.getByRole('button', { name: 'Удалить ссылку' })).toBeInTheDocument()

		await fireEvent.update(input, 'new.test')
		await fireEvent.click(screen.getByRole('checkbox', { name: 'Открыть в новой вкладке' }))
		await fireEvent.click(screen.getByRole('button', { name: 'Применить' }))

		await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
		expect(lastEmitted(wrapper)).toContain('<a href="https://new.test" target="_blank" rel="noopener noreferrer">ссылка</a>')
		expect(textbox).toHaveFocus()
	})

	it('Enter в поле адреса применяет ссылку', async () => {
		const wrapper = render(BaseEditor, { props: { modelValue: LINKED }, global: { stubs } })
		await selectLinkText(screen.getByRole('textbox'))
		await fireEvent.click(screen.getByRole('button', { name: 'Ссылка' }))
		const input = await screen.findByLabelText('Адрес ссылки')

		await fireEvent.update(input, 'https://enter.test')
		await fireEvent.keyDown(input, { key: 'Enter' })

		expect(lastEmitted(wrapper)).toContain('href="https://enter.test"')
	})

	it('Enter на кнопке «Удалить ссылку», в флажке и при подтверждении IME ссылку не применяет', async () => {
		const wrapper = render(BaseEditor, { props: { modelValue: LINKED }, global: { stubs } })
		await selectLinkText(screen.getByRole('textbox'))
		await fireEvent.click(screen.getByRole('button', { name: 'Ссылка' }))
		const input = await screen.findByLabelText('Адрес ссылки')
		await fireEvent.update(input, 'https://ime.test')

		const onButton = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
		screen.getByRole('button', { name: 'Удалить ссылку' }).dispatchEvent(onButton)
		const onCheckbox = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
		screen.getByRole('checkbox', { name: 'Открыть в новой вкладке' }).dispatchEvent(onCheckbox)
		const composing = new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true, cancelable: true })
		input.dispatchEvent(composing)
		const legacyIme = new KeyboardEvent('keydown', { key: 'Enter', keyCode: 229, bubbles: true, cancelable: true })
		input.dispatchEvent(legacyIme)

		expect([onButton, onCheckbox, composing, legacyIme].map(event => event.defaultPrevented)).toEqual([false, false, false, false])
		expect(screen.getByRole('dialog')).toBeInTheDocument()
		expect(wrapper.emitted('update:modelValue')).toBeUndefined()
	})

	it.each(['javascript:alert(1)', '', 'data:text/html,x'])('адрес «%s» отклоняется с сообщением, диалог остаётся', async value => {
		const wrapper = render(BaseEditor, { props: { modelValue: LINKED }, global: { stubs } })
		await selectLinkText(screen.getByRole('textbox'))
		await fireEvent.click(screen.getByRole('button', { name: 'Ссылка' }))
		const input = await screen.findByLabelText('Адрес ссылки')

		await fireEvent.update(input, value)
		await fireEvent.click(screen.getByRole('button', { name: 'Применить' }))

		expect(await screen.findByText('Введите адрес: http, https, mailto или tel')).toBeInTheDocument()
		expect(input).toHaveAttribute('aria-invalid', 'true')
		expect(screen.getByRole('dialog')).toBeInTheDocument()
		expect(wrapper.emitted('update:modelValue')).toBeUndefined()

		await fireEvent.update(input, 'ok.test')
		expect(screen.queryByText('Введите адрес: http, https, mailto или tel')).toBeNull()
	})

	it('«Удалить ссылку» снимает ссылку, текст остаётся, фокус в редакторе', async () => {
		const wrapper = render(BaseEditor, { props: { modelValue: LINKED }, global: { stubs } })
		const textbox = screen.getByRole('textbox')
		await selectLinkText(textbox)
		await fireEvent.click(screen.getByRole('button', { name: 'Ссылка' }))

		await fireEvent.click(await screen.findByRole('button', { name: 'Удалить ссылку' }))

		expect(lastEmitted(wrapper)).toBe('<p>Текст ссылка и ещё слова</p>')
		expect(textbox).toHaveFocus()
	})

	it('Escape закрывает диалог и возвращает фокус в редактор', async () => {
		render(BaseEditor, { props: { modelValue: LINKED }, global: { stubs } })
		const textbox = screen.getByRole('textbox')
		await selectLinkText(textbox)
		await fireEvent.click(screen.getByRole('button', { name: 'Ссылка' }))
		const input = await screen.findByLabelText('Адрес ссылки')
		await waitFor(() => expect(input).toHaveFocus())

		await fireEvent.keyDown(input, { key: 'Escape' })

		await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
		expect(textbox).toHaveFocus()
	})

	it('Escape в режиме кода возвращает фокус в поле кода', async () => {
		render(BaseEditor, { props: { modelValue: '<p>слово</p>' }, global: { stubs } })
		await fireEvent.click(screen.getByRole('button', { name: 'Режим кода' }))
		const code = screen.getByRole('textbox', { name: 'HTML-код' })
		await fireEvent.click(screen.getByRole('button', { name: 'Ссылка' }))
		const input = await screen.findByLabelText('Адрес ссылки')
		await waitFor(() => expect(input).toHaveFocus())

		await fireEvent.keyDown(input, { key: 'Escape' })

		await waitFor(() => expect(code).toHaveFocus())
	})

	it('Ctrl+K открывает диалог, в режиме чтения — нет', async () => {
		const wrapper = render(BaseEditor, { props: { modelValue: LINKED }, global: { stubs } })
		const textbox = screen.getByRole('textbox')
		await selectLinkText(textbox)

		const hotkey = new KeyboardEvent('keydown', { code: 'KeyK', key: 'k', ctrlKey: true, bubbles: true, cancelable: true })
		textbox.dispatchEvent(hotkey)
		expect(hotkey.defaultPrevented).toBe(true)
		expect(await screen.findByRole('dialog', { name: 'Ссылка' })).toBeInTheDocument()

		await wrapper.rerender({ isReadonly: true })
		await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
		const locked = new KeyboardEvent('keydown', { code: 'KeyK', key: 'k', ctrlKey: true, bubbles: true, cancelable: true })
		screen.getByRole('textbox').dispatchEvent(locked)
		await nextTick()
		expect(screen.queryByRole('dialog')).toBeNull()
	})

	it('в режиме кода выделение оборачивается тегом ссылки', async () => {
		const wrapper = render(BaseEditor, { props: { modelValue: '<p>слово</p>' }, global: { stubs } })
		await fireEvent.click(screen.getByRole('button', { name: 'Режим кода' }))
		const code = screen.getByRole('textbox', { name: 'HTML-код' }) as HTMLTextAreaElement
		code.setSelectionRange(3, 8)

		await fireEvent.click(screen.getByRole('button', { name: 'Ссылка' }))
		expect(screen.queryByRole('button', { name: 'Удалить ссылку' })).toBeNull()
		await fireEvent.update(await screen.findByLabelText('Адрес ссылки'), 'https://code.test')
		await fireEvent.click(screen.getByRole('checkbox', { name: 'Открыть в новой вкладке' }))
		await fireEvent.click(screen.getByRole('button', { name: 'Применить' }))

		expect(lastEmitted(wrapper)).toBe('<p><a href="https://code.test" target="_blank" rel="noopener noreferrer">слово</a></p>')
		await waitFor(() => expect(code).toHaveFocus())
	})
})

describe('BaseEditor: формат под кареткой', () => {
	afterEach(() => {
		vi.restoreAllMocks()
		window.getSelection()?.removeAllRanges()
		document.body.innerHTML = ''
	})

	async function nextFrame(): Promise<void> {
		await new Promise(resolve => requestAnimationFrame(() => resolve(null)))
		await nextTick()
	}

	function toolbarText(): string {
		return screen.getByRole('toolbar').textContent ?? ''
	}

	it('селект «Формат» показывает блок под кареткой по selectionchange', async () => {
		render(BaseEditor, { props: { modelValue: '<p>абзац</p><h2>заголовок</h2><blockquote>цитата</blockquote>' }, global: { stubs } })
		const textbox = screen.getByRole('textbox')

		selectIn(textbox.querySelector('h2')!.firstChild!, 1, 1)
		document.dispatchEvent(new Event('selectionchange'))
		document.dispatchEvent(new Event('selectionchange'))
		await nextFrame()
		expect(toolbarText()).toContain('Заголовок 2')

		selectIn(textbox.querySelector('p')!.firstChild!, 1, 1)
		document.dispatchEvent(new Event('selectionchange'))
		await nextFrame()
		expect(toolbarText()).toContain('Параграф')

		selectIn(textbox.querySelector('blockquote')!.firstChild!, 1, 1)
		document.dispatchEvent(new Event('selectionchange'))
		await nextFrame()
		expect(toolbarText()).not.toContain('Параграф')
		expect(toolbarText()).toContain('Формат')
	})

	it('выделение вне редактора и композиция селект не обновляют', async () => {
		render(BaseEditor, {
			props: { modelValue: '<h3>заголовок</h3>' },
			global: { stubs },
		})
		const textbox = screen.getByRole('textbox')
		const outside = document.createElement('p')
		outside.textContent = 'вне'
		document.body.appendChild(outside)

		selectIn(outside.firstChild!, 0, 1)
		document.dispatchEvent(new Event('selectionchange'))
		await nextFrame()
		expect(toolbarText()).not.toContain('Заголовок 3')

		await fireEvent.compositionStart(textbox)
		selectIn(textbox.querySelector('h3')!.firstChild!, 1, 1)
		document.dispatchEvent(new Event('selectionchange'))
		await nextFrame()
		expect(toolbarText()).not.toContain('Заголовок 3')
		await fireEvent.compositionEnd(textbox)
	})

	it('после размонтирования подписка на selectionchange снимается', async () => {
		const removeSpy = vi.spyOn(document, 'removeEventListener')
		const { unmount } = render(BaseEditor, { global: { stubs } })

		unmount()

		expect(removeSpy).toHaveBeenCalledWith('selectionchange', expect.any(Function))
	})
})
