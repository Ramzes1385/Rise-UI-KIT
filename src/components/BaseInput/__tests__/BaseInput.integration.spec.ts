/**
 * Integration-тесты для BaseInput.
 * Проверяют взаимодействие: ввод, v-model, emits.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'
import BaseInput from '../ui/BaseInput.vue'

interface InputRef {
	value: HTMLInputElement | null
}

interface InputExpose {
	inputRef: InputRef
	focus: () => void
	blur: () => void
}

interface VueRoot {
	__vueParentComponent?: {
		exposed?: InputExpose
	}
}

const nativeFrame = window.requestAnimationFrame

afterEach(() => {
	window.requestAnimationFrame = nativeFrame
})

function hasExpose(element: Element): element is Element & VueRoot {
	return '__vueParentComponent' in element
}

function getInput(): HTMLInputElement {
	const input = screen.getByRole('textbox')
	if (input instanceof HTMLInputElement) return input
	throw new Error('BaseInput не найден')
}

function getExposed(container: Element): InputExpose {
	const root = container.firstElementChild
	if (!root || !hasExpose(root)) throw new Error('Expose не найден')
	const exposed = root.__vueParentComponent?.exposed
	if (!exposed) throw new Error('Expose пустой')
	return exposed
}

function mockFrame(): void {
	window.requestAnimationFrame = function requestFrame(callback: FrameRequestCallback): number {
		callback(0)
		return 1
	}
}

describe('BaseInput integration', () => {
	describe('v-model', () => {
		it('должен эмитить update:modelValue при вводе', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseInput, { props: { modelValue: '' } })

			const input = screen.getByRole('textbox')
			await user.type(input, 'h')

			const events = emitted()['update:modelValue']
			expect(events).toBeTruthy()
		})

		it('должен эмитить корректное значение при вводе текста', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseInput, { props: { modelValue: '' } })

			const input = screen.getByRole('textbox')
			await user.type(input, 'hello')

			const events = emitted()['update:modelValue'] as string[][]
			expect(events.at(-1)?.[0]).toBe('hello')
		})
	})

	describe('события фокуса', () => {
		it('должен эмитить focus при фокусе', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseInput, { props: { modelValue: '' } })

			await user.click(screen.getByRole('textbox'))

			expect(emitted()).toHaveProperty('focus')
		})

		it('должен эмитить blur при потере фокуса', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseInput, { props: { modelValue: '' } })

			const input = screen.getByRole('textbox')
			await user.click(input)
			await user.tab()

			expect(emitted()).toHaveProperty('blur')
		})
	})

	describe('отключённое поле', () => {
		it('не должен эмитить update:modelValue при вводе в отключённое поле', async () => {
			const { emitted } = render(BaseInput, {
				props: { modelValue: '', isDisabled: true },
			})

			await fireEvent.click(screen.getByRole('textbox'))

			expect(emitted()).not.toHaveProperty('update:modelValue')
		})
	})

	describe('поле пароля', () => {
		it('должен рендерить кнопку переключения видимости', () => {
			const { container } = render(BaseInput, {
				props: { modelValue: '', type: 'password' },
			})

			expect(container.querySelector('.base-input__password-toggle')).toBeInTheDocument()
		})

		it('должен добавлять класс --password когда type=password', () => {
			const { container } = render(BaseInput, {
				props: { modelValue: '', type: 'password' },
			})

			expect(container.firstElementChild?.classList.contains('base-input--password')).toBe(true)
		})
	})

	describe('маска ввода', () => {
		it('должен эмитить очищенное значение при вводе через маску', async () => {
			mockFrame()
			const { emitted } = render(BaseInput, {
				props: { modelValue: '', mask: '(###) ###-##-##' },
			})

			const input = getInput()
			await fireEvent.update(input, '(123) 456-78-90')

			const events = emitted<string[]>('update:modelValue')
			expect(events.at(-1)?.[0]).toBe('1234567890')
			expect(input.value).toBe('(123) 456-78-90')
		})

		it('должен ограничивать ввод длиной маски', async () => {
			mockFrame()
			const { emitted } = render(BaseInput, {
				props: { modelValue: '', mask: '##.##' },
			})

			await fireEvent.update(getInput(), '123456')

			const events = emitted<string[]>('update:modelValue')
			expect(events.at(-1)?.[0]).toBe('1234')
		})

		it('должен удалять символ через Backspace', async () => {
			mockFrame()
			const { emitted } = render(BaseInput, {
				props: { modelValue: '1234', mask: '##.##' },
			})
			const input = getInput()
			input.setSelectionRange(3, 3)

			await fireEvent.keyDown(input, { key: 'Backspace' })

			const events = emitted<string[]>('update:modelValue')
			expect(events.at(-1)?.[0]).toBe('134')
			expect(input.selectionStart).toBe(1)
		})

		it('должен удалять символ через Delete', async () => {
			mockFrame()
			const { emitted } = render(BaseInput, {
				props: { modelValue: '1234', mask: '##.##' },
			})
			const input = getInput()
			input.setSelectionRange(1, 1)

			await fireEvent.keyDown(input, { key: 'Delete' })

			const events = emitted<string[]>('update:modelValue')
			expect(events.at(-1)?.[0]).toBe('134')
			expect(input.selectionStart).toBe(1)
		})

		it('не должен удалять символ через Backspace в начале строки', async () => {
			const { emitted } = render(BaseInput, {
				props: { modelValue: '1234', mask: '##.##' },
			})
			const input = getInput()
			input.setSelectionRange(0, 0)

			await fireEvent.keyDown(input, { key: 'Backspace' })

			expect(emitted()).not.toHaveProperty('update:modelValue')
		})

		it('не должен удалять символ через Backspace при пустом значении', async () => {
			const { emitted } = render(BaseInput, {
				props: { modelValue: '', mask: '##.##' },
			})
			const input = getInput()
			input.setSelectionRange(1, 1)

			await fireEvent.keyDown(input, { key: 'Backspace' })

			expect(emitted()).not.toHaveProperty('update:modelValue')
		})

		it('не должен удалять символ через Delete после конца значения', async () => {
			const { emitted } = render(BaseInput, {
				props: { modelValue: '1', mask: '##.##' },
			})
			const input = getInput()
			input.setSelectionRange(4, 4)

			await fireEvent.keyDown(input, { key: 'Delete' })

			expect(emitted()).not.toHaveProperty('update:modelValue')
		})
	})

	describe('публичный API', () => {
		it('должен вызывать focus и blur у поля', () => {
			const focusSpy = vi.spyOn(HTMLInputElement.prototype, 'focus')
			const blurSpy = vi.spyOn(HTMLInputElement.prototype, 'blur')
			const { container } = render(BaseInput, { props: { modelValue: '' } })
			const exposed = getExposed(container)

			exposed.focus()
			exposed.blur()

			expect(focusSpy).toHaveBeenCalled()
			expect(blurSpy).toHaveBeenCalled()
		})
	})
})
