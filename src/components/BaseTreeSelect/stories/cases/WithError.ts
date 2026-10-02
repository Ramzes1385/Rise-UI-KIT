import { expect } from 'storybook/test'
import type meta from '../BaseTreeSelect.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Ошибка: текст под полем связан с ним через `aria-describedby`, поле помечено `aria-invalid`.' } },
	},
	args: { error: 'Заполните название' },
	play: async ({ canvas }) => {
		const field = canvas.getByLabelText('Название')
		await expect(field).toHaveAccessibleDescription('Заполните название')
		await expect(field).toHaveAttribute('aria-invalid', 'true')
	},
}
