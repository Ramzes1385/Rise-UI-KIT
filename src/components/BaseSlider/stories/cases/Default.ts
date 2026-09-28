import { sliderNav } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../BaseSlider.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Песочница: стрелки листают по одному слайду, точки ведут на нужный слайд; смена вызывает `change`.' },
		},
	},
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Следующий слайд' }))
		await expect(sliderNav(canvasElement, 2)).toHaveAttribute('aria-current', 'true')
		await expect(args.onNext).toHaveBeenCalledOnce()

		await userEvent.click(sliderNav(canvasElement, 4))
		await expect(sliderNav(canvasElement, 4)).toHaveAttribute('aria-current', 'true')
		await expect(args.onChange).toHaveBeenLastCalledWith(3)
	},
}
