import { expect } from 'storybook/test'
import type meta from '../BaseBankCard.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Песочница: меняйте props в панели Controls.' } } },
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Основная')).toBeVisible()
	},
}
