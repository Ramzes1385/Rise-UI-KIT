import { expect } from 'storybook/test'
import type meta from '../BaseInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённое поле: приглушено, недоступно для фокуса и ввода.' } } },
	args: { modelValue: 'anna@example.com', isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByLabelText('Email')).toBeDisabled()
	},
}
