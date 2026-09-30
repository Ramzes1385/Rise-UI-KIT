import { expect } from 'storybook/test'
import type meta from '../../BaseMoneyInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Ошибка: текст под полем связан с ним через `aria-describedby`, поле помечено `aria-invalid`.' } },
	},
	args: { modelValue: 150000, max: 100000, error: 'Не больше 100 000 ₽ за один перевод' },
	play: async ({ canvas }) => {
		const field = canvas.getByLabelText('Сумма')
		await expect(field).toHaveAccessibleDescription('Не больше 100 000 ₽ за один перевод')
		await expect(field).toHaveAttribute('aria-invalid', 'true')
	},
}
