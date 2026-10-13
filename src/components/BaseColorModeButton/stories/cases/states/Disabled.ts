import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseColorModeButton.stories'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённая кнопка: не получает фокус и не переключает тему.' } } },
	args: { isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: 'Тёмная тема' })).toBeDisabled()
	},
}
