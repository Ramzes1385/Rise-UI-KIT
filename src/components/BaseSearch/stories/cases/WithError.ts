import { expect } from 'storybook/test'
import type { SearchArgs } from '../shared'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithError: StoryObj<SearchArgs> = {
	parameters: {
		docs: { description: { story: 'Ошибка: красная рамка и текст под полем; поле помечено `aria-invalid` и описано текстом ошибки.' } },
	},
	args: { modelValue: 'Лис', error: 'Сервис поиска недоступен, попробуйте позже' },
	play: async ({ canvas }) => {
		const field = canvas.getByPlaceholderText('Поиск по проекту')
		await expect(field).toHaveAttribute('aria-invalid', 'true')
		await expect(field).toHaveAccessibleDescription('Сервис поиска недоступен, попробуйте позже')
	},
}
