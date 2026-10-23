import { expect } from 'storybook/test'
import type meta from '../BaseUser.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Песочница: фото, имя и должность.' } } },
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Анна Смирнова')).toBeVisible()
		await expect(canvas.getByText('Дизайнер')).toBeVisible()
	},
}
