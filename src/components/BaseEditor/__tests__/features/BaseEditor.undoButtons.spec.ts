import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import BaseEditor from '../../ui/BaseEditor.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

const stubs = { BaseTooltip: { template: '<div class="tooltip-stub"><slot /></div>' } }

async function typeChar(textbox: HTMLElement, html: string): Promise<void> {
	await fireEvent(textbox, new InputEvent('beforeinput', { inputType: 'insertText', bubbles: true, cancelable: true }))
	textbox.innerHTML = html
	const text = textbox.querySelector('p')!.firstChild as Text
	window.getSelection()?.setBaseAndExtent(text, text.data.length, text, text.data.length)
	await fireEvent(textbox, new InputEvent('input', { inputType: 'insertText', bubbles: true }))
}

const undoButton = (): HTMLElement => screen.getByRole('button', { name: 'Отменить' })
const redoButton = (): HTMLElement => screen.getByRole('button', { name: 'Повторить' })

describe('BaseEditor: кнопки «Отменить» и «Повторить»', () => {
	afterEach(() => {
		vi.restoreAllMocks()
		window.getSelection()?.removeAllRanges()
		document.body.innerHTML = ''
	})

	it('стоят первыми в панели, пока нечего отменять — aria-disabled и фокус возможен', async () => {
		render(BaseEditor, { props: { modelValue: '<p>Текст</p>' }, global: { stubs } })
		await nextTick()
		const toolbar = screen.getByRole('toolbar')

		expect(toolbar.querySelector('button')).toBe(undoButton())
		expect(undoButton()).toHaveAttribute('aria-disabled', 'true')
		expect(redoButton()).toHaveAttribute('aria-disabled', 'true')
		expect(undoButton()).not.toBeDisabled()
		expect(undoButton()).toHaveAttribute('aria-keyshortcuts', 'Control+Z')
		expect(redoButton()).toHaveAttribute('aria-keyshortcuts', 'Control+Shift+Z')
		expect(undoButton()).toHaveAttribute('tabindex', '0')
	})

	it('подсказка называет сочетание клавиш для платформы', async () => {
		vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')
		render(BaseEditor, { props: { modelValue: '<p>Текст</p>' } })
		await nextTick()

		expect(undoButton()).toHaveAttribute('aria-keyshortcuts', 'Meta+Z')
		expect(redoButton()).toHaveAttribute('aria-keyshortcuts', 'Meta+Shift+Z')
	})

	it('кнопки ведут историю: отмена, повтор, края стека; фокус остаётся на кнопке', async () => {
		const wrapper = render(BaseEditor, { props: { modelValue: '<p>Привет</p>' }, global: { stubs } })
		const textbox = screen.getByRole('textbox')
		textbox.focus()
		await typeChar(textbox, '<p>Привет!</p>')
		await nextTick()

		expect(undoButton()).not.toHaveAttribute('aria-disabled')
		undoButton().focus()
		await fireEvent.click(undoButton())
		await nextTick()

		expect(textbox.innerHTML).toBe('<p>Привет</p>')
		expect((wrapper.emitted('update:modelValue') as string[][]).at(-1)?.[0]).toBe('<p>Привет</p>')
		expect(undoButton()).toHaveAttribute('aria-disabled', 'true')
		expect(undoButton()).toHaveFocus()
		expect(redoButton()).not.toHaveAttribute('aria-disabled')

		await fireEvent.click(undoButton())
		expect(textbox.innerHTML).toBe('<p>Привет</p>')

		redoButton().focus()
		await fireEvent.click(redoButton())
		await nextTick()
		expect(textbox.innerHTML).toBe('<p>Привет!</p>')
		expect(redoButton()).toHaveAttribute('aria-disabled', 'true')
		expect(redoButton()).toHaveFocus()
	})

	it('в режиме кода кнопки недоступны, после возврата — снова доступны', async () => {
		render(BaseEditor, { props: { modelValue: '<p>Привет</p>' }, global: { stubs } })
		const textbox = screen.getByRole('textbox')
		await typeChar(textbox, '<p>Привет!</p>')
		await nextTick()
		expect(undoButton()).not.toHaveAttribute('aria-disabled')

		await fireEvent.click(screen.getByRole('button', { name: 'Режим кода' }))
		await nextTick()
		expect(undoButton()).toHaveAttribute('aria-disabled', 'true')
		expect(redoButton()).toHaveAttribute('aria-disabled', 'true')
	})

	it('hasHistoryButtons=false скрывает группу', async () => {
		render(BaseEditor, { props: { hasHistoryButtons: false }, global: { stubs } })
		await nextTick()

		expect(screen.queryByRole('button', { name: 'Отменить' })).toBeNull()
		expect(screen.queryByRole('button', { name: 'Повторить' })).toBeNull()
		expect(screen.getByRole('button', { name: 'Жирный' })).toBeInTheDocument()
	})

	it('у отключённого и только читаемого редактора панели нет', async () => {
		const { rerender } = render(BaseEditor, { props: { isDisabled: true }, global: { stubs } })
		await nextTick()
		expect(screen.queryByRole('button', { name: 'Отменить' })).toBeNull()
		await rerender({ isDisabled: false, isReadonly: true })
		expect(screen.queryByRole('button', { name: 'Отменить' })).toBeNull()
	})

	it('умолчание hasHistoryButtons задаётся настройками плагина', async () => {
		render(BaseEditor, {
			global: { stubs, plugins: [createUiKitPlugin({ defaults: { BaseEditor: { hasHistoryButtons: false } } })] },
		})
		await nextTick()

		expect(screen.queryByRole('button', { name: 'Отменить' })).toBeNull()
	})
})
