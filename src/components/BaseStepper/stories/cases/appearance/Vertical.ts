import { expect } from 'storybook/test'
import type meta from '../../BaseStepper.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Vertical: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Вертикальная ориентация: подписи справа от индикаторов, линия — отрезками между шагами.' } },
	},
	args: { orientation: 'vertical', modelValue: 3 },
	play: async ({ canvas }) => {
		const [first, second] = canvas.getAllByRole('button')
		await expect(second.getBoundingClientRect().top).toBeGreaterThan(first.getBoundingClientRect().bottom - 1)
	},
}
