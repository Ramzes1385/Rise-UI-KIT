import '@testing-library/jest-dom/vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createUiKitPlugin } from '@/plugin'
import { dirname, resolve } from 'node:path'
import BaseSlider from '../ui/BaseSlider.vue'
import { render } from '@testing-library/vue'
import { SLIDER_PARTS } from '../types/BaseSlider.types'
import type { SliderItem } from '../types/BaseSlider.types'

const ITEMS: SliderItem[] = [
	{ src: 'slide1.jpg', alt: 'Слайд 1', type: 'image', title: 'Горы', description: 'Рассвет' },
	{ src: 'video.mp4', type: 'video', poster: 'poster.jpg' },
	{ src: 'slide3.jpg', alt: 'Слайд 3', type: 'image' },
]

const FULL = { items: ITEMS, navigation: 'both', isAutoplay: true } as const

const STYLES = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../styles/BaseSlider.style.scss'), 'utf-8')

describe('BaseSlider: проп ui', () => {
	beforeEach(() => {
		vi.stubGlobal(
			'matchMedia',
			vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
		)
	})

	afterEach(() => vi.unstubAllGlobals())

	it('без ui — только классы кита', () => {
		const { container } = render(BaseSlider, { props: FULL })

		for (const part of [
			'body',
			'stage',
			'arrows',
			'viewport',
			'track',
			'video',
			'caption',
			'title',
			'desc',
			'navigation',
			'dots',
			'thumbs',
		]) {
			expect(container.querySelector(`.base-slider__${part}`)).toHaveAttribute('class', `base-slider__${part}`)
		}
		expect(container.querySelector('.base-slider__dot')).toHaveAttribute('class', 'base-slider__dot base-slider__dot--active')
		expect(container.querySelectorAll('.base-slider__dot')[1]).toHaveAttribute('class', 'base-slider__dot')
		expect(container.querySelector('.base-slider__thumb-play')).toHaveAttribute('class', 'base-slider__thumb-play')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const ui = Object.fromEntries([...SLIDER_PARTS, 'root'].map(part => [part, `u-${part}`]))
		const { container } = render(BaseSlider, { props: { ...FULL, customClass: { dot: 'own-dot' }, ui } })

		expect(container.querySelector('.base-slider')).toHaveClass('u-root', 'base-slider--slide', 'base-slider--arrows-center')
		for (const part of SLIDER_PARTS) {
			const elements = container.querySelectorAll(`.base-slider__${part}`)
			expect(elements.length).toBeGreaterThan(0)
			for (const element of elements) expect(element).toHaveClass(`u-${part}`)
		}
		expect(container.querySelector('.base-slider__arrow--prev')).toHaveClass('base-slider__arrow', 'u-arrow')
		expect(container.querySelector('.base-slider__arrow--next')).toHaveClass('base-slider__arrow', 'u-arrow')
		expect(container.querySelector('.base-slider__dot')).toHaveClass('base-slider__dot--active', 'own-dot', 'u-dot')
		expect(container.querySelector('.base-slider__thumb')).toHaveClass('base-slider__thumb--active', 'u-thumb')
	})

	it('классы из defaults.BaseSlider.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseSlider, {
			props: { items: ITEMS, ui: { viewport: 'own-viewport' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseSlider: { ui: { root: 'app-root', viewport: 'app-viewport' } } } })] },
		})

		expect(container.querySelector('.base-slider')).toHaveClass('base-slider', 'app-root')
		expect(container.querySelector('.base-slider__viewport')).toHaveAttribute(
			'class',
			'base-slider__viewport app-viewport own-viewport',
		)
	})
})

describe('BaseSlider: движение в стилях', () => {
	it('длительности только токенами: чисел в s и ms нет (reduce и пресет none обнуляют токены — смена сразу)', () => {
		expect(STYLES).not.toMatch(/\b\d*\.?\d+m?s\b/)
		expect(STYLES).toMatch(/transition: transform var\(--rise-duration-slow\) var\(--rise-ease\)/)
	})

	it('точки не анимируют раскладку: transform и clip-path вместо width и height', () => {
		const dot = STYLES.slice(STYLES.indexOf('&__dot {'), STYLES.indexOf('&__thumbs {'))

		expect(dot).not.toMatch(/transition[^;]*\b(width|height)\b/)
		expect(dot).toMatch(/transition: transform var\(--rise-duration\) var\(--rise-ease\)/)
		expect(dot).toMatch(/clip-path var\(--rise-duration\) var\(--rise-ease\)/)
		expect(dot).not.toMatch(/&--active \{\s*width/)
	})
})
