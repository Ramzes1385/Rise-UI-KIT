import { expect } from 'storybook/test'
import type meta from '../../BaseDatePicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Ошибка: красная рамка и текст под полем; поле помечено `aria-invalid` и описано текстом ошибки.' } },
	},
	args: { error: 'Выберите дату встречи', isRequired: true },
	play: async ({ canvas }) => {
		const field = canvas.getByLabelText(/Дата встречи/)
		await expect(field).toHaveAttribute('aria-invalid', 'true')
		await expect(field).toHaveAccessibleDescription('Выберите дату встречи')
	},
}
