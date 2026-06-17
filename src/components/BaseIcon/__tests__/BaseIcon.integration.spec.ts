/**
 * Integration-тесты для BaseIcon.
 * Проверяют рендер с реальным useIcon (без мока).
 */

import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/vue'
import BaseIcon from '../ui/BaseIcon.vue'

describe('BaseIcon integration', () => {
	it('должен рендерить SVG-элемент с реальным useIcon', () => {
		const { container } = render(BaseIcon, {
			props: { name: 'close' },
		})

		const svg = container.querySelector('.base-icon__svg')
		expect(svg).toBeInTheDocument()
		expect(svg?.tagName).toBe('svg')
	})

	it('должен рендерить <use> с href на спрайт', () => {
		const { container } = render(BaseIcon, {
			props: { name: 'close' },
		})

		const use = container.querySelector('.base-icon use')
		expect(use).toBeInTheDocument()
		expect(use?.getAttribute('href')).toContain('close')
	})

	it('должен рендерить иконку с другим именем', () => {
		const { container } = render(BaseIcon, {
			props: { name: 'plus' },
		})

		const use = container.querySelector('.base-icon use')
		expect(use?.getAttribute('href')).toContain('plus')
	})

	it('должен применять sizeScale через CSS-переменную', () => {
		const { container } = render(BaseIcon, {
			props: { name: 'close', sizeScale: 150 },
		})

		const root = container.querySelector('.base-icon') as HTMLElement
		expect(root?.style.getPropertyValue('--size-scale')).toBe('1.5')
	})

	it('должен применять поворот через инлайн-стиль', () => {
		const { container } = render(BaseIcon, {
			props: { name: 'close', rotate: 90 },
		})

		const svg = container.querySelector('.base-icon__svg') as HTMLElement
		expect(svg?.style.transform).toContain('rotate(90deg)')
	})

	it('должен быть декоративным без ariaLabel', () => {
		const { container } = render(BaseIcon, {
			props: { name: 'close' },
		})

		const svg = container.querySelector('.base-icon__svg')
		expect(svg?.getAttribute('aria-hidden')).toBe('true')
	})

	it('должен быть доступным с ariaLabel', () => {
		const { container } = render(BaseIcon, {
			props: { name: 'close', ariaLabel: 'Закрыть' },
		})

		const svg = container.querySelector('.base-icon__svg')
		expect(svg?.getAttribute('aria-hidden')).toBeNull()
		expect(svg?.getAttribute('aria-label')).toBe('Закрыть')
	})
})
