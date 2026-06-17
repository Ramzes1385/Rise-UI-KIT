/**
 * Unit-тесты для BaseSkeleton.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/vue'
import BaseSkeleton from '../ui/BaseSkeleton.vue'

describe('BaseSkeleton unit', () => {
	describe('рендер', () => {
		it('должен рендерить скелетон', () => {
			const { container } = render(BaseSkeleton)

			expect(container.querySelector('.base-skeleton')).toBeInTheDocument()
		})
	})

	describe('пропс shape', () => {
		it('должен применять модификатор --rect по умолчанию', () => {
			const { container } = render(BaseSkeleton)

			expect(container.querySelector('.base-skeleton')?.classList.contains('base-skeleton--rect')).toBe(true)
		})

		it('должен применять модификатор --text когда shape=text', () => {
			const { container } = render(BaseSkeleton, { props: { shape: 'text' } })

			expect(container.querySelector('.base-skeleton')?.classList.contains('base-skeleton--text')).toBe(true)
		})

		it('должен применять модификатор --circle когда shape=circle', () => {
			const { container } = render(BaseSkeleton, { props: { shape: 'circle' } })

			expect(container.querySelector('.base-skeleton')?.classList.contains('base-skeleton--circle')).toBe(true)
		})
	})

	describe('пропс isAnimated', () => {
		it('должен добавлять класс --animated по умолчанию', () => {
			const { container } = render(BaseSkeleton)

			expect(container.querySelector('.base-skeleton')?.classList.contains('base-skeleton--animated')).toBe(true)
		})

		it('не должен добавлять класс --animated когда isAnimated=false', () => {
			const { container } = render(BaseSkeleton, { props: { isAnimated: false } })

			expect(container.querySelector('.base-skeleton')?.classList.contains('base-skeleton--animated')).toBe(false)
		})
	})

	describe('пропс isPulse', () => {
		it('должен добавлять класс --pulse когда isPulse=true', () => {
			const { container } = render(BaseSkeleton, { props: { isPulse: true } })

			expect(container.querySelector('.base-skeleton')?.classList.contains('base-skeleton--pulse')).toBe(true)
		})

		it('не должен добавлять класс --pulse по умолчанию', () => {
			const { container } = render(BaseSkeleton)

			expect(container.querySelector('.base-skeleton')?.classList.contains('base-skeleton--pulse')).toBe(false)
		})
	})

	describe('пропсы width/height', () => {
		it('должен устанавливать ширину в пикселях когда передано число', () => {
			const { container } = render(BaseSkeleton, { props: { width: 200 } })

			const el = container.querySelector('.base-skeleton') as HTMLElement
			expect(el.style.width).toBe('200px')
		})

		it('должен устанавливать высоту в пикселях когда передано число', () => {
			const { container } = render(BaseSkeleton, { props: { height: 16 } })

			const el = container.querySelector('.base-skeleton') as HTMLElement
			expect(el.style.height).toBe('16px')
		})

		it('должен устанавливать ширину как строку когда передана строка', () => {
			const { container } = render(BaseSkeleton, { props: { width: '100%' } })

			const el = container.querySelector('.base-skeleton') as HTMLElement
			expect(el.style.width).toBe('100%')
		})
	})

	describe('пропс color', () => {
		it('должен устанавливать backgroundColor когда передан color', () => {
			const { container } = render(BaseSkeleton, { props: { color: '#e0e7ff' } })

			const el = container.querySelector('.base-skeleton') as HTMLElement
			expect(el.style.backgroundColor).toBe('rgb(224, 231, 255)')
		})

		it('не должен устанавливать backgroundColor по умолчанию', () => {
			const { container } = render(BaseSkeleton)

			const el = container.querySelector('.base-skeleton') as HTMLElement
			expect(el.style.backgroundColor).toBe('')
		})
	})

	describe('пропс sizeScale', () => {
		it('должен масштабировать ширину-число при sizeScale=150', () => {
			const { container } = render(BaseSkeleton, { props: { width: 100, sizeScale: 150 } })

			const el = container.querySelector('.base-skeleton') as HTMLElement
			expect(el.style.width).toBe('150px')
		})

		it('должен масштабировать высоту-число при sizeScale=75', () => {
			const { container } = render(BaseSkeleton, { props: { height: 40, sizeScale: 75 } })

			const el = container.querySelector('.base-skeleton') as HTMLElement
			expect(el.style.height).toBe('30px')
		})

		it('должен масштабировать строковую ширину через calc', () => {
			const { container } = render(BaseSkeleton, { props: { width: '100%', sizeScale: 150 } })

			const el = container.querySelector('.base-skeleton') as HTMLElement
			expect(el.style.width).toBe('calc(150%)')
		})

		it('не должен добавлять --size-scale при значении 100', () => {
			const { container } = render(BaseSkeleton, { props: { sizeScale: 100 } })

			const el = container.querySelector('.base-skeleton') as HTMLElement
			expect(el.style.getPropertyValue('--size-scale')).toBe('')
		})

		it('должен добавлять --size-scale при значении отличном от 100', () => {
			const { container } = render(BaseSkeleton, { props: { sizeScale: 150 } })

			const el = container.querySelector('.base-skeleton') as HTMLElement
			expect(el.style.getPropertyValue('--size-scale')).toBe('1.5')
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseSkeleton, {
				props: { customClass: 'custom-skeleton-class' },
			})

			expect(container.querySelector('.base-skeleton')?.classList.contains('custom-skeleton-class')).toBe(true)
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseSkeleton, {
				props: {
					customClass: {
						root: 'custom-skeleton-root',
					},
				},
			})

			expect(container.querySelector('.base-skeleton')?.classList.contains('custom-skeleton-root')).toBe(true)
		})
	})
})
