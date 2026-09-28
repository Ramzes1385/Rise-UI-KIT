import { expect } from 'storybook/test'
import type meta from '../BaseInputNumber.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithError: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Ошибка: текст под полем описывает его, поле помечено `aria-invalid`.' } } },
	args: { modelValue: null, isRequired: true, error: 'Укажите число гостей' },
	play: async ({ canvas }) => {
		const field = canvas.getByRole('spinbutton', { name: 'Гостей' })
		await expect(field).toHaveAttribute('aria-invalid', 'true')
		await expect(field).toHaveAccessibleDescription('Укажите число гостей')
	},
}
