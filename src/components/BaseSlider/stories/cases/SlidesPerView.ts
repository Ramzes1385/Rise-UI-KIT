import { expect } from 'storybook/test'
import type meta from '../BaseSlider.stories'
import { PHOTOS, sliderNav } from '../shared'
import type { StoryObj } from '@storybook/vue3-vite'

export const SlidesPerView: StoryObj<typeof meta> = {
	args: { items: PHOTOS, slidesPerView: 3, spaceBetween: 12, height: '160px' },
	parameters: {
		docs: {
			description: {
				story: [
					'Несколько слайдов на экране: `slidesPerView` — сколько видно, `slidesPerGroup` — на сколько листать,',
					'`spaceBetween` — промежуток в px (при нём скругляется каждый слайд). Точка — позиция первого видимого слайда.',
				].join('\n'),
			},
		},
		maxWidth: 720,
	},
	play: async ({ canvasElement, userEvent }) => {
		const slides = canvasElement.querySelectorAll<HTMLElement>('.base-slider__slide')
		await expect(slides[2]).not.toHaveAttribute('inert')
		await expect(slides[3]).toHaveAttribute('inert')

		await userEvent.click(sliderNav(canvasElement, 2))
		await expect(slides[0]).toHaveAttribute('inert')
		await expect(slides[3]).not.toHaveAttribute('inert')
	},
}
