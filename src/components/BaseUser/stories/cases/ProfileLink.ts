import { expect } from 'storybook/test'
import type meta from '../BaseUser.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const ProfileLink: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Ссылка на профиль (`to`) и статус «в сети»: весь блок — ссылка, скринридер слышит «Анна Смирнова, в сети».',
			},
		},
	},
	args: { to: '/users/1', isOnline: true },
	play: async ({ canvas }) => {
		const link = canvas.getByRole('link', { name: /Анна Смирнова.*в сети/ })
		await expect(link).toHaveAttribute('href', '/users/1')
	},
}
