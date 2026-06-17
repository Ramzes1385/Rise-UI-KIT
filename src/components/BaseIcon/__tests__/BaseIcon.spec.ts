/**
 * Unit-тесты для компонента BaseIcon.
 * Проверяет рендеринг, пропсы, трансформации и доступность.
 */

import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/vue'
import BaseIcon from '../ui/BaseIcon.vue'

/** Мокаем useIcon — разрыв циклической зависимости */
vi.mock('@composables/useIcon', () => ({
	useIcon: () => ({
		getIconUrl: (name: string) => `icons.svg#${name}`,
	}),
	createIconPlugin: () => ({ install: () => {} }),
}))

/** Получить корневой элемент иконки из DOM */
function getIconRoot(): HTMLElement | null {
	return document.querySelector('.base-icon')
}

/** Получить SVG-элемент иконки из DOM */
function getIconSvg(): SVGSVGElement | null {
	return document.querySelector('.base-icon__svg') as SVGSVGElement | null
}

beforeEach(() => {
	document.body.innerHTML = ''
})

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
		expect(use?.getAttribute('href')).toContain('#close')
	})

	it('должен применять sizeScale через CSS-переменную', () => {
		render(BaseIcon, { props: { name: 'close', sizeScale: 150 } })

		const root = getIconRoot()
		expect(root?.style.getPropertyValue('--size-scale')).toBe('1.5')
	})

	it('не должен устанавливать --size-scale при значении 100', () => {
		render(BaseIcon, { props: { name: 'close', sizeScale: 100 } })

		const root = getIconRoot()
		expect(root?.style.getPropertyValue('--size-scale')).toBe('')
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

	it('должен явно обрабатывать isFlipX=false', () => {
		render(BaseIcon, { props: { name: 'close', isFlipX: false } })

		const svg = getIconSvg()
		expect(svg?.style.transform).not.toContain('scaleX(-1)')
	})

	it('должен применять отражение по вертикали', () => {
		render(BaseIcon, { props: { name: 'close', isFlipY: true } })

		const svg = getIconSvg()
		expect(svg?.style.transform).toContain('scaleY(-1)')
	})

	it('должен явно обрабатывать isFlipY=false', () => {
		render(BaseIcon, { props: { name: 'close', isFlipY: false } })

		const svg = getIconSvg()
		expect(svg?.style.transform).not.toContain('scaleY(-1)')
	})

	it('должен комбинировать поворот и отражение', () => {
		render(BaseIcon, { props: { name: 'close', rotate: 90, isFlipX: true } })

		const svg = getIconSvg()
		expect(svg?.style.transform).toContain('rotate(90deg)')
		expect(svg?.style.transform).toContain('scaleX(-1)')
	})

	it('должен применять цвет через инлайн-стиль', () => {
		render(BaseIcon, { props: { name: 'close', color: 'red' } })

		const svg = getIconSvg()
		expect(svg?.style.color).toBe('red')
	})

	it('не должен устанавливать цвет при пустом значении', () => {
		render(BaseIcon, { props: { name: 'close' } })

		const svg = getIconSvg()
		expect(svg?.style.color).toBe('')
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

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			render(BaseIcon, {
				props: {
					name: 'close',
					customClass: 'custom-icon-class',
				},
			})

			const root = getIconRoot()
			expect(root).toHaveClass('custom-icon-class')
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			render(BaseIcon, {
				props: {
					name: 'close',
					customClass: {
						root: 'custom-icon-root',
						svg: 'custom-icon-svg',
					},
				},
			})

			const root = getIconRoot()
			const svg = getIconSvg()

			expect(root).toHaveClass('custom-icon-root')
			expect(svg).toHaveClass('custom-icon-svg')
		})
	})
})
