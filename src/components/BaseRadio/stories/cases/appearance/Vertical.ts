import { expect } from 'storybook/test'
import type meta from '../../BaseRadio.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Vertical: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Вертикальная группа `isVertical` — для длинных подписей и больше чем 3–4 опций.' } } },
	args: { isVertical: true, name: 'delivery-vertical' },
	play: async ({ canvas }) => {
		const [first, second] = canvas.getAllByRole('radio')
		await expect(second.getBoundingClientRect().top).toBeGreaterThan(first.getBoundingClientRect().top)
	},
}
