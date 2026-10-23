import '@testing-library/jest-dom/vitest'
import { h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import BaseEditor from '../../ui/BaseEditor.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { BaseEditorExpose, BaseEditorToolbarSlotProps } from '../../types/BaseEditor.types'

const stubs = { BaseTooltip: { template: '<div class="tooltip-stub"><slot /></div>' } }

function caretAtEnd(textbox: HTMLElement): void {
	const walker = document.createTreeWalker(textbox, NodeFilter.SHOW_TEXT)
	let last: Text | null = null
	while (walker.nextNode()) last = walker.currentNode as Text
	const selection = window.getSelection()
	if (last) selection?.setBaseAndExtent(last, last.data.length, last, last.data.length)
	else selection?.setBaseAndExtent(textbox, textbox.childNodes.length, textbox, textbox.childNodes.length)
}

async function typeChar(textbox: HTMLElement, html: string, inputType = 'insertText'): Promise<void> {
	await fireEvent(textbox, new InputEvent('beforeinput', { inputType, bubbles: true, cancelable: true }))
	textbox.innerHTML = html
	caretAtEnd(textbox)
	await fireEvent(textbox, new InputEvent('input', { inputType, bubbles: true }))
}

async function press(target: HTMLElement, init: KeyboardEventInit): Promise<KeyboardEvent> {
	const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init })
	target.dispatchEvent(event)
	await nextTick()
	return event
}

const undoKey = (target: HTMLElement) => press(target, { key: 'z', code: 'KeyZ', ctrlKey: true })
const redoKey = (target: HTMLElement) => press(target, { key: 'y', code: 'KeyY', ctrlKey: true })
const redoShiftKey = (target: HTMLElement) => press(target, { key: 'Z', code: 'KeyZ', ctrlKey: true, shiftKey: true })

function emitted(wrapper: ReturnType<typeof render>): string[] {
	return ((wrapper.emitted('update:modelValue') ?? []) as string[][]).map(args => args[0])
}

function selectWord(textbox: HTMLElement, start: number, end: number): void {
	const text = textbox.querySelector('p')!.firstChild as Text
	window.getSelection()?.setBaseAndExtent(text, start, text, end)
}

