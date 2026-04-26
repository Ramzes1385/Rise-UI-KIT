/**
 * Unit-тесты для BaseBadge.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import BaseBadge from './BaseBadge.vue'

describe('BaseBadge unit', () => {
	describe('рендер', () => {
		it('должен рендерить бейдж', () => {
			const { container } = render(BaseBadge)

			expect(container.querySelector('.base-badge')).toBeInTheDocument()
		})

		it('должен рендерить текст из пропса label', () => {
			render(BaseBadge, { props: { label: 'Новый' } })

			expect(screen.getByText('Новый')).toBeInTheDocument()
		})

		it('должен рендерить контент слота', () => {
			render(BaseBadge, { slots: { default: '<span>Слот</span>' } })

			expect(screen.getByText('Слот')).toBeInTheDocument()
		})
	})

	describe('пропс variant', () => {
		const variants = ['primary', 'secondary', 'success', 'warning', 'error', 'info'] as const

		variants.forEach(variant => {
			it(`должен применять модификатор --${variant}`, () => {
				const { container } = render(BaseBadge, { props: { variant } })

				expect(container.querySelector('.base-badge')?.classList.contains(`base-badge--${variant}`)).toBe(true)
			})
		})

		it('должен применять --primary по умолчанию', () => {
			const { container } = render(BaseBadge)

			expect(container.querySelector('.base-badge')?.classList.contains('base-badge--primary')).toBe(true)
		})
	})

	describe('пропс size', () => {
		it('должен применять модификатор --sm когда size=sm', () => {
			const { container } = render(BaseBadge, { props: { size: 'sm' } })

			expect(container.querySelector('.base-badge')?.classList.contains('base-badge--sm')).toBe(true)
		})

		it('должен применять модификатор --md по умолчанию', () => {
			const { container } = render(BaseBadge)

			expect(container.querySelector('.base-badge')?.classList.contains('base-badge--md')).toBe(true)
		})

		it('должен применять модификатор --lg когда size=lg', () => {
			const { container } = render(BaseBadge, { props: { size: 'lg' } })

			expect(container.querySelector('.base-badge')?.classList.contains('base-badge--lg')).toBe(true)
		})
	})

	describe('emit click', () => {
		it('должен эмитить click при клике на бейдж', async () => {
			const { emitted, container } = render(BaseBadge)

			const badge = container.querySelector('.base-badge') as HTMLElement
			badge.dispatchEvent(new Event('click'))

			const clickEvents = emitted()['click']
			expect(clickEvents).toBeTruthy()
		})
	})
})
