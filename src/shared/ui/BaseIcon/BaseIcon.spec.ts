/**
 * Unit-тесты для компонента BaseIcon.
 * Проверяет рендеринг, пропсы, трансформации и доступность.
 */

import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import BaseIcon from './BaseIcon.vue'

/** Получить SVG-элемент иконки из DOM */
function getIconSvg(): SVGSVGElement | null {
	return document.querySelector('.base-icon') as SVGSVGElement | null
}

describe('BaseIcon', () => {
	it('должен рендерить SVG-элемент', () => {
		render(BaseIcon, { props: { name: 'close' } })

		const svg = getIconSvg()
		expect(svg).toBeTruthy()
		expect(svg?.tagName).toBe('svg')
	})

	it('должен рендерить <use> с правильным href', () => {
		render(BaseIcon, { props: { name: 'close' } })

		const use = document.querySelector('.base-icon use')
		expect(use?.getAttribute('href')).toBe('/icons.svg#close')
	})

	it('должен применять модификатор размера', () => {
		render(BaseIcon, { props: { name: 'close', size: 'lg' } })

		const svg = getIconSvg()
		expect(svg?.classList.contains('base-icon--lg')).toBe(true)
	})

	it('должен применять размер md по умолчанию', () => {
		render(BaseIcon, { props: { name: 'close' } })

		const svg = getIconSvg()
		expect(svg?.classList.contains('base-icon--md')).toBe(true)
	})

	it('должен применять поворот через инлайн-стиль', () => {
		render(BaseIcon, { props: { name: 'close', rotate: 90 } })

		const svg = getIconSvg()
		expect(svg?.style.transform).toContain('rotate(90deg)')
	})

	it('должен применять отражение по горизонтали', () => {
		render(BaseIcon, { props: { name: 'close', isFlipX: true } })

		const svg = getIconSvg()
		expect(svg?.style.transform).toContain('scaleX(-1)')
	})

	it('должен применять отражение по вертикали', () => {
		render(BaseIcon, { props: { name: 'close', isFlipY: true } })

		const svg = getIconSvg()
		expect(svg?.style.transform).toContain('scaleY(-1)')
	})

	it('должен применять цвет через инлайн-стиль', () => {
		render(BaseIcon, { props: { name: 'close', color: 'red' } })

		const svg = getIconSvg()
		expect(svg?.style.color).toBe('red')
	})

	it('должен быть декоративным без ariaLabel', () => {
		render(BaseIcon, { props: { name: 'close' } })

		const svg = getIconSvg()
		expect(svg?.getAttribute('aria-hidden')).toBe('true')
		expect(svg?.getAttribute('role')).toBe('presentation')
	})

	it('должен быть доступным с ariaLabel', () => {
		render(BaseIcon, { props: { name: 'close', ariaLabel: 'Закрыть' } })

		const svg = getIconSvg()
		expect(svg?.getAttribute('aria-hidden')).toBeNull()
		expect(svg?.getAttribute('aria-label')).toBe('Закрыть')
		expect(svg?.getAttribute('role')).toBe('img')
	})

	it('должен иметь focusable="false"', () => {
		render(BaseIcon, { props: { name: 'close' } })

		const svg = getIconSvg()
		expect(svg?.getAttribute('focusable')).toBe('false')
	})
})
