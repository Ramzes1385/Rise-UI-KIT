import '@testing-library/jest-dom/vitest'
import BaseSlider from '../ui/BaseSlider.vue'
import { fireEvent, render } from '@testing-library/vue'
import type { SliderAnimation, SliderItem } from '../types/BaseSlider.types'

const ITEMS: SliderItem[] = Array.from({ length: 7 }, (_, index) => ({ src: `slide${index}.jpg`, alt: `Слайд ${index + 1}` }))

function offsets(container: Element): string[] {
	return [...container.querySelectorAll<HTMLElement>('.base-slider__slide')].map(slide => slide.style.getPropertyValue('--slide-offset'))
}

function renderSlider(animation: SliderAnimation, props: Record<string, unknown> = {}) {
	return render(BaseSlider, { props: { items: ITEMS, animation, ...props } })
}

describe('BaseSlider: пространственные эффекты', () => {
	it.each(['cube', 'coverflow'] as const)('%s: у каждого слайда смещение от текущего с переходом через край по кругу', animation => {
		const { container } = renderSlider(animation)

		expect(container.querySelector(`.base-slider--${animation}`)).toBeInTheDocument()
		expect(offsets(container)).toEqual(['0', '1', '2', '3', '-3', '-2', '-1'])
	})

	it('смещение ограничено, а расстояние и слой считаются по модулю', () => {
		const { container } = renderSlider('coverflow', { isLoop: false, initialIndex: 5 })

		expect(offsets(container)).toEqual(['-3', '-3', '-3', '-2', '-1', '0', '1'])
		const slides = container.querySelectorAll<HTMLElement>('.base-slider__slide')
		expect(slides[3].style.getPropertyValue('--slide-distance')).toBe('2')
		expect(slides[3].style.zIndex).toBe('1')
		expect(slides[5].style.zIndex).toBe('3')
	})

	it('при двух слайдах по кругу не переносит', () => {
		const { container } = render(BaseSlider, { props: { items: ITEMS.slice(0, 2), animation: 'cube', initialIndex: 1 } })

		expect(offsets(container)).toEqual(['-1', '0'])
	})

	it('после перехода смещения пересчитываются', async () => {
		const { container, getByRole } = renderSlider('cube')

		await fireEvent.click(getByRole('button', { name: 'Следующий слайд' }))

		expect(offsets(container)).toEqual(['-1', '0', '1', '2', '3', '-3', '-2'])
	})

	it.each(['slide', 'fade', 'scale'] as const)('%s: без смещений', animation => {
		const { container } = renderSlider(animation)

		expect(offsets(container).every(value => value === '')).toBe(true)
	})
})
