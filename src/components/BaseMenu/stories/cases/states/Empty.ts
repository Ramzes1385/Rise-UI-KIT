import { expect } from 'storybook/test'
import type meta from '../../BaseMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Empty: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Без пунктов остаётся пустая панель.' } } },
	args: { items: [] },
	play: async ({ canvas }) => {
		await expect(canvas.queryAllByRole('button')).toHaveLength(0)
	},
}
