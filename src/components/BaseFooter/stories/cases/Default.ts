import { expect } from 'storybook/test'
import type meta from '../BaseFooter.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Песочница: копирайт, ссылки и подпись.' } } },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('contentinfo')).toBeVisible()
		await expect(canvas.getByRole('navigation', { name: 'Документы' })).toBeVisible()
	},
}
