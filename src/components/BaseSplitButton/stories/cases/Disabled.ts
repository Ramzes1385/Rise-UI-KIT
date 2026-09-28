import { expect } from 'storybook/test'
import type meta from '../BaseSplitButton.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключено: обе кнопки недоступны.' } } },
	args: { isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: 'Сохранить' })).toBeDisabled()
		await expect(canvas.getByRole('button', { name: 'Другие действия' })).toBeDisabled()
	},
}
