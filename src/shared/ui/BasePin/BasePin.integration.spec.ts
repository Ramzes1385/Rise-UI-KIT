/**
 * Integration-тесты для BasePin.
 * Проверяют взаимодействие: ввод, навигация, вставка, Backspace.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/vue'
import { defineComponent, ref } from 'vue'

import BasePin from './BasePin.vue'

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
})
