import { expect } from 'storybook/test'
import type meta from '../../BaseFab.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Link: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Ссылка (`to`): кнопка ведёт на страницу создания.' } } },
	args: { to: '/tasks/new', isExtended: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('link', { name: 'Новая задача' })).toHaveAttribute('href', '/tasks/new')
	},
}
