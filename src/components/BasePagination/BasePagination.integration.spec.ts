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
		it('должен эмитить следующую страницу при клике на кнопку вперед', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(BasePagination, {
				props: { modelValue: 1, total: 50, pageSize: 10 },
			})

			// Кнопка «вперед» — последняя кнопка в пагинации
			const buttons = container.querySelectorAll('.base-button')
			const nextButton = buttons[buttons.length - 1] as HTMLElement
			await user.click(nextButton)

			const events = emitted()['update:modelValue'] as number[][]
			expect(events.at(-1)?.[0]).toBe(2)
		})
	})

	describe('кнопка Назад', () => {
		it('должен эмитить предыдущую страницу при клике на кнопку назад', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(BasePagination, {
				props: { modelValue: 3, total: 50, pageSize: 10 },
			})

			// Кнопка «назад» — первая кнопка в пагинации
			const buttons = container.querySelectorAll('.base-button')
			const prevButton = buttons[0] as HTMLElement
			await user.click(prevButton)

			const events = emitted()['update:modelValue'] as number[][]
			expect(events.at(-1)?.[0]).toBe(2)
		})
	})

	describe('многоточия', () => {
		it('не должны быть кликабельными', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(BasePagination, {
				props: { modelValue: 5, total: 200, pageSize: 10, maxVisible: 7 },
			})

			const ellipsis = container.querySelector('.base-pagination__ellipsis') as HTMLElement
			if (ellipsis) {
				await user.click(ellipsis)
				// Клик по многоточию не должен вызывать emits
				expect(emitted()).not.toHaveProperty('update:modelValue')
			}
		})
	})
})
