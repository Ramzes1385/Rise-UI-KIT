import { expect } from 'storybook/test'
import type meta from '../../BaseRoadmap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const LongContent: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	parameters: { docs: { description: { story: 'Длинный путь: восемь этапов с вложенными темами и длинными названиями.' } } },
	args: { ariaLabel: 'Длинный путь фронтенд-разработчика' },
	play: async ({ canvas }) => {
		await expect(await canvas.findByRole('group', { name: 'Длинный путь фронтенд-разработчика' })).toBeVisible()
	},
}
