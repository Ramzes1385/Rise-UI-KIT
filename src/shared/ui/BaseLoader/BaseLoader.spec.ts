/**
 * Unit-тесты для BaseLoader.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import BaseLoader from './BaseLoader.vue'

describe('BaseLoader unit', () => {
	describe('рендер', () => {
		it('должен рендерить лоадер', () => {
			const { container } = render(BaseLoader)

			expect(container.querySelector('.base-loader')).toBeInTheDocument()
		})

		it('должен иметь role=status', () => {
			const { container } = render(BaseLoader)

			expect(container.querySelector('.base-loader')?.getAttribute('role')).toBe('status')
		})

		it('должен иметь aria-label=Загрузка', () => {
			const { container } = render(BaseLoader)

			expect(container.querySelector('.base-loader')?.getAttribute('aria-label')).toBe('Загрузка')
		})
	})

	describe('пропс variant', () => {
		it('должен применять модификатор --spinner по умолчанию', () => {
			const { container } = render(BaseLoader)

			expect(container.querySelector('.base-loader')?.classList.contains('base-loader--spinner')).toBe(true)
		})

		it('должен применять модификатор --dots когда variant=dots', () => {
			const { container } = render(BaseLoader, {
				props: { variant: 'dots' },
			})

			expect(container.querySelector('.base-loader')?.classList.contains('base-loader--dots')).toBe(true)
		})

		it('должен применять модификатор --pulse когда variant=pulse', () => {
			const { container } = render(BaseLoader, {
				props: { variant: 'pulse' },
			})

			expect(container.querySelector('.base-loader')?.classList.contains('base-loader--pulse')).toBe(true)
		})

		it('должен применять модификатор --bars когда variant=bars', () => {
			const { container } = render(BaseLoader, {
				props: { variant: 'bars' },
			})

			expect(container.querySelector('.base-loader')?.classList.contains('base-loader--bars')).toBe(true)
		})
	})

	describe('пропс size', () => {
		it('должен применять модификатор --md по умолчанию', () => {
			const { container } = render(BaseLoader)

			expect(container.querySelector('.base-loader')?.classList.contains('base-loader--md')).toBe(true)
		})

		it('должен применять модификатор --xs когда size=xs', () => {
			const { container } = render(BaseLoader, {
				props: { size: 'xs' },
			})

			expect(container.querySelector('.base-loader')?.classList.contains('base-loader--xs')).toBe(true)
		})

		it('должен применять модификатор --lg когда size=lg', () => {
			const { container } = render(BaseLoader, {
				props: { size: 'lg' },
			})

			expect(container.querySelector('.base-loader')?.classList.contains('base-loader--lg')).toBe(true)
		})
	})

	describe('пропс hasLabel', () => {
		it('не должен показывать текст по умолчанию', () => {
			render(BaseLoader)

			expect(screen.queryByText('Загрузка...')).not.toBeInTheDocument()
		})

		it('должен показывать текст когда hasLabel=true', () => {
			render(BaseLoader, {
				props: { hasLabel: true },
			})

			expect(screen.getByText('Загрузка...')).toBeInTheDocument()
		})

		it('должен показывать кастомный текст', () => {
			render(BaseLoader, {
				props: { hasLabel: true, label: 'Подождите...' },
			})

			expect(screen.getByText('Подождите...')).toBeInTheDocument()
		})
	})

	describe('пропс isOverlay', () => {
		it('не должен иметь класс --overlay по умолчанию', () => {
			const { container } = render(BaseLoader)

			expect(container.querySelector('.base-loader')?.classList.contains('base-loader--overlay')).toBe(false)
		})

		it('должен добавлять класс --overlay когда isOverlay=true', () => {
			const { container } = render(BaseLoader, {
				props: { isOverlay: true },
			})

			expect(container.querySelector('.base-loader')?.classList.contains('base-loader--overlay')).toBe(true)
		})
	})

	describe('пропс color', () => {
		it('не должен задавать --loader-color по умолчанию', () => {
			const { container } = render(BaseLoader)

			const animation = container.querySelector('.base-loader__animation')
			expect(animation?.getAttribute('style')).toBeFalsy()
		})

		it('должен задавать --loader-color через style', () => {
			const { container } = render(BaseLoader, {
				props: { color: '#ff0000' },
			})

			const animation = container.querySelector('.base-loader__animation')
			expect(animation?.getAttribute('style')).toContain('--loader-color: #ff0000')
		})
	})
})
