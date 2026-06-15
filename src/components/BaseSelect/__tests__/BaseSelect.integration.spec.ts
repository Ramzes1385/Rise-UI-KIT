/**
 * Integration-тесты для BaseSelect.
 * Проверяют взаимодействие: выбор опций, мультивыбор, поиск.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'

import type { BaseSelectOption } from '../model/BaseSelect.types'
import BaseSelect from '../ui/BaseSelect.vue'

/** Стандартный набор опций для тестов */
const OPTIONS: BaseSelectOption[] = [
	{ value: 'metal', label: 'Металл' },
	{ value: 'wood', label: 'Дерево' },
	{ value: 'stone', label: 'Камень' },
	{ value: 'ceramic', label: 'Керамика', isDisabled: true },
]

describe('BaseSelect integration', () => {
	describe('выбор опции', () => {
		it('должен открывать дропдаун по клику', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS },
			})

			const trigger = container.querySelector('.base-select__trigger')
			await user.click(trigger!)

			expect(container.querySelector('.base-select--open')).toBeInTheDocument()
		})

		it('должен эмитить update:modelValue при выборе опции', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS },
			})

			const trigger = container.querySelector('.base-select__trigger')
			await user.click(trigger!)

			const option = screen.getByText('Металл')
			await user.click(option)

			const events = emitted()['update:modelValue'] as (string | number)[][]
			expect(events.at(-1)?.[0]).toBe('metal')
		})

		it('должен эмитить change при выборе опции', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS },
			})

			const trigger = container.querySelector('.base-select__trigger')
			await user.click(trigger!)

			const option = screen.getByText('Металл')
			await user.click(option)

			expect(emitted()).toHaveProperty('change')
		})
	})

	describe('отключённый селект', () => {
		it('не должен открываться когда isDisabled=true', async () => {
			const { container } = render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS, isDisabled: true },
			})

			const trigger = container.querySelector('.base-select__trigger')
			await fireEvent.click(trigger!)

			expect(container.querySelector('.base-select--open')).not.toBeInTheDocument()
		})
	})

	describe('мультивыбор', () => {
		it('должен эмитить массив при выборе в режиме isMultiple', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(BaseSelect, {
				props: { modelValue: [] as (string | number)[], options: OPTIONS, isMultiple: true },
			})

			const trigger = container.querySelector('.base-select__trigger')
			await user.click(trigger!)

			const option = screen.getByText('Металл')
			await user.click(option)

			const events = emitted()['update:modelValue'] as (string | number)[][][]
			expect(events.at(-1)?.[0]).toEqual(['metal'])
		})
	})
})
