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
		it('не должен задавать кастомный цвет по умолчанию', () => {
			const { container } = render(BaseLoader)

			const style = container.querySelector('.base-loader')?.getAttribute('style') ?? ''
			expect(style).not.toContain('--custom-')
		})

		it('должен задавать кастомный цвет через style', () => {
			const { container } = render(BaseLoader, {
				props: { color: { text: { base: '#ff0000' } } },
			})

			expect(container.querySelector('.base-loader')?.getAttribute('style')).toContain('--custom-text: #ff0000')
		})
	})

	describe('пропс sizeScale', () => {
		it('не должен устанавливать --size-scale когда sizeScale=100', () => {
			const { container } = render(BaseLoader, {
				props: { sizeScale: 100 },
			})

			const loader = container.querySelector('.base-loader') as HTMLElement
			expect(loader.style.getPropertyValue('--size-scale')).toBe('')
		})

		it('должен устанавливать --size-scale когда sizeScale=150', () => {
			const { container } = render(BaseLoader, {
				props: { sizeScale: 150 },
			})

			const loader = container.querySelector('.base-loader') as HTMLElement
			expect(loader.style.getPropertyValue('--size-scale')).toBe('1.5')
		})

		it('должен устанавливать --size-scale когда sizeScale=50', () => {
			const { container } = render(BaseLoader, {
				props: { sizeScale: 50 },
			})

			const loader = container.querySelector('.base-loader') as HTMLElement
			expect(loader.style.getPropertyValue('--size-scale')).toBe('0.5')
		})
	})

	describe('структура spinner', () => {
		it('должен рендерить SVG для варианта spinner', () => {
			const { container } = render(BaseLoader, {
				props: { variant: 'spinner' },
			})

			expect(container.querySelector('.base-loader__spinner')).toBeInTheDocument()
			expect(container.querySelector('.base-loader__spinner-track')).toBeInTheDocument()
			expect(container.querySelector('.base-loader__spinner-fill')).toBeInTheDocument()
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseLoader, {
				props: { customClass: 'custom-loader-class' },
			})

			expect(container.querySelector('.base-loader')).toHaveClass('custom-loader-class')
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseLoader, {
				props: {
					hasLabel: true,
					label: 'Загрузка',
					customClass: {
						root: 'custom-loader-root',
						animation: 'custom-loader-animation',
						spinner: 'custom-loader-spinner',
						label: 'custom-loader-label',
					},
				},
			})

			expect(container.querySelector('.base-loader')).toHaveClass('custom-loader-root')
			expect(container.querySelector('.base-loader__animation')).toHaveClass('custom-loader-animation')
			expect(container.querySelector('.base-loader__spinner')).toHaveClass('custom-loader-spinner')
			expect(container.querySelector('.base-loader__label')).toHaveClass('custom-loader-label')
		})
	})
})
