import { expect } from 'storybook/test'
import type meta from '../../BasePin.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённый ввод: ячейки приглушены и не принимают фокус.' } } },
	args: { modelValue: '48', isDisabled: true },
	play: async ({ canvas }) => {
		for (const cell of canvas.getAllByRole('textbox')) {
			await expect(cell).toBeDisabled()
		}
	},
}
