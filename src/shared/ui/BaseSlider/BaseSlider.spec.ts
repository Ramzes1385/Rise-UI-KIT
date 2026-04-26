/**
 * Unit-тесты для BaseSlider.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/vue'

import type { SliderItem } from './BaseSlider.types'
import BaseSlider from './BaseSlider.vue'

const ITEMS: SliderItem[] = [
	{ src: 'slide1.jpg', alt: 'Слайд 1', type: 'image' },
	{ src: 'slide2.jpg', alt: 'Слайд 2', type: 'image' },
]

describe('BaseSlider unit', () => {
	describe('рендер', () => {
		it('должен рендерить слайдер', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS },
			})

			expect(container.querySelector('.base-slider')).toBeInTheDocument()
		})

		it('должен рендерить слайды', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS },
			})

			expect(container.querySelectorAll('.base-slider__slide').length).toBe(2)
		})

		it('должен рендерить изображения', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS },
			})

			expect(container.querySelectorAll('img').length).toBe(2)
		})
	})

	describe('пропс hasArrows', () => {
		it('должен рендерить стрелки когда hasArrows=true', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS, hasArrows: true },
			})

			expect(container.querySelector('.base-slider__arrows')).toBeInTheDocument()
		})

		it('не должен рендерить стрелки когда hasArrows=false', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS, hasArrows: false },
			})

			expect(container.querySelector('.base-slider__arrows')).not.toBeInTheDocument()
		})
	})

	describe('пропс navigation', () => {
		it('должен рендерить точки когда navigation=dots', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS, navigation: 'dots' },
			})

			expect(container.querySelector('.base-slider__dots')).toBeInTheDocument()
		})

		it('не должен рендерить точки когда navigation=none', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS, navigation: 'none' },
			})

			expect(container.querySelector('.base-slider__dots')).not.toBeInTheDocument()
		})
	})

	describe('пропс animation', () => {
		it('должен применять модификатор --slide по умолчанию', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS },
			})

			expect(container.querySelector('.base-slider')?.classList.contains('base-slider--slide')).toBe(true)
		})

		it('должен применять модификатор --fade когда animation=fade', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS, animation: 'fade' },
			})

			expect(container.querySelector('.base-slider')?.classList.contains('base-slider--fade')).toBe(true)
		})
	})
})
