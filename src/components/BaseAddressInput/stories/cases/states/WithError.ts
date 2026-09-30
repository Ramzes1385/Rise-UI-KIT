import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseAddressInput.stories'

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Ошибка: текст под полем связан с ним через `aria-describedby`, поле помечено `aria-invalid`.' } },
	},
	args: { modelValue: 'г Москва, ул Тверская', error: 'Укажите номер дома' },
	play: async ({ canvas }) => {
		const field = canvas.getByRole('combobox', { name: 'Адрес доставки' })
		await expect(field).toHaveValue('г Москва, ул Тверская')
		await expect(field).toHaveAccessibleDescription('Укажите номер дома')
		await expect(field).toHaveAttribute('aria-invalid', 'true')
	},
}
