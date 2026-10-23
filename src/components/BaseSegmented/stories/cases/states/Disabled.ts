import { expect } from 'storybook/test'
import type meta from '../../BaseSegmented.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённая группа: все сегменты недоступны.' } } },
	args: { isDisabled: true },
	play: async ({ canvas }) => {
		for (const radio of canvas.getAllByRole('radio')) await expect(radio).toBeDisabled()
	},
}
