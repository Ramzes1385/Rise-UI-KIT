import { expect } from 'storybook/test'
import type meta from '../BaseInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Ошибка: красная рамка и текст под полем; поле помечено `aria-invalid` и описано текстом ошибки.' } },
	},
	args: { modelValue: 'anna@', error: 'Введите адрес целиком, например name@example.com', isRequired: true },
	play: async ({ canvas }) => {
		const field = canvas.getByLabelText(/Email/)
		await expect(field).toHaveAttribute('aria-invalid', 'true')
		await expect(field).toHaveAccessibleDescription('Введите адрес целиком, например name@example.com')
	},
}
