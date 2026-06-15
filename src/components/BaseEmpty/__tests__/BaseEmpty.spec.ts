/**
 * Unit-тесты для BaseEmpty.
 * Проверяют рендер, пропсы, слоты и кастомные стили.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'
import BaseEmpty from '../ui/BaseEmpty.vue'

describe('BaseEmpty unit', () => {
	describe('рендер', () => {
		it('должен рендерить пустое состояние', () => {
			const { container } = render(BaseEmpty)

			expect(container.querySelector('.base-empty')).toBeInTheDocument()
		})

		it('должен рендерить заголовок и описание', () => {
			render(BaseEmpty, {
				props: {
					title: 'Нет данных',
					description: 'Попробуйте изменить параметры фильтрации',
				},
			})

			expect(screen.getByText('Нет данных')).toBeInTheDocument()
			expect(screen.getByText('Попробуйте изменить параметры фильтрации')).toBeInTheDocument()
		})
	})

	describe('пропс variant', () => {
		const variants = ['ghost', 'soft'] as const

		variants.forEach(variant => {
			it(`должен применять класс модификатора --${variant}`, () => {
				const { container } = render(BaseEmpty, { props: { variant } })

				expect(container.querySelector('.base-empty')?.classList.contains(`base-empty--${variant}`)).toBe(true)
			})
		})

		it('не должен добавлять модификатор для варианта default', () => {
			const { container } = render(BaseEmpty)

			expect(container.querySelector('.base-empty')?.classList.contains('base-empty--default')).toBe(false)
		})
	})

	describe('слоты', () => {
		it('должен рендерить контент в дефолтном слоте', () => {
			render(BaseEmpty, {
				slots: {
					default: '<span>Дополнительный контент</span>',
				},
			})

			expect(screen.getByText('Дополнительный контент')).toBeInTheDocument()
		})

		it('должен рендерить контент в слоте icon', () => {
			render(BaseEmpty, {
				slots: {
					icon: '<span data-testid="custom-icon">Иконка</span>',
				},
			})

			expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
		})

		it('должен рендерить контент в слоте actions', () => {
			render(BaseEmpty, {
				slots: {
					actions: '<button data-testid="custom-action">Сбросить фильтры</button>',
				},
			})

			expect(screen.getByTestId('custom-action')).toBeInTheDocument()
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseEmpty, {
				props: { customClass: 'my-custom-empty' },
			})

			expect(container.querySelector('.base-empty')?.classList.contains('my-custom-empty')).toBe(true)
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseEmpty, {
				props: {
					title: 'Заголовок',
					description: 'Описание',
					customClass: {
						root: 'my-empty-root',
						title: 'my-empty-title',
						description: 'my-empty-desc',
					},
				},
			})

			expect(container.querySelector('.base-empty')?.classList.contains('my-empty-root')).toBe(true)
			expect(container.querySelector('.base-empty__title')?.classList.contains('my-empty-title')).toBe(true)
			expect(container.querySelector('.base-empty__description')?.classList.contains('my-empty-desc')).toBe(true)
		})
	})
})
