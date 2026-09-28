import { expect } from 'storybook/test'
import type meta from '../BaseAccordion.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Empty: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Без пунктов аккордеон ничего не выводит.' } } },
	args: { items: [] },
	play: async ({ canvas }) => {
		await expect(canvas.queryAllByRole('button')).toHaveLength(0)
	},
}
