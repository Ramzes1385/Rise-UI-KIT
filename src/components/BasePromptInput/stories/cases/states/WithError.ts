import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BasePromptInput.stories'

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Ошибка: текст под полем связан с ним через `aria-describedby`, поле помечено `aria-invalid`.' } },
	},
	args: { error: 'Запрос длиннее 4000 символов', modelValue: 'Слишком длинный запрос…' },
	play: async ({ canvas }) => {
		const field = canvas.getByRole('textbox', { name: 'Сообщение' })
		await expect(field).toHaveAccessibleDescription(/^Запрос длиннее 4000 символов/)
		await expect(field).toHaveAttribute('aria-invalid', 'true')
	},
}
