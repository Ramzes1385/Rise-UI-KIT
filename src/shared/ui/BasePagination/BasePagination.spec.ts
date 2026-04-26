/**
 * Unit-тесты для BasePagination.
 * Проверяют рендер, пропсы и вычисления.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import BasePagination from './BasePagination.vue'

describe('BasePagination unit', () => {
	describe('рендер', () => {
		it('должен рендерить пагинацию', () => {
			const { container } = render(BasePagination, {
				props: { modelValue: 1, total: 50 },
			})

			expect(container.querySelector('.base-pagination')).toBeInTheDocument()
		})

		it('должен рендерить кнопки страниц', () => {
			render(BasePagination, {
				props: { modelValue: 1, total: 50, pageSize: 10 },
			})

			// 5 страниц: 1, 2, 3, 4, 5
			expect(screen.getByText('1')).toBeInTheDocument()
			expect(screen.getByText('5')).toBeInTheDocument()
		})
	})

	describe('вычисление totalPages', () => {
		it('должен вычислять количество страниц', () => {
			render(BasePagination, {
				props: { modelValue: 1, total: 25, pageSize: 10 },
			})

			// 25 / 10 = 3 страницы
			expect(screen.getByText('3')).toBeInTheDocument()
		})
	})

	describe('пропс variant', () => {
		it('должен рендерить текстовые кнопки по умолчанию', () => {
			render(BasePagination, {
				props: { modelValue: 1, total: 50 },
			})

			expect(screen.getByText('Назад')).toBeInTheDocument()
			expect(screen.getByText('Вперед')).toBeInTheDocument()
		})
	})

	describe('пропс sizeScale', () => {
		it('не должен устанавливать style когда sizeScale=1', () => {
			const { container } = render(BasePagination, {
				props: { modelValue: 1, total: 50, sizeScale: 100 },
			})

			expect(container.querySelector('.base-pagination')?.getAttribute('style')).toBeNull()
		})

		it('должен устанавливать --size-scale когда sizeScale=150', () => {
			const { container } = render(BasePagination, {
				props: { modelValue: 1, total: 50, sizeScale: 150 },
			})

			expect(container.querySelector('.base-pagination')?.getAttribute('style')).toContain('--size-scale: 1.5')
		})
	})
})
