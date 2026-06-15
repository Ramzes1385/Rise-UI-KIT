/**
 * Integration-тесты для BaseLoader.
 * Проверяют: isOverlay оверлей, hasLabel текст, варианты анимации.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import BaseLoader from '../ui/BaseLoader.vue'

describe('BaseLoader integration', () => {
	describe('пропс isOverlay', () => {
		it('должен применять класс --overlay когда isOverlay=true', () => {
			const { container } = render(BaseLoader, {
				props: { isOverlay: true },
			})

			expect(container.querySelector('.base-loader')?.classList.contains('base-loader--overlay')).toBe(true)
		})

		it('не должен применять класс --overlay по умолчанию', () => {
			const { container } = render(BaseLoader, {
				props: { isOverlay: false },
			})

			expect(container.querySelector('.base-loader')?.classList.contains('base-loader--overlay')).toBe(false)
		})
	})

	describe('пропс hasLabel', () => {
		it('должен рендерить текст загрузки когда hasLabel=true', () => {
			render(BaseLoader, {
				props: { hasLabel: true, label: 'Загрузка данных...' },
			})

			expect(screen.getByText('Загрузка данных...')).toBeInTheDocument()
		})

		it('не должен рендерить текст когда hasLabel=false', () => {
			const { container } = render(BaseLoader, {
				props: { hasLabel: false },
			})

			expect(container.querySelector('.base-loader__label')).not.toBeInTheDocument()
		})

		it('должен использовать текст по умолчанию', () => {
			render(BaseLoader, {
				props: { hasLabel: true },
			})

			expect(screen.getByText('Загрузка...')).toBeInTheDocument()
		})
	})

	describe('варианты анимации', () => {
		it('должен рендерить spinner по умолчанию', () => {
			const { container } = render(BaseLoader)

			expect(container.querySelector('.base-loader__spinner')).toBeInTheDocument()
		})

		it('должен рендерить dots когда variant=dots', () => {
			const { container } = render(BaseLoader, {
				props: { variant: 'dots' },
			})

			expect(container.querySelector('.base-loader__dot')).toBeInTheDocument()
		})

		it('должен рендерить pulse когда variant=pulse', () => {
			const { container } = render(BaseLoader, {
				props: { variant: 'pulse' },
			})

			expect(container.querySelector('.base-loader__pulse')).toBeInTheDocument()
		})

		it('должен рендерить bars когда variant=bars', () => {
			const { container } = render(BaseLoader, {
				props: { variant: 'bars' },
			})

			expect(container.querySelector('.base-loader__bar')).toBeInTheDocument()
		})
	})

	describe('доступность', () => {
		it('должен иметь role=status', () => {
			const { container } = render(BaseLoader)

			expect(container.querySelector('.base-loader')?.getAttribute('role')).toBe('status')
		})

		it('должен иметь aria-label', () => {
			const { container } = render(BaseLoader)

			expect(container.querySelector('.base-loader')?.getAttribute('aria-label')).toBe('Загрузка')
		})
	})
})
