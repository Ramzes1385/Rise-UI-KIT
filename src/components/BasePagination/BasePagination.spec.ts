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

			// 5 страниц без многоточий: 1, 2, 3, 4, 5
			expect(screen.getByText('1')).toBeInTheDocument()
			expect(screen.getByText('5')).toBeInTheDocument()
		})

		it('должен рендерить многоточия для большого количества страниц', () => {
			const { container } = render(BasePagination, {
				props: { modelValue: 5, total: 200, pageSize: 10, maxVisible: 7 },
			})

			const ellipsis = container.querySelectorAll('.base-pagination__ellipsis')
			expect(ellipsis.length).toBeGreaterThanOrEqual(1)
		})

		it('должен показывать последнюю страницу', () => {
			render(BasePagination, {
				props: { modelValue: 1, total: 200, pageSize: 10, maxVisible: 7, showLastPage: true },
			})

			expect(screen.getByText('20')).toBeInTheDocument()
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
		it('должен рендерить иконки навигации', () => {
			const { container } = render(BasePagination, {
				props: { modelValue: 1, total: 50 },
			})

			// Кнопки навигации с иконками (chevron-left / chevron-right)
			const svgs = container.querySelectorAll('svg')
			expect(svgs.length).toBeGreaterThanOrEqual(2)
		})
	})

	describe('пропс sizeScale', () => {
		it('не должен устанавливать style когда sizeScale=100', () => {
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

	describe('пропс showLastPage', () => {
		it('не должен показывать последнюю страницу когда showLastPage=false', () => {
			render(BasePagination, {
				props: { modelValue: 1, total: 200, pageSize: 10, maxVisible: 7, showLastPage: false },
			})

			expect(screen.queryByText('20')).not.toBeInTheDocument()
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BasePagination, {
				props: {
					modelValue: 1,
					total: 50,
					customClass: 'custom-root-class',
				},
			})

			expect(container.querySelector('.base-pagination')).toHaveClass('custom-root-class')
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BasePagination, {
				props: {
					modelValue: 5,
					total: 200,
					pageSize: 10,
					maxVisible: 7,
					customClass: {
						root: 'custom-root',
						prev: 'custom-prev',
						next: 'custom-next',
						pages: 'custom-pages',
						button: 'custom-button',
						ellipsis: 'custom-ellipsis',
					},
				},
			})

			expect(container.querySelector('.base-pagination')).toHaveClass('custom-root')
			expect(container.querySelector('.base-pagination > button:first-child')).toHaveClass('custom-prev')
			expect(container.querySelector('.base-pagination > button:last-child')).toHaveClass('custom-next')
			expect(container.querySelector('.base-pagination__pages')).toHaveClass('custom-pages')
			expect(container.querySelector('.base-pagination__pages button')).toHaveClass('custom-button')
			expect(container.querySelector('.base-notification-container, .base-pagination__ellipsis')).toHaveClass(
				'custom-ellipsis',
			)
		})
	})

	describe('дополнительное покрытие ветвей', () => {
		it('не должен эмитить события при вызове changePage с некорректной страницей', async () => {
			const { mount } = await import('@vue/test-utils')
			const wrapper = mount(BasePagination, {
				props: {
					modelValue: 1,
					total: 50,
					pageSize: 10,
				},
			})

			// Находим первую кнопку (Prev) и эмитим клик, когда она отключена
			const prevButton = wrapper.findComponent({ name: 'BaseButton' })
			await prevButton.vm.$emit('click')

			expect(wrapper.emitted()).not.toHaveProperty('update:modelValue')
			expect(wrapper.emitted()).not.toHaveProperty('change')
		})
	})
})
