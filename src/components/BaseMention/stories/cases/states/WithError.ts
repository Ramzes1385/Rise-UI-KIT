import { expect } from 'storybook/test'
import type meta from '../../BaseMention.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Ошибка: текст под полем связан с ним через `aria-describedby`, поле помечено `aria-invalid`.' } },
	},
	args: { error: 'Упомяните хотя бы одного проверяющего' },
	play: async ({ canvas }) => {
		const field = canvas.getByRole('textbox', { name: 'Комментарий' })
		await expect(field).toHaveAccessibleDescription('Упомяните хотя бы одного проверяющего')
		await expect(field).toHaveAttribute('aria-invalid', 'true')
	},
}
