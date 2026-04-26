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

	describe('пропс image', () => {
		it('должен рендерить изображение когда передан', () => {
			const { container } = render(BaseCard, {
				props: { image: '/test.jpg', imageAlt: 'Тест' },
			})

			const img = container.querySelector<HTMLImageElement>('.base-card__image')
			expect(img).toBeInTheDocument()
			expect(img?.src).toContain('/test.jpg')
		})

		it('не должен рендерить изображение когда не передан', () => {
			const { container } = render(BaseCard)

			expect(container.querySelector('.base-card__image-wrapper')).not.toBeInTheDocument()
		})
	})

	describe('пропс variant', () => {
		it('должен применять модификатор --default по умолчанию', () => {
			const { container } = render(BaseCard)

			expect(container.querySelector('.base-card')?.classList.contains('base-card--default')).toBe(true)
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
})
