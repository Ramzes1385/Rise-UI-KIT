/**
 * Integration-тесты для BasePagination.
 * Проверяют взаимодействие: переключение страниц, emits.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'

import BasePagination from './BasePagination.vue'

describe('BasePagination integration', () => {
	describe('переключение страниц', () => {
		it('должен эмитить update:modelValue при клике на страницу', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BasePagination, {
				props: { modelValue: 1, total: 50, pageSize: 10 },
			})

			await user.click(screen.getByText('3'))

			expect(emitted()).toHaveProperty('update:modelValue')
			const events = emitted()['update:modelValue'] as number[][]
			expect(events.at(-1)?.[0]).toBe(3)
		})

		it('должен эмитить change при переключении', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BasePagination, {
				props: { modelValue: 1, total: 50, pageSize: 10 },
			})

			await user.click(screen.getByText('2'))

			expect(emitted()).toHaveProperty('change')
		})
	})

	describe('кнопка Вперед', () => {
		it('должен эмитить следующую страницу при клике Вперед', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BasePagination, {
				props: { modelValue: 1, total: 50, pageSize: 10 },
			})

			await user.click(screen.getByText('Вперед'))

			const events = emitted()['update:modelValue'] as number[][]
			expect(events.at(-1)?.[0]).toBe(2)
		})
	})

	describe('кнопка Назад', () => {
		it('должен эмитить предыдущую страницу при клике Назад', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BasePagination, {
				props: { modelValue: 3, total: 50, pageSize: 10 },
			})

			await user.click(screen.getByText('Назад'))

			const events = emitted()['update:modelValue'] as number[][]
			expect(events.at(-1)?.[0]).toBe(2)
		})
	})
})
