import { expect } from 'storybook/test'
import type meta from '../BaseSideBar.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const NotCollapsible: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: '`isCollapsible: false` — панель без кнопки сворачивания.' } } },
	args: { isCollapsible: false },
	play: async ({ canvas }) => {
		await expect(canvas.queryByRole('button', { name: 'Свернуть' })).toBeNull()
	},
}
