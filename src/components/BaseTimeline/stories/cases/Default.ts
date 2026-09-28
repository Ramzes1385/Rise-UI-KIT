import { expect } from 'storybook/test'
import type meta from '../BaseTimeline.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Песочница: история заказа, текущий этап — «Передан в доставку».' } } },
	play: async ({ canvas }) => {
		const items = canvas.getAllByRole('listitem')
		await expect(items).toHaveLength(4)
		await expect(items[2]).toHaveAttribute('aria-current', 'step')
		await expect(items[0].querySelector('time')).toHaveAttribute('datetime')
	},
}
