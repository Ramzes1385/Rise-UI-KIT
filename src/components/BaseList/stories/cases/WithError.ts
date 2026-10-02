import { expect } from 'storybook/test'
import type meta from '../BaseList.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Ошибка: текст под списком связан с ним через `aria-describedby`, список помечен `aria-invalid`.' } },
	},
	args: { error: 'Выберите раздел' },
	play: async ({ canvas }) => {
		const field = canvas.getByRole('listbox', { name: 'Разделы' })
		await expect(field).toHaveAccessibleDescription('Выберите раздел')
		await expect(field).toHaveAttribute('aria-invalid', 'true')
	},
}
