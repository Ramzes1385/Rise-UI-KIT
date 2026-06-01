/**
 * Integration-тесты для BaseSkeleton.
 * Проверяют рендер с реальными стилями и вычисляемыми размерами.
 */

import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/vue'

import BaseSkeleton from './BaseSkeleton.vue'

describe('BaseSkeleton integration', () => {
	it('должен рендерить скелетон с числовыми размерами', () => {
		const { container } = render(BaseSkeleton, {
			props: { width: 200, height: 40 },
		})

		const el = container.querySelector('.base-skeleton') as HTMLElement
		expect(el.style.width).toBe('200px')
		expect(el.style.height).toBe('40px')
	})

	it('должен рендерить скелетон со строковыми размерами', () => {
		const { container } = render(BaseSkeleton, {
			props: { width: '100%', height: '2rem' },
		})

		const el = container.querySelector('.base-skeleton') as HTMLElement
		expect(el.style.width).toBe('100%')
		expect(el.style.height).toBe('2rem')
	})

	it('должен масштабировать числовые размеры при sizeScale', () => {
		const { container } = render(BaseSkeleton, {
			props: { width: 200, height: 40, sizeScale: 150 },
		})

		const el = container.querySelector('.base-skeleton') as HTMLElement
		expect(el.style.width).toBe('300px')
		expect(el.style.height).toBe('60px')
	})

	it('должен масштабировать строковые размеры при sizeScale через calc', () => {
		const { container } = render(BaseSkeleton, {
			props: { width: '100%', height: '2rem', sizeScale: 150 },
		})

		const el = container.querySelector('.base-skeleton') as HTMLElement
		expect(el.style.width).toBe('calc(150%)')
		expect(el.style.height).toBe('calc(3rem)')
	})

	it('должен применять модификатор формы --circle', () => {
		const { container } = render(BaseSkeleton, {
			props: { shape: 'circle', width: 48, height: 48 },
		})

		expect(container.querySelector('.base-skeleton--circle')).toBeInTheDocument()
	})

	it('должен применять модификатор --animated по умолчанию', () => {
		const { container } = render(BaseSkeleton)

		expect(container.querySelector('.base-skeleton--animated')).toBeInTheDocument()
	})

	it('должен применять модификатор --pulse когда isPulse=true', () => {
		const { container } = render(BaseSkeleton, {
			props: { isPulse: true },
		})

		expect(container.querySelector('.base-skeleton--pulse')).toBeInTheDocument()
	})

	it('должен устанавливать кастомный цвет фона', () => {
		const { container } = render(BaseSkeleton, {
			props: { color: '#e0e0e0' },
		})

		const el = container.querySelector('.base-skeleton') as HTMLElement
		expect(el.style.backgroundColor).toBe('rgb(224, 224, 224)')
	})
})
