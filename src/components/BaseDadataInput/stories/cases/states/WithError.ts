import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDadataInput.stories'

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Ошибка: текст под полем связан с ним через `aria-describedby`, поле помечено `aria-invalid`.' } },
	},
	args: { modelValue: 'Рога и копыта', error: 'Выберите организацию из списка' },
	play: async ({ canvas }) => {
		const field = canvas.getByRole('combobox', { name: 'Организация' })
		await expect(field).toHaveValue('Рога и копыта')
		await expect(field).toHaveAccessibleDescription('Выберите организацию из списка')
		await expect(field).toHaveAttribute('aria-invalid', 'true')
	},
}
