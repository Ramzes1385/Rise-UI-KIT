import { expect } from 'storybook/test'
import type meta from '../../BasePhoneInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Ошибка: текст под полем связан с ним через `aria-describedby`, поле помечено `aria-invalid`.' } },
	},
	args: { modelValue: '+7916123', error: 'Введите номер полностью' },
	play: async ({ canvas }) => {
		const field = canvas.getByLabelText('Телефон')
		await expect(field).toHaveValue('(916) 123')
		await expect(field).toHaveAccessibleDescription('Введите номер полностью')
		await expect(field).toHaveAttribute('aria-invalid', 'true')
	},
}