describe('BaseEditor: история отмены', () => {
	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['Date'] })
		vi.setSystemTime(new Date('2025-05-15T10:00:00Z'))
	})

	afterEach(() => {
		vi.useRealTimers()
		vi.restoreAllMocks()
		window.getSelection()?.removeAllRanges()
		document.body.innerHTML = ''
	})

	it('набор, команда, набор: Ctrl+Z отменяет по шагам, Ctrl+Y и Ctrl+Shift+Z повторяют', async () => {
		const wrapper = render(BaseEditor, { props: { modelValue: '<p>Привет мир</p>' }, global: { stubs } })
		const textbox = screen.getByRole('textbox')
		textbox.focus()
		caretAtEnd(textbox)
		await typeChar(textbox, '<p>Привет мир!</p>')
		await typeChar(textbox, '<p>Привет мир!!</p>')
		selectWord(textbox, 7, 10)
		await fireEvent.keyUp(textbox)
		await fireEvent.click(screen.getByRole('button', { name: 'Жирный' }))
		vi.advanceTimersByTime(600)
		caretAtEnd(textbox)
		await typeChar(textbox, textbox.innerHTML.replace('!!</p>', '!!?</p>'))

		const undo = await undoKey(textbox)
		expect(undo.defaultPrevented).toBe(true)
		expect(textbox.innerHTML).toBe('<p>Привет <b>мир</b>!!</p>')
		await undoKey(textbox)
		expect(textbox.innerHTML).toBe('<p>Привет мир!!</p>')
		await undoKey(textbox)
		expect(textbox.innerHTML).toBe('<p>Привет мир</p>')
		expect(emitted(wrapper).at(-1)).toBe('<p>Привет мир</p>')

		await redoKey(textbox)
		expect(textbox.innerHTML).toBe('<p>Привет мир!!</p>')
		await redoShiftKey(textbox)
		expect(textbox.innerHTML).toBe('<p>Привет <b>мир</b>!!</p>')
		expect(emitted(wrapper).at(-1)).toBe('<p>Привет <b>мир</b>!!</p>')
	})

	it('кнопка «Жирный» и Ctrl+Z: разметка снята, то же слово выделено', async () => {
		render(BaseEditor, { props: { modelValue: '<p>Привет мир</p>' }, global: { stubs } })
		const textbox = screen.getByRole('textbox')
		textbox.focus()
		selectWord(textbox, 7, 10)
		await fireEvent.keyUp(textbox)

		await fireEvent.click(screen.getByRole('button', { name: 'Жирный' }))
		expect(textbox.querySelector('b')).not.toBeNull()
		await undoKey(textbox)

		expect(textbox.querySelector('b')).toBeNull()
		expect(window.getSelection()?.toString()).toBe('мир')
	})

	it('после отмены следующая команда применяется к восстановленному выделению', async () => {
		render(BaseEditor, { props: { modelValue: '<p>Привет мир</p>' }, global: { stubs } })
		const textbox = screen.getByRole('textbox')
		textbox.focus()
		selectWord(textbox, 7, 10)
		await fireEvent.keyUp(textbox)
		await fireEvent.click(screen.getByRole('button', { name: 'Жирный' }))
		await undoKey(textbox)

		await fireEvent.click(screen.getByRole('button', { name: 'Жирный' }))

		expect(textbox.querySelector('b')?.textContent).toBe('мир')
	})

	it('вставка из буфера и insertHtml — по одному шагу', async () => {
		const wrapper = mount(BaseEditor, { props: { modelValue: '<p>a</p>' }, global: { stubs }, attachTo: document.body })
		const textbox = wrapper.get('[role="textbox"]').element as HTMLElement
		caretAtEnd(textbox)
		const paste = new InputEvent('beforeinput', { inputType: 'insertFromPaste', bubbles: true, cancelable: true })
		Object.defineProperty(paste, 'dataTransfer', { value: { getData: (type: string) => (type === 'text/plain' ? 'вставка' : '') } })
		textbox.dispatchEvent(paste)
		await nextTick()
		expect(textbox.innerHTML).toBe('<p>aвставка</p>')

		;(wrapper.vm as unknown as BaseEditorExpose).insertHtml('<b>жирное</b>')
		await nextTick()
		expect(textbox.innerHTML).toContain('<b>жирное</b>')

		await undoKey(textbox)
		expect(textbox.innerHTML).toBe('<p>aвставка</p>')
		await undoKey(textbox)
		expect(textbox.innerHTML).toBe('<p>a</p>')
	})

	it('композиция — один шаг, Ctrl+Z во время неё не перехватывается, порядок событий Safari не рвёт шаг', async () => {
		render(BaseEditor, { props: { modelValue: '<p>a</p>' }, global: { stubs } })
		const textbox = screen.getByRole('textbox')
		caretAtEnd(textbox)

		await fireEvent.compositionStart(textbox)
		await typeChar(textbox, '<p>aに</p>', 'insertCompositionText')
		await typeChar(textbox, '<p>aにほ</p>', 'insertCompositionText')
		const during = await press(textbox, { key: 'z', code: 'KeyZ', ctrlKey: true, isComposing: true })
		expect(during.defaultPrevented).toBe(false)
		await fireEvent.compositionEnd(textbox)
		await typeChar(textbox, '<p>aにほ</p>', 'insertText')

		await undoKey(textbox)
		expect(textbox.innerHTML).toBe('<p>a</p>')
	})

	it('режим кода: правка и выход — один шаг, вход и выход без правки шага не добавляют', async () => {
		render(BaseEditor, { props: { modelValue: '<p>a</p>' }, global: { stubs } })
		const textbox = screen.getByRole('textbox')
		await fireEvent.click(screen.getByRole('button', { name: 'Режим кода' }))
		await fireEvent.click(screen.getByRole('button', { name: 'Режим кода' }))
		await nextTick()
		await undoKey(screen.getByRole('textbox'))
		expect(screen.getByRole('textbox').innerHTML).toBe('<p>a</p>')

		await fireEvent.click(screen.getByRole('button', { name: 'Режим кода' }))
		const code = screen.getByRole('textbox', { name: 'HTML-код' })
		await fireEvent.update(code, '<p>a</p><p>b</p>')
		await fireEvent.update(code, '<p>a</p><p>bc</p>')
		await fireEvent.click(screen.getByRole('button', { name: 'Режим кода' }))
		await nextTick()
		const visual = screen.getByRole('textbox')
		expect(visual.innerHTML).toBe('<p>a</p><p>bc</p>')

		await undoKey(visual)
		expect(visual.innerHTML).toBe('<p>a</p>')
		expect(textbox).not.toBe(visual)
	})

	it('внешний modelValue очищает историю, эхо своего значения — нет', async () => {
		const wrapper = render(BaseEditor, { props: { modelValue: '<p>a</p>' }, global: { stubs } })
		const textbox = screen.getByRole('textbox')
		caretAtEnd(textbox)
		await typeChar(textbox, '<p>ab</p>')
		await wrapper.rerender({ modelValue: '<p>ab</p>' })
		expect((await undoKey(textbox)).defaultPrevented).toBe(true)
		expect(textbox.innerHTML).toBe('<p>a</p>')

		await wrapper.rerender({ modelValue: '<p>внешнее</p>' })
		await undoKey(textbox)
		expect(textbox.innerHTML).toBe('<p>внешнее</p>')
	})

	it('внешний modelValue в режиме кода тоже очищает историю', async () => {
		const wrapper = render(BaseEditor, { props: { modelValue: '<p>a</p>' }, global: { stubs } })
		caretAtEnd(screen.getByRole('textbox'))
		await typeChar(screen.getByRole('textbox'), '<p>ab</p>')
		await fireEvent.click(screen.getByRole('button', { name: 'Режим кода' }))
		await wrapper.rerender({ modelValue: '<p>другое</p>' })
		await fireEvent.click(screen.getByRole('button', { name: 'Режим кода' }))
		await nextTick()

		const visual = screen.getByRole('textbox')
		await undoKey(visual)
		expect(visual.innerHTML).toBe('<p>другое</p>')
	})

	it('асинхронный v-model: родитель отвечает позже, отмена работает и отправляет значение', async () => {
		const wrapper = render(BaseEditor, { props: { modelValue: '<p>a</p>' }, global: { stubs } })
		const textbox = screen.getByRole('textbox')
		caretAtEnd(textbox)
		await typeChar(textbox, '<p>ab</p>')

		await undoKey(textbox)
		expect(emitted(wrapper).at(-1)).toBe('<p>a</p>')
		await wrapper.rerender({ modelValue: '<p>a</p>' })
		expect(textbox.innerHTML).toBe('<p>a</p>')
		await redoKey(textbox)
		expect(emitted(wrapper).at(-1)).toBe('<p>ab</p>')
	})

	it.each([['isReadonly'], ['isDisabled']])('%s: Ctrl+Z не перехватывается', async prop => {
		render(BaseEditor, { props: { modelValue: '<p>a</p>', [prop]: true }, global: { stubs } })
		const textbox = screen.getByRole('textbox')

		const event = await undoKey(textbox)

		expect(event.defaultPrevented).toBe(false)
	})

	it('набранная пара <b>x</b>: первая отмена — буквальный текст, вторая — состояние до набора', async () => {
		render(BaseEditor, { props: { modelValue: '<p>a </p>' }, global: { stubs } })
		const textbox = screen.getByRole('textbox')
		caretAtEnd(textbox)
		await typeChar(textbox, '<p>a &lt;b&gt;x&lt;/b&gt;</p>')
		expect(textbox.querySelector('b')?.textContent).toBe('x')

		await undoKey(textbox)
		expect(textbox.textContent).toBe('a <b>x</b>')
		expect(textbox.querySelector('b')).toBeNull()
		await undoKey(textbox)
		expect(textbox.innerHTML).toBe('<p>a </p>')
	})

	it('перетаскивание через beforeinput: вставка идёт отдельным шагом drag', async () => {
		render(BaseEditor, { props: { modelValue: '<p>ab</p>' }, global: { stubs } })
		const textbox = screen.getByRole('textbox')
		caretAtEnd(textbox)
		const drop = new InputEvent('beforeinput', { inputType: 'insertFromDrop', bubbles: true, cancelable: true })
		Object.defineProperty(drop, 'dataTransfer', { value: { getData: (type: string) => (type === 'text/html' ? '<i>x</i>' : '') } })
		textbox.dispatchEvent(drop)
		await nextTick()
		expect(textbox.innerHTML).toContain('<i>x</i>')

		await undoKey(textbox)

		expect(textbox.innerHTML).toBe('<p>ab</p>')
	})

	it('undo, redo, canUndo и canRedo доступны через ref и в слоте toolbar', async () => {
		let slot: BaseEditorToolbarSlotProps | null = null
		const wrapper = mount(BaseEditor, {
			props: { modelValue: '<p>a</p>' },
			global: { stubs },
			attachTo: document.body,
			slots: {
				toolbar: (props: BaseEditorToolbarSlotProps) => {
					slot = props
					return h('span', 'панель')
				},
			},
		})
		const api = wrapper.vm as unknown as BaseEditorExpose
		const textbox = wrapper.get('[role="textbox"]').element as HTMLElement
		expect(api.canUndo).toBe(false)
		expect(api.canRedo).toBe(false)

		caretAtEnd(textbox)
		await typeChar(textbox, '<p>ab</p>')
		await nextTick()
		expect(api.canUndo).toBe(true)
		expect((slot as unknown as BaseEditorToolbarSlotProps).canUndo).toBe(true)

		api.undo()
		await nextTick()
		expect(textbox.innerHTML).toBe('<p>a</p>')
		expect(api.canRedo).toBe(true)
		expect((slot as unknown as BaseEditorToolbarSlotProps).canRedo).toBe(true)

		;(slot as unknown as BaseEditorToolbarSlotProps).redo()
		expect(textbox.innerHTML).toBe('<p>ab</p>')
		;(slot as unknown as BaseEditorToolbarSlotProps).undo()
		expect(textbox.innerHTML).toBe('<p>a</p>')
		api.redo()
		expect(textbox.innerHTML).toBe('<p>ab</p>')
	})

	it('beforeinput historyUndo гасится и запускает свою отмену', async () => {
		render(BaseEditor, { props: { modelValue: '<p>a</p>' }, global: { stubs } })
		const textbox = screen.getByRole('textbox')
		caretAtEnd(textbox)
		await typeChar(textbox, '<p>ab</p>')

		const event = new InputEvent('beforeinput', { inputType: 'historyUndo', bubbles: true, cancelable: true })
		textbox.dispatchEvent(event)
		await nextTick()

		expect(event.defaultPrevented).toBe(true)
		expect(textbox.innerHTML).toBe('<p>a</p>')
	})

	it('отмена закрывает меню размера медиа и обновляет выделение для следующей команды', async () => {
		render(BaseEditor, { props: { modelValue: '<p>a<img src="x.png" alt=""></p>' }, global: { stubs } })
		const textbox = screen.getByRole('textbox')
		caretAtEnd(textbox)
		await typeChar(textbox, '<p>a<img src="x.png" alt="">b</p>')
		await fireEvent.contextMenu(textbox.querySelector('img')!)
		expect(await screen.findByRole('dialog', { name: 'Размер медиа' })).toBeInTheDocument()

		await undoKey(textbox)
		await nextTick()

		expect(screen.queryByRole('dialog', { name: 'Размер медиа' })).toBeNull()
		expect(textbox.innerHTML).toBe('<p>a<img src="x.png" alt=""></p>')
	})
})
