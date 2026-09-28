import { expect } from 'storybook/test'
import type meta from '../BaseAutocomplete.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithError: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Ошибка: текст под полем описывает его, поле помечено `aria-invalid`.' } } },
	args: { isRequired: true, error: 'Выберите город из списка' },
	play: async ({ canvas }) => {
		const field = canvas.getByRole('combobox', { name: 'Город доставки' })
		await expect(field).toHaveAttribute('aria-invalid', 'true')
		await expect(field).toHaveAccessibleDescription('Выберите город из списка')
	},
}
