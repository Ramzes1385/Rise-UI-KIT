import { expect } from 'storybook/test'
import type meta from '../BaseColorPicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённый выбор цвета: образец приглушён и не открывает панель.' } } },
	args: { isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: /Выбранный цвет/ })).toBeDisabled()
	},
}
