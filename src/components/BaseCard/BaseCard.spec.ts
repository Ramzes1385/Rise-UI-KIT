/**
 * Unit-тесты для BaseCard.
 * Проверяют рендер, пропсы, слоты и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import BaseCard from './BaseCard.vue'

describe('BaseCard unit', () => {
	describe('рендер', () => {
		it('должен рендерить карточку', () => {
			const { container } = render(BaseCard)

			expect(container.querySelector('.base-card')).toBeInTheDocument()
		})

		it('должен рендерить body с контентом слота', () => {
			const { container } = render(BaseCard, {
				slots: { default: '<p>Контент</p>' },
			})

			expect(container.querySelector('.base-card__body')).toBeInTheDocument()
			expect(screen.getByText('Контент')).toBeInTheDocument()
		})
	})

	describe('пропс title', () => {
		it('должен рендерить заголовок когда передан', () => {
			render(BaseCard, { props: { title: 'Заголовок' } })

			expect(screen.getByText('Заголовок')).toBeInTheDocument()
		})

		it('должен рендерить header когда есть title', () => {
			const { container } = render(BaseCard, { props: { title: 'Заголовок' } })

			expect(container.querySelector('.base-card__header')).toBeInTheDocument()
		})
	})

	describe('пропс subtitle', () => {
		it('должен рендерить подзаголовок когда передан', () => {
			render(BaseCard, { props: { subtitle: 'Описание' } })

			expect(screen.getByText('Описание')).toBeInTheDocument()
		})
	})

	describe('пропс variant', () => {
		it('не должен добавлять модификатор для варианта default', () => {
			const { container } = render(BaseCard)

			expect(container.querySelector('.base-card')?.classList.contains('base-card--default')).toBe(false)
		})

		it('должен применять модификатор --outline когда variant=outline', () => {
			const { container } = render(BaseCard, { props: { variant: 'outline' } })

			expect(container.querySelector('.base-card')?.classList.contains('base-card--outline')).toBe(true)
		})

		it('должен применять модификатор --ghost когда variant=ghost', () => {
			const { container } = render(BaseCard, { props: { variant: 'ghost' } })

			expect(container.querySelector('.base-card')?.classList.contains('base-card--ghost')).toBe(true)
		})
	})

	describe('пропс isHoverable', () => {
		it('должен добавлять класс --hoverable когда isHoverable=true', () => {
			const { container } = render(BaseCard, { props: { isHoverable: true } })

			expect(container.querySelector('.base-card')?.classList.contains('base-card--hoverable')).toBe(true)
		})

		it('не должен добавлять класс --hoverable по умолчанию', () => {
			const { container } = render(BaseCard)

			expect(container.querySelector('.base-card')?.classList.contains('base-card--hoverable')).toBe(false)
		})
	})

	describe('слоты', () => {
		it('должен рендерить footer-слот', () => {
			const { container } = render(BaseCard, {
				slots: { footer: '<button>Действие</button>' },
			})

			expect(container.querySelector('.base-card__footer')).toBeInTheDocument()
			expect(screen.getByText('Действие')).toBeInTheDocument()
		})

		it('не должен рендерить footer когда слот не передан', () => {
			const { container } = render(BaseCard)

			expect(container.querySelector('.base-card__footer')).not.toBeInTheDocument()
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseCard, {
				props: { customClass: 'custom-card-class' },
			})

			expect(container.querySelector('.base-card')).toHaveClass('custom-card-class')
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseCard, {
				props: {
					title: 'Заголовок',
					subtitle: 'Подзаголовок',
					customClass: {
						root: 'custom-root',
						header: 'custom-header',
						title: 'custom-title',
						subtitle: 'custom-subtitle',
						actions: 'custom-actions',
						body: 'custom-body',
						footer: 'custom-footer',
					},
				},
				slots: {
					actions: '<button>Кнопка</button>',
					footer: '<p>Подвал</p>',
				},
			})

			expect(container.querySelector('.base-card')).toHaveClass('custom-root')
			expect(container.querySelector('.base-card__header')).toHaveClass('custom-header')
			expect(container.querySelector('.base-card__title')).toHaveClass('custom-title')
			expect(container.querySelector('.base-card__subtitle')).toHaveClass('custom-subtitle')
			expect(container.querySelector('.base-card__actions')).toHaveClass('custom-actions')
			expect(container.querySelector('.base-card__body')).toHaveClass('custom-body')
			expect(container.querySelector('.base-card__footer')).toHaveClass('custom-footer')
		})
	})
})
