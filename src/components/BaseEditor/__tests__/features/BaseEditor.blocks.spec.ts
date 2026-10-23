import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseEditor from '../../ui/BaseEditor.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

const stubs = { BaseTooltip: { template: '<div class="tooltip-stub"><slot /></div>' } }

function caretIn(node: Node, offset: number): void {
	window.getSelection()?.setBaseAndExtent(node, offset, node, offset)
}

function enter(target: HTMLElement): InputEvent {
	const event = new InputEvent('beforeinput', { inputType: 'insertParagraph', bubbles: true, cancelable: true })
	target.dispatchEvent(event)
	return event
}

function emitted(wrapper: ReturnType<typeof render>): string[] {
	return ((wrapper.emitted('update:modelValue') ?? []) as string[][]).map(args => args[0])
}

describe('BaseEditor: блоки, списки и Enter', () => {
	beforeEach(() => {
		Object.defineProperty(document, 'execCommand', { configurable: true, writable: true, value: vi.fn(() => true) })
	})

	afterEach(() => {
		vi.restoreAllMocks()
		window.getSelection()?.removeAllRanges()
		document.body.innerHTML = ''
	})

	it('фокус не вызывает execCommand: разделитель абзацев больше не задаётся', async () => {
		render(BaseEditor, { global: { stubs } })

		await fireEvent.focus(screen.getByRole('textbox'))

		expect(document.execCommand).not.toHaveBeenCalled()
	})

	it('Enter делит абзац на два <p>, событие гасится, v-model получает результат, Ctrl+Z возвращает абзац', async () => {
		const wrapper = render(BaseEditor, { props: { modelValue: '<p>abcd</p>' }, global: { stubs } })
		const textbox = screen.getByRole('textbox')
		caretIn(textbox.querySelector('p')!.firstChild!, 2)

		const event = enter(textbox)
		await nextTick()

		expect(event.defaultPrevented).toBe(true)
		expect(textbox.innerHTML).toBe('<p>ab</p><p>cd</p>')
		expect(emitted(wrapper).at(-1)).toBe('<p>ab</p><p>cd</p>')

		textbox.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', code: 'KeyZ', ctrlKey: true, bubbles: true, cancelable: true }))
		await nextTick()
		expect(textbox.innerHTML).toBe('<p>abcd</p>')
	})

	it('Enter в пустой области оборачивает ввод в абзац', async () => {
		render(BaseEditor, { global: { stubs } })
		const textbox = screen.getByRole('textbox')
		textbox.focus()
		caretIn(textbox, 0)

		enter(textbox)
		await nextTick()

		expect(textbox.querySelectorAll('p').length).toBeGreaterThan(0)
	})

	it('Enter во время композиции и в режиме чтения не перехватывается', async () => {
		const wrapper = render(BaseEditor, { props: { modelValue: '<p>abcd</p>' }, global: { stubs } })
		const textbox = screen.getByRole('textbox')
		caretIn(textbox.querySelector('p')!.firstChild!, 2)

		await fireEvent.compositionStart(textbox)
		const composing = enter(textbox)
		await fireEvent.compositionEnd(textbox)
		await wrapper.rerender({ isReadonly: true })
		const locked = enter(screen.getByRole('textbox'))

		expect(composing.defaultPrevented).toBe(false)
		expect(locked.defaultPrevented).toBe(false)
		expect(textbox.innerHTML).toBe('<p>abcd</p>')
	})

	it('маркированный список: кнопка делает пункты, Enter добавляет пункт, двойной Enter выходит из списка', async () => {
		render(BaseEditor, { props: { modelValue: '<p>one</p><p>two</p>' }, global: { stubs } })
		const textbox = screen.getByRole('textbox')
		textbox.focus()
		window.getSelection()?.selectAllChildren(textbox)
		await fireEvent.keyUp(textbox)

		await fireEvent.click(screen.getByRole('button', { name: 'Маркированный список' }))
		expect(textbox.innerHTML).toBe('<ul><li>one</li><li>two</li></ul>')

		const last = textbox.querySelectorAll('li')[1]
		caretIn(last.firstChild!, 3)
		enter(textbox)
		expect(textbox.querySelectorAll('li')).toHaveLength(3)
		enter(textbox)
		await nextTick()
		expect(textbox.innerHTML).toBe('<ul><li>one</li><li>two</li></ul><p><br></p>')

		await fireEvent.click(screen.getByRole('button', { name: 'Маркированный список' }))
	})

	it('выравнивание и цитата: кнопки меняют блоки выделения, активные состояния отражаются в aria-pressed', async () => {
		render(BaseEditor, { props: { modelValue: '<p>one</p>' }, global: { stubs } })
		const textbox = screen.getByRole('textbox')
		textbox.focus()
		caretIn(textbox.querySelector('p')!.firstChild!, 1)
		await fireEvent.keyUp(textbox)

		await fireEvent.click(screen.getByRole('button', { name: 'По центру' }))
		expect(textbox.querySelector('p')!.style.textAlign).toBe('center')
		await fireEvent.click(screen.getByRole('button', { name: 'Цитата' }))
		expect(textbox.innerHTML).toBe('<blockquote style="text-align: center;">one</blockquote>')
		await nextTick()
		expect(screen.getByRole('button', { name: 'Цитата' })).toHaveAttribute('aria-pressed', 'true')
		expect(screen.getByRole('button', { name: 'По центру' })).toHaveAttribute('aria-pressed', 'true')
	})
})
