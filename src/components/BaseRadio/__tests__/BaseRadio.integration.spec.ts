/**
 * Integration-тесты для BaseRadio.
 * Проверяют взаимодействие: выбор, v-model, emits.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'
import { BaseText } from '@components/BaseText'
import BaseRadio from '../ui/BaseRadio.vue'
import type { BaseRadioOption } from '../model/BaseRadio.types'

const OPTIONS: BaseRadioOption[] = [
	{ value: 'metal', label: 'Металл' },
	{ value: 'wood', label: 'Дерево' },
	{ value: 'stone', label: 'Камень' },
	{ value: 'glass', label: 'Стекло', isDisabled: true },
]

const GLOBAL_COMPONENTS = { global: { components: { BaseText } } }

describe('BaseRadio integration', () => {
	describe('v-model', () => {
		it('должен эмитить update:modelValue при клике на опцию', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test' },
				...GLOBAL_COMPONENTS,
			})

			await user.click(screen.getByText('Дерево'))

			expect(emitted()).toHaveProperty('update:modelValue')
		})

		it('должен эмитить корректное значение при выборе', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test' },
				...GLOBAL_COMPONENTS,
			})

			await user.click(screen.getByText('Металл'))

			const events = emitted()['update:modelValue'] as (string | number)[][]
			expect(events.at(-1)?.[0]).toBe('metal')
		})
	})

	describe('событие change', () => {
		it('должен эмитить change при выборе опции', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test' },
				...GLOBAL_COMPONENTS,
			})

			await user.click(screen.getByText('Камень'))

			expect(emitted()).toHaveProperty('change')
		})
	})

	describe('отключённая опция', () => {
		it('не должен эмитить update:modelValue при клике на отключённую опцию', async () => {
			const { emitted } = render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test' },
				...GLOBAL_COMPONENTS,
			})

			await fireEvent.click(screen.getByText('Стекло'))

			expect(emitted()).not.toHaveProperty('update:modelValue')
		})
	})

	describe('клавиатурная навигация', () => {
		it('должен выбирать опцию при нажатии Space', async () => {
			const user = userEvent.setup()
			const { emitted, container } = render(BaseRadio, {
				props: { modelValue: '', options: OPTIONS, name: 'test' },
				...GLOBAL_COMPONENTS,
			})

			const firstInput = container.querySelector<HTMLInputElement>('input[type="radio"]')
			firstInput?.focus()
			await user.keyboard(' ')

			expect(emitted()).toHaveProperty('update:modelValue')
		})
	})
})

