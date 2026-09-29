import { expect } from 'storybook/test'
import { sliderNav } from '../../shared'
import type meta from '../../BaseSlider.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithoutLoop: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Без зацикливания (`isLoop=false`): на первом слайде недоступна стрелка «назад», на последнем — «вперёд».',
			},
		},
	},
	args: { isLoop: false },
	play: async ({ canvas, canvasElement, userEvent }) => {
		await expect(canvas.getByRole('button', { name: 'Предыдущий слайд' })).toBeDisabled()

		await userEvent.click(sliderNav(canvasElement, 6))
		await expect(canvas.getByRole('button', { name: 'Следующий слайд' })).toBeDisabled()
		await expect(canvas.getByRole('button', { name: 'Предыдущий слайд' })).toBeEnabled()
	},
}
