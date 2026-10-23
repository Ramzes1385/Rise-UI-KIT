import { expect } from 'storybook/test'
import type meta from '../BaseTimePicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithError: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Ошибка: текст под полем описывает его.' } } },
	args: { isRequired: true, error: 'Выберите время звонка' },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('combobox', { name: 'Время звонка' })).toHaveAccessibleDescription('Выберите время звонка')
	},
}
