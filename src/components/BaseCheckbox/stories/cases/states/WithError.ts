import { expect } from 'storybook/test'
import type meta from '../../BaseCheckbox.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Ошибка: красная рамка квадрата и текст под подписью; чекбокс помечен `aria-invalid` и описан текстом ошибки.',
			},
		},
	},
	args: { label: 'Принимаю условия пользовательского соглашения', error: 'Без согласия с условиями заказ не оформить' },
	play: async ({ canvas }) => {
		const checkbox = canvas.getByRole('checkbox', { name: 'Принимаю условия пользовательского соглашения' })
		await expect(checkbox).toHaveAttribute('aria-invalid', 'true')
		await expect(checkbox).toHaveAccessibleDescription('Без согласия с условиями заказ не оформить')
	},
}
