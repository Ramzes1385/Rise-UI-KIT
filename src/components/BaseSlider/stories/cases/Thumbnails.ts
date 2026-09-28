import { sliderNav } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../BaseSlider.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Thumbnails: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Миниатюры вместо точек: лента под слайдами прокручивается, если не помещается; у текущей — кольцо основного цвета.',
					'`navigation="both"` выводит точки и миниатюры вместе.',
				].join('\n'),
			},
		},
	},
	args: { navigation: 'thumbnails', height: '420px' },
	play: async ({ canvasElement, userEvent, args }) => {
		await userEvent.click(sliderNav(canvasElement, 3))
		await expect(sliderNav(canvasElement, 3)).toHaveAttribute('aria-current', 'true')
		await expect(sliderNav(canvasElement, 1)).not.toHaveAttribute('aria-current')
		await expect(args.onChange).toHaveBeenLastCalledWith(2)
	},
}
