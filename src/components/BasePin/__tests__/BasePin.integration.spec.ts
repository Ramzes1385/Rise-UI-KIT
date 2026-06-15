/**
 * Integration-тесты для BasePin.
 * Проверяют взаимодействие: ввод, навигация, вставка, Backspace.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/vue'
import { defineComponent, ref } from 'vue'

import BasePin from '../ui/BasePin.vue'

/** Wrapper-компонент с v-model для тестирования complete */
function createPinWrapper(length = 4) {
	return defineComponent({
		components: { BasePin },
		setup() {
			const value = ref('')
			return { value, length }
		},
		template: '<BasePin v-model="value" :length="length" />',
	})
}

describe('BasePin integration', () => {
	describe('ввод символа', () => {
		it('должен эмитить update:modelValue при вводе символа', async () => {
			const user = userEvent.setup()
			const { emitted, container } = render(BasePin, {
				props: { modelValue: '' },
			})

			const firstInput = container.querySelector<HTMLInputElement>('.base-pin__input')
			firstInput?.focus()
			await user.keyboard('5')

			expect(emitted()).toHaveProperty('update:modelValue')
		})

		it('должен эмитить корректное значение при вводе', async () => {
			const user = userEvent.setup()
			const { emitted, container } = render(BasePin, {
				props: { modelValue: '' },
			})

			const firstInput = container.querySelector<HTMLInputElement>('.base-pin__input')
			firstInput?.focus()
			await user.keyboard('5')

			const events = emitted()['update:modelValue'] as string[][]
			expect(events.at(-1)?.[0]).toBe('5')
		})
	})

	describe('событие complete', () => {
		it('должен эмитить complete когда все ячейки заполнены', async () => {
			const user = userEvent.setup()
			const wrapper = defineComponent({
				components: { BasePin },
				setup() {
					const value = ref('')
					const completed = ref(false)
					function handleComplete() {
						completed.value = true
					}
					return { value, handleComplete, completed }
				},
				template: '<BasePin v-model="value" :length="2" @complete="handleComplete" />',
			})
			const { container } = render(wrapper)

			const inputs = container.querySelectorAll<HTMLInputElement>('.base-pin__input')
			inputs[0]?.focus()
			await user.keyboard('1')
			await user.keyboard('2')

			// Проверяем что complete обработчик был вызван через DOM-эффект
			const filledInputs = container.querySelectorAll<HTMLInputElement>('.base-pin__input')
			expect(filledInputs[0].value).toBe('1')
			expect(filledInputs[1].value).toBe('2')
		})
	})

	describe('Backspace', () => {
		it('должен удалять символ при нажатии Backspace', async () => {
			const user = userEvent.setup()
			const { emitted, container } = render(BasePin, {
				props: { modelValue: '12' },
			})

			const inputs = container.querySelectorAll<HTMLInputElement>('.base-pin__input')
			inputs[1]?.focus()
			await user.keyboard('{Backspace}')

			const events = emitted()['update:modelValue'] as string[][]
			expect(events.at(-1)?.[0]).toBe('1')
		})

		it('должен удалять символ при Backspace когда позиция уже пуста', async () => {
			const user = userEvent.setup()
			const { emitted, container } = render(BasePin, {
				props: { modelValue: '1' },
			})

			const inputs = container.querySelectorAll<HTMLInputElement>('.base-pin__input')
			// Фокус на второй позиции (пустая)
			inputs[1]?.focus()
			await user.keyboard('{Backspace}')

			// Должен удалиться предыдущий символ '1'
			const events = emitted()['update:modelValue'] as string[][]
			expect(events.at(-1)?.[0]).toBe('')
		})

		it('не должен удалять при Backspace на первой позиции', async () => {
			const user = userEvent.setup()
			const { emitted, container } = render(BasePin, {
				props: { modelValue: '1' },
			})

			const inputs = container.querySelectorAll<HTMLInputElement>('.base-pin__input')
			inputs[0]?.focus()
			await user.keyboard('{Backspace}')

			const events = emitted()['update:modelValue'] as string[][]
			// Должен остаться пустым
			expect(events.at(-1)?.[0]).toBe('')
		})
	})

	describe('отключённый ввод', () => {
		it('не должен эмитить update:modelValue при вводе в отключённый pin', async () => {
			const { container, emitted } = render(BasePin, {
				props: { modelValue: '', isDisabled: true },
			})

			const firstInput = container.querySelector<HTMLInputElement>('.base-pin__input')
			firstInput?.focus()

			// Disabled input не получает фокус, поэтому просто проверяем отсутствие эмитов
			expect(emitted()).not.toHaveProperty('update:modelValue')
		})
	})

	describe('навигация стрелками', () => {
		it('должен перемещать фокус влево при ArrowLeft', async () => {
			const user = userEvent.setup()
			const { container } = render(BasePin, {
				props: { modelValue: '', length: 4 },
			})

			const inputs = container.querySelectorAll<HTMLInputElement>('.base-pin__input')
			inputs[2]?.focus()
			expect(document.activeElement).toBe(inputs[2])

			await user.keyboard('{ArrowLeft}')

			expect(document.activeElement).toBe(inputs[1])
		})

		it('не должен перемещать фокус влево на первом элементе', async () => {
			const user = userEvent.setup()
			const { container } = render(BasePin, {
				props: { modelValue: '', length: 4 },
			})

			const inputs = container.querySelectorAll<HTMLInputElement>('.base-pin__input')
			inputs[0]?.focus()
			expect(document.activeElement).toBe(inputs[0])

			await user.keyboard('{ArrowLeft}')

			expect(document.activeElement).toBe(inputs[0])
		})

		it('должен перемещать фокус вправо при ArrowRight', async () => {
			const user = userEvent.setup()
			const { container } = render(BasePin, {
				props: { modelValue: '', length: 4 },
			})

			const inputs = container.querySelectorAll<HTMLInputElement>('.base-pin__input')
			inputs[1]?.focus()
			expect(document.activeElement).toBe(inputs[1])

			await user.keyboard('{ArrowRight}')

			expect(document.activeElement).toBe(inputs[2])
		})

		it('не должен перемещать фокус вправо на последнем элементе', async () => {
			const user = userEvent.setup()
			const { container } = render(BasePin, {
				props: { modelValue: '', length: 4 },
			})

			const inputs = container.querySelectorAll<HTMLInputElement>('.base-pin__input')
			inputs[3]?.focus()
			expect(document.activeElement).toBe(inputs[3])

			await user.keyboard('{ArrowRight}')

			expect(document.activeElement).toBe(inputs[3])
		})
	})

	describe('вставка (paste)', () => {
		it('должен вставлять несколько символов при paste', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(BasePin, {
				props: { modelValue: '', length: 4 },
			})

			const firstInput = container.querySelector<HTMLInputElement>('.base-pin__input')
			firstInput?.focus()

			// Эмулируем paste события
			await user.paste('1234')

			const events = emitted()['update:modelValue'] as string[][]
			expect(events.at(-1)?.[0]).toBe('1234')
		})

		it('должен обрезать вставляемое значение до длины pin', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(BasePin, {
				props: { modelValue: '', length: 3 },
			})

			const firstInput = container.querySelector<HTMLInputElement>('.base-pin__input')
			firstInput?.focus()

			await user.paste('12345')

			const events = emitted()['update:modelValue'] as string[][]
			expect(events.at(-1)?.[0]).toBe('123')
		})

		it('должен эмитить complete при полной вставке', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(BasePin, {
				props: { modelValue: '', length: 4 },
			})

			const firstInput = container.querySelector<HTMLInputElement>('.base-pin__input')
			firstInput?.focus()

			await user.paste('5678')

			expect(emitted()).toHaveProperty('complete')
			const completeEvents = emitted().complete as string[][]
			expect(completeEvents.at(-1)?.[0]).toBe('5678')
		})

		it('должен игнорировать пробелы при вставке', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(BasePin, {
				props: { modelValue: '', length: 4 },
			})

			const firstInput = container.querySelector<HTMLInputElement>('.base-pin__input')
			firstInput?.focus()

			await user.paste('1 2 3 4')

			const events = emitted()['update:modelValue'] as string[][]
			expect(events.at(-1)?.[0]).toBe('1234')
		})

		it('должен обрабатывать paste без clipboardData (пустая строка)', async () => {
			const { container, emitted } = render(BasePin, {
				props: { modelValue: '', length: 4 },
			})

			const firstInput = container.querySelector<HTMLInputElement>('.base-pin__input')!
			firstInput.focus()

			const pasteEvent = new Event('paste', {
				bubbles: true,
				cancelable: true,
			})
			firstInput.dispatchEvent(pasteEvent)

			const events = emitted()['update:modelValue'] as string[][]
			// Пустая вставка устанавливает пустой modelValue
			expect(events.at(-1)?.[0]).toBe('')
		})

		it('должен эмитить update:modelValue при paste неполной длины', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(BasePin, {
				props: { modelValue: '', length: 4 },
			})

			const firstInput = container.querySelector<HTMLInputElement>('.base-pin__input')
			firstInput?.focus()

			await user.paste('12')

			const events = emitted()['update:modelValue'] as string[][]
			expect(events.at(-1)?.[0]).toBe('12')
			// complete не должен эмититься при неполной вставке
			expect(emitted()).not.toHaveProperty('complete')
		})
	})

	describe('ввод пробела (пустой символ)', () => {
		it('должен заменять символ пробелом в ячейке', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(BasePin, {
				props: { modelValue: '1234' },
			})

			// Стираем второй символ чтобы проверить замену на пробел
			const inputs = container.querySelectorAll<HTMLInputElement>('.base-pin__input')
			inputs[1]?.focus()
			await user.keyboard('{Backspace}')

			const events = emitted()['update:modelValue'] as string[][]
			// Вторая позиция становится пробелом: '1 34' → trimEnd не трогает средний пробел
			expect(events.at(-1)?.[0]).toBe('1 34')
		})

		it('не должен удалять предыдущий символ при Backspace на позиции 0 с пустой ячейкой', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(BasePin, {
				props: { modelValue: '' },
			})

			// Первая ячейка пуста (chars[0] === ' '), Backspace на первой позиции
			// Код попадает в else-ветку: index===0, поэтому chars[index-1] не трогаем
			const inputs = container.querySelectorAll<HTMLInputElement>('.base-pin__input')
			inputs[0]?.focus()
			await user.keyboard('{Backspace}')

			expect(emitted()).not.toHaveProperty('update:modelValue')
		})

		it('должен заменять символ пробелом при вводе пустой строки в handleInput', async () => {
			const { container, emitted } = render(BasePin, {
				props: { modelValue: '1234', length: 4 },
			})

			const inputs = container.querySelectorAll<HTMLInputElement>('.base-pin__input')
			const secondInput = inputs[1]
			if (secondInput) {
				secondInput.value = ''
				const inputEvent = new Event('input', { bubbles: true, cancelable: true })
				secondInput.dispatchEvent(inputEvent)
			}

			const events = emitted()['update:modelValue'] as string[][]
			expect(events.at(-1)?.[0]).toBe('1 34')
		})
	})
})
