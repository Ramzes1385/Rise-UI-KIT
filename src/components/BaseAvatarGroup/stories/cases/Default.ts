import { expect } from 'storybook/test'
import type meta from '../BaseAvatarGroup.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Песочница: четыре аватара и «+3».' } } },
	play: async ({ canvas }) => {
		const list = canvas.getByRole('list', { name: 'Участники проекта' })
		await expect(list.querySelectorAll('li')).toHaveLength(5)
		await expect(canvas.getByText('и ещё 3')).toBeInTheDocument()
	},
}
