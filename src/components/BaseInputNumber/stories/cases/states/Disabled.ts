import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseInputNumber.stories'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённое поле: кнопки и ввод недоступны.' } } },
	args: { isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('spinbutton', { name: 'Гостей' })).toBeDisabled()
		await expect(canvas.getByRole('button', { name: 'Увеличить' })).toBeDisabled()
	},
}
