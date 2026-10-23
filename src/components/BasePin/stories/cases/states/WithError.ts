import { expect } from 'storybook/test'
import type meta from '../../BasePin.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Ошибка: красная рамка ячеек и текст под ними; ячейки помечены `aria-invalid` и описаны текстом ошибки.',
			},
		},
	},
	args: { modelValue: '4830', error: 'Неверный код. Осталось 2 попытки' },
	play: async ({ canvas }) => {
		const cell = canvas.getByRole('textbox', { name: 'Символ 1 из 4' })
		await expect(cell).toHaveAttribute('aria-invalid', 'true')
		await expect(cell).toHaveAccessibleDescription('Неверный код. Осталось 2 попытки')
	},
}
