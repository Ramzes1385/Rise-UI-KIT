import { expect } from 'storybook/test'
import type meta from '../BaseTimePicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённое поле.' } } },
	args: { isDisabled: true, modelValue: '12:00' },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('combobox', { name: 'Время звонка' })).toBeDisabled()
	},
}
