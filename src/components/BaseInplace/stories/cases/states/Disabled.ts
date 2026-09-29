import { expect } from 'storybook/test'
import type meta from '../../BaseInplace.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключено: текст виден, правка недоступна.' } } },
	args: { isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: /Название проекта/ })).toBeDisabled()
	},
}
